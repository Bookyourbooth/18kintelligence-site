"use client";

import { useEffect, useRef, useState } from "react";
import type { JourneyStep } from "@/content";

function Media({ m, year }: { m: JourneyStep["media"]; year: string }) {
  if (!m) return <span className="j-year">{year}</span>;
  return (
    <>
      {m.kind === "video" ? (
        <video src={m.src} poster={m.poster} muted loop playsInline preload="none" aria-hidden="true" className={m.fit}></video>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.src} alt={m.alt} loading="lazy" className={m.fit} />
      )}
      <span className="j-cap">{m.caption}</span>
    </>
  );
}

/**
 * The About section as a timeline. A gold line fills as you scroll, the chapter
 * in the middle of the screen lights up, and on wide screens its clip or photo
 * shows in the frame beside it. Reduced motion gets the whole line and still posters.
 */
export function Journey({ steps }: { steps: JourneyStep[] }) {
  const box = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(0);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    setLive(true);
    const list = el.querySelector<HTMLElement>(".j-list")!;
    let frame = 0;
    const fill = () => {
      frame = 0;
      const r = list.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight / 2 - r.top) / r.height));
      list.style.setProperty("--jp", p.toFixed(3));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(fill);
    };
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setOn(Number((e.target as HTMLElement).dataset.i))),
      { rootMargin: "-45% 0px -45% 0px" },
    );
    el.querySelectorAll(".j-step").forEach((s) => io.observe(s));
    // Only follow the scroll while the section is near the screen.
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) addEventListener("scroll", onScroll, { passive: true });
      else removeEventListener("scroll", onScroll);
      fill();
    });
    near.observe(el);
    return () => {
      io.disconnect();
      near.disconnect();
      removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Play only the lit chapter's clip, wherever it's showing (the frame on wide screens, inline on phones).
  useEffect(() => {
    if (!live) return;
    box.current?.querySelectorAll<HTMLVideoElement>("video").forEach((v) => {
      const mine = Number(v.closest<HTMLElement>("[data-i]")?.dataset.i) === on;
      if (mine && v.offsetParent) v.play().catch(() => {});
      else v.pause();
    });
  }, [on, live]);

  return (
    <div className={`journey${live ? " live" : ""}`} ref={box}>
      <div className="j-stage" aria-hidden="true">
        {steps.map((s, i) => (
          <div className={`j-slide${s.media ? "" : " type"}${i === on ? " on" : ""}`} data-i={i} key={i}>
            <Media m={s.media} year={s.year} />
          </div>
        ))}
      </div>
      <ol className="j-list">
        {steps.map((s, i) => (
          <li className={`j-step${i === on ? " on" : ""}`} data-i={i} key={i}>
            <p className="j-when">{s.when}</p>
            <h3>{s.title}</h3>
            {s.body.map((b) => (
              <p key={b}>{b}</p>
            ))}
            {s.media && (
              <div className="j-inline" aria-hidden="true">
                <Media m={s.media} year={s.year} />
              </div>
            )}
            {(s.became || s.links) && (
              <div className="j-links">
                {s.became && (
                  <a className="j-became" href={s.became.href}>
                    Became <b>{s.became.label}</b>
                  </a>
                )}
                {s.links?.map((l) => (
                  <a
                    className="text-link"
                    key={l.href}
                    href={l.href}
                    {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}
