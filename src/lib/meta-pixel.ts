import { hashedOnly, matchKeys, MATCH_KEYS, type MatchKeys, type Who } from "@/lib/meta-match";

/**
 * The Meta Pixel, and the visitor's say over it. Built the same way as
 * BYBhub's, which has run on bybhub.io since November 2026.
 *
 * WHY IT EXISTS. Ads are judged on what each email sign-up and each sale
 * costs, and Meta cannot see either without this.
 *
 * NOTHING BEFORE A YES. UK rules (PECR) want consent before a tracking
 * cookie is set, so nothing is loaded and nothing is sent until the visitor
 * accepts: not the script, not a page view. A sign-up made before they have
 * answered waits in memory, and is reported if they say yes in the same
 * visit, or forgotten if they say no. Saying no later stops it, and takes
 * Meta's cookies back off.
 *
 * INERT WITHOUT AN ID. No NEXT_PUBLIC_META_PIXEL_ID, and every function here
 * does nothing, no question shows, and the privacy policy leaves Meta out.
 * The value is fixed at build time, so setting it means redeploying.
 *
 * WHAT META GETS, since 5 Nov 2026, chosen so the ads perform as well as they
 * can:
 * - the address of each page, a Lead when an email reaches the list, and an
 *   InitiateCheckout when someone presses to buy;
 * - what Meta's own code reads of the page and of the buttons pressed
 *   (readPages);
 * - who the visitor is, scrambled (lib/meta-match): the email address they
 *   sign up with, with the Lead and every event after it;
 * - a second copy of every event from our own server (app/api/meta-events),
 *   so it still arrives when a browser blocks Meta's script;
 * - a Purchase, from the server alone, when Stripe says a buyer who had said
 *   yes has paid (lib/meta-server, purchaseEvent).
 * A secret in an address has to be kept from all of it, by SILENT_PATHS. The
 * privacy policy says all of this. Change one, change the other.
 */

export type CookieChoice = "off" | "ask" | "accepted" | "declined";

type MetaEvent = "Lead" | "InitiateCheckout";

/** What Meta's script and the server copy are both sent. */
type Sent = MetaEvent | "PageView";

type MetaEventParams = {
  content_name?: string;
  content_ids?: string[];
  content_type?: "product";
  num_items?: number;
  value?: number;
  currency?: string;
};

/** Digits only. It ends up in a request to Meta, so anything else counts as unset. */
export function pixelIdFrom(raw: string | undefined): string | null {
  const id = raw?.trim();
  return id && /^\d{5,20}$/.test(id) ? id : null;
}

export const PIXEL_ID = pixelIdFrom(process.env.NEXT_PUBLIC_META_PIXEL_ID);

export const PIXEL_SCRIPT = "https://connect.facebook.net/en_US/fbevents.js";

/** Where the server copy of each event goes (app/api/meta-events). */
export const SERVER_EVENTS = "/api/meta-events";

/**
 * Pages the Pixel never runs on, and the question is never asked on. Every
 * event carries the page's full address, and Stripe sends a buyer back to
 * /thanks with their checkout session in it, which is enough to show their
 * email address on that page.
 */
const SILENT_PATHS = ["/thanks"];

export const isSilentPath = (path: string) => SILENT_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/* ---------------------------------------------------- The visitor's answer */

export const CONSENT_COOKIE = "18k_ad_cookies";

/**
 * The cookie's value for a yes. It was "accepted" until 5 Nov 2026, when the
 * question began to say Meta is given a scrambled email address and name. A
 * yes from before then was to the old wording, so it no longer counts and
 * those visitors are asked again. A no still stands.
 */
export const CONSENT_YES = "accepted-2";

const SIX_MONTHS = 60 * 60 * 24 * 182;
const NINETY_DAYS = 60 * 60 * 24 * 90;

/** Their answer this visit, which counts even if the browser refuses cookies. */
let chosen: "accepted" | "declined" | null = null;
let settingsOpen = false;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((listener) => listener());

const readCookie = (name: string) =>
  document.cookie
    .split(/;\s*/)
    .find((c) => c.startsWith(`${name}=`))
    ?.slice(name.length + 1);

