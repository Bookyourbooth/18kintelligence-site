import { CURRENCY, productBySlug, site } from "@/content";
import { saleMetadata } from "@/lib/meta-server";
import { accessUrl, stripe } from "@/lib/server";

/**
 * Starts Stripe Checkout for one digital product and returns its URL.
 *
 * Prices come from content.ts on the server, never from the browser, so a
 * visitor can't edit the amount they pay. A product only sells once it is
 * marked live and has an access link to deliver.
 *
 * For a buyer who said yes to advertising cookies, the checkout also keeps
 * what the webhook needs to report the sale to Meta (lib/meta-server).
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const product = typeof body.slug === "string" ? productBySlug(body.slug) : undefined;
  if (!product) return Response.json({ error: "That product isn't available." }, { status: 404 });
  if (!product.live || !accessUrl(product.slug)) {
    return Response.json({ error: `${product.name} isn't on sale yet. Join the list to hear when it is.` }, { status: 409 });
  }
  if (!stripe) {
    console.error("checkout: STRIPE_SECRET_KEY is not set");
    return Response.json({ error: "Checkout is paused for a moment. Please try again shortly." }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? origin;
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: CURRENCY,
            unit_amount: product.price,
            product_data: { name: product.name, description: product.summary },
          },
        },
      ],
      metadata: { slug: product.slug, ...saleMetadata(request) },
      customer_creation: "always",
      allow_promotion_codes: true,
      success_url: `${base}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/#products`,
    });
    return Response.json({ url: session.url });
  } catch (err) {
    console.error("checkout: session failed", err);
    return Response.json({ error: `We couldn't start checkout for ${site.name}. Please try again.` }, { status: 502 });
  }
}
