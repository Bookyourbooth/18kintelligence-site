import { after, NextResponse, type NextRequest } from "next/server";
import { site } from "@/content";
import { CONSENT_COOKIE, CONSENT_YES, PIXEL_ID } from "@/lib/meta-pixel";
import { capiToken, cleanTestCode, postToMeta, serverEvent, visitorIp } from "@/lib/meta-server";

/**
 * The server's copy of each Pixel event, posted here by lib/meta-pixel and
 * passed to Meta's Conversions API. See lib/meta-server for why, and for how
 * little is taken on trust.
 *
 * ONLY WITH A YES. The browser only posts for a visitor who accepted, and the
 * answer is checked again here, from the request's own cookie. Without it
 * the event is dropped without a word: the page has nothing to do about it.
 *
 * ANSWERS AT ONCE. Meta is called after the response has gone (next/server's
 * after), so a slow Meta never holds up a page.
 */
export async function POST(request: NextRequest) {
  const nothing = new NextResponse(null, { status: 204 });
  if (!PIXEL_ID || !capiToken()) return nothing;

  // A browser says where a request came from. Another site's page posting here is refused.
  const from = request.headers.get("sec-fetch-site");
  if (from && from !== "same-origin") return new NextResponse(null, { status: 403 });
  if (request.cookies.get(CONSENT_COOKIE)?.value !== CONSENT_YES) return nothing;

  const raw = await request.text();
  if (raw.length > 16_000) return new NextResponse(null, { status: 413 });
  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const event = serverEvent(body, {
    /** Hostinger sits in front, and says which address was asked for. */
    hosts: [
      (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "").split(",")[0].trim(),
      siteHost(),
    ].filter((h): h is string => Boolean(h)),
    ip: visitorIp(request.headers.get("x-forwarded-for"), request.headers.get("x-real-ip")),
    userAgent: request.headers.get("user-agent"),
    fbp: request.cookies.get("_fbp")?.value ?? null,
    fbc: request.cookies.get("_fbc")?.value ?? null,
  });
  if (!event) return new NextResponse(null, { status: 400 });

  const testCode = cleanTestCode((body as Record<string, unknown>).test_event_code);
  after(() => postToMeta([event], testCode));
  return nothing;
}

/** The address the site is published at (NEXT_PUBLIC_SITE_URL). */
function siteHost(): string | null {
  try {
    return new URL(site.url).host;
  } catch {
    return null;
  }
}