export function subscribeToCookies(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function cookieChoice(): CookieChoice {
  if (!PIXEL_ID || typeof document === "undefined") return "off";
  if (chosen) return chosen;
  const saved = readCookie(CONSENT_COOKIE);
  return saved === CONSENT_YES ? "accepted" : saved === "declined" ? "declined" : "ask";
}

export const cookieSettingsOpen = () => settingsOpen;

/** The "Cookie settings" link: consent has to be as easy to take back as to give. */
export function openCookieSettings() {
  settingsOpen = true;
  readPages();
  changed();
}

export function chooseCookies(choice: "accepted" | "declined") {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  const value = choice === "accepted" ? CONSENT_YES : "declined";
  document.cookie = `${CONSENT_COOKIE}=${value}; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`;
  chosen = choice;
  settingsOpen = false;

  if (choice === "accepted") {
    window.fbq?.("consent", "grant");
    pageView(location.pathname);
    for (const e of waiting.splice(0)) trackOnce(e.key, e.name, e.params, e.who);
  } else {
    waiting.length = 0;
    /** So a yes after this no counts the page, and a second yes in a row doesn't. */
    lastPage = null;
    window.fbq?.("consent", "revoke");
    forgetMetaCookies();
  }
  changed();
}

/** "; Domain=18kintelligence.com", where Meta keeps its cookies, so www and the bare address share them. */
function siteWide() {
  const labels = location.hostname.split(".");
  return labels.length > 1 && !/^[\d.]+$/.test(location.hostname)
    ? `; Domain=${labels.slice(-2).join(".")}`
    : "";
}

/** Meta sets these on the whole domain, so that is where they have to be expired. */
function forgetMetaCookies() {
  const host = location.hostname;
  const scopes = ["", `; Domain=${host}`, `; Domain=${host.split(".").slice(-2).join(".")}`];
  for (const name of ["_fbp", "_fbc"]) {
    for (const scope of scopes) {
      document.cookie = `${name}=; Max-Age=0; Path=/${scope}`;
    }
  }
}

/* ----------------------------------------------------- Which ad, and who */

/**
 * The click id Meta adds to an ad's link (?fbclid=), kept in memory from the
 * page the visitor landed on. Meta's script reads it only from the address it
 * starts on, so someone who looked around before answering the cookie
 * question would otherwise lose the ad its credit. Written into Meta's own
 * cookie when they say yes (startCookies), and never stored before that.
 */
const landedFrom = (() => {
  if (typeof location === "undefined" || !location.search) return null;
  const id = new URLSearchParams(location.search).get("fbclid");
  return id && /^[\w-]{1,500}$/.test(id) ? { id, at: Date.now() } : null;
})();

/**
 * Meta's Test events screen lists a server copy only when it carries the code
 * that screen shows. Opening a page with ?meta_test=TEST12345 sends that code
 * with this visit's server copies, so a change can be checked end to end. It
 * touches nothing but the visit that asks for it.
 */
const testCode = (() => {
  if (typeof location === "undefined" || !location.search) return undefined;
  const code = new URLSearchParams(location.search).get("meta_test");
  return code && /^TEST\w{1,20}$/.test(code) ? code : undefined;
})();

/**
 * Meta's two cookies, made by us when they are missing: _fbc from the ad's
 * click id, and _fbp, the browser's own id. Meta's script reuses both. Made
 * here so the server copies carry them too, including for a browser that
 * blocks Meta's script, and so a sale can be tied back to the ad
 * (api/checkout keeps them for it). The "1" says they sit on
 * 18kintelligence.com, one level below the top of the address, as Meta's
 * script would put them.
 */
function startCookies() {
  const where = siteWide();
  const level = where ? 1 : 0;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  const set = (name: string, value: string) => {
    document.cookie = `${name}=${value}; Max-Age=${NINETY_DAYS}; Path=/${where}; SameSite=Lax${secure}`;
  };
  if (landedFrom && !readCookie("_fbc")) set("_fbc", `fb.${level}.${landedFrom.at}.${landedFrom.id}`);
  if (!readCookie("_fbp")) set("_fbp", `fb.${level}.${Date.now()}.${Math.floor(Math.random() * 2147483647)}`);
}

/** Who this browser's events are about, as far as anyone has said (lib/meta-match). */
let visitor: MatchKeys = {};
/** Whether Meta's script has been told. It takes a person once per page load, and no other after. */
let introduced = false;

const known = (keys: MatchKeys) => MATCH_KEYS.some((k) => keys[k]);

/** The first value given for each key stands, as it does in Meta's script. */
function identify(keys: MatchKeys) {
  visitor = { ...keys, ...visitor };
  introduce();
}

function introduce() {
  if (introduced || !window.fbq || !known(visitor)) return;
  introduced = true;
  window.fbq("init", PIXEL_ID, { ...visitor });
}

/** Keys already scrambled, or details typed into the page, to scramble here. */
async function keysFor(who: Who | MatchKeys): Promise<MatchKeys> {
  const given = hashedOnly(who);
  return known(given) ? given : matchKeys(who as Who);
}

/* ------------------------------------------------------------ The Pixel */

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: unknown;
  loaded: boolean;
  version: string;
  disablePushState: boolean;
  allowDuplicatePageViews: boolean;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

let reading: boolean | null = null;

/**
 * Whether Meta's own code reads the page (its title, prices and the like) and
 * the buttons pressed on it, with their words. On, because it helps the ads
 * (chosen 4 Nov 2026), except:
 * - on a silent page, should a visitor reach one after the Pixel has started,
 *   because its address would go with every click;
 * - while the cookie question is open, so pressing Decline isn't reported.
 *
 * Meta looks at this switch before every click and every event, so it is set
 * again on each page.
 */
function readPages() {
  const on = !settingsOpen && !isSilentPath(location.pathname);
  if (!window.fbq || on === reading) return;
  reading = on;
  window.fbq("set", "autoConfig", on);
}

/** Meta's own stub: commands queue here until fbevents.js arrives to work through them. */
function pixel(...command: unknown[]) {
  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue.push(args);
    }) as Fbq;
    fbq.push = fbq;
    fbq.loaded = true;
    fbq.version = "2.0";
    fbq.queue = [];
    /** pageView below says when the page changes, so Meta must not also guess from the history. */
    fbq.disablePushState = true;
    /** Meta's script drops every PageView after the first in a page load unless told otherwise. */
    fbq.allowDuplicatePageViews = true;
    window.fbq = fbq;
    window._fbq = fbq;
    startCookies();
    readPages();
    introduced = known(visitor);
    if (introduced) fbq("init", PIXEL_ID, { ...visitor });
    else fbq("init", PIXEL_ID);
  }
  readPages();
  introduce();
  window.fbq(...command);
}

