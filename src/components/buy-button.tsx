"use client";

import { useState } from "react";

/** Sends the buyer to Stripe Checkout for one product. */
export function BuyButton({ slug }: { slug: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function buy() {
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
