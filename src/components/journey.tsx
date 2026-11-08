"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type FocusEvent } from "react";
import type { JourneyStep } from "@/content";

/*
 * The About section as a story you scroll through.
 *
 * A gold line runs under the chapters like the shape of the story: it climbs
 * with the idea and the launch, drops to its lowest point when Book Your Booth
 * went on hold, and rises again to now. A marker rides along it as you scroll.
 *
 * Three ways it shows:
 * - "rest": no script or reduced motion. Every chapter in a plain column, the whole line drawn.
 * - "pinned": wide screens. The stage holds still and each chapter takes it over in turn:
 *   the words slide through, the picture wipes in, the marker moves along the line.
 * - "flow": phones. Chapters stay in a column you scroll, pictures wipe in as they arrive,
 *   and the line sits at the top of the screen showing where you are.
 */

type Mode = "rest" | "pinned" | "flow";

// The story line lives in a 1000 x 100 box; the top is the high point.
const W = 1000;
const H = 100;
const PAD = 12;

type Pt = { x: number; y: number };
type Seg = [Pt, Pt, Pt, Pt];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Smooth curve through every chapter. Ends are mirrored so x moves evenly with t. */
function curve(steps: JourneyStep[]): { d: string; segs: Seg[]; pts: Pt[] } {
  const n = steps.length;
  const pts = steps.map((s, i) => ({ x: n > 1 ? (i / (n - 1)) * W : W / 2, y: PAD + (1 - clamp01(s.rise)) * (H - 2 * PAD) }));
  const mirror = (a: Pt, b: Pt) => ({ x: 2 * a.x - b.x, y: 2 * a.y - b.y });
  const segs: Seg[] = [];
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[i - 1] ?? mirror(pts[i], pts[i + 1]);
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? mirror(pts[i + 1], pts[i]);
    segs.push([p1, { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 }, { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 }, p2]);
  }
  const f = (v: number) => v.toFixed(1);
  const d = segs.length
    ? `M${f(pts[0].x)} ${f(pts[0].y)}` + segs.map(([, a, b, c]) => ` C${f(a.x)} ${f(a.y)} ${f(b.x)} ${f(b.y)} ${f(c.x)} ${f(c.y)}`).join("")
    : "";
  return { d, segs, pts };
}

/** Where the marker sits at story position p (0 to chapters - 1). */
function pointAt(segs: Seg[], pts: Pt[], p: number): Pt {
  if (!segs.length) return pts[0] ?? { x: W / 2, y: H / 2 };
  const i = Math.min(segs.length - 1, Math.max(0, Math.floor(p)));
  const t = clamp01(p - i);
  const [a, b, c, d] = segs[i];
  const u = 1 - t;
  const k = (q: "x" | "y") => u * u * u * a[q] + 3 * u * u * t * b[q] + 3 * u * t * t * c[q] + t * t * t * d[q];
  return { x: k("x"), y: k("y") };
}

const ratioOf = (m: NonNullable<JourneyStep["media"]>) => (m.ratio ?? "4:5").replace(":", " / ");

function Picture({ s }: { s: JourneyStep }) {
  const m = s.media;
  if (!m) {
    return (
      <figure className="sc-media">
        <div className="sc-frame sc-type" style={{ "--ar": "4 / 5" } as CSSProperties}>
          <span>{s.year}</span>
        </div>
      </figure>
    );
  }
  const wide = m.ratio === "16:10";
  return (
    <figure className="sc-media">
      <div className={`sc-frame${wide ? " wide" : ""}`} style={{ "--ar": ratioOf(m) } as CSSProperties}>
        {m.kind === "video" ? (
          <video src={m.src} poster={m.poster} muted loop playsInline preload="none" aria-hidden="true" className={m.fit}></video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.src} alt={m.alt} loading="lazy" className={m.fit} />
        )}
      </div>
      <figcaption>{m.caption}</figcaption>
    </figure>
  );
}

