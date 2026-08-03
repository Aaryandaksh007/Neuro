"use client";

import { Battery, BatteryLow, BatteryWarning, Sparkles } from "lucide-react";
import { MotionDiv } from "@/components/shared/motion";
import { useWellness } from "@/store/wellness";
import { cn } from "@/lib/utils";

function describeLevel(value: number): {
  label: string;
  blurb: string;
  color: string; // tailwind text color class for the level
  fill: string; // gradient for fill bar
  Icon: typeof Battery;
} {
  if (value >= 75)
    return {
      label: "Well charged",
      blurb: "Plenty in the tank. Use it on whatever feels worth it.",
      color: "text-primary",
      fill: "from-primary to-amber-glow",
      Icon: Battery,
    };
  if (value >= 40)
    return {
      label: "Steady",
      blurb: "Enough for the next small step.",
      color: "text-amber-glow-foreground",
      fill: "from-amber-glow to-primary",
      Icon: BatteryLow,
    };
  return {
    label: "Running low",
    blurb: "Be gentle with yourself. The smallest version still counts.",
    color: "text-rose-soft",
    fill: "from-rose-soft to-plum",
    Icon: BatteryWarning,
  };
}

export function EnergyBattery() {
  const latestMood = useWellness((s) => s.latestMood());
  const brainEnergy = useWellness((s) => s.brainWeather.energy);
  // Prefer mood energy if logged recently; otherwise fall back to brain weather.
  const value = latestMood?.energy ?? brainEnergy;
  const level = describeLevel(value);
  const Icon = level.Icon;

  // cap visual width
  const widthPct = Math.max(4, Math.min(100, value));

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-amber p-5 h-full"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="size-8 rounded-lg bg-amber-glow/15 flex items-center justify-center">
          <Icon className="size-4 text-amber-glow-foreground" />
        </span>
        <div>
          <h3 className="font-semibold leading-tight">Energy Battery</h3>
          <p className="text-xs text-muted-foreground">A friendly readout</p>
        </div>
      </div>

      {/* Battery visual */}
      <div
        role="img"
        aria-label={`Energy level ${value} out of 100, ${level.label.toLowerCase()}`}
        className="relative w-full h-12 rounded-lg border-2 border-border bg-muted overflow-hidden"
      >
        {/* Battery tip */}
        <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 h-5 w-2 rounded-r bg-border" />
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${widthPct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "h-full rounded-l-md bg-gradient-to-r relative overflow-hidden",
            level.fill
          )}
        >
          {/* Subtle shimmer */}
          <div className="absolute inset-0 nt-shimmer opacity-40" />
        </MotionDiv>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold tabular-nums drop-shadow-sm">
            {value}%
          </span>
        </div>
      </div>

      <div className="mt-3 flex items-start gap-1.5">
        <Sparkles className={cn("size-3.5 mt-0.5 shrink-0", level.color)} />
        <div>
          <p className={cn("text-sm font-medium", level.color)}>
            {level.label}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
            {level.blurb}
          </p>
        </div>
      </div>
    </MotionDiv>
  );
}
