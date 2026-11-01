"use client";

import { useState, type FormEvent, type ReactNode } from "react";

const DONE = {
  kit: "You're in. Check your inbox for the Starter Kit.",
  newsletter: "You're in. Check your inbox for a welcome email.",
  waitlist: "You're on the waitlist. We'll email you when doors open.",
} as const;

type Props = {
  id: string;
  source: keyof typeof DONE;
  label: string;
  button: string;
  note?: ReactNode;
  formId?: string;
};

/** One-field email signup. Posts to /api/subscribe and swaps to a confirmation once sent. */
export function CaptureForm({ id, source, label, button, note, formId }: Props) {
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "").trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMsg("Enter a valid email address, like you@example.com.");
      (e.currentTarget.elements.namedItem("email") as HTMLInputElement | null)?.focus();
      return;
    }
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, website: d.get("website") }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("idle");
        setMsg(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setState("done");
      setMsg(DONE[source]);
    } catch {
      setState("idle");
      setMsg("You seem to be offline. Check your connection and try again.");
    }
  }

  return (
    <form className="capture" id={formId} onSubmit={onSubmit} noValidate>
      <label className="label g" htmlFor={id}>
        {label}
      </label>
      {state !== "done" && (
        <div className="capture-row">
          <input id={id} name="email" type="email" autoComplete="email" placeholder="Your email address" required />
          <button className="btn au" type="submit" disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : button}
          </button>
        </div>
      )}
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {note && state !== "done" && <small>{note}</small>}
      <p className={`msg${state === "done" ? " ok" : msg ? " bad" : ""}`} role="status">
        {msg}
      </p>
    </form>
  );
}
