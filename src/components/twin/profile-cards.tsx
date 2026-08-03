"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Eye,
  Clock,
  BookOpen,
  Brain,
  Target,
  Sparkles,
  ShieldCheck,
  Heart,
  Pencil,
  type LucideIcon,
} from "lucide-react";
import type { LearnerProfile, LearningStyle } from "@/store/app";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

const STYLE_LABEL: Record<LearningStyle, string> = {
  visual: "Visual — diagrams & images",
  verbal: "Verbal — spoken explanation",
  auditory: "Auditory — listening & sound",
  kinesthetic: "Hands-on — move and do",
  reading: "Reading — text first",
};

const SPEED_LABEL: Record<string, string> = {
  slow: "Slow & steady",
  moderate: "Moderate",
  fast: "Fast",
};

const ATTENTION_LABEL: Record<string, string> = {
  short: "Short bursts (5–10 min)",
  medium: "Medium (10–25 min)",
  long: "Long (25+ min)",
};

interface ProfileCardDef {
  key: string;
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  accent: string;
}

export function ProfileCards({ profile }: { profile: LearnerProfile }) {
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  const cards: ProfileCardDef[] = [
    {
      key: "style",
      icon: Eye,
      label: "Preferred style",
      value: STYLE_LABEL[profile.preferredStyle] ?? "Visual",
      hint: "I lead lessons in this style.",
      accent: "text-sage",
    },
    {
      key: "session",
      icon: Clock,
      label: "Session length",
      value: `${profile.sessionLength || 20} minutes`,
      hint: "I keep sessions near this length.",
      accent: "text-amber-glow-foreground",
    },
    {
      key: "speed",
      icon: BookOpen,
      label: "Reading speed",
      value: SPEED_LABEL[profile.readingSpeed] ?? "Moderate",
      hint: "I pace text and examples to match.",
      accent: "text-plum",
    },
    {
      key: "attention",
      icon: Brain,
      label: "Attention span",
      value: ATTENTION_LABEL[profile.attentionSpan] ?? "Medium",
      hint: "I break work into chunks that fit.",
      accent: "text-plum",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top row: 4 quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.key}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: reduced ? 0 : 0.05 * i,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-2xl border bg-card nt-shadow-soft p-4"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "flex size-7 items-center justify-center rounded-lg bg-muted/70",
                    c.accent
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  {c.label}
                </span>
              </div>
              <p className="text-sm font-medium leading-snug">{c.value}</p>
              {c.hint && (
                <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                  {c.hint}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Goals + Interests */}
      <div className="grid gap-3 sm:grid-cols-2">
        <ProfileListCard
          icon={Target}
          accent="text-rose-soft"
          label="Your goals"
          items={profile.goals}
          emptyText="No goals shared yet — that's okay. We'll find them together."
        />
        <ProfileListCard
          icon={Sparkles}
          accent="text-amber-glow-foreground"
          label="Your interests"
          items={profile.interests}
          emptyText="Tell me what you love — I'll bring it into your lessons."
        />
      </div>

      {/* Sensory notes + feels safe with */}
      <div className="grid gap-3 sm:grid-cols-2">
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: reduced ? 0 : 0.2 }}
          className="rounded-2xl border bg-card nt-shadow-soft p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="flex size-7 items-center justify-center rounded-lg bg-muted/70 text-sage">
              <ShieldCheck className="size-4" />
            </span>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              Sensory notes
            </span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">
            {profile.sensoryNotes?.trim()
              ? profile.sensoryNotes
              : "Nothing shared yet. I'll always default to a calm, low-stimulation pace."}
          </p>
        </motion.div>

        <ProfileListCard
          icon={Heart}
          accent="text-rose-soft"
          label="What helps you feel safe"
          items={profile.feelsSafeWith}
          emptyText="You can tell me what makes you feel safe — I'll remember."
        />
      </div>

      {/* Editable note */}
      <div className="flex items-start gap-2 rounded-xl bg-muted/50 px-4 py-3">
        <Pencil className="size-4 text-muted-foreground mt-0.5 shrink-0" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground/80">
            You can change any of this anytime.{" "}
          </span>
          This is my best understanding so far — not a label. Update your
          profile from onboarding, and I'll gently relearn.
        </p>
      </div>
    </div>
  );
}

function ProfileListCard({
  icon: Icon,
  accent,
  label,
  items,
  emptyText,
}: {
  icon: LucideIcon;
  accent: string;
  label: string;
  items?: string[];
  emptyText: string;
}) {
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";
  const list = (items ?? []).filter(Boolean);

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: reduced ? 0 : 0.15 }}
      className="rounded-2xl border bg-card nt-shadow-soft p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <span
          className={cn(
            "flex size-7 items-center justify-center rounded-lg bg-muted/70",
            accent
          )}
        >
          <Icon className="size-4" />
        </span>
        <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
          {label}
        </span>
      </div>
      {list.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {list.map((g, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs"
            >
              {g}
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground leading-relaxed italic">
          {emptyText}
        </p>
      )}
    </motion.div>
  );
}
