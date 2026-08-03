"use client";

import { useMemo } from "react";
import {
  Brain,
  Sparkles,
  Wind,
  Heart,
  Battery,
  Lightbulb,
} from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { useWellness, type BrainWeather } from "@/store/wellness";
import { cn } from "@/lib/utils";

type DimKey = keyof BrainWeather;

interface DimMeta {
  key: DimKey;
  label: string;
  icon: typeof Brain;
  color: string; // CSS var ref
  accentText: string;
  // gentle adaptive strategy by trait level
  strategyLow: string;
  strategyHigh: string;
  studyTip: string;
}

const DIMENSIONS: DimMeta[] = [
  {
    key: "clarity",
    label: "Clarity",
    icon: Sparkles,
    color: "var(--color-sage)",
    accentText: "text-primary",
    strategyLow:
      "Your mind feels a little foggy. A sip of water and one tiny step can lift it.",
    strategyHigh: "Thinking feels clear. A great moment for something new.",
    studyTip:
      "Because clarity is low, start with a 5-minute warm-up before the real thing.",
  },
  {
    key: "focus",
    label: "Focus",
    icon: Brain,
    color: "var(--color-amber-glow)",
    accentText: "text-amber-glow-foreground",
    strategyLow:
      "Focus feels scattered. A 2-minute break might help, then short 10-minute bursts.",
    strategyHigh: "Focus is steady. Try one uninterrupted 25-minute session.",
    studyTip:
      "Because your focus is low, I suggest short sessions with gentle breaks.",
  },
  {
    key: "calm",
    label: "Calm",
    icon: Heart,
    color: "var(--color-rose-soft)",
    accentText: "text-rose-soft",
    strategyLow:
      "Something feels heavy. The breathing companion or Calm Room can help.",
    strategyHigh: "You feel settled. A good window to stretch a little further.",
    studyTip:
      "Because calm is low, try the breathing companion before you begin.",
  },
  {
    key: "energy",
    label: "Energy",
    icon: Wind,
    color: "var(--color-plum)",
    accentText: "text-plum",
    strategyLow:
      "Energy is gentle right now. Pick the smallest version of your task.",
    strategyHigh: "Energy is here. Use it for the thing you've been postponing.",
    studyTip:
      "Because energy is low, choose the smallest, kindest version of today's task.",
  },
];

export function BrainWeatherCard() {
  const brain = useWellness((s) => s.brainWeather);
  const setBrainWeather = useWellness((s) => s.setBrainWeather);

  // Find lowest dimension — drives the adaptive suggestion.
  const lowest = useMemo<DimMeta>(() => {
    return [...DIMENSIONS].sort(
      (a, b) => brain[a.key] - brain[b.key]
    )[0];
  }, [brain]);

  const radarData = DIMENSIONS.map((d) => ({
    dimension: d.label,
    value: brain[d.key],
  }));

  return (
    <section
      aria-labelledby="brain-weather-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-sage overflow-hidden"
    >
      <div className="p-5 sm:p-6 flex flex-col lg:flex-row gap-6">
        {/* Left: chart */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Brain className="size-4 text-primary" />
            <h2 id="brain-weather-heading" className="text-lg font-semibold">
              Brain Weather
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Four gentle dimensions. Slide them to match how your mind feels
            right now.
          </p>

          <div className="h-44 w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="oklch(0.7 0.02 150 / 0.25)" />
                <PolarAngleAxis
                  dataKey="dimension"
                  tick={{
                    fill: "oklch(0.5 0.02 150)",
                    fontSize: 11,
                  }}
                />
                <Radar
                  dataKey="value"
                  stroke="var(--color-sage)"
                  fill="var(--color-sage)"
                  fillOpacity={0.28}
                  strokeWidth={2}
                  isAnimationActive
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Sliders */}
          <div className="mt-4 grid sm:grid-cols-2 gap-x-5 gap-y-4">
            {DIMENSIONS.map((d) => (
              <SliderRow
                key={d.key}
                meta={d}
                value={brain[d.key]}
                onChange={(v) => setBrainWeather({ [d.key]: v })}
              />
            ))}
          </div>
        </div>

        {/* Right: adaptive suggestion */}
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="lg:w-72 shrink-0 rounded-2xl bg-gradient-to-br from-rose-soft/15 via-primary/5 to-amber-glow/10 border border-border/50 p-5 flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="size-8 rounded-lg bg-card/80 flex items-center justify-center">
              <Lightbulb className={cn("size-4", lowest.accentText)} />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium">
                Adaptive suggestion
              </p>
              <p className="text-sm font-semibold">
                Lean toward{" "}
                <span className={lowest.accentText}>
                  {lowest.label.toLowerCase()}
                </span>
              </p>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-foreground/90">
            {brain[lowest.key] <= 45
              ? lowest.strategyLow
              : lowest.strategyHigh}
          </p>

          <div className="rounded-xl bg-card/70 border border-border/50 p-3 mt-1">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-medium mb-1">
              Today's study strategy
            </p>
            <p className="text-sm leading-relaxed">{lowest.studyTip}</p>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Sparkles className="size-3 text-primary" />
              <span>Explainable: based on your lowest dimension.</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-auto pt-2">
            <Battery className="size-3" />
            <span>Not a diagnosis — just a gentle nudge.</span>
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}

function SliderRow({
  meta,
  value,
  onChange,
}: {
  meta: DimMeta;
  value: number;
  onChange: (v: number) => void;
}) {
  const Icon = meta.icon;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label
          htmlFor={`bw-${meta.key}`}
          className="text-sm font-medium flex items-center gap-1.5"
        >
          <Icon className={cn("size-3.5", meta.accentText)} />
          {meta.label}
        </label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {value}
        </span>
      </div>
      <Slider
        id={`bw-${meta.key}`}
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        aria-label={`${meta.label} level`}
        className="[&_[data-slot=slider-range]]:bg-[var(--color-chart-1)]"
      />
    </div>
  );
}
