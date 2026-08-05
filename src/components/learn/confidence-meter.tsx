"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useTwin } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";

function kindLabel(v: number): { label: string; sub: string } {
  if (v < 25) return { label: "Finding your footing", sub: "Every tiny win lifts this." };
  if (v < 50) return { label: "Steady and growing", sub: "Your twin can see it." };
  if (v < 75) return { label: "Confident and curious", sub: "You're trusting yourself more." };
  return { label: "Shining bright", sub: "What a beautiful stretch." };
}

export function ConfidenceMeter({
  size = 132,
  showLabel = true,
}: {
  size?: number;
  showLabel?: boolean;
}) {
  const value = useTwin((s) => s.traits.confidence?.value ?? 35);
  const reduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const isReduced = reduced || appMotion === "reduced";

  const stroke = 10;
  const r = (size - stroke) / 2 - 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ;

  const { label, sub } = kindLabel(value);

  return (
    <div className="flex items-center gap-4">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label={`Learning confidence: ${Math.round(value)} out of 100. ${label}.`}
      >
        <svg
          width={size}
          height={size}
          className="-rotate-90"
          viewBox={`0 0 ${size} ${size}`}
        >
          <defs>
            <linearGradient id="nt-conf-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="oklch(0.82 0.13 80)" />
              <stop offset="100%" stopColor="oklch(0.7 0.1 155)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="oklch(0.7 0.02 150 / 0.22)"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="url(#nt-conf-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={false}
            animate={{ strokeDashoffset: offset }}
            transition={{
              duration: isReduced ? 0 : 1.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            key={Math.round(value)}
            initial={isReduced ? false : { scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold tabular-nums text-foreground"
          >
            {Math.round(value)}
          </motion.span>
          <span className="text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            confidence
          </span>
        </div>
        {/* Subtle outer pulse ring */}
        {!isReduced && (
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ boxShadow: "0 0 0 0 oklch(0.82 0.13 80 / 0.0)" }}
          />
        )}
      </div>
      {showLabel && (
        <div className="min-w-0">
          <div className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-amber-glow/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-amber-glow-foreground">
            <Sparkles className="size-3" aria-hidden />
            Live twin signal
          </div>
          <p className="text-sm font-semibold text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{sub}</p>
        </div>
      )}
    </div>
  );
}
