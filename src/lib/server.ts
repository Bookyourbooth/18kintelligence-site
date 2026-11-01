import "server-only";
import { Resend } from "resend";
import Stripe from "stripe";

/**
 * Server-side clients, built from the environment. Each is `null` when its
 * key is missing, so a route can refuse clearly instead of failing halfway.
 * Secret keys are never NEXT_PUBLIC_: anything with that prefix ships to
 * the browser.
 */

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      // Pinned: Stripe ships breaking changes behind version dates.
      apiVersion: "2026-08-26.dahlia",
      appInfo: { name: "18kintelligence-site" },
    })
  : null;

export function mailer() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return {
    resend: new Resend(key),
    from: process.env.RESEND_FROM ?? "18K Intelligence <hello@bybhub.io>",
    ownerTo: process.env.OWNER_EMAIL ?? "",
    segmentId: process.env.RESEND_SEGMENT_ID ?? "",
  };
}

/** The link a buyer gets after paying, from ACCESS_URL_<SLUG> (dashes become underscores). */
export function accessUrl(slug: string): string {
  return process.env[`ACCESS_URL_${slug.toUpperCase().replace(/-/g, "_")}`] ?? "";
}

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

/** Escapes visitor-supplied text before it goes into an email's HTML. */
export function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

/** A gold button for emails. */
export function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${esc(href)}" style="background:#d4af5a;color:#17130a;padding:14px 22px;border-radius:999px;text-decoration:none;font-weight:600">${esc(label)}</a></p>`;
}

/** A plain, readable email body in the 18K Intelligence look. */
export function layout(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#0e0d0f;font-family:Helvetica,Arial,sans-serif;color:#f3eee6">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#17151a;border:1px solid #2d2931;border-radius:12px">
<tr><td style="padding:24px 32px;border-bottom:1px solid #2d2931;font-weight:800;font-size:22px;letter-spacing:-1px"><span style="color:#d4af5a">18k</span>intelligence</td></tr>
<tr><td style="padding:28px 32px;font-size:15px;line-height:1.65;color:#d9d3c9">${inner}</td></tr>
</table></td></tr></table></body></html>`;
}

/**
 * Adds or updates a contact in the "18K Intelligence list" segment. Best effort: a
 * failure is logged, never shown to the visitor, because the email they
 * asked for has already gone.
 */
export async function saveContact(email: string, source: string, name?: string) {
  const m = mailer();
  if (!m?.segmentId) return;
  const [firstName, ...rest] = (name ?? "").trim().split(/\s+/);
  const res = await m.resend.contacts.create({
    email,
    firstName: firstName || undefined,
    lastName: rest.join(" ") || undefined,
    unsubscribed: false,
    segments: [{ id: m.segmentId }],
    properties: { source },
  });
  if (res.error) console.error("contact not saved", source, res.error);
}
