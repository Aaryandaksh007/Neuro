"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useGrowth } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { useHealth } from "@/store/health";

function FutureCard({
  label,
  value,
  suffix,
  delta,
  color,
  reduced,
  delay,
}: {
  label: string;
  value: number;
  suffix?: string;
  delta: number;
  color: string;
  reduced: boolean | null;
  delay: number;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-xl border bg-card p-3 sm:p-3.5"
    >
      <div className="text-xs text-muted-foreground leading-tight">
        {label}
      </div>
      <div className="flex items-baseline gap-1.5 mt-1.5">
        <span
          className="text-xl sm:text-2xl font-semibold tabular-nums"
          style={{ color }}
        >
          {value}
          {suffix}
        </span>
        {delta > 0 && (
          <span
            className="text-[11px] font-medium px-1.5 py-0.5 rounded-full"
            style={{
              color,
              background: `color-mix(in oklch, ${color} 12%, transparent)`,
            }}
          >
            +{delta}
            {suffix}
          </span>
        )}
      </div>
    </motion.div>
  );
}

export default function FutureSelf() {
  const trees = useGrowth((s) => s.trees);
  const stars = useGrowth((s) => s.stars);
  const persistence = useGrowth((s) => s.persistence);
  const curiosity = useTwin((s) => s.traits.curiosity?.value ?? 50);
  const streak = useHealth((s) => s.streak());
  const reduced = useReducedMotion();

  // Gentle 30-day projection, grounded in current data. Always encouraging,
  // never punitive. We assume the user keeps their current gentle pace.
  const growthFactor = Math.max(1, streak);
  const projectedTrees = trees.length + Math.max(2, Math.round(growthFactor * 0.5) + 1);
  const projectedStars = stars.length + Math.max(3, Math.round(growthFactor * 0.8) + 2);
  const projectedPersistence = Math.min(
    100,
    Math.round(persistence + 10 + growthFactor * 0.4)
  );
  const projectedCuriosity = Math.min(
    100,
    Math.round(curiosity + 6 + growthFactor * 0.3)
  );

  return (
    <section
      aria-label="Future Self"
      className="rounded-2xl border nt-shadow-soft nt-gradient-amber bg-card p-4 sm:p-6"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <ArrowUpRight className="size-4 text-amber-glow-foreground" aria-hidden />
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-glow-foreground/80">
              Future Self
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            If you keep this gentle pace…
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed max-w-md">
            Not a prediction — an encouragement. Your pace is yours alone, and
            any pace counts.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <FutureCard
          label="Trees in your forest"
          value={projectedTrees}
          delta={projectedTrees - trees.length}
          color="oklch(0.62 0.10 155)"
          reduced={reduced}
          delay={0}
        />
        <FutureCard
          label="Stars in your sky"
          value={projectedStars}
          delta={projectedStars - stars.length}
          color="oklch(0.74 0.12 75)"
          reduced={reduced}
          delay={0.06}
        />
        <FutureCard
          label="Persistence"
          value={projectedPersistence}
          suffix="%"
          delta={projectedPersistence - persistence}
          color="oklch(0.62 0.13 330)"
          reduced={reduced}
          delay={0.12}
        />
        <FutureCard
          label="Curiosity"
          value={projectedCuriosity}
          suffix="%"
          delta={projectedCuriosity - Math.round(curiosity)}
          color="oklch(0.74 0.12 155)"
          reduced={reduced}
          delay={0.18}
        />
      </div>

      <p className="text-sm text-muted-foreground mt-4 italic leading-relaxed">
        “In 30 days, your forest could look like this — if you keep being gentle
        with yourself.”
      </p>
    </section>
  );
}
