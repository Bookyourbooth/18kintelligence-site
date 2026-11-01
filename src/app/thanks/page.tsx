import type { Metadata } from "next";
import { productBySlug } from "@/content";
import { stripe } from "@/lib/server";

export const metadata: Metadata = { title: "Thank you", robots: { index: false } };

/** Where Stripe Checkout sends a buyer after paying. Delivery itself happens in the webhook. */
export default async function Thanks({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let product = "";
  let email = "";
  if (stripe && session_id?.startsWith("cs_")) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      if (s.payment_status === "paid") {
        product = productBySlug(s.metadata?.slug ?? "")?.name ?? "";
        email = s.customer_details?.email ?? "";
      }
    } catch {
      // An unknown or expired session still gets the general thank-you below.
    }
  }

  return (
    <main className="gut">
      <div className="wrap page">
        <a className="label g" href="/" style={{ textDecoration: "none" }}>
          ← who18k
        </a>
        <h1>{product ? `You're in. ${product} is yours.` : "Thank you for your order."}</h1>
        <p className="lede">
          {email ? (
            <>
              Your access link is on its way to <b style={{ color: "var(--ink)" }}>{email}</b>. It usually arrives within a minute.
            </>
          ) : (
            "Your access link is on its way to the email you used at checkout. It usually arrives within a minute."
          )}
        </p>
        <p>Can&apos;t see it? Check your spam folder, or reply to your Stripe receipt and I&apos;ll sort it out.</p>
        <p>
          <a className="btn au" href="/">
            Back to who18k
          </a>
        </p>
      </div>
    </main>
  );
}
