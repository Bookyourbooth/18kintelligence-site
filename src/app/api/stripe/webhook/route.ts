import { after } from "next/server";
import type Stripe from "stripe";
import { formatPrice, productBySlug, site } from "@/content";
import { postToMeta, purchaseEvent } from "@/lib/meta-server";
import { accessUrl, button, esc, layout, mailer, saveContact, stripe } from "@/lib/server";

/**
 * Stripe webhook: delivers a product after payment.
 *
 * The signature check is the whole security model. The URL is public, so
 * without it anyone could POST "payment succeeded" and get a course. It
 * needs the RAW body: parse it first and the signature no longer matches.
 *
 * Stripe retries on any non-2xx and can deliver the same event twice, so a
 * repeat only re-sends the same access email; Meta counts the sale once.
 *
 * Once delivered, the sale goes to Meta as a Purchase if the buyer said yes
 * to advertising cookies before pressing to buy (lib/meta-server).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return Response.json({ error: "Stripe not configured" }, { status: 503 });

  const raw = await request.text();
  const sig = request.headers.get("stripe-signature") ?? "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch {
    return Response.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") {
    return Response.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  if (session.payment_status !== "paid") return Response.json({ received: true });

  const product = productBySlug(session.metadata?.slug ?? "");
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const name = session.customer_details?.name ?? "";
  if (!product || !email) {
    console.error("webhook: paid session without product or email", session.id);
    return Response.json({ received: true });
  }

  const m = mailer();
  if (!m) {
    // 500 so Stripe retries once email is configured, instead of a buyer never getting access.
    console.error("webhook: RESEND_API_KEY is not set; access email not sent", session.id);
    return Response.json({ error: "Email not configured" }, { status: 500 });
  }

  const link = accessUrl(product.slug);
  const sent = await m.resend.emails.send({
    from: m.from,
    to: email,
    subject: `Your access to ${product.name}`,
    html: layout(
      `<p>Hey${name ? ` ${esc(name.split(/\s+/)[0])}` : ""},</p><p>Thanks for buying <b>${esc(product.name)}</b>. Here's your access. Keep this email: the link is yours for life, including future updates.</p>
${link ? button(link, `Open ${product.name}`) : "<p>Your access link is on its way in a separate email.</p>"}
<p>Questions or stuck on something? Just reply to this email.</p><p>Kwame<br>18K Intelligence</p>`,
    ),
  });
  if (sent.error) {
    console.error("webhook: access email failed", session.id, sent.error);
    return Response.json({ error: "Access email failed" }, { status: 500 });
  }

  await saveContact(email, `customer: ${product.slug}`, name);
  if (m.ownerTo) {
    await m.resend.emails.send({
      from: m.from,
      to: m.ownerTo,
      subject: `💰 Sale: ${product.name}`,
      html: layout(`<p>${esc(email)} bought <b>${esc(product.name)}</b> for ${formatPrice(session.amount_total ?? product.price)}.</p>`),
    });
  }
  const sale = await purchaseEvent(session, product, site.url);
  if (sale) after(() => postToMeta([sale]));
  return Response.json({ received: true });
}
