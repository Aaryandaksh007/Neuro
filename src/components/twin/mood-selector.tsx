"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Leaf, Sparkles, Eye, Heart, Check } from "lucide-react";
import type { TwinMood } from "./twin-orb";
import { MOOD_THEMES } from "./twin-orb";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

interface Option {
  key: TwinMood;
  label: string;
  desc: string;
  icon: typeof Leaf;
}

const OPTIONS: Option[] = [
  {
    key: "calm",
    label: "Gentle",
    desc: "Soft, quiet, slow",
    icon: Leaf,
  },
  {
    key: "learning",
    label: "Curious",
    desc: "Learning you",
    icon: Sparkles,
  },
  {
    key: "attentive",
    label: "Attentive",
    desc: "Close attention",
    icon: Eye,
  },
  {
    key: "encouraging",
    label: "Encouraging",
    desc: "Warm cheer",
    icon: Heart,
  },
];

export function MoodSelector({
  value,
  onChange,
}: {
  value: TwinMood;
  onChange: (m: TwinMood) => void;
}) {
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  return (
    <div
      role="radiogroup"
      aria-label="How should your Twin be today?"
      className="flex flex-wrap gap-2"
    >
      {OPTIONS.map((opt) => {
        const active = value === opt.key;
        const Icon = opt.icon;
        const theme = MOOD_THEMES[opt.key];
        return (
          <button
            key={opt.key}
            role="radio"
            aria-checked={active}
            aria-label={`${opt.label}: ${opt.desc}`}
            onClick={() => onChange(opt.key)}
            className={cn(
              "relative flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-all",
              active
                ? "border-transparent text-foreground nt-shadow-soft"
                : "bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
            )}
            style={
              active
                ? {
                    background: `linear-gradient(135deg, ${theme.c1}, ${theme.c2})`,
                    color: "white",
                  }
                : undefined
            }
          >
            {active && !reduced && (
              <motion.span
                layoutId="mood-active-glow"
                className="absolute inset-0 rounded-full"
                style={{
                  boxShadow: `0 0 0 3px ${theme.ring}`,
                }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
              />
            )}
            <Icon className="size-4 relative z-10" />
            <span className="relative z-10 font-medium">{opt.label}</span>
            {active && <Check className="size-3.5 relative z-10" />}
          </button>
        );
      })}
    </div>
  );
}