export function Journey({ steps }: { steps: JourneyStep[] }) {
  const box = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const drawn = useRef<SVGRectElement>(null);
  const [mode, setMode] = useState<Mode>("rest");
  const [on, setOn] = useState(0);
  const n = steps.length;
  const { d, segs, pts } = useMemo(() => curve(steps), [steps]);

  // Pick the mode, and change it if the screen changes size.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 900px) and (min-height: 640px)");
    const pick = () => setMode(still.matches ? "rest" : wide.matches ? "pinned" : "flow");
    pick();
    still.addEventListener("change", pick);
    wide.addEventListener("change", pick);
    return () => {
      still.removeEventListener("change", pick);
      wide.removeEventListener("change", pick);
    };
  }, []);

  /** Story position: 0 at the first chapter, n - 1 at the last. */
  const position = useCallback((): number => {
    const el = box.current;
    if (!el) return 0;
    const navH = parseFloat(getComputedStyle(el).getPropertyValue("--nav")) || 0;
    if (mode === "pinned") {
      const r = el.getBoundingClientRect();
      const stageH = innerHeight - navH;
      const run = r.height - stageH;
      return run > 0 ? clamp01((navH - r.top) / run) * (n - 1) : 0;
    }
    // flow: which chapter's top has passed the reading line, and how far towards the next.
    const line = innerHeight * 0.55;
    const tops = [...el.querySelectorAll<HTMLElement>(".scene")].map((s) => s.getBoundingClientRect().top);
    if (tops[0] > line) return 0;
    for (let i = 0; i < tops.length - 1; i++) {
      if (tops[i + 1] > line) return i + clamp01((line - tops[i]) / (tops[i + 1] - tops[i]));
    }
    return n - 1;
  }, [mode, n]);

  // Follow the scroll while the section is near the screen.
  useEffect(() => {
    const el = box.current;
    if (!el || mode === "rest") return;
    const scenes = [...el.querySelectorAll<HTMLElement>(".scene")];
    let frame = 0;
    let last = -1;

    const paint = () => {
      frame = 0;
      const p = position();
      const at = pointAt(segs, pts, p);
      marker.current?.style.setProperty("left", `${(at.x / W) * 100}%`);
      marker.current?.style.setProperty("top", `${(at.y / H) * 100}%`);
      drawn.current?.setAttribute("width", at.x.toFixed(1));

      scenes.forEach((s, i) => {
        const dist = p - i;
        if (mode === "pinned") {
          const o = clamp01((0.48 - Math.abs(dist)) / 0.22);
          // The next picture wipes up over the last one while it fades, so the stage never goes empty.
          const r = dist < 0 ? clamp01((0.7 + dist) / 0.4) : 1;
          const mo = dist > 0 ? clamp01((0.7 - dist) / 0.4) : 1;
          s.style.setProperty("--o", o.toFixed(3));
          s.style.setProperty("--y", `${(-dist * 56).toFixed(1)}px`);
          s.style.setProperty("--r", r.toFixed(3));
          s.style.setProperty("--mo", mo.toFixed(3));
          // Chapters off the stage are hidden outright; the chapter links on the line reach every one.
          s.dataset.gone = o === 0 && (r === 0 || mo === 0) ? "all" : o === 0 ? "copy" : r === 0 || mo === 0 ? "media" : "";
        } else {
          const r = s.querySelector(".sc-frame")?.getBoundingClientRect();
          s.style.setProperty("--r", r ? clamp01((innerHeight - r.top) / (innerHeight * 0.5)).toFixed(3) : "1");
        }
      });

      const now = Math.round(p);
      if (now !== last) {
        last = now;
        setOn(now);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const near = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        addEventListener("scroll", onScroll, { passive: true });
        addEventListener("resize", onScroll);
      } else {
        removeEventListener("scroll", onScroll);
        removeEventListener("resize", onScroll);
      }
      paint();
    }, { rootMargin: "50% 0px" });
    near.observe(el);
    paint();
    return () => {
      near.disconnect();
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
      scenes.forEach((s) => {
        ["--o", "--y", "--r", "--mo"].forEach((v) => s.style.removeProperty(v));
        delete s.dataset.gone;
      });
    };
  }, [mode, position, segs, pts]);

  // Play the clips that are showing; warm up the next chapter's.
  useEffect(() => {
    const el = box.current;
    if (!el || mode === "rest") return;
    const vids = [...el.querySelectorAll<HTMLVideoElement>(".scene video")];
    if (mode === "pinned") {
      vids.forEach((v) => {
        const i = Number(v.closest<HTMLElement>(".scene")?.dataset.i);
        if (i === on) v.play().catch(() => {});
        else v.pause();
        if (i === on + 1) v.preload = "auto";
      });
      return;
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.4 },
    );
    vids.forEach((v) => io.observe(v));
    return () => {
      io.disconnect();
      vids.forEach((v) => v.pause());
    };
  }, [mode, on]);

  /** Scroll so chapter i is the one showing. */
  const go = useCallback(
    (i: number) => {
      const el = box.current;
      if (!el) return;
      const navH = parseFloat(getComputedStyle(el).getPropertyValue("--nav")) || 0;
      const behavior: ScrollBehavior = mode === "rest" ? "auto" : "smooth";
      if (mode === "pinned") {
        const top = el.getBoundingClientRect().top + scrollY;
        const run = el.offsetHeight - (innerHeight - navH);
        scrollTo({ top: top - navH + (n > 1 ? (i / (n - 1)) * run : 0) + 1, behavior });
      } else {
        const s = el.querySelectorAll<HTMLElement>(".scene")[i];
        const bar = el.querySelector<HTMLElement>(".story-line")?.offsetHeight ?? 0;
        if (s) scrollTo({ top: s.getBoundingClientRect().top + scrollY - navH - (mode === "flow" ? bar : 0) - 16, behavior });
      }
    },
    [mode, n],
  );

  // Tabbing onto a link in a chapter that isn't showing brings that chapter in.
  const onFocus = (e: FocusEvent) => {
    if (mode !== "pinned") return;
    const i = Number((e.target as HTMLElement).closest<HTMLElement>(".scene")?.dataset.i);
    if (!Number.isNaN(i) && i !== on) go(i);
  };

  const cur = steps[on] ?? steps[0];

  return (
    <div className={`story ${mode}`} ref={box} style={{ "--n": n } as CSSProperties} onFocus={onFocus}>
      <div className="story-stage">
        <nav className="story-line" aria-label="Chapters of the story">
          <p className="sl-now" aria-hidden="true">
            <b>{cur.when}</b>
            <span>
              {on + 1} of {n}
            </span>
          </p>
          <div className="sl-track">
            <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
              <defs>
                <clipPath id="sl-drawn">
                  <rect ref={drawn} x="0" y="-10" width={mode === "rest" ? W : 0} height={H + 20} />
                </clipPath>
              </defs>
              <path className="sl-base" d={d} vectorEffect="non-scaling-stroke" />
              <path className="sl-gold" d={d} vectorEffect="non-scaling-stroke" clipPath="url(#sl-drawn)" />
            </svg>
            {pts.map((p, i) => (
              <span key={i} className={`sl-dot${i <= on || mode === "rest" ? " past" : ""}`} style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%` }} aria-hidden="true" />
            ))}
            {mode !== "rest" && <span className="sl-marker" ref={marker} aria-hidden="true" />}
          </div>
          <ol className="sl-marks">
            {steps.map((s, i) => (
              <li key={i} style={{ left: `${(pts[i].x / W) * 100}%` }}>
                <a
                  href={`#ch-${i + 1}`}
                  aria-current={i === on && mode !== "rest" ? "step" : undefined}
                  onClick={(e) => {
                    if (mode === "rest") return;
                    e.preventDefault();
                    go(i);
                  }}
                >
                  <span className="sr-only">{s.when}: </span>
                  <span aria-hidden="true">{s.mark}</span>
                  <span className="sr-only">{s.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="scenes">
          {steps.map((s, i) => (
            <li className={`scene${i === on ? " on" : ""}${i % 2 ? " flip" : ""}`} data-i={i} id={`ch-${i + 1}`} key={i}>
              <div className="sc-head">
                <h3>{s.title}</h3>
                <p className="sc-when">{s.when}</p>
              </div>
              <Picture s={s} />
              <div className="sc-body">
                {s.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
                {(s.became || s.links) && (
                  <div className="sc-links">
                    {s.became && (
                      <a className="sc-became" href={s.became.href}>
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
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
