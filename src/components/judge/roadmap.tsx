"use client";

import {
  Rocket,
  Sparkles,
  Calendar,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Phase = {
  key: "now" | "next" | "later";
  label: string;
  window: string;
  icon: LucideIcon;
  gradient: string;
  accent: string;
  pill: string;
  items: { title: string; desc: string }[];
};

const PHASES: Phase[] = [
  {
    key: "now",
    label: "Now",
    window: "This prototype",
    icon: CheckCircle2,
    gradient: "nt-gradient-sage",
    accent: "text-primary",
    pill: "bg-primary/15 text-primary hover:bg-primary/15",
    items: [
      {
        title: "Digital Twin core",
        desc: "7 evolving traits, explainable AI, day-over-day personalization.",
      },
      {
        title: "Four living worlds",
        desc: "Learn · Wellness · Health · Growth — fully interactive.",
      },
      {
        title: "Accessibility toolbar",
        desc: "Dyslexia font, scale, motion, contrast, calm mode — always on.",
      },
      {
        title: "Companion + adaptive tutor",
        desc: "Twin-aware chat + 7 lesson formats with safety preamble.",
      },
    ],
  },
  {
    key: "next",
    label: "Next",
    window: "3 – 6 months",
    icon: Sparkles,
    gradient: "nt-gradient-amber",
    accent: "text-amber-glow-foreground",
    pill: "bg-amber-glow/20 text-amber-glow-foreground hover:bg-amber-glow/20",
    items: [
      {
        title: "Voice-first learning",
        desc: "Speak a question, hear a Twin answer. For learners who think out loud.",
      },
      {
        title: "Real RAG knowledge graph",
        desc: "Long-term memory across lessons, moods, and reflections — your context, yours.",
      },
      {
        title: "Parent & educator companion",
        desc: "A read-only view of growth, never grades. Built with consent at the center.",
      },
      {
        title: "Native mobile companion",
        desc: "Tiny check-ins, calm room, and the companion — wherever you are.",
      },
    ],
  },
  {
    key: "later",
    label: "Later",
    window: "6 – 12 months",
    icon: Rocket,
    gradient: "nt-gradient-plum",
    accent: "text-plum",
    pill: "bg-plum/15 text-plum hover:bg-plum/15",
    items: [
      {
        title: "Multi-modal input",
        desc: "Draw, photograph, or hum an idea. The Twin meets you in your medium.",
      },
      {
        title: "School pilots",
        desc: "Co-designed classroom deployments with accessibility-first educators.",
      },
      {
        title: "Open accessibility toolkit",
        desc: "Release our calm palette, font system, and motion presets as open source.",
      },
      {
        title: "Peer learning constellations",
        desc: "Opt-in, low-pressure ways to learn alongside kindred minds.",
      },
    ],
  },
];

function PhaseColumn({ phase }: { phase: Phase }) {
  const Icon = phase.icon;
  return (
    <Card
      className={cn(
        "relative overflow-hidden border-border/60 nt-shadow-soft h-full py-0 gap-0",
        phase.gradient
      )}
    >
      {/* phase header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between">
          <div className="size-12 rounded-2xl bg-card/80 flex items-center justify-center nt-shadow-soft">
            <Icon className={cn("size-6", phase.accent)} />
          </div>
          <Badge className={cn("rounded-full border-transparent", phase.pill)}>
            <Calendar className="size-3" />
            {phase.window}
          </Badge>
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight">{phase.label}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {phase.items.length} milestones
        </p>
      </div>

      {/* vertical timeline */}
      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
       
        className="px-6 pb-6"
      >
        <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
          {phase.items.map((it, i) => (
            <MotionDiv
              key={it.title}
              variants={fadeUp}
              className="relative pl-6"
            >
              <span
                className={cn(
                  "absolute left-0 top-1.5 size-[15px] rounded-full ring-4 ring-background",
                  phase.key === "now"
                    ? "bg-primary"
                    : phase.key === "next"
                    ? "bg-amber-glow"
                    : "bg-plum"
                )}
                aria-hidden
              />
              <p className="text-sm font-semibold leading-tight">{it.title}</p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                {it.desc}
              </p>
              {phase.key === "now" && i === 0 && (
                <span className="inline-flex mt-1.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Shipped in this build
                </span>
              )}
            </MotionDiv>
          ))}
        </ol>
      </MotionDiv>
    </Card>
  );
}

export function RoadmapSlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-plum">
          Where we&apos;re going
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mt-2">
          A calm roadmap,{" "}
          <span className="text-plum">not a hype cycle</span>.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          We build slowly and with users. Every phase earns its place through
          real learner feedback — never because it&apos;s trendy.
        </p>
      </MotionDiv>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {PHASES.map((p) => (
          <PhaseColumn key={p.key} phase={p} />
        ))}
      </div>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="rounded-2xl border border-border/60 bg-card/50 p-5 text-sm text-muted-foreground flex items-start gap-3"
      >
        <Sparkles className="size-4 text-primary mt-0.5 shrink-0" />
        <p>
          <span className="text-foreground font-medium">Privacy-first, always.</span>{" "}
          Future phases never trade learner data for features. Consent is asked,
          never assumed. You can erase your Twin at any time.
        </p>
      </MotionDiv>
    </div>
  );
}
