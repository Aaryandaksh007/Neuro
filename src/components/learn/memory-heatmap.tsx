"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Sparkles } from "lucide-react";
import { useGrowth } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];
const TOTAL_DAYS = 35; // 7 cols × 5 rows

function startOfDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function intensityClass(value: number, retention: number): string {
  if (value <= 0) {
    // Empty day — show a faint potential tint driven by retention.
    if (retention > 60) return "bg-primary/10";
    if (retention > 35) return "bg-primary/[0.06]";
    return "bg-muted/60";
  }
  if (value < 25) return "bg-primary/20";
  if (value < 50) return "bg-primary/35";
  if (value < 75) return "bg-primary/60";
  return "bg-primary/90";
}

export function MemoryHeatmap() {
  const stars = useGrowth((s) => s.stars);
  const retention = useTwin((s) => s.traits.retention?.value ?? 40);
  const reduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const isReduced = reduced || appMotion === "reduced";

  const cells = useMemo(() => {
    const today = startOfDay(new Date());
    const result: {
      dayKey: number;
      date: Date;
      intensity: number;
      concepts: string[];
      isToday: boolean;
    }[] = [];
    for (let i = TOTAL_DAYS - 1; i >= 0; i--) {
      const dayMs = today - i * 86400000;
      const date = new Date(dayMs);
      const dayStars = stars.filter(
        (s) => startOfDay(new Date(s.earnedAt)) === dayMs
      );
      const intensity = dayStars.length
        ? dayStars.reduce((a, b) => a + b.brightness, 0) / dayStars.length
        : 0;
      result.push({
        dayKey: dayMs,
        date,
        intensity,
        concepts: dayStars.map((s) => s.concept),
        isToday: i === 0,
      });
    }
    return result;
  }, [stars]);

  const activeCount = cells.filter((c) => c.intensity > 0).length;
  const isEmpty = stars.length === 0;

  return (
    <MotionDiv
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="relative overflow-hidden rounded-2xl border bg-card p-5 nt-gradient-sage nt-shadow-soft sm:p-6"
      aria-label="Memory heatmap"
    >
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="size-4 text-primary" aria-hidden />
            Memory Map
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Each square is a day. Brighter squares = ideas landing deeper.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-muted/40 px-3 py-1 text-xs">
          <Flame className="size-3.5 text-amber-glow-foreground" aria-hidden />
          <span className="font-medium tabular-nums">{Math.round(retention)}</span>
          <span className="text-muted-foreground">retention</span>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-10 text-center">
          <div className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary nt-breathe">
            <Sparkles className="size-5" aria-hidden />
          </div>
          <p className="text-sm font-medium">
            Your memory map will light up as you learn.
          </p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Try a tiny lesson in the Adaptive Tutor. Each one leaves a soft glow
            here — never a grade, never pressure.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {WEEKDAY_LABELS.map((d, i) => (
              <div
                key={i}
                className="text-center text-[10px] font-medium uppercase tracking-wider text-muted-foreground"
              >
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              const label = c.date.toLocaleDateString(undefined, {
                weekday: "long",
                month: "short",
                day: "numeric",
              });
              const concepts = c.concepts.length
                ? c.concepts.join(" • ")
                : "No new concepts";
              return (
                <motion.div
                  key={c.dayKey}
                  initial={isReduced ? false : { opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: isReduced ? 0 : Math.min(i * 0.012, 0.4),
                  }}
                  className={cn(
                    "aspect-square rounded-md sm:rounded-lg transition-transform",
                    "ring-offset-1 hover:ring-1 hover:ring-primary/30",
                    intensityClass(c.intensity, retention),
                    c.isToday &&
                      "outline outline-2 outline-offset-1 outline-primary/70"
                  )}
                  title={`${label} — ${concepts}`}
                  aria-label={`${label}. ${concepts}. Intensity ${Math.round(
                    c.intensity
                  )} out of 100.`}
                  role="img"
                />
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <span className="size-3 rounded bg-muted/60" />
              <span className="size-3 rounded bg-primary/20" />
              <span className="size-3 rounded bg-primary/40" />
              <span className="size-3 rounded bg-primary/60" />
              <span className="size-3 rounded bg-primary/90" />
            </div>
            <span>More</span>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {activeCount} of {TOTAL_DAYS} days glowing.{" "}
            {activeCount >= 5
              ? "A gentle rhythm is forming."
              : "Even one star counts."}
          </p>
        </>
      )}
    </MotionDiv>
  );
}
