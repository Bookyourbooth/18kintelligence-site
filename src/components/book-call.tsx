"use client";

import { useState } from "react";

/**
 * Focus picker plus the link to the paid Cal.com booking page. Cal.com
 * takes the payment through the connected Stripe account; the chosen focus
 * rides along as the booking's notes.
 */
export function BookCall({ calUrl, focuses, price, policy }: { calUrl: string; focuses: { name: string; detail: string }[]; price: string; policy: string }) {
  const [focus, setFocus] = useState(focuses[0].name);
  const href = calUrl ? `${calUrl}${calUrl.includes("?") ? "&" : "?"}notes=${encodeURIComponent(`Focus: ${focus}`)}` : "";

  return (
    <>
      <fieldset className="pick">
        <legend>What do you want to focus on?</legend>
        <div className="pick-opts">
          {focuses.map((f, i) => (
            <label key={f.name}>
              <input id={`fo-${i}`} type="radio" name="focus" value={f.name} checked={focus === f.name} onChange={() => setFocus(f.name)} />
              <span>
                <b>{f.name}</b>
                {f.detail}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      {href ? (
        <>
        <a className="btn au" href={href} target="_blank" rel="noopener noreferrer">
          Book your call{price && `, ${price}`}
        </a>
        <p className="policy">{policy}</p>
        </>
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
