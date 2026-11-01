"use client";

import { useState } from "react";

/**
 * Focus picker plus the link to the paid Cal.com booking page. Cal.com
 * takes the payment through the connected Stripe account; the chosen focus
 * rides along as the booking's notes.
 */
export function BookCall({ calUrl, focuses }: { calUrl: string; focuses: string[] }) {
  const [focus, setFocus] = useState(focuses[0]);
  const href = calUrl ? `${calUrl}${calUrl.includes("?") ? "&" : "?"}notes=${encodeURIComponent(`Focus: ${focus}`)}` : "";

  return (
    <>
      <fieldset className="pick">
        <legend className="label">What do you want to focus on?</legend>
        <div className="pick-opts">
          {focuses.map((f, i) => (
            <label key={f}>
              <input id={`fo-${i}`} type="radio" name="focus" value={f} checked={focus === f} onChange={() => setFocus(f)} />
              <span>{f}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p style={{ color: "var(--mute)" }}>
        Pay when you book. A short questionnaire before the call means we get straight to your plan.
      </p>
      {href ? (
        <a className="btn au" href={href} target="_blank" rel="noopener noreferrer">
          Book &amp; pay
        </a>
      ) : (
        <>
          <a className="btn au" href="#join">
            Get notified when booking opens
          </a>
          <p className="buy-msg">1:1 booking opens soon. Join the list to hear first.</p>
        </>
      )}
    </>
  );
}
