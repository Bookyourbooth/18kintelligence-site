"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from "react";
import { CaptureForm } from "@/components/capture-form";
import type { JourneyStep } from "@/content";

/*
 * The About section as a story you scroll through.
 *
 * A gold line runs above the chapters like the shape of the story: it climbs
 * with the idea and the launch, drops to its lowest point when Book Your Booth
 * went on hold, recovers slowly, then shoots up from April 2026 to now and on
 * past the top. A marker rides along it as you scroll.
 *
 * Three ways it shows:
 * - "rest": no script or reduced motion. Every chapter in a plain column with its picture, the whole line drawn.
 * - "wide": wide screens. The chapters scroll as normal text beside a frame that holds still. The chapter at the
 *   reading line lights up and its picture slides into the frame.
 * - "flow": phones and tablets. Chapters stay in a column and each picture slides in as it arrives,
 *   while the line rides at the top of the screen showing where you are.
 */

type Mode = "rest" | "wide" | "flow";

// The story line lives in a 1000 x 100 box; the top is the high point.
const W = 1000;
const H = 100;
const PAD = 12;

type Pt = { x: number; y: number };
type Seg = [Pt, Pt, Pt, Pt];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * Smooth curve through every chapter, spread over `slots` steps of the width (one more than the
 * chapters need when the line runs on past the last one). Ends are mirrored so x moves evenly with t.
 */
function curve(steps: JourneyStep[], slots: number): { d: string; segs: Seg[]; pts: Pt[] } {
  const n = steps.length;
  const pts = steps.map((s, i) => ({ x: n > 1 ? (i / slots) * W : W / 2, y: PAD + (1 - clamp01(s.rise)) * (H - 2 * PAD) }));
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

/** Everything a picture shows, for screen readers: its caption, then each shot of a montage. */
const describe = (m: NonNullable<JourneyStep["media"]>) => [m.caption, ...(m.shots ?? []).map((x) => x.caption)].join(". ");

/** Which shot of a montage is on screen, from the clip's own clock. */
function useShot(video: RefObject<HTMLVideoElement | null>, shots: { t: number }[] | undefined, live: boolean): number {
  const [k, setK] = useState(0);
  useEffect(() => {
    const v = video.current;
    if (!v || !shots?.length || !live) return;
    const tick = () => {
      const t = v.currentTime;
      let i = 0;
      for (let j = 0; j < shots.length; j++) if (shots[j].t <= t + 0.05) i = j;
      setK((prev) => (prev === i ? prev : i));
    };
    v.addEventListener("timeupdate", tick);
    v.addEventListener("seeked", tick);
    tick();
    return () => {
      v.removeEventListener("timeupdate", tick);
      v.removeEventListener("seeked", tick);
    };
  }, [video, shots, live]);
  return k;
}

function Picture({ s, live, posters }: { s: JourneyStep; live: boolean; posters: boolean }) {
  const m = s.media;
  const vid = useRef<HTMLVideoElement>(null);
  const shots = m?.shots;
  const k = useShot(vid, shots, live);
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
          <video ref={vid} src={m.src} poster={posters ? m.poster : undefined} muted loop playsInline preload="none" aria-hidden="true" className={m.fit}></video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.src} alt={m.alt} loading="lazy" className={m.fit} />
        )}
      </div>
      {shots?.length && live ? (
        <figcaption>
          {/* The visible line follows the shot on screen; screen readers get the whole list once. */}
          <span className="sc-shot" key={k} aria-hidden="true">
            {shots[k].caption}
          </span>
          <span className="sr-only">{describe(m)}</span>
        </figcaption>
      ) : (
        <figcaption>{m.caption}</figcaption>
      )}
    </figure>
  );
}