const newEventId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;

/**
 * One event, to Meta's script and to our server. Both copies carry the same
 * id, which is how Meta knows they are one event and counts it once.
 */
function send(name: Sent, params: MetaEventParams | undefined, keys?: MatchKeys) {
  // Scrambling details takes a moment, and they may have said no in it.
  if (cookieChoice() !== "accepted" || isSilentPath(location.pathname)) return;
  const eventID = newEventId();
  if (keys && known(keys)) identify(keys);
  pixel("track", name, params ?? {}, { eventID });
  try {
    fetch(SERVER_EVENTS, {
      method: "POST",
      keepalive: true,
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: name,
        event_id: eventID,
        event_source_url: location.href,
        custom_data: params ?? {},
        user_data: { ...visitor, ...keys },
        test_event_code: testCode,
      }),
    }).catch(() => {});
  } catch {
    // Meta's script has its own copy; this one is the spare.
  }
}

let lastPage: string | null = null;

export function pageView(path: string) {
  if (cookieChoice() !== "accepted") return;
  readPages();
  if (isSilentPath(path) || path === lastPage) return;
  lastPage = path;
  send("PageView", undefined);
}

const waiting: { key: string; name: MetaEvent; params?: MetaEventParams; who?: Who | MatchKeys }[] = [];

/**
 * Report something once per visit. `key` names the thing that happened.
 * `who` is the person it is about: the details typed into the page.
 */
function trackOnce(key: string, name: MetaEvent, params?: MetaEventParams, who?: Who | MatchKeys) {
  const choice = cookieChoice();
  if (choice === "ask") {
    if (!waiting.some((e) => e.key === key)) waiting.push({ key, name, params, who });
    return;
  }
  if (choice !== "accepted") return;

  try {
    const seen = `18k_tracked:${key}`;
    if (sessionStorage.getItem(seen)) return;
    sessionStorage.setItem(seen, "1");
  } catch {
    // Storage can be refused. A rare double count beats a lost sign-up.
  }
  if (!who) {
    send(name, params);
    return;
  }
  // Scrambling takes a moment. Should it fail, the event still goes, without the person.
  keysFor(who).then(
    (keys) => send(name, params, keys),
    () => send(name, params),
  );
}

/** Each sign-up form, as Meta will list it. */
const LISTS = {
  kit: "Starter Kit",
  courses: "Courses list",
  newsletter: "Weekly email",
  waitlist: "18K Club waitlist",
  early: "Courses and Club list",
} as const;

/**
 * An email that reached the list, to be scrambled. One Lead per visit,
 * however many forms they fill in: it's one person.
 */
export function trackSignUp(source: keyof typeof LISTS, who?: Who) {
  trackOnce("sign-up", "Lead", { content_name: LISTS[source] }, who);
}

/** Pressing to buy. The sale itself is reported from the server, once Stripe says it is paid. */
export function trackCheckout(product: { slug: string; name: string; value: number; currency: string }) {
  trackOnce(`checkout:${product.slug}`, "InitiateCheckout", {
    content_name: product.name,
    content_ids: [product.slug],
    content_type: "product",
    num_items: 1,
    value: product.value,
    currency: product.currency.toUpperCase(),
  });
}
