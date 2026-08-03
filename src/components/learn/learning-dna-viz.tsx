"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { motion, useReducedMotion } from "framer-motion";
import { Brain, Eye, Target, BookOpen, Sparkles, Wind } from "lucide-react";
import { useTwin } from "@/store/twin";
import { useApp } from "@/store/app";
import { useAccessibility } from "@/store/accessibility";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

interface Axis {
  key: string;
  label: string;
  value: number;
  icon: typeof Brain;
  accent: string;
}

export function LearningDNAViz() {
  const traits = useTwin((s) => s.traits);
  const profile = useApp((s) => s.profile);
  const reduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const isReduced = reduced || appMotion === "reduced";

  const data: Axis[] = useMemo(
    () => [
      {
        key: "visual",
        label: "Visual",
        value: traits.visualPreference?.value ?? 50,
        icon: Eye,
        accent: "text-primary",
      },
      {
        key: "focus",
        label: "Focus",
        value: traits.focusWindow?.value ?? 45,
        icon: Target,
        accent: "text-amber-glow-foreground",
      },
      {
        key: "retention",
        label: "Retention",
        value: traits.retention?.value ?? 40,
        icon: BookOpen,
        accent: "text-plum",
      },
      {
        key: "confidence",
        label: "Confidence",
        value: traits.confidence?.value ?? 35,
        icon: Sparkles,
        accent: "text-amber-glow-foreground",
      },
      {
        key: "curiosity",
        label: "Curiosity",
        value: traits.curiosity?.value ?? 60,
        icon: Brain,
        accent: "text-primary",
      },
      {
        key: "calm",
        label: "Calm",
        value: traits.calm?.value ?? 55,
        icon: Wind,
        accent: "text-rose-soft",
      },
    ],
    [traits]
  );

  const chartData = data.map((d) => ({ subject: d.label, value: Math.round(d.value) }));

  // Pick the top and bottom trait for the explainable-AI insight line.
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const top = sorted[0];
  const growing = sorted[sorted.length - 1];

  const profileChips = [
    {
      label: "Preferred style",
      value: profile.preferredStyle || "—",
      icon: Brain,
    },
    {
      label: "Reading pace",
      value: profile.readingSpeed || "moderate",
      icon: BookOpen,
    },
    {
      label: "Attention span",
      value: profile.attentionSpan || "medium",
      icon: Target,
    },
    {
      label: "Session length",
      value: `${profile.sessionLength || 20} min`,
      icon: Sparkles,
    },
  ];

  return (
    <MotionDiv
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"
    >
      {/* Radar chart card */}
      <section
        aria-label="Learning DNA radar chart"
        className="relative overflow-hidden rounded-2xl border bg-card p-5 nt-gradient-sage nt-shadow-soft sm:p-6"
      >
        <div className="mb-1 flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Brain className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">
              Your Learning DNA
            </h3>
            <p className="text-xs text-muted-foreground">
              Six signals we listen to when we adapt lessons for you.
            </p>
          </div>
        </div>
        <div className="mt-2 h-[300px] w-full sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={chartData}
              outerRadius="72%"
              margin={{ top: 16, right: 24, bottom: 8, left: 24 }}
            >
              <PolarGrid
                stroke="oklch(0.5 0.02 150 / 0.28)"
                strokeDasharray="3 4"
              />
              <PolarAngleAxis
                dataKey="subject"
                tick={{
                  fontSize: 12,
                  fill: "oklch(0.45 0.02 150)",
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                tick={false}
                axisLine={false}
                tickCount={5}
              />
              <Radar
                dataKey="value"
                stroke="oklch(0.7 0.1 155)"
                strokeWidth={2}
                fill="oklch(0.7 0.1 155)"
                fillOpacity={0.3}
                isAnimationActive={!isReduced}
                animationDuration={900}
                animationEasing="ease-out"
                dot={{
                  r: 3,
                  fill: "oklch(0.62 0.11 155)",
                  stroke: "oklch(0.99 0.01 150)",
                  strokeWidth: 1.5,
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Insights + profile */}
      <section className="flex flex-col gap-4">
        <div className="rounded-2xl border bg-card p-5 nt-shadow-soft">
          <h3 className="text-sm font-semibold">What your twin sees right now</h3>
          <div className="mt-3 space-y-3">
            <InsightRow
              icon={top.icon}
              accent={top.accent}
              title={`${top.label} is your superpower`}
              text={`${Math.round(
                top.value
              )}/100 — we lean into this when we shape your lessons.`}
            />
            <InsightRow
              icon={growing.icon}
              accent={growing.accent}
              title={`${growing.label} is gently growing`}
              text={`At ${Math.round(
                growing.value
              )}/100 — small practice here turns into big leaps.`}
            />
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 nt-shadow-soft">
          <h3 className="text-sm font-semibold">Your learning setup</h3>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {profileChips.map((c) => {
              const Icon = c.icon;
              return (
                <div
                  key={c.label}
                  className="rounded-xl border bg-muted/30 px-3 py-2.5"
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    <Icon className="size-3" aria-hidden />
                    {c.label}
                  </div>
                  <p className="mt-0.5 text-sm font-medium capitalize text-foreground">
                    {c.value}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </MotionDiv>
  );
}

function InsightRow({
  icon: Icon,
  accent,
  title,
  text,
}: {
  icon: typeof Brain;
  accent: string;
  title: string;
  text: string;
}) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="flex items-start gap-3 rounded-xl border border-border/60 bg-muted/20 p-3"
    >
      <div
        className={cn(
          "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted",
          accent
        )}
      >
        <Icon className="size-4" aria-hidden />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium leading-tight">{title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{text}</p>
      </div>
    </motion.div>
  );
}
