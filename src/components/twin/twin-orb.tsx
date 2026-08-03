"use client";

import { useId } from "react";
import { useAccessibility } from "@/store/accessibility";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type TwinMood = "learning" | "calm" | "attentive" | "encouraging";

interface MoodTheme {
  label: string;
  status: string;
  c1: string; // outer gradient
  c2: string; // mid gradient
  c3: string; // core
  halo: string; // halo color (rgba-ish oklch)
  ring: string; // pulse ring color
  particle: string;
}

export const MOOD_THEMES: Record<TwinMood, MoodTheme> = {
  learning: {
    label: "Learning you",
    status: "I'm learning how you learn — gently, one detail at a time.",
    c1: "oklch(0.74 0.12 155)",
    c2: "oklch(0.7 0.11 175)",
    c3: "oklch(0.66 0.1 195)",
    halo: "oklch(0.74 0.12 155 / 0.42)",
    ring: "oklch(0.74 0.12 155 / 0.45)",
    particle: "oklch(0.78 0.1 160)",
  },
  calm: {
    label: "Calm presence",
    status: "Soft and quiet. No rush. We go at your pace.",
    c1: "oklch(0.78 0.09 175)",
    c2: "oklch(0.74 0.08 185)",
    c3: "oklch(0.7 0.08 170)",
    halo: "oklch(0.76 0.09 175 / 0.42)",
    ring: "oklch(0.76 0.09 175 / 0.45)",
    particle: "oklch(0.8 0.08 180)",
  },
  attentive: {
    label: "Attentive",
    status: "I'm paying close attention. Every detail matters today.",
    c1: "oklch(0.84 0.13 80)",
    c2: "oklch(0.8 0.12 65)",
    c3: "oklch(0.74 0.12 50)",
    halo: "oklch(0.82 0.13 80 / 0.46)",
    ring: "oklch(0.82 0.13 80 / 0.5)",
    particle: "oklch(0.86 0.12 75)",
  },
  encouraging: {
    label: "Warm & encouraging",
    status: "Cheering you on. Tiny steps count — I see them all.",
    c1: "oklch(0.78 0.1 15)",
    c2: "oklch(0.72 0.12 350)",
    c3: "oklch(0.68 0.13 335)",
    halo: "oklch(0.72 0.12 350 / 0.44)",
    ring: "oklch(0.74 0.12 345 / 0.48)",
    particle: "oklch(0.8 0.11 20)",
  },
};

// Static particle positions (deterministic so they don't jump on re-render)
const PARTICLES = [
  { cx: 38, cy: 60, r: 1.6, d: 0 },
  { cx: 70, cy: 42, r: 1.1, d: 0.6 },
  { cx: 92, cy: 70, r: 1.3, d: 1.2 },
  { cx: 24, cy: 92, r: 1.0, d: 1.8 },
  { cx: 60, cy: 18, r: 1.4, d: 0.3 },
  { cx: 14, cy: 44, r: 0.9, d: 2.1 },
  { cx: 84, cy: 92, r: 1.2, d: 1.5 },
  { cx: 50, cy: 12, r: 0.8, d: 0.9 },
  { cx: 96, cy: 52, r: 1.0, d: 2.4 },
  { cx: 8, cy: 70, r: 1.1, d: 0.4 },
];

interface TwinOrbProps {
  mood: TwinMood;
  size?: number;
  className?: string;
  /** Show the outer pulsing rings + particles */
  ambient?: boolean;
  /** Aria label override */
  ariaLabel?: string;
}

export function TwinOrb({
  mood,
  size = 280,
  className,
  ambient = true,
  ariaLabel,
}: TwinOrbProps) {
  const appMotion = useAccessibility((s) => s.motion);
  const osReduced = useReducedMotion();
  const reduced = osReduced || appMotion === "reduced";
  const theme = MOOD_THEMES[mood];
  const uid = useId().replace(/[:]/g, "");
  const haloId = `orb-halo-${uid}`;
  const bodyId = `orb-body-${uid}`;
  const sheenId = `orb-sheen-${uid}`;
  const coreId = `orb-core-${uid}`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        ariaLabel ?? `Digital Twin orb in ${theme.label} mood`
      }
    >
      {/* Ambient halo glow (blurred) */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 rounded-full pointer-events-none",
          !reduced && "nt-breathe"
        )}
        style={{
          background: `radial-gradient(circle at 50% 50%, ${theme.halo}, transparent 65%)`,
          filter: "blur(22px)",
          transform: "scale(1.15)",
        }}
      />

      {/* Pulsing rings */}
      {ambient && !reduced && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          {[0, 0.8, 1.6].map((delay, i) => (
            <span
              key={i}
              className="absolute inset-[18%] rounded-full nt-pulse-ring"
              style={{
                background: `radial-gradient(circle, ${theme.ring}, transparent 70%)`,
                animationDelay: `${delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Floating wrapper for orb + particles */}
      <div
        className={cn(
          "relative",
          !reduced && "nt-float"
        )}
        style={{ width: size * 0.78, height: size * 0.78 }}
      >
        <svg
          viewBox="0 0 100 100"
          width={size * 0.78}
          height={size * 0.78}
          className={cn(
            "relative z-10 drop-shadow-sm",
            !reduced && "nt-breathe"
          )}
          aria-hidden
        >
          <defs>
            <radialGradient id={haloId} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.c1} stopOpacity="0.9" />
              <stop offset="60%" stopColor={theme.c2} stopOpacity="0.55" />
              <stop offset="100%" stopColor={theme.c3} stopOpacity="0" />
            </radialGradient>
            <radialGradient id={bodyId} cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor={theme.c1} />
              <stop offset="55%" stopColor={theme.c2} />
              <stop offset="100%" stopColor={theme.c3} />
            </radialGradient>
            <radialGradient id={sheenId} cx="32%" cy="26%" r="42%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={coreId} cx="50%" cy="55%" r="55%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* soft outer aura */}
          <circle cx="50" cy="50" r="48" fill={`url(#${haloId})`} />

          {/* main orb body */}
          <circle cx="50" cy="50" r="38" fill={`url(#${bodyId})`} />

          {/* brain-twin connection lines (subtle, like the logo) */}
          <g
            stroke="white"
            strokeOpacity="0.55"
            strokeWidth="0.7"
            strokeLinecap="round"
            fill="none"
          >
            <path d="M32 38c4-3 8-3 12 0s8 3 12 0M30 48c5-3 9-3 13 0s8 3 12 0M32 58c4-3 8-3 12 0s8 3 12 0M36 66c3-2 6-2 9 0s6 2 9 0" />
          </g>

          {/* inner glow core */}
          <circle cx="50" cy="52" r="22" fill={`url(#${coreId})`} />

          {/* top sheen */}
          <ellipse cx="40" cy="34" rx="14" ry="9" fill={`url(#${sheenId})`} />
        </svg>

        {/* Particles orbiting */}
        {ambient && !reduced && (
          <div className="absolute inset-0 pointer-events-none" aria-hidden>
            {PARTICLES.map((p, i) => (
              <span
                key={i}
                className="absolute rounded-full nt-twinkle"
                style={{
                  left: `${p.cx}%`,
                  top: `${p.cy}%`,
                  width: p.r * 3,
                  height: p.r * 3,
                  background: theme.particle,
                  animationDelay: `${p.d}s`,
                  boxShadow: `0 0 ${p.r * 4}px ${theme.particle}`,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
