"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Star, Sparkles } from "lucide-react";
import { useGrowth, type MemoryStar } from "@/store/growth";
import { MotionDiv } from "@/components/shared/motion";

// Deterministic star position from id — so the sky is stable across renders.
function hashPos(id: string, seed: number): { x: number; y: number } {
  let h1 = 0;
  let h2 = 0;
  for (let i = 0; i < id.length; i++) {
    h1 = (h1 * 31 + id.charCodeAt(i)) | 0;
    h2 = (h2 * 37 + id.charCodeAt(i) * (i + 1)) | 0;
  }
  h1 = Math.abs(h1 + seed * 7919);
  h2 = Math.abs(h2 + seed * 6151);
  const x = 5 + (h1 % 90); // 5-95%
  const y = 10 + (h2 % 72); // 10-82%
  return { x, y };
}

export default function MemoryGalaxy() {
  const stars = useGrowth((s) => s.stars);
  const totalStars = useGrowth((s) => s.totalStars());
  const reduced = useReducedMotion();

  const containerRef = useRef<HTMLDivElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (reduced) return;
    const el = containerRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setMouse({ x, y });
    };
    const onLeave = () => setMouse({ x: 0, y: 0 });
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced]);

  const constellations = useMemo(() => {
    const map: Record<string, MemoryStar[]> = {};
    for (const s of stars) {
      const key = s.constellation || "Lonely Lights";
      if (!map[key]) map[key] = [];
      map[key].push(s);
    }
    return map;
  }, [stars]);

  const positioned = useMemo(
    () =>
      stars.map((s) => ({
        ...s,
        pos: hashPos(s.id, s.brightness),
      })),
    [stars]
  );

  const parallaxX = reduced ? 0 : mouse.x * -14;
  const parallaxY = reduced ? 0 : mouse.y * -10;

  // Stable background starfield positions
  const bgStars = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => {
        const h = i * 73;
        return {
          x: (h * 17) % 100,
          y: (h * 23) % 100,
          r: 0.5 + ((h % 7) / 7) * 0.9,
          delay: (h % 11) * 0.4,
          opacity: 0.3 + ((h % 5) / 5) * 0.4,
        };
      }),
    []
  );

  const constellationCount = Object.keys(constellations).length;

  return (
    <section
      aria-label="Memory Galaxy"
      className="relative rounded-2xl overflow-hidden border nt-shadow-soft bg-card"
    >
      <div
        ref={containerRef}
        className="relative h-[420px] sm:h-[480px]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, oklch(0.28 0.07 330 / 0.95), oklch(0.16 0.05 280) 55%, oklch(0.10 0.03 270) 100%)",
        }}
      >
        {/* Deep background starfield */}
        <div className="absolute inset-0" aria-hidden>
          {bgStars.map((s, i) => (
            <span
              key={i}
              className="absolute rounded-full nt-twinkle"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: `${s.r}px`,
                height: `${s.r}px`,
                background: "oklch(0.95 0.04 80 / 0.7)",
                opacity: s.opacity,
                animationDelay: `${s.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Soft nebula glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 30% 70%, oklch(0.6 0.12 330 / 0.18), transparent 60%), radial-gradient(ellipse 50% 40% at 80% 30%, oklch(0.7 0.10 80 / 0.12), transparent 60%)",
          }}
        />

        {/* Parallax layer for actual stars */}
        <motion.div
          className="absolute inset-0"
          animate={reduced ? undefined : { x: parallaxX, y: parallaxY }}
          transition={{ type: "spring", stiffness: 50, damping: 18 }}
          style={{ pointerEvents: "none" }}
          aria-hidden
        >
          {/* Constellation connecting lines */}
          <svg
            className="absolute inset-0 w-full h-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 100"
          >
            {Object.entries(constellations).map(([name, group]) => {
              if (group.length < 2) return null;
              const pts = group.map((s) => hashPos(s.id, s.brightness));
              const path = pts
                .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
                .join(" ");
              return (
                <path
                  key={name}
                  d={path}
                  stroke="oklch(0.8 0.06 80 / 0.20)"
                  strokeWidth={0.15}
                  fill="none"
                  strokeDasharray="0.4 0.6"
                />
              );
            })}
          </svg>

          {/* Stars */}
          {positioned.map((s, i) => {
            const size = 4 + (s.brightness / 100) * 18; // 4-22 px
            const glowOpacity = 0.4 + (s.brightness / 100) * 0.5;
            return (
              <div
                key={s.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${s.pos.x}%`, top: `${s.pos.y}%` }}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-full -z-10"
                  style={{
                    width: `${size * 2.4}px`,
                    height: `${size * 2.4}px`,
                    left: "50%",
                    top: "50%",
                    transform: "translate(-50%, -50%)",
                    background: `radial-gradient(circle, oklch(0.92 0.10 80 / ${glowOpacity}) 0%, oklch(0.92 0.10 80 / 0) 70%)`,
                  }}
                />
                {/* Star core */}
                <div
                  className="rounded-full nt-twinkle"
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    background:
                      s.brightness > 70
                        ? "oklch(0.94 0.10 75)"
                        : "oklch(0.92 0.08 80)",
                    animationDelay: `${(i % 7) * 0.4}s`,
                    boxShadow: `0 0 ${size * 0.6}px oklch(0.95 0.10 80 / 0.8)`,
                  }}
                  title={s.concept}
                />
                {/* Hover label */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="rounded-md bg-foreground/90 text-background text-[10px] px-2 py-0.5 whitespace-nowrap shadow-md">
                    {s.concept}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Header overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex items-start justify-between gap-3 pointer-events-none">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Star className="size-4 text-amber-glow-foreground" aria-hidden />
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-glow-foreground/80">
                Memory Galaxy
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-amber-50">
              {totalStars === 0
                ? "Every concept you master becomes a star"
                : `${totalStars} star${totalStars === 1 ? "" : "s"} in your sky`}
            </h2>
            <p className="text-sm text-amber-100/70 mt-1 max-w-md">
              {stars.length === 0
                ? "As you learn, ideas you've truly understood will light up here, grouped into constellations."
                : reduced
                  ? "Each light is something you've made your own."
                  : "Move your mouse to drift through the sky. Each light is something you've made your own."}
            </p>
          </div>
          {totalStars > 0 && (
            <div className="rounded-full bg-foreground/10 backdrop-blur px-3 py-1.5 text-xs text-amber-100/90 font-medium pointer-events-auto shrink-0">
              {constellationCount}{" "}
              {constellationCount === 1 ? "constellation" : "constellations"}
            </div>
          )}
        </div>

        {/* Empty state */}
        {stars.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <MotionDiv
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center px-6"
            >
              <div className="relative mx-auto mb-4 size-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-amber-glow/30 blur-xl nt-breathe" />
                <div className="relative size-14 rounded-full bg-gradient-to-br from-amber-glow/40 to-amber-glow/20 flex items-center justify-center border border-amber-glow/30">
                  <Sparkles className="size-7 text-amber-50" />
                </div>
              </div>
              <p className="text-amber-50/90 text-sm font-medium max-w-xs">
                Your sky is waiting for its first star
              </p>
              <p className="text-amber-100/60 text-xs max-w-xs mt-1.5">
                Complete a lesson in Learn and a concept you master will light
                up here.
              </p>
            </MotionDiv>
          </div>
        )}

        {/* SR-only list of stars */}
        {stars.length > 0 && (
          <ul className="sr-only">
            {stars.map((s) => (
              <li key={s.id}>
                {s.concept} in the {s.constellation} constellation, brightness{" "}
                {s.brightness}.
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
