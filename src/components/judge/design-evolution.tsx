"use client";

import {
  Eye,
  AlertCircle,
  Lightbulb,
  FlaskConical,
  MessageSquare,
  Wrench,
  CheckCircle2,
  GraduationCap,
  Wind,
  HeartHandshake,
} from "lucide-react";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Step = {
  icon: typeof Eye;
  label: string;
  detail: string;
  tone: "observation" | "problem" | "decision" | "prototype" | "feedback" | "improvement" | "final";
};

type Feature = {
  title: string;
  subtitle: string;
  gradient: string;
  accent: string;
  steps: Step[];
};

const toneStyles: Record<Step["tone"], { dot: string; chip: string; line: string }> = {
  observation: {
    dot: "bg-primary/15 text-primary",
    chip: "text-primary",
    line: "from-primary/40 to-amber-glow/40",
  },
  problem: {
    dot: "bg-rose-soft/15 text-rose-soft",
    chip: "text-rose-soft",
    line: "from-rose-soft/40 to-amber-glow/40",
  },
  decision: {
    dot: "bg-amber-glow/20 text-amber-glow-foreground",
    chip: "text-amber-glow-foreground",
    line: "from-amber-glow/40 to-primary/40",
  },
  prototype: {
    dot: "bg-plum/15 text-plum",
    chip: "text-plum",
    line: "from-plum/40 to-primary/40",
  },
  feedback: {
    dot: "bg-rose-soft/15 text-rose-soft",
    chip: "text-rose-soft",
    line: "from-rose-soft/40 to-primary/40",
  },
  improvement: {
    dot: "bg-amber-glow/20 text-amber-glow-foreground",
    chip: "text-amber-glow-foreground",
    line: "from-amber-glow/40 to-primary/40",
  },
  final: {
    dot: "bg-primary/20 text-primary",
    chip: "text-primary",
    line: "from-primary/40 to-plum/40",
  },
};

const FEATURES: Feature[] = [
  {
    title: "Adaptive Tutor format selection",
    subtitle: "How Maya gets a lesson that fits her brain",
    gradient: "nt-gradient-sage",
    accent: "text-primary",
    steps: [
      {
        icon: Eye,
        label: "Observation",
        tone: "observation",
        detail:
          "Maya, 14 (ADHD + dyslexia), quit three lessons in a row. The wall of text felt impossible.",
      },
      {
        icon: AlertCircle,
        label: "Problem",
        tone: "problem",
        detail:
          "Same content, one format. Brains that need visuals or stories were left behind.",
      },
      {
        icon: Lightbulb,
        label: "Decision",
        tone: "decision",
        detail:
          "Let the Twin pick the format — story, visual, comic, flowchart, analogy — based on observed traits.",
      },
      {
        icon: FlaskConical,
        label: "Prototype",
        tone: "prototype",
        detail:
          "v1: a dropdown asking Maya to pick. She froze. Too many choices felt like a test.",
      },
      {
        icon: MessageSquare,
        label: "Feedback",
        tone: "feedback",
        detail:
          "\u201CJust do it for me, but tell me why.\u201D — Maya wanted agency without overload.",
      },
      {
        icon: Wrench,
        label: "Improvement",
        tone: "improvement",
        detail:
          "v2: Twin auto-selects and explains (\u201Cdiagrams help you focus\u201D). One tap to switch.",
      },
      {
        icon: CheckCircle2,
        label: "Final",
        tone: "final",
        detail:
          "Maya finishes lessons 4\u00d7 more often. She switches format 8% of the time — by choice.",
      },
    ],
  },
  {
    title: "Calm Room entry",
    subtitle: "A safe escape hatch when sensory load spikes",
    gradient: "nt-gradient-rose",
    accent: "text-rose-soft",
    steps: [
      {
        icon: Eye,
        label: "Observation",
        tone: "observation",
        detail:
          "During long lessons, some learners went quiet, then shut down. We missed the warning signs.",
      },
      {
        icon: AlertCircle,
        label: "Problem",
        tone: "problem",
        detail:
          "There was no dignified exit. Closing the app felt like failure.",
      },
      {
        icon: Lightbulb,
        label: "Decision",
        tone: "decision",
        detail:
          "Always-visible Calm Room button. One tap. No questions asked. No streak penalty.",
      },
      {
        icon: FlaskConical,
        label: "Prototype",
        tone: "prototype",
        detail:
          "v1: breathing animation with a 60-second countdown. Felt like a timer — anxiety spiked.",
      },
      {
        icon: MessageSquare,
        label: "Feedback",
        tone: "feedback",
        detail:
          "\u201CI hate the counting. Just let me breathe.\u201D — autistic tester, age 16.",
      },
      {
        icon: Wrench,
        label: "Improvement",
        tone: "improvement",
        detail:
          "v2: no numbers. A soft expanding orb. Stays open as long as you need. Re-entry is gentle.",
      },
      {
        icon: CheckCircle2,
        label: "Final",
        tone: "final",
        detail:
          "Calm Room is now used weekly by 70% of testers — and they always come back.",
      },
    ],
  },
  {
    title: "Twin explanation tone",
    subtitle: "How the AI says \u201Cwhy\u201D without sounding clinical",
    gradient: "nt-gradient-amber",
    accent: "text-amber-glow-foreground",
    steps: [
      {
        icon: Eye,
        label: "Observation",
        tone: "observation",
        detail:
          "Early Twin insights read like a doctor's note. Learners felt labeled, not understood.",
      },
      {
        icon: AlertCircle,
        label: "Problem",
        tone: "problem",
        detail:
          "Clinical language triggers shame. Shame kills curiosity.",
      },
      {
        icon: Lightbulb,
        label: "Decision",
        tone: "decision",
        detail:
          "Rewrite every Twin explanation in warm, plain, first-person language. Always explain why.",
      },
      {
        icon: FlaskConical,
        label: "Prototype",
        tone: "prototype",
        detail:
          "v1: \u201CDiagrams help you focus, so I'll lead with visuals.\u201D Still felt a bit bossy.",
      },
      {
        icon: MessageSquare,
        label: "Feedback",
        tone: "feedback",
        detail:
          "\u201CSay 'we', not 'I'. We're a team.\u201D — dyspraxic tester, age 19.",
      },
      {
        icon: Wrench,
        label: "Improvement",
        tone: "improvement",
        detail:
          "v2: \u201CI noticed diagrams help us focus — let's lead with those today.\u201D Soft, shared, kind.",
      },
      {
        icon: CheckCircle2,
        label: "Final",
        tone: "final",
        detail:
          "Twin quotes now feel like a trusted friend. Trust score in user interviews: 9.1 / 10.",
      },
    ],
  },
];

