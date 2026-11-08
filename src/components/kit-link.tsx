"use client";

import type { MouseEvent, ReactNode } from "react";

/**
 * A link to the kit signup at the top of the page that also puts the cursor in its email field.
 * Without script, or once the form has been sent, it's a plain #join link.
 */
export function KitLink({ className, children }: { className?: string; children: ReactNode }) {
  const onClick = (e: MouseEvent<HTMLAnchorElement>) => {
    const field = document.getElementById("hero-email");
    if (!field) return;
    e.preventDefault();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    field.scrollIntoView({ behavior: still ? "auto" : "smooth", block: "center" });
    field.focus({ preventScroll: true });
  };
  return (
    <a className={className} href="#join" onClick={onClick}>
      {children}
    </a>
  );
}
