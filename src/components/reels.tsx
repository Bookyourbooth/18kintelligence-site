"use client";

import { useEffect, useRef } from "react";

type Video = { title: string; tag: string; src: string; poster: string; href: string };

/**
 * Real posts as muted loops. They play only while on screen; people who prefer
 * reduced motion get the still posters. Each tile opens the post on Instagram.
 */
export function Reels({ videos }: { videos: Video[] }) {
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.25 },
    );
    el.querySelectorAll("video").forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <div className="reels" ref={box}>
      {videos.map((v) => (
        <a className="reel" key={v.href} href={v.href} target="_blank" rel="noopener noreferrer">
          <video src={v.src} poster={v.poster} muted loop playsInline preload="none" aria-hidden="true"></video>
          <span className="reel-meta">{v.tag}</span>
          <h3>{v.title}</h3>
        </a>
      ))}
    </div>
  );
}
