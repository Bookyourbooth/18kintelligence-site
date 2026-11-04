/**
 * The Meta Pixel, and the visitor's say over it. Built the same way as
 * BYBhub's, which has run on bybhub.io since November 2026.
 *
 * WHY IT EXISTS. Ads are judged on what each email sign-up costs, and Meta
 * cannot see a sign-up without this.
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
 * WHAT META GETS. The address of each page, plus a Lead when an email reaches
 * the list. So a secret in an address has to be kept from it, by SILENT_PATHS.
 * autoConfig is switched off, because it would otherwise report button clicks
 * and page details nobody chose to send. The privacy policy says so, and also
 * says Meta is not given a name, email address or phone number, which stays
 * true only while "Automatic advanced matching" is off for this Pixel in
 * Events Manager. Change one, change the other.
 */

export type CookieChoice = "off" | "ask" | "accepted" | "declined";

type MetaEventParams = { content_name?: string };

/** Digits only. It ends up in a request to Meta, so anything else counts as unset. */
export function pixelIdFrom(raw: string | undefined): string | null {
  const id = raw?.trim();
  return id && /^\d{5,20}$/.test(id) ? id : null;
}

export const PIXEL_ID = pixelIdFrom(process.env.NEXT_PUBLIC_META_PIXEL_ID);

export const PIXEL_SCRIPT = "https://connect.facebook.net/en_US/fbevents.js";

/**
 * Pages the Pixel never runs on, and the question is never asked on. Every
 * event carries the page's full address, and Stripe sends a buyer back to
 * /thanks with their checkout session in it, which is enough to show their
 * email address on that page.
 */
const SILENT_PATHS = ["/thanks"];

export const isSilentPath = (path: string) => SILENT_PATHS.some((p) => path === p || path.startsWith(`${p}/`));

/* ---------------------------------------------------- The visitor's answer */

const COOKIE = "18k_ad_cookies";
const SIX_MONTHS = 60 * 60 * 24 * 182;

/** Their answer this visit, which counts even if the browser refuses cookies. */
let chosen: "accepted" | "declined" | null = null;
let settingsOpen = false;
const listeners = new Set<() => void>();
const changed = () => listeners.forEach((listener) => listener());

export function subscribeToCookies(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function cookieChoice(): CookieChoice {
  if (!PIXEL_ID || typeof document === "undefined") return "off";
  if (chosen) return chosen;
  const saved = document.cookie
    .split(/;\s*/)
    .find((c) => c.startsWith(`${COOKIE}=`))
    ?.slice(COOKIE.length + 1);
  return saved === "accepted" || saved === "declined" ? saved : "ask";
}

export const cookieSettingsOpen = () => settingsOpen;

/** The "Cookie settings" link: consent has to be as easy to take back as to give. */
export function openCookieSettings() {
  settingsOpen = true;
  changed();
}

export function chooseCookies(choice: "accepted" | "declined") {
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE}=${choice}; Max-Age=${SIX_MONTHS}; Path=/; SameSite=Lax${secure}`;
  chosen = choice;
  settingsOpen = false;

  if (choice === "accepted") {
    window.fbq?.("consent", "grant");
    pageView(location.pathname);
    for (const e of waiting.splice(0)) trackOnce(e.key, e.name, e.params);
  } else {
    waiting.length = 0;
    /** So a yes after this no counts the page, and a second yes in a row doesn't. */
    lastPage = null;
    window.fbq?.("consent", "revoke");
    forgetMetaCookies();
  }
  changed();
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
    fbq("set", "autoConfig", false, PIXEL_ID);
    fbq("init", PIXEL_ID);
  }
  window.fbq(...command);
}

let lastPage: string | null = null;

export function pageView(path: string) {
  if (cookieChoice() !== "accepted" || isSilentPath(path) || path === lastPage) return;
  lastPage = path;
  pixel("track", "PageView");
}

const waiting: { key: string; name: "Lead"; params?: MetaEventParams }[] = [];

/** Report something once per visit. `key` names the thing that happened. */
function trackOnce(key: string, name: "Lead", params?: MetaEventParams) {
  const choice = cookieChoice();
  if (choice === "ask") {
    if (!waiting.some((e) => e.key === key)) waiting.push({ key, name, params });
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
  pixel("track", name, params);
}

/** Each sign-up form, as Meta will list it. */
const LISTS = {
  kit: "Starter Kit",
  courses: "Courses list",
  newsletter: "Weekly email",
  waitlist: "18K Club waitlist",
  early: "Courses and Club list",
} as const;

/** An email that reached the list. One Lead per visit, however many forms they fill in: it's one person. */
export function trackSignUp(source: keyof typeof LISTS) {
  trackOnce("sign-up", "Lead", { content_name: LISTS[source] });
}
