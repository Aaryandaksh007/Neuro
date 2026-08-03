"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  Clock,
  Brain,
  TrendingUp,
  Heart,
  Lightbulb,
  MessageCircleHeart,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import type { TwinTrait } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

interface TraitVisual {
  icon: LucideIcon;
  /** Tailwind text-color class for the icon + bar */
  accent: string;
  /** CSS color value for the gradient bar fill */
  barFrom: string;
  barTo: string;
  /** Why-I-do-this line, contextual to this trait */
  whyHint: string;
}

export const TRAIT_VISUALS: Record<string, TraitVisual> = {
  visualPreference: {
    icon: Eye,
    accent: "text-sage",
    barFrom: "oklch(0.74 0.12 155)",
    barTo: "oklch(0.7 0.1 180)",
    whyHint: "I lead with diagrams and visuals because this is high.",
  },
  sessionLength: {
    icon: Clock,
    accent: "text-amber-glow-foreground",
    barFrom: "oklch(0.82 0.13 80)",
    barTo: "oklch(0.74 0.12 50)",
    whyHint: "I keep lessons close to this length so you don't burn out.",
  },
  focusWindow: {
    icon: Brain,
    accent: "text-plum",
    barFrom: "oklch(0.7 0.13 330)",
    barTo: "oklch(0.64 0.12 350)",
    whyHint: "I break work into chunks that fit your focus.",
  },
  retention: {
    icon: TrendingUp,
    accent: "text-sage",
    barFrom: "oklch(0.7 0.1 165)",
    barTo: "oklch(0.74 0.12 145)",
    whyHint: "I replay older ideas gently, when I think you might forget.",
  },
  confidence: {
    icon: Heart,
    accent: "text-rose-soft",
    barFrom: "oklch(0.78 0.08 15)",
    barTo: "oklch(0.72 0.1 30)",
    whyHint: "I celebrate tiny wins to lift this — quietly, never forcing.",
  },
  curiosity: {
    icon: Lightbulb,
    accent: "text-amber-glow-foreground",
    barFrom: "oklch(0.82 0.13 80)",
    barTo: "oklch(0.78 0.1 95)",
    whyHint: "When this is high, I offer one stretch question — never required.",
  },
  calm: {
    icon: MessageCircleHeart,
    accent: "text-sage",
    barFrom: "oklch(0.74 0.09 175)",
    barTo: "oklch(0.7 0.08 195)",
    whyHint: "If this dips, I soften the pace and dim the colors.",
  },
};

const TRAIT_ORDER = [
  "visualPreference",
  "sessionLength",
  "focusWindow",
  "retention",
  "confidence",
  "curiosity",
  "calm",
];

function levelLabel(value: number): { label: string; color: string } {
  if (value < 25) return { label: "Just beginning", color: "text-muted-foreground" };
  if (value < 50) return { label: "Growing", color: "text-primary" };
  if (value < 75) return { label: "Strong", color: "text-amber-glow-foreground" };
  return { label: "Flourishing", color: "text-plum" };
}

export function TraitCard({
  trait,
  index = 0,
}: {
  trait: TwinTrait;
  index?: number;
}) {
  const visual = TRAIT_VISUALS[trait.key] ?? TRAIT_VISUALS.curiosity;
  const Icon = visual.icon;
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";
  const value = Math.round(trait.value);
  const level = levelLabel(value);

  return (
    <motion.article
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: reduced ? 0 : 0.05 * index,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group relative rounded-2xl border bg-card nt-shadow-soft p-5 sm:p-6 overflow-hidden"
      aria-label={`${trait.label}: ${value} out of 100`}
    >
      {/* subtle wash */}
      <div
        aria-hidden
        className="absolute -top-12 -right-12 size-32 rounded-full opacity-40 blur-2xl pointer-events-none group-hover:opacity-60 transition-opacity"
        style={{ background: visual.barFrom }}
      />

      <div className="relative flex items-start gap-3">
        <span
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted/70 ring-1 ring-border/40",
            visual.accent
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold leading-tight">
              {trait.label}
            </h3>
            <span
              className="text-sm font-mono font-semibold tabular-nums"
              aria-hidden
            >
              {value}
              <span className="text-muted-foreground text-xs">/100</span>
            </span>
          </div>
          <p className={cn("text-[11px] font-medium mt-0.5", level.color)}>
            {level.label}
          </p>

          {/* bar */}
          <div
            className="mt-2.5 h-2.5 w-full rounded-full bg-muted overflow-hidden"
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${trait.label} level`}
          >
            <motion.div
              className="h-full rounded-full"
              initial={reduced ? false : { width: 0 }}
              animate={{ width: `${value}%` }}
              transition={{
                duration: reduced ? 0 : 1.1,
                delay: reduced ? 0 : 0.15 + 0.06 * index,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{
                background: `linear-gradient(90deg, ${visual.barFrom}, ${visual.barTo})`,
                boxShadow: `0 0 12px ${visual.barFrom}`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Why I do this — Explainable AI callout */}
      <div className="relative mt-4 flex items-start gap-2 rounded-lg bg-muted/50 px-3 py-2.5">
        <Sparkles className="size-3.5 text-amber-glow-foreground mt-0.5 shrink-0" />
        <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground/80">Why I do this: </span>
          {visual.whyHint}
        </p>
      </div>

      {/* Evidence — what the Twin noticed */}
      {trait.evidence.length > 0 && (
        <div className="relative mt-3.5">
          <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground/80 mb-2">
            What I noticed
          </p>
          <ul className="space-y-2 max-h-32 overflow-y-auto pr-1">
            {trait.evidence
              .slice()
              .reverse()
              .map((ev, i) => (
                <li
                  key={i}
                  className="text-[11px] sm:text-xs leading-relaxed text-foreground/75 flex gap-2"
                >
                  <span
                    className="mt-1 size-1.5 rounded-full shrink-0"
                    style={{ background: visual.barFrom }}
                    aria-hidden
                  />
                  <span>{ev}</span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </motion.article>
  );
}

export function TraitGrid({ traits }: { traits: Record<string, TwinTrait> }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {TRAIT_ORDER.map((key, i) => {
        const t = traits[key];
        if (!t) return null;
        return <TraitCard key={key} trait={t} index={i} />;
      })}
    </div>
  );
}