export function Journey({ steps }: { steps: JourneyStep[] }) {
  const box = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const drawn = useRef<SVGRectElement>(null);
  const tail = useRef<SVGRectElement>(null);
  const landed = useRef(false);
  const [mode, setMode] = useState<Mode>("rest");
  const [on, setOn] = useState(0);
  const [inView, setInView] = useState(false);
  const [posters, setPosters] = useState(false);
  const n = steps.length;
  // When the last chapter holds the kit signup, the line runs on past it to "You".
  const runOn = n > 1 && Boolean(steps[n - 1].kit);
  const slots = runOn ? n : n - 1;
  const { d, segs, pts } = useMemo(() => curve(steps, slots), [steps, slots]);
  const end = pts[n - 1] ?? { x: W / 2, y: H / 2 };
  // The dotted run-on keeps climbing at the angle the line arrives at "Now" (at least a gentle rise),
  // and leaves through the top of the box when it gets there.
  const prev = pts[n - 2];
  const climb = Math.min(prev && end.x > prev.x ? (end.y - prev.y) / (end.x - prev.x) : 0, -0.06);
  const runY = end.y + climb * (W - end.x);
  const runTo = runY < -4 ? { x: end.x + (-4 - end.y) / climb, y: -4 } : { x: W, y: runY };
  /** The lowest chapter: the clips lose their colour and the page darkens as the story nears it. */
  const low = useMemo(() => steps.reduce((m, s, i) => (s.rise < steps[m].rise ? i : m), 0), [steps]);

  // Pick the mode, and change it if the screen changes size.
  useEffect(() => {
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Wide enough for the frame beside the words, and tall enough for a frame worth holding still.
    const wide = window.matchMedia("(min-width: 900px) and (min-height: 560px)");
    const pick = () => setMode(still.matches ? "rest" : wide.matches ? "wide" : "flow");
    pick();
    still.addEventListener("change", pick);
    wide.addEventListener("change", pick);
    return () => {
      still.removeEventListener("change", pick);
      wide.removeEventListener("change", pick);
    };
  }, []);

  // Story posters load as the section gets near, not with the page.
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setPosters(true);
        io.disconnect();
      },
      { rootMargin: "150% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The line rides at the top of the screen: the frame and chapter links keep clear of its height.
  useEffect(() => {
    const el = box.current;
    const bar = line.current;
    if (!el || !bar || mode === "rest") return;
    const set = () => el.style.setProperty("--bar", `${bar.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(bar);
    return () => {
      ro.disconnect();
      el.style.removeProperty("--bar");
    };
  }, [mode]);

  /** Story position: 0 at the first chapter, n - 1 at the last, from which chapter's top has passed the reading line. */
  const position = useCallback((): number => {
    const el = box.current;
    if (!el) return 0;
    const at = innerHeight * 0.45;
    const tops = [...el.querySelectorAll<HTMLElement>(".scene")].map((s) => s.getBoundingClientRect().top);
    if (!tops.length || tops[0] > at) return 0;
    for (let i = 0; i < tops.length - 1; i++) {
      if (tops[i + 1] > at) return i + clamp01((at - tops[i]) / (tops[i + 1] - tops[i]));
    }
    return n - 1;
  }, [n]);

  // Follow the scroll while the section is near the screen: the marker, the line, the low point and the lit chapter.
  useEffect(() => {
    const el = box.current;
    if (!el || mode === "rest") return;
    const root = document.documentElement;
    const endX = pts[n - 1]?.x ?? W;
    let frame = 0;
    let last = -1;
    let dimWas = "";

    const paint = () => {
      frame = 0;
      const p = position();
      const at = pointAt(segs, pts, p);
      marker.current?.style.setProperty("left", `${(at.x / W) * 100}%`);
      marker.current?.style.setProperty("top", `${(at.y / H) * 100}%`);
      drawn.current?.setAttribute("width", at.x.toFixed(1));
      // The dotted stretch to "You" draws in as the last chapter arrives.
      tail.current?.setAttribute("width", (clamp01((p - (n - 1.35)) / 0.35) * (W - endX)).toFixed(1));
      // The low point: near the lowest chapter the clips lose their colour and the page darkens, then it all comes back.
      const dim = clamp01(1 - Math.abs(p - low) / 0.9).toFixed(3);
      if (dim !== dimWas) {
        dimWas = dim;
        root.style.setProperty("--low", dim);
        el.toggleAttribute("data-low", dim !== "0.000");
      }
      // The chapter being read changes as the next heading passes the reading line.
      const now = Math.floor(p);
      if (now !== last) {
        last = now;
        setOn(now);
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const near = new IntersectionObserver(([e]) => {
      setInView(e.isIntersecting);
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
      root.style.removeProperty("--low");
      el.removeAttribute("data-low");
    };
  }, [mode, position, segs, pts, n, low]);

  // Wide: play the chapter in the frame and warm up the next, only while the story is near the screen.
  // The short wait means a jump across several chapters starts one clip, not all of them.
  useEffect(() => {
    const el = box.current;
    if (!el || mode !== "wide") return;
    const vids = [...el.querySelectorAll<HTMLVideoElement>(".j-slide video")];
    const t = setTimeout(
      () =>
        vids.forEach((v) => {
          const i = Number(v.closest<HTMLElement>(".j-slide")?.dataset.i);
          if (inView && i === on) v.play().catch(() => {});
          else v.pause();
          if (inView && i === on + 1) v.preload = "auto";
        }),
      150,
    );
    return () => clearTimeout(t);
  }, [mode, on, inView]);

  // Flow: each picture slides in the first time it arrives, and each clip plays while it's on screen.
  useEffect(() => {
    const el = box.current;
    if (!el || mode !== "flow") return;
    const figs = [...el.querySelectorAll<HTMLElement>(".scene .sc-media")];
    const show = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add("seen");
          show.unobserve(e.target);
        }),
      { rootMargin: "0px 0px -12% 0px" },
    );
    figs.forEach((f) => show.observe(f));
    const vids = [...el.querySelectorAll<HTMLVideoElement>(".scene video")];
    const play = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.4 },
    );
    vids.forEach((v) => play.observe(v));
    return () => {
      show.disconnect();
      play.disconnect();
      vids.forEach((v) => v.pause());
    };
  }, [mode]);

  /** Scroll so chapter i is the one being read. */
  const go = useCallback(
    (i: number, behavior: ScrollBehavior = mode === "rest" ? "auto" : "smooth") => {
      const el = box.current;
      const s = el?.querySelectorAll<HTMLElement>(".scene")[i];
      if (!el || !s) return;
      const navH = parseFloat(getComputedStyle(el).getPropertyValue("--nav")) || 0;
      const bar = mode === "rest" ? 0 : (line.current?.offsetHeight ?? 0);
      scrollTo({ top: s.getBoundingClientRect().top + scrollY - navH - bar - 16, behavior });
    },
    [mode],
  );

  // A link straight to a chapter or past the story (#ch-6, #consult) lands there once the layout has switched.
  useEffect(() => {
    if (mode === "rest" || landed.current) return;
    landed.current = true;
    const id = location.hash.slice(1);
    if (!id) return;
    const ch = /^ch-(\d+)$/.exec(id);
    requestAnimationFrame(() => (ch ? go(Number(ch[1]) - 1, "instant") : document.getElementById(id)?.scrollIntoView({ behavior: "instant" })));
  }, [mode, go]);

  const cur = steps[on] ?? steps[0];

  return (
    <div className={`story ${mode}`} ref={box} style={{ "--n": n } as CSSProperties}>
      {/* Keyboard users can pass the ten chapters in one step. */}
      <a className="btn skip" href="#consult">
        Skip the story
      </a>
      <nav className="story-line" ref={line} aria-label="Chapters of the story">
        <p className="sl-now" aria-hidden="true">
          <b>{cur.when}</b>
          <span>
            {on + 1} of {n}
          </span>
        </p>
        <div
          className="sl-track"
          onClick={(e) => {
            // Tap or click anywhere on the line to go to the nearest chapter.
            const r = e.currentTarget.getBoundingClientRect();
            go(Math.min(n - 1, Math.round(clamp01((e.clientX - r.left) / r.width) * slots)));
          }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="sl-metal" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#C29A49" />
                <stop offset="0.35" stopColor="#EDD493" />
                <stop offset="0.7" stopColor="#D8B562" />
                <stop offset="1" stopColor="#C29A49" />
              </linearGradient>
              <clipPath id="sl-drawn">
                <rect ref={drawn} x="0" y="-10" width={mode === "rest" ? W : 0} height={H + 20} />
              </clipPath>
              <clipPath id="sl-run-on">
                <rect ref={tail} x={end.x.toFixed(1)} y="-10" width={mode === "rest" ? (W - end.x).toFixed(1) : 0} height={H + 20} />
              </clipPath>
            </defs>
            {/* The ground already travelled: one flat dark-gold tone under the drawn line. */}
            {d && <path className="sl-area" d={`${d} L${end.x.toFixed(1)} ${H} L0 ${H} Z`} clipPath="url(#sl-drawn)" />}
            <path className="sl-base" d={d} vectorEffect="non-scaling-stroke" />
            <path className="sl-gold" d={d} vectorEffect="non-scaling-stroke" clipPath="url(#sl-drawn)" />
            {runOn && (
              <path
                className="sl-next"
                d={`M${end.x.toFixed(1)} ${end.y.toFixed(1)} L${runTo.x.toFixed(1)} ${runTo.y.toFixed(1)}`}
                vectorEffect="non-scaling-stroke"
                clipPath="url(#sl-run-on)"
              />
            )}
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
                  // Keyboard focus follows into the chapter.
                  box.current?.querySelectorAll<HTMLElement>(".scene h3")[i]?.focus({ preventScroll: true });
                }}
              >
                <span className="sr-only">{s.when}: </span>
                <span aria-hidden="true">{s.mark}</span>
                <span className="sr-only">{s.title}</span>
              </a>
            </li>
          ))}
          {runOn && (
            <li style={{ left: "100%" }}>
              <a
                href="#story-email"
                aria-label="Your next step: the free Starter Kit"
                onClick={(e) => {
                  if (mode === "rest") return;
                  e.preventDefault();
                  go(n - 1);
                  box.current?.querySelector<HTMLElement>("#story-email")?.focus({ preventScroll: true });
                }}
              >
                You
              </a>
            </li>
          )}
        </ol>
      </nav>

      <div className="story-body">
        {/* Wide screens: one frame holds still beside the words, and each chapter's picture slides into it in turn. */}
        {mode === "wide" && (
          <div className="j-stage" aria-hidden="true">
            {steps.map((s, i) => (
              <div className={`j-slide${i === on ? " on" : ""}`} data-i={i} key={i}>
                <Picture s={s} live posters={posters} />
              </div>
            ))}
          </div>
        )}
        <ol className="scenes">
          {steps.map((s, i) => (
            <li className={`scene${i === on ? " on" : ""}${i % 2 ? " flip" : ""}`} data-i={i} id={`ch-${i + 1}`} key={i}>
              <div className="sc-head">
                <h3 tabIndex={-1}>{s.title}</h3>
                <p className="sc-when">{s.when}</p>
              </div>
              {mode === "wide" ? s.media && <p className="sr-only">{describe(s.media)}</p> : <Picture s={s} live={mode !== "rest"} posters={posters} />}
              <div className="sc-body">
                {s.body.map((b) => (
                  <p key={b}>{b}</p>
                ))}
                {s.kit && (
                  <CaptureForm id="story-email" source="kit" label="Get the free Starter Kit" button="Send me the kit" note="Plus one email a week. Unsubscribe anytime." />
                )}
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
