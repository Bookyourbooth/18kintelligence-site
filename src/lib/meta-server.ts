import type Stripe from "stripe";
import { hashedOnly, matchKeys, type MatchKeys } from "@/lib/meta-match";
import { CONSENT_COOKIE, CONSENT_YES, isSilentPath, PIXEL_ID } from "@/lib/meta-pixel";

/**
 * Meta's Conversions API: the server's copy of each Pixel event, and the
 * sales, which only the server sees. Built the same way as BYBhub's.
 *
 * WHY. Some browsers block Meta's script, and Meta's ads are judged and aimed
 * on the events it receives. A copy from our own server still arrives, with
 * the same event id, so Meta counts the event once whichever copy gets there
 * (chosen 5 Nov 2026). A sale is paid on Stripe's page and confirmed to the
 * webhook, so the server is the only place that knows it happened.
 *
 * INERT WITHOUT A TOKEN. META_CONVERSIONS_API_TOKEN is made in Events
 * Manager, under the dataset's Settings, "Generate access token", and set on
 * the host. Until it is, nothing is sent from here. It is a secret: never in
 * a NEXT_PUBLIC_ variable, never in a log.
 *
 * NOTHING IS TAKEN ON TRUST. The browser posts these, so anyone can post
 * anything. Only the events the site sends are passed on, with the details
 * they normally carry, an amount within reason, an address on this site that
 * is not a silent page, and person keys that are already scrambled.
 */

export const GRAPH_VERSION = "v26.0";

export const capiToken = () => process.env.META_CONVERSIONS_API_TOKEN?.trim() || null;

const EVENTS = new Set(["PageView", "Lead", "InitiateCheckout"]);

export type ServerEvent = {
  event_name: string;
  event_time: number;
  event_id: string;
  event_source_url: string;
  action_source: "website";
  user_data: MatchKeys & {
    client_ip_address?: string;
    client_user_agent?: string;
    fbp?: string;
    fbc?: string;
  };
  custom_data: Record<string, unknown>;
};

/** What the server knows about the request, rather than what the browser says. */
export type RequestFacts = {
  /** The addresses this site answers on, such as 18kintelligence.com. */
  hosts: string[];
  ip: string | null;
  userAgent: string | null;
  fbp: string | null;
  fbc: string | null;
};

const text = (v: unknown, max: number) =>
  typeof v === "string" && v.trim() && v.length <= max ? v.trim() : undefined;

/** The details a site event normally carries, and nothing else. */
function cleanCustomData(raw: unknown): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!raw || typeof raw !== "object") return out;
  const d = raw as Record<string, unknown>;
  if (typeof d.value === "number" && Number.isFinite(d.value) && d.value >= 0 && d.value <= 50_000) {
    out.value = Math.round(d.value * 100) / 100;
  }
  if (typeof d.currency === "string" && /^[a-z]{3}$/i.test(d.currency)) out.currency = d.currency.toUpperCase();
  const name = text(d.content_name, 200);
  if (name) out.content_name = name;
  if (Array.isArray(d.content_ids)) {
    const ids = d.content_ids.filter((x): x is string => typeof x === "string" && x.length > 0 && x.length <= 100);
    if (ids.length) out.content_ids = ids.slice(0, 20);
  }
  if (d.content_type === "product") out.content_type = "product";
  if (typeof d.num_items === "number" && Number.isInteger(d.num_items) && d.num_items > 0 && d.num_items <= 100) {
    out.num_items = d.num_items;
  }
  return out;
}