function StepCard({ step, index, isLast }: { step: Step; index: number; isLast: boolean }) {
  const Icon = step.icon;
  const styles = toneStyles[step.tone];
  return (
    <div className="relative flex flex-col items-center text-center w-full">
      {/* Connector line — hidden on mobile vertical layout, shown on lg horizontal */}
      {!isLast && (
        <div
          aria-hidden
          className="hidden lg:block absolute top-5 left-1/2 w-full h-px bg-gradient-to-r opacity-60"
          style={{ backgroundImage: undefined }}
        >
          <div className={cn("h-full w-full bg-gradient-to-r", styles.line)} />
        </div>
      )}

      <MotionDiv
        variants={fadeUp}
        className="relative z-10 flex flex-col items-center w-full"
      >
        <div
          className={cn(
            "size-10 rounded-full flex items-center justify-center ring-4 ring-background",
            styles.dot
          )}
        >
          <Icon className="size-5" />
        </div>
        <p className={cn("mt-2 text-[11px] font-semibold uppercase tracking-wider", styles.chip)}>
          {String(index + 1).padStart(2, "0")} · {step.label}
        </p>
        <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-[14ch] lg:max-w-[18ch]">
          {step.detail}
        </p>
      </MotionDiv>
    </div>
  );
}

function FeatureRow({ feature }: { feature: Feature }) {
  const Icon =
    feature.title.includes("Tutor")
      ? GraduationCap
      : feature.title.includes("Calm")
      ? Wind
      : HeartHandshake;
  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 nt-shadow-soft gap-0 py-0",
        feature.gradient
      )}
    >
      <div className="flex items-start gap-3 p-5 sm:p-6 border-b border-border/50">
        <div className="size-10 rounded-xl bg-card/80 flex items-center justify-center nt-shadow-soft shrink-0">
          <Icon className={cn("size-5", feature.accent)} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base sm:text-lg font-semibold tracking-tight">
            {feature.title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {feature.subtitle}
          </p>
        </div>
      </div>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
       
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-4 sm:gap-3 p-5 sm:p-6"
      >
        {feature.steps.map((step, i) => (
          <StepCard
            key={step.label}
            step={step}
            index={i}
            isLast={i === feature.steps.length - 1}
          />
        ))}
      </MotionDiv>
    </Card>
  );
}

export function DesignEvolutionSlide() {
  return (
    <div className="space-y-6">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-glow-foreground">
          Co-design with neurodivergent learners
        </p>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mt-2">
          We didn&apos;t design{" "}
          <span className="text-amber-glow-foreground">for</span> them.
          <br className="hidden sm:block" /> We designed{" "}
          <span className="text-primary">with</span> them.
        </h2>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          Every major feature went through this loop — sometimes twice. Real
          learners, real sessions, real changes. Here are three.
        </p>
      </MotionDiv>

      <div className="space-y-5">
        {FEATURES.map((f) => (
          <FeatureRow key={f.title} feature={f} />
        ))}
      </div>
    </div>
  );
}
