"use client";

import { useState } from "react";
import { trackCheckout } from "@/lib/meta-pixel";

/** Sends the buyer to Stripe Checkout for one product. `value` is the price in dollars, for Meta. */
export function BuyButton({ slug, name, value, currency }: { slug: string; name: string; value: number; currency: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
    trackCheckout({ slug, name, value, currency });
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error ?? "We couldn't start checkout. Please try again.");
    } catch {
      setError("You seem to be offline. Check your connection and try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <button className="btn au" type="button" onClick={buy} disabled={busy}>
        {busy ? "Opening checkout…" : "Buy now"}
      </button>
      <p className="buy-msg bad" role="status" style={{ gridColumn: "1 / -1", flexBasis: "100%" }}>
        {error}
      </p>
    </>
  );
}
