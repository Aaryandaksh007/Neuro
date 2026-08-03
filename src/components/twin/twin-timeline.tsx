"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  Lightbulb,
  Heart,
  Sparkles,
  Calendar,
  type LucideIcon,
} from "lucide-react";
import type { TwinMemory } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

type MemoryKind = TwinMemory["kind"];

interface KindMeta {
  label: string;
  icon: LucideIcon;
  color: string; // hex/oklch
  bg: string; // tint
  ring: string;
}

export const KIND_META: Record<MemoryKind, KindMeta> = {
  observation: {
    label: "Observation",
    icon: Eye,
    color: "oklch(0.62 0.1 165)",
    bg: "oklch(0.74 0.12 155 / 0.12)",
    ring: "oklch(0.74 0.12 155 / 0.5)",
  },
  adaptation: {
    label: "Adaptation",
    icon: Lightbulb,
    color: "oklch(0.7 0.13 80)",
    bg: "oklch(0.82 0.13 80 / 0.14)",
    ring: "oklch(0.82 0.13 80 / 0.55)",
  },
  celebration: {
    label: "Celebration",
    icon: Heart,
    color: "oklch(0.66 0.1 20)",
    bg: "oklch(0.78 0.08 15 / 0.14)",
    ring: "oklch(0.78 0.08 15 / 0.55)",
  },
  insight: {
    label: "Insight",
    icon: Sparkles,
    color: "oklch(0.62 0.13 330)",
    bg: "oklch(0.7 0.13 330 / 0.12)",
    ring: "oklch(0.7 0.13 330 / 0.55)",
  },
};

// Projected gentle future milestones — clearly framed as growth trajectory
interface Milestone {
  day: number;
  text: string;
  kind: MemoryKind;
}

const PROJECTED: Milestone[] = [
  {
    day: 5,
    text: "I'll have a clearer sense of your focus rhythm — and adapt lesson length.",
    kind: "adaptation",
  },
  {
    day: 15,
    text: "I'll know which topics light you up, and bring more of them to you.",
    kind: "insight",
  },
  {
    day: 30,
    text: "We'll have a real rhythm together. You'll feel that I get you — gently.",
    kind: "celebration",
  },
];

export function TwinTimeline({
  memories,
  currentDay,
}: {
  memories: TwinMemory[];
  currentDay: number;
}) {
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  // Sort: by day ascending, then by createdAt
  const sorted = [...memories].sort((a, b) => {
    if (a.day !== b.day) return a.day - b.day;
    return a.createdAt - b.createdAt;
  });

  // Find projected milestones that are still in the future
  const future = PROJECTED.filter((m) => m.day > currentDay).slice(0, 3);

  return (
    <ol
      className="relative space-y-5 pl-7 sm:pl-9"
      aria-label="Digital Twin memory timeline, Day 1 onwards"
    >
      {/* vertical line */}
      <div
        aria-hidden
        className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-primary/25 to-transparent"
      />

      {sorted.map((m, i) => {
        const meta = KIND_META[m.kind];
        const Icon = meta.icon;
        return (
          <motion.li
            key={m.id}
            initial={reduced ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.45,
              delay: reduced ? 0 : 0.04 * i,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="relative"
          >
            {/* node */}
            <span
              aria-hidden
              className="absolute -left-7 sm:-left-9 top-3 flex size-6 sm:size-7 items-center justify-center rounded-full border bg-card"
              style={{ borderColor: meta.ring, background: meta.bg }}
            >
              <Icon
                className="size-3.5 sm:size-4"
                style={{ color: meta.color }}
              />
            </span>

            <article
              className="rounded-xl border bg-card/70 backdrop-blur-sm px-4 py-3 nt-shadow-soft"
              tabIndex={0}
            >
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  <Calendar className="size-3" />
                  Day {m.day}
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground"
                >
                  {meta.label}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {m.text}
              </p>
            </article>
          </motion.li>
        );
      })}

      {/* Projected future milestones */}
      {future.length > 0 && (
        <li className="relative pt-2" aria-label="Projected growth milestones">
          <div className="mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground/80">
            <span
              aria-hidden
              className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"
            />
            <span>Coming soon · my growth with you</span>
            <span
              aria-hidden
              className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent"
            />
          </div>

          <div className="space-y-3">
            {future.map((m, i) => {
              const meta = KIND_META[m.kind];
              const Icon = meta.icon;
              return (
                <motion.div
                  key={`future-${m.day}`}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: reduced ? 0 : 0.08 + 0.08 * i,
                  }}
                  className="relative rounded-xl border border-dashed bg-muted/30 px-4 py-3"
                >
                  <span
                    aria-hidden
                    className="absolute -left-7 sm:-left-9 top-3 flex size-6 sm:size-7 items-center justify-center rounded-full border border-dashed bg-card"
                    style={{ borderColor: meta.ring }}
                  >
                    <Icon
                      className="size-3.5"
                      style={{ color: meta.color, opacity: 0.7 }}
                    />
                  </span>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      <Calendar className="size-3" />
                      Day {m.day}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/70">
                      Coming soon
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {m.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </li>
      )}
    </ol>
  );
}