/** An address on this site, and not a silent page. */
function cleanUrl(raw: unknown, hosts: string[]): string | null {
  if (typeof raw !== "string" || raw.length > 2000) return null;
  try {
    const url = new URL(raw);
    const ours = hosts.some((h) => h.toLowerCase() === url.host.toLowerCase());
    if (!ours || !/^https?:$/.test(url.protocol) || isSilentPath(url.pathname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Meta's own formats for its two cookies. Anything else is left out. */
const cleanFbp = (v: string | null) => (v && /^fb\.\d\.\d{10,16}\.\d{1,20}$/.test(v) ? v : undefined);
const cleanFbc = (v: string | null) => (v && /^fb\.\d\.\d{10,16}\.[\w-]{1,500}$/.test(v) ? v : undefined);
const cleanIp = (v: string | null) => (v && /^[0-9a-f.:]{3,45}$/i.test(v) ? v : undefined);

/** The event to send, or null if this is nothing the site would have sent. */
export function serverEvent(body: unknown, facts: RequestFacts, now = Date.now()): ServerEvent | null {
  if (!body || typeof body !== "object") return null;
  const b = body as Record<string, unknown>;
  const name = typeof b.event_name === "string" && EVENTS.has(b.event_name) ? b.event_name : null;
  const id = typeof b.event_id === "string" && /^[\w-]{8,64}$/.test(b.event_id) ? b.event_id : null;
  const url = cleanUrl(b.event_source_url, facts.hosts);
  if (!name || !id || !url) return null;

  const userAgent = text(facts.userAgent, 1000);
  return {
    event_name: name,
    event_time: Math.floor(now / 1000),
    event_id: id,
    event_source_url: url,
    action_source: "website",
    user_data: {
      ...hashedOnly(b.user_data),
      ...(cleanIp(facts.ip) ? { client_ip_address: cleanIp(facts.ip) } : {}),
      ...(userAgent ? { client_user_agent: userAgent } : {}),
      ...(cleanFbp(facts.fbp) ? { fbp: cleanFbp(facts.fbp) } : {}),
      ...(cleanFbc(facts.fbc) ? { fbc: cleanFbc(facts.fbc) } : {}),
    },
    custom_data: cleanCustomData(b.custom_data),
  };
}

export const cleanTestCode = (v: unknown) =>
  typeof v === "string" && /^TEST\w{1,20}$/.test(v) ? v : undefined;

/** The first address in X-Forwarded-For is the visitor; the rest are the host's own proxies. */
export const visitorIp = (forwarded: string | null, real: string | null) =>
  forwarded?.split(",")[0]?.trim() || real?.trim() || null;

/** Hands events to Meta. Never throws: a lost copy is not worth a failed page. */
export async function postToMeta(events: ServerEvent[], testCode?: string): Promise<void> {
  const token = capiToken();
  if (!PIXEL_ID || !token || events.length === 0) return;
  try {
    const res = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: events,
        access_token: token,
        ...(testCode ? { test_event_code: testCode } : {}),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("meta-events: Meta refused", events.map((e) => e.event_name).join(","), res.status, (await res.text()).slice(0, 500));
    }
  } catch (e) {
    console.error("meta-events: could not reach Meta", (e as Error).message);
  }
}

/* ------------------------------------------------------------- Sales */

const cookieIn = (header: string | null, name: string) =>
  header?.split(/;\s*/).find((c) => c.startsWith(`${name}=`))?.slice(name.length + 1) ?? null;

/**
 * What a sale needs from the visit, kept with the Stripe checkout so the
 * webhook can report the sale once it is paid: an event id, Meta's two
 * cookies, and the buyer's IP address and browser. Nothing at all for a
 * visitor who has not said yes to the cookie question, or until the token
 * is set. Stripe holds each value to 500 characters.
 */
export function saleMetadata(request: Request): Record<string, string> {
  const header = request.headers.get("cookie");
  if (!PIXEL_ID || !capiToken() || cookieIn(header, CONSENT_COOKIE) !== CONSENT_YES) return {};
  const ip = cleanIp(visitorIp(request.headers.get("x-forwarded-for"), request.headers.get("x-real-ip")));
  const ua = text(request.headers.get("user-agent"), 500);
  const fbp = cleanFbp(cookieIn(header, "_fbp"));
  const fbc = cleanFbc(cookieIn(header, "_fbc"));
  return {
    meta_event_id: crypto.randomUUID(),
    ...(ip ? { meta_ip: ip } : {}),
    ...(ua ? { meta_ua: ua } : {}),
    ...(fbp ? { meta_fbp: fbp } : {}),
    ...(fbc && fbc.length <= 500 ? { meta_fbc: fbc } : {}),
  };
}

/**
 * A paid checkout as Meta's Purchase, with the amount paid and the buyer's
 * email address, name and country scrambled. Null unless the buyer had said
 * yes when they pressed to buy (saleMetadata). Stripe can tell the webhook
 * twice; the event id is kept with the checkout, so Meta counts it once.
 */
export async function purchaseEvent(
  session: Stripe.Checkout.Session,
  product: { slug: string; name: string },
  siteUrl: string,
  now = Date.now(),
): Promise<ServerEvent | null> {
  const m = session.metadata ?? {};
  const id = m.meta_event_id;
  if (!id || !/^[\w-]{8,64}$/.test(id) || session.amount_total == null || !session.currency) return null;
  let url: string;
  try {
    url = new URL("/", siteUrl).toString();
  } catch {
    return null;
  }
  const buyer = session.customer_details;
  const keys = await matchKeys({
    email: buyer?.email ?? session.customer_email,
    name: buyer?.name,
    country: buyer?.address?.country,
  });
  const ip = cleanIp(m.meta_ip ?? null);
  const userAgent = text(m.meta_ua, 1000);
  const fbp = cleanFbp(m.meta_fbp ?? null);
  const fbc = cleanFbc(m.meta_fbc ?? null);
  return {
    event_name: "Purchase",
    event_time: Math.floor(now / 1000),
    event_id: id,
    event_source_url: url,
    action_source: "website",
    user_data: {
      ...keys,
      ...(ip ? { client_ip_address: ip } : {}),
      ...(userAgent ? { client_user_agent: userAgent } : {}),
      ...(fbp ? { fbp } : {}),
      ...(fbc ? { fbc } : {}),
    },
    custom_data: {
      value: session.amount_total / 100,
      currency: session.currency.toUpperCase(),
      content_name: product.name,
      content_ids: [product.slug],
      content_type: "product",
      num_items: 1,
    },
  };
}
