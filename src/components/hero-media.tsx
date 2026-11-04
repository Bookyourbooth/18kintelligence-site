"use client";

import { useEffect, useRef } from "react";

/**
 * The headline, shown: a reel Kwame filmed of himself, with a site he built
 * with AI laid over its corner. Both loop muted while on screen; people who
 * prefer reduced motion get the still posters.
 */
export function HeroMedia() {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const videos = [...el.querySelectorAll("video")];
    const io = new IntersectionObserver(([e]) => videos.forEach((v) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause())));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="hero-media" ref={box}>
      <figure className="hm-film">
        <a href="https://www.instagram.com/reel/DXMA3zWjNEL/" target="_blank" rel="noopener noreferrer" aria-label="Watch the reel on Instagram">
          <video src="/work/mistakes.mp4" poster="/work/mistakes.jpg" muted loop playsInline preload="metadata" aria-hidden="true"></video>
        </a>
        <figcaption>
          <b>Filmed it.</b> A reel I shot and edited myself.
        </figcaption>
      </figure>
      <figure className="hm-build">
        <a href="https://bybhub.io" target="_blank" rel="noopener noreferrer" aria-label="Visit bybhub.io">
          <video src="/work/hero-site.mp4" poster="/work/hero-site.jpg" muted loop playsInline preload="metadata" aria-hidden="true"></video>
        </a>
        <figcaption>
          <b>Built it.</b> bybhub.io, made with AI.
        </figcaption>
      </figure>
    </div>
  );
}
