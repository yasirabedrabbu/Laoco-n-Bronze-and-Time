"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import SplitTitle from "./SplitTitle";
import { createScene, damp } from "@/lib/scene";

const MODEL_URL = "/models/bronze_horse.glb";

const NAV = [
  { label: "Bronze", id: "slide-1", target: 0.0 },
  { label: "Marble", id: "slide-2", target: 0.34 },
  { label: "Liquid", id: "slide-3", target: 0.62 },
  { label: "Eternal", id: "slide-4", target: 0.94 },
];

const SLIDE_RANGES: ReadonlyArray<readonly [number, number]> = [
  [-0.1, 0.12],
  [0.28, 0.4],
  [0.56, 0.68],
  [0.84, 1.05],
];

export default function Experience() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorInnerRef = useRef<HTMLDivElement>(null);
  const cursorOuterRef = useRef<HTMLDivElement>(null);

  // 0 = no slide active, 1..4 = active slide
  const [active, setActive] = useState(1);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const inner = cursorInnerRef.current;
    const outer = cursorOuterRef.current;
    if (!root || !canvas || !inner || !outer) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // cache DOM nodes once (no querySelector inside the frame loop)
    const dots = Array.from(root.querySelectorAll<HTMLElement>(".grid-dot"));
    const fills = Array.from(root.querySelectorAll<HTMLElement>(".story-dash-fill"));
    let dotHeights: number[] = [];
    const measureDots = () => {
      dotHeights = dots.map((d) => d.parentElement?.offsetHeight ?? window.innerHeight);
    };
    measureDots();

    // cursor state
    let cx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    let ox = cx;
    let oy = cy;
    inner.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;

    let lastActive = -1;

    const scene = createScene({
      canvas,
      modelUrl: MODEL_URL,
      reducedMotion: reduced,
      onProgress: setProgress,
      onLoaded: () => {
        setProgress(1);
        setReady(true);
      },
      onError: (message) => {
       console.error("[Experience] Model error:", message);
       setFailed(true);
      },
      onFrame: ({ scroll, dt }) => {
        // outer cursor ring follows with lag
        ox += (cx - ox) * damp(13.4, dt);
        oy += (cy - oy) * damp(13.4, dt);
        outer.style.transform = `translate3d(${ox}px, ${oy}px, 0) translate(-50%, -50%)`;

        // drifting grid dots (transform only, no layout)
        for (let i = 0; i < dots.length; i++) {
          const startY = ((i * 17) % 80) + 10;
          let speed = 90 + ((i * 55) % 180);
          if (i % 2 === 0) speed = -speed;
          let y = startY + scroll * speed;
          y = ((y % 100) + 100) % 100;
          dots[i].style.transform = `translate3d(-50%, ${(y / 100) * dotHeights[i] - 3}px, 0)`;
        }

        // story progress dashes
        for (let i = 0; i < fills.length; i++) {
          const start = i * 0.25;
          const p = Math.max(0, Math.min(1, (scroll - start) / 0.25));
          fills[i].style.transform = `scaleY(${p})`;
        }

        // active slide (only touches React state when it changes)
        const next = SLIDE_RANGES.findIndex(([a, b]) => scroll >= a && scroll <= b) + 1;
        if (next !== lastActive) {
          lastActive = next;
          setActive(next);
        }
      },
    });

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      cx = e.clientX;
      cy = e.clientY;
      inner.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`;
      scene.setPointer((cx / window.innerWidth) * 2 - 1, (cy / window.innerHeight) * 2 - 1);
      const overInteractive = e.target instanceof Element && !!e.target.closest("a, button");
      outer.classList.toggle("is-hover", overInteractive);
    };

    const onResize = () => measureDots();

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      scene.dispose();
    };
  }, []);

  const goTo = (target: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: max * target, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div ref={rootRef}>
      {/* Preloader */}
      <div className={`preloader ${ready ? "done" : ""}`} role="status" aria-live="polite">
        <span className="preloader-brand">Laocoön</span>
        <span className="preloader-count">
          {failed
            ? "Could not load the sculpture"
            : progress > 0
            ? `${Math.round(progress * 100)}%`
            : "Loading"}
        </span>
      </div>

      {/* Custom cursor (hidden on touch devices via CSS) */}
      <div ref={cursorInnerRef} className="cursor-inner" aria-hidden="true" />
      <div ref={cursorOuterRef} className="cursor-outer" aria-hidden="true" />

      {/* Scroll space that drives everything */}
      <div className="scroll-space" />

      <canvas ref={canvasRef} id="webgl" aria-hidden="true" />

      {/* Slide 2 editorial image */}
      <div className={`slide-image-mask ${active === 2 ? "active" : ""}`} id="slide-2-img">
        <Image
          src="/images/1.png"
          alt="Editorial concept"
          fill
          sizes="25vw"
          priority
          className="slide-2-photo"
        />
      </div>

      {/* Grid overlay */}
      <div className="grid-horizontal-line" />
      <div className="grid-lines" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div className="grid-line" key={i}>
            <div className="grid-dot" />
            <div className="grid-dot" />
          </div>
        ))}
        <div className="grid-line story-progress-container">
          <div className="grid-dot" />
          <div className="grid-dot" />
          <div className="story-dashes">
            {[1, 2, 3, 4].map((n) => (
              <div className="story-dash" key={n}>
                <div className="story-dash-fill" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cinematic overlay */}
      <div className="cinematic-container">
        <header className="main-header">
          <div className="brand">Laocoön</div>
          <nav className="header-nav" aria-label="Sections">
            {NAV.map((item, i) => (
              <span className="nav-item" key={item.id}>
                <a href={`#${item.id}`} className="nav-link" onClick={goTo(item.target)}>
                  {item.label}
                </a>
                {i < NAV.length - 1 && <span className="nav-dot" />}
              </span>
            ))}
          </nav>
          <div className="header-actions">
            {/* TODO: replace with your real contact link */}
            <a href="mailto:hello@example.com" className="contact-btn">
              Contact <span className="btn-circle" />
            </a>
          </div>
        </header>

        <section className={`slide ${active === 1 ? "active" : ""}`} id="slide-1">
          <SplitTitle lines={["Bronze", "and Time"]} />
          <div className="desc-row">
            <p className="slide-desc col-1">
              A timeless material holding centuries of human history. Fluid in hot flames,
              eternal in its form. Each curve captures a tense, dramatic moment.
            </p>
            <p className="slide-desc col-2">
              Born of molten fire and creative will, it stands to bridge our ancient memory and
              modern vision. A fluid energy frozen in still, heavy bronze.
            </p>
          </div>
        </section>

        <section className={`slide ${active === 2 ? "active" : ""}`} id="slide-2">
          <SplitTitle lines={["Marble", "Emotion"]} />
          <p className="slide-desc">
            A sculpture frozen at the peak of human suffering and heroic struggle. Laocoön and his
            sons, bound by ruthless fate.
          </p>
        </section>

        <section className={`slide ${active === 3 ? "active" : ""}`} id="slide-3">
          <SplitTitle lines={["Liquid Metal"]} />
          <p className="slide-desc">
            Art that breathes. Mesmerizing waves of liquid bronze flow through space, reflecting
            every contour and tensed muscle of the ancient masterpiece.
          </p>
        </section>

        <section className={`slide ${active === 4 ? "active" : ""}`} id="slide-4">
          <SplitTitle lines={["Eternal", "Moment"]} />
          <p className="slide-desc">
            Contemplating antique form through the lens of new dimensions. A classic masterpiece
            reborn in the currents of radiant digital matter.
          </p>
        </section>
      </div>
    </div>
  );
}