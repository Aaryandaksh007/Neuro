"use client";

import {
  Sparkles,
  Brain,
  ShieldCheck,
  Lightbulb,
  TrendingUp,
  Rocket,
  Heart,
  Accessibility as AccessIcon,
  GitBranch,
  MessageSquare,
  Trophy,
  Target,
  Users,
  ArrowRight,
  ArrowLeft,
  Eye,
  Type,
  Wind,
  Keyboard,
  Contrast,
  Clock,
  Lock,
  Scale,
  Layers,
  Database,
  Cloud,
  Quote,
  CheckCircle2,
  GraduationCap,
  HeartPulse,
  Sprout,
  Star,
  CircuitBoard,
  Cpu,
  Network,
  Moon,
  Sun,
  TreePine,
  Compass,
  HandHeart,
  MessageCircleHeart,
  Server,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { MotionDiv, fadeUp, stagger, scaleIn } from "@/components/shared/motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NeuroTwinLogo, Wordmark } from "@/components/shared/logo";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";
import { DesignEvolutionSlide } from "./design-evolution";
import { RoadmapSlide } from "./roadmap";
import { cn } from "@/lib/utils";

/* ============================================================
   Shared slide primitives
   ============================================================ */

function SlideEyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "text-xs font-semibold uppercase tracking-[0.18em]",
        className
      )}
    >
      {children}
    </p>
  );
}

function SlideHeading({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mt-2 leading-[1.1]",
        className
      )}
    >
      {children}
    </h2>
  );
}

function IconChip({
  icon: Icon,
  className,
  size = "md",
}: {
  icon: LucideIcon;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const dim =
    size === "lg" ? "size-12 rounded-2xl" : size === "sm" ? "size-9 rounded-lg" : "size-10 rounded-xl";
  const ic = size === "lg" ? "size-6" : size === "sm" ? "size-4.5" : "size-5";
  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0 nt-shadow-soft bg-card/80",
        dim
      )}
    >
      <Icon className={cn(ic, className)} />
    </div>
  );
}

/* ============================================================
   Slide 1 — Cover / Product Vision
   ============================================================ */

export function CoverSlide() {
  const reduced = useAccessibility((s) => s.motion) === "reduced";
  return (
    <div className="relative">
      {/* Aurora background confined to this slide */}
      <div className="nt-aurora nt-motion-bg" aria-hidden />

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center pt-6 sm:pt-10 pb-4"
      >
        <MotionDiv variants={fadeUp}>
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 gap-1.5 mb-6"
          >
            <Trophy className="size-3.5 text-primary" />
            Judge Mode · NeuroMastishk OS
          </Badge>
        </MotionDiv>

        {/* Living orb */}
        <MotionDiv variants={scaleIn} className="relative mb-8">
          <div className="relative size-36 sm:size-44">
            {!reduced && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl nt-breathe" />
                <div
                  className="absolute inset-4 rounded-full bg-amber-glow/25 blur-xl nt-breathe"
                  style={{ animationDelay: "-2s" }}
                />
                <div
                  className="absolute inset-8 rounded-full bg-plum/15 blur-lg nt-breathe"
                  style={{ animationDelay: "-4s" }}
                />
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <NeuroTwinLogo size={110} className="nt-float" />
            </div>
          </div>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="max-w-4xl">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05]">
            Your mind.{" "}
            <span className="bg-gradient-to-r from-primary via-amber-glow-foreground to-plum bg-clip-text text-transparent">
              Understood.
            </span>{" "}
            Never judged.
          </h1>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="mt-6 max-w-2xl">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            NeuroMastishk OS is an accessibility-first AI learning companion that
            adapts technology to every individual brain — not the other way
            around. Built with and for neurodivergent learners. Safe. Seen.
            Calm. Empowered.
          </p>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="mt-9">
          <Card className="nt-glass nt-shadow-soft border-border/60 rounded-2xl px-6 py-4 max-w-xl">
            <div className="flex items-center gap-3 text-left">
              <MessageCircleHeart className="size-5 text-primary shrink-0" />
              <p className="text-sm leading-relaxed">
                <span className="font-medium">Our mission:</span> give every
                learner — especially those left behind by traditional EdTech —
                an AI companion that quietly understands them, never labels
                them, and helps them grow on their own terms.
              </p>
            </div>
          </Card>
        </MotionDiv>

        <MotionDiv
          variants={fadeUp}
          className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/70 border border-border/60 px-3 py-1.5">
            <Sparkles className="size-3.5 text-primary" /> Built with neurodivergent learners
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/70 border border-border/60 px-3 py-1.5">
            <ShieldCheck className="size-3.5 text-rose-soft" /> Privacy-first · Consent-first
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-card/70 border border-border/60 px-3 py-1.5">
            <AccessIcon className="size-3.5 text-amber-glow-foreground" /> WCAG AAA by default
          </span>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 2 — The Problem
   ============================================================ */

const PAIN_POINTS = [
  {
    icon: Brain,
    accent: "text-primary",
    tint: "bg-primary/10",
    card: "nt-gradient-sage",
    title: "ADHD",
    summary: "Brains that crave novelty and movement",
    quote:
      "“I open a lesson and it's a wall of text. I last 90 seconds. Then I feel broken.”",
    attr: "— Leo, 16",
  },
  {
    icon: Heart,
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
    card: "nt-gradient-rose",
    title: "Autism",
    summary: "Deep focus, sensory sensitivity, literal thinking",
    quote:
      "“The app talks down to me. The bright colors hurt. I just want calm.”",
    attr: "— Sam, 19",
  },
  {
    icon: Type,
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
    card: "nt-gradient-amber",
    title: "Dyslexia",
    summary: "Brains that decode text differently",
    quote:
      "“By the time I finish the paragraph, I forgot what it was about. So I quit.”",
    attr: "— Maya, 14",
  },
  {
    icon: AccessIcon,
    accent: "text-plum",
    tint: "bg-plum/15",
    card: "nt-gradient-plum",
    title: "Dyspraxia & sensory",
    summary: "Motor planning, overwhelm, hidden effort",
    quote:
      "“Tiny buttons. Timers. Loud animations. Every detail tells me: this isn't for me.”",
    attr: "— River, 22",
  },
];

export function ProblemSlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-rose-soft">The problem</SlideEyebrow>
        <SlideHeading>
          Educational AI expects students to{" "}
          <span className="text-rose-soft">adapt to technology</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          One in five learners thinks differently — ADHD, autism, dyslexia,
          dyspraxia, sensory sensitivities. Most EdTech is built for the
          other four. The result is quiet, daily harm: shame, avoidance, and
          lost potential.
        </p>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        {PAIN_POINTS.map((p) => (
          <MotionDiv key={p.title} variants={fadeUp}>
            <Card
              className={cn(
                "h-full overflow-hidden border-border/60 nt-shadow-soft py-0 gap-0",
                p.card
              )}
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={cn(
                      "size-10 rounded-xl flex items-center justify-center",
                      p.tint
                    )}
                  >
                    <p.icon className={cn("size-5", p.accent)} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold tracking-tight">
                      {p.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">{p.summary}</p>
                  </div>
                </div>
                <blockquote className="text-sm leading-relaxed border-l-2 border-border/60 pl-3 italic">
                  {p.quote}
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">{p.attr}</p>
              </div>
            </Card>
          </MotionDiv>
        ))}
      </MotionDiv>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="rounded-2xl border border-rose-soft/30 bg-rose-soft/5 p-5 flex items-start gap-3"
      >
        <Heart className="size-5 text-rose-soft mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          <span className="font-medium">The hidden cost:</span> It&apos;s not
          that these learners can&apos;t learn. It&apos;s that the tools
          silently tell them they can&apos;t — every day, in a thousand tiny
          ways. We set out to fix that.
        </p>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 3 — The Solution
   ============================================================ */

export function SolutionSlide() {
  const worlds = [
    {
      icon: GraduationCap,
      name: "Learn",
      tag: "Lessons that become your language",
      accent: "text-primary",
      tint: "bg-primary/10",
    },
    {
      icon: HeartPulse,
      name: "Wellness",
      tag: "Feel what you feel, safely",
      accent: "text-rose-soft",
      tint: "bg-rose-soft/15",
    },
    {
      icon: Sprout,
      name: "Health",
      tag: "A companion that grows with you",
      accent: "text-amber-glow-foreground",
      tint: "bg-amber-glow/15",
    },
    {
      icon: Star,
      name: "Growth",
      tag: "Never grades. Only growth.",
      accent: "text-plum",
      tint: "bg-plum/15",
    },
  ];
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-primary">The solution</SlideEyebrow>
        <SlideHeading>
          We adapt technology to{" "}
          <span className="text-primary">every individual brain</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          One Digital Twin quietly learns who you are. Four living worlds turn
          that understanding into action. Accessibility is the foundation
          everything sits on — not a checkbox.
        </p>
      </MotionDiv>

      {/* Diagram: Twin in the center, 4 worlds around */}
      <MotionDiv
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        className="relative rounded-3xl border border-border/60 nt-gradient-sage nt-shadow-soft p-6 sm:p-10"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 lg:gap-10 items-center">
          {/* Left column: 2 worlds */}
          <div className="space-y-4 order-2 lg:order-1">
            {worlds.slice(0, 2).map((w) => (
              <Card
                key={w.name}
                className="flex items-center gap-3 p-4 nt-shadow-soft border-border/60 bg-card/80"
              >
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center",
                    w.tint
                  )}
                >
                  <w.icon className={cn("size-5", w.accent)} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.tag}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Center: Twin orb */}
          <div className="order-1 lg:order-2 flex flex-col items-center text-center">
            <div className="relative size-32 sm:size-36">
              <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl nt-breathe" />
              <div className="absolute inset-2 rounded-full bg-card/60 backdrop-blur" />
              <div className="absolute inset-0 flex items-center justify-center">
                <NeuroTwinLogo size={92} className="nt-float" />
              </div>
            </div>
            <Badge
              variant="secondary"
              className="mt-3 rounded-full gap-1.5"
            >
              <Brain className="size-3.5 text-primary" />
              Digital Twin
            </Badge>
            <p className="text-xs text-muted-foreground mt-2 max-w-[20ch]">
              Learns you. Explains itself. Never labels.
            </p>
          </div>

          {/* Right column: 2 worlds */}
          <div className="space-y-4 order-3">
            {worlds.slice(2, 4).map((w) => (
              <Card
                key={w.name}
                className="flex items-center gap-3 p-4 nt-shadow-soft border-border/60 bg-card/80"
              >
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center",
                    w.tint
                  )}
                >
                  <w.icon className={cn("size-5", w.accent)} />
                </div>
                <div>
                  <p className="font-semibold text-sm">{w.name}</p>
                  <p className="text-xs text-muted-foreground">{w.tag}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Foundation: Accessibility */}
        <div className="mt-6 pt-6 border-t border-border/50">
          <div className="flex items-center justify-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
            <AccessIcon className="size-3.5" />
            <span>Accessibility is the foundation</span>
            <AccessIcon className="size-3.5" />
          </div>
        </div>
      </MotionDiv>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="grid sm:grid-cols-3 gap-4"
      >
        {[
          {
            icon: Brain,
            title: "One Digital Twin",
            desc: "Quietly learns your rhythm. Adapts every lesson.",
          },
          {
            icon: Sparkles,
            title: "Four living worlds",
            desc: "Learn, Wellness, Health, Growth — interconnected.",
          },
          {
            icon: ShieldCheck,
            title: "Accessibility as bedrock",
            desc: "Not a setting. Not an afterthought. The default.",
          },
        ].map((c) => (
          <Card
            key={c.title}
            className="p-5 nt-shadow-soft border-border/60 bg-card/80"
          >
            <IconChip icon={c.icon} className="text-primary" />
            <p className="mt-3 font-semibold">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {c.desc}
            </p>
          </Card>
        ))}
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 4 — User Story
   ============================================================ */

const MAYA_DAY = [
  {
    time: "7:30 AM",
    title: "Morning check-in",
    icon: Sun,
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
    body: "Maya opens NeuroMastishk. Brain Weather reads \u201Cfoggy, low energy.\u201D The Twin suggests a 12-minute session instead of 20. She agrees — one tap.",
    twin: "“We'll keep it short today. That's not failure — that's smart.”",
  },
  {
    time: "9:00 AM",
    title: "Adaptive lesson — photosynthesis",
    icon: GraduationCap,
    accent: "text-primary",
    tint: "bg-primary/10",
    body: "The Twin leads with a visual comic format (her strongest channel). Eight panels. Big type. No timer. She finishes — for the first time this week.",
    twin: "“Diagrams help us focus. Let's lead with those.”",
  },
  {
    time: "11:00 AM",
    title: "Calm Room break",
    icon: Wind,
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
    body: "Maya flags that the classroom got loud. One tap opens the Calm Room — a soft expanding orb, no countdown. She breathes for 90 seconds. No streak penalty.",
    twin: "“Take what you need. I'll be right here.”",
  },
  {
    time: "2:00 PM",
    title: "Math — story format",
    icon: MessageSquare,
    accent: "text-plum",
    tint: "bg-plum/15",
    body: "The Twin turns fractions into a story about sharing pizza between two friends. Maya laughs. She solves three problems. Confidence trait quietly ticks +4.",
    twin: "“You just did something hard. Notice how that felt.”",
  },
  {
    time: "6:00 PM",
    title: "Tiny victory logged",
    icon: Trophy,
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
    body: "Maya writes: \u201CI finished my reading today.\u201D One sentence. The companion does a tiny spin. Her persistence tree grows +5.",
    twin: "“I saved that. It matters more than you think.”",
  },
  {
    time: "8:30 PM",
    title: "Growth reflection",
    icon: Moon,
    accent: "text-primary",
    tint: "bg-primary/10",
    body: "Maya sees 3 stars in her Growth galaxy, a taller tree, and her Twin's daily insight. She goes to bed feeling capable — not behind.",
    twin: "“Day 15. You're not the same learner you were on Day 1. Neither am I.”",
  },
];

export function UserStorySlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-amber-glow-foreground">
          A day in the life
        </SlideEyebrow>
        <SlideHeading>
          Maya, 14.{" "}
          <span className="text-amber-glow-foreground">ADHD + dyslexia</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          One day with NeuroMastishk OS. No grades. No timers. No shame. Just a
          companion that quietly meets her where she is — every hour.
        </p>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        {/* vertical line */}
        <div
          aria-hidden
          className="absolute left-[19px] sm:left-[27px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-amber-glow/40 to-plum/40"
        />
        <ol className="space-y-5">
          {MAYA_DAY.map((step) => (
            <MotionDiv
              key={step.time}
              variants={fadeUp}
              className="relative pl-12 sm:pl-16"
            >
              <span
                className={cn(
                  "absolute left-0 top-1 size-10 sm:size-14 rounded-2xl flex items-center justify-center ring-4 ring-background nt-shadow-soft",
                  step.tint
                )}
              >
                <step.icon className={cn("size-5 sm:size-6", step.accent)} />
              </span>
              <Card className="p-5 nt-shadow-soft border-border/60 bg-card/80">
                <div className="flex items-baseline justify-between gap-3 flex-wrap">
                  <h3 className="font-semibold tracking-tight">{step.title}</h3>
                  <Badge
                    variant="secondary"
                    className="rounded-full font-mono text-[11px]"
                  >
                    {step.time}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {step.body}
                </p>
                <div className="mt-3 rounded-xl bg-primary/5 border border-primary/15 p-3 text-sm flex items-start gap-2">
                  <Quote className="size-3.5 text-primary mt-0.5 shrink-0" />
                  <p className="italic text-foreground/90">{step.twin}</p>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </ol>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 5 — Accessibility Decisions
   ============================================================ */

const A11Y_DECISIONS = [
  {
    icon: Type,
    title: "OpenDyslexic font",
    why: "Letters with weighted bottoms reduce letter-flipping for dyslexic readers.",
  },
  {
    icon: Wind,
    title: "Reduced motion",
    why: "Always available. Auto-respects the OS preference. No surprise movement.",
  },
  {
    icon: Contrast,
    title: "High contrast mode",
    why: "Boosts text-to-background ratio past WCAG AAA. Easier on sensory load.",
  },
  {
    icon: Moon,
    title: "Calm mode",
    why: "Softens color saturation and freezes ambient motion when overwhelmed.",
  },
  {
    icon: Type,
    title: "Font scaling",
    why: "Four steps from default to extra-large. No layout breakage.",
  },
  {
    icon: Keyboard,
    title: "Keyboard navigation",
    why: "Every action is reachable without a mouse. Visible focus rings everywhere.",
  },
  {
    icon: AccessIcon,
    title: "Screen-reader support",
    why: "Semantic landmarks, ARIA labels, live regions. Tested with VoiceOver.",
  },
  {
    icon: Eye,
    title: "WCAG AAA color",
    why: "We aim for AAA contrast, not just AA. Higher bar, calmer reading.",
  },
  {
    icon: MessageCircleHeart,
    title: "Simple language",
    why: "Short sentences. Common words. No jargon. Plain by default.",
  },
  {
    icon: Clock,
    title: "No timers",
    why: "Learning isn't a race. Time pressure triggers anxiety, not focus.",
  },
  {
    icon: Heart,
    title: "No shaming",
    why: "No red X. No streak loss. No comparisons. Effort is always honored.",
  },
  {
    icon: ShieldCheck,
    title: "Explainable AI",
    why: "The Twin always says why it made a choice. Never silent. Never spooky.",
  },
];

export function AccessibilitySlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-primary">
          Accessibility decisions
        </SlideEyebrow>
        <SlideHeading>
          Twelve concrete choices.{" "}
          <span className="text-primary">Each with a reason.</span>
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          This is not a list of features. It&apos;s a list of decisions — each
          one made on purpose, with a one-line &quot;why&quot; we can defend.
        </p>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {A11Y_DECISIONS.map((d) => (
          <MotionDiv key={d.title} variants={fadeUp}>
            <Card className="h-full p-5 nt-shadow-soft border-border/60 bg-card/80 hover:-translate-y-0.5 transition-transform">
              <div className="flex items-start gap-3">
                <IconChip icon={d.icon} className="text-primary" size="sm" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm leading-tight">
                    {d.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-1.5">
                    {d.why}
                  </p>
                </div>
              </div>
            </Card>
          </MotionDiv>
        ))}
      </MotionDiv>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-3"
      >
        <AccessIcon className="size-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          <span className="font-medium">Accessibility is the product.</span>{" "}
          Every decision above is on by default — not buried in settings. If a
          learner has to find accessibility, we&apos;ve already failed.
        </p>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 6 — The Digital Twin
   ============================================================ */

const TWIN_TRAITS = [
  { label: "Visual learning", v: 78, accent: "from-primary to-amber-glow" },
  { label: "Ideal session length", v: 62, accent: "from-amber-glow to-rose-soft" },
  { label: "Focus window", v: 54, accent: "from-rose-soft to-plum" },
  { label: "Memory retention", v: 48, accent: "from-plum to-primary" },
  { label: "Confidence", v: 52, accent: "from-primary to-amber-glow" },
  { label: "Calm state", v: 65, accent: "from-amber-glow to-primary" },
];

const TWIN_LEARNS = [
  "Learning style",
  "Reading speed",
  "Attention span",
  "Best focus windows",
  "Stress patterns",
  "Motivation triggers",
  "Sensory preferences",
];

const TWIN_TIMELINE = [
  {
    day: "Day 1",
    title: "Stranger",
    desc: "Twin asks gentle questions, sets baseline traits from onboarding.",
    accent: "text-muted-foreground",
  },
  {
    day: "Day 7",
    title: "Acquaintance",
    desc: "Twin notices patterns: prefers visuals, focus drops after 18 min.",
    accent: "text-primary",
  },
  {
    day: "Day 15",
    title: "Companion",
    desc: "Twin leads with the right format, paces sessions, explains itself.",
    accent: "text-amber-glow-foreground",
  },
  {
    day: "Day 30",
    title: "Trusted twin",
    desc: "Twin predicts low-energy days, offers rest before you ask.",
    accent: "text-plum",
  },
];

export function DigitalTwinSlide() {
  const twin = useTwin();
  const traits = Object.values(twin.traits).slice(0, 6);
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-primary">The Digital Twin</SlideEyebrow>
        <SlideHeading>
          An AI that actually learns{" "}
          <span className="text-primary">you</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          The Digital Twin quietly observes how you learn, focus, rest, and
          recharge — then adapts every lesson to fit. It explains itself every
          time. It never labels you. Over 30 days, it grows from a stranger
          into a trusted companion.
        </p>
      </MotionDiv>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Trait bars */}
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <Card className="p-6 nt-shadow-soft nt-gradient-sage border-border/60 h-full">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <NeuroTwinLogo size={28} />
                <span className="font-medium text-sm">Twin · Day 15</span>
              </div>
              <Badge className="rounded-full bg-primary/15 text-primary hover:bg-primary/15">
                evolving
              </Badge>
            </div>
            <div className="space-y-3">
              {(traits.length ? traits : TWIN_TRAITS).map((b, i) => {
                const v =
                  "value" in b ? b.value : (b as { v: number }).v;
                const label =
                  "label" in b ? b.label : (b as { label: string }).label;
                const accent = (b as { accent?: string }).accent ||
                  "from-primary to-amber-glow";
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-medium">{v}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={cn(
                          "h-full rounded-full bg-gradient-to-r",
                          accent
                        )}
                        initial={reduced ? { width: `${v}%` } : { width: 0 }}
                        animate={{ width: `${v}%` }}
                        transition={{
                          duration: 0.9,
                          ease: "easeOut",
                          delay: i * 0.06,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 rounded-xl bg-card/70 p-3 text-sm border border-border/50">
              <p className="text-muted-foreground text-xs mb-1">Twin says:</p>
              <p className="italic">
                “I noticed diagrams help us focus, so I&apos;ll lead with
                visuals today. We&apos;ll keep it to 18 minutes — that&apos;s
                our sweet spot.”
              </p>
            </div>
          </Card>
        </MotionDiv>

        {/* What it learns + timeline */}
        <div className="space-y-6">
          <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
            <Card className="p-5 nt-shadow-soft border-border/60 bg-card/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3">
                What the Twin learns
              </p>
              <div className="flex flex-wrap gap-2">
                {TWIN_LEARNS.map((t) => (
                  <Badge
                    key={t}
                    variant="secondary"
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary/10 border-transparent"
                  >
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>
          </MotionDiv>

          <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
            <Card className="p-5 nt-shadow-soft border-border/60 bg-card/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Day 1 → Day 30
              </p>
              <ol className="relative space-y-4 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-px before:bg-border">
                {TWIN_TIMELINE.map((s) => (
                  <li key={s.day} className="relative pl-6">
                    <span
                      className="absolute left-0 top-1.5 size-[15px] rounded-full ring-4 ring-background bg-primary"
                      aria-hidden
                    />
                    <p className="text-xs font-mono text-muted-foreground">
                      {s.day}
                    </p>
                    <p className={cn("text-sm font-semibold", s.accent)}>
                      {s.title}
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">
                      {s.desc}
                    </p>
                  </li>
                ))}
              </ol>
            </Card>
          </MotionDiv>
        </div>
      </div>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="rounded-2xl border border-primary/30 bg-primary/5 p-5 flex items-start gap-3"
      >
        <ShieldCheck className="size-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          <span className="font-medium">Explainable AI, always.</span> Every
          Twin choice comes with a plain-language reason. You can ask
          &quot;why?&quot; at any moment and get a real answer — never a black
          box.
        </p>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 7 — AI Architecture
   ============================================================ */

const ARCH_LAYERS = [
  {
    icon: Layers,
    title: "Frontend",
    sub: "Next.js 16 · App Router",
    desc: "Client-side view orchestration, MindSpace shell, four worlds, companion dock.",
    accent: "text-primary",
    tint: "bg-primary/10",
  },
  {
    icon: Server,
    title: "API Routes",
    sub: "/companion · /learn · /reflection · /twin",
    desc: "Server-side request handlers. Validate input, attach safety preamble, call AI.",
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
  },
  {
    icon: Cpu,
    title: "z-ai-web-dev-sdk",
    sub: "Large Language Model · backend only",
    desc: "Twin-aware chat, adaptive tutor with 7 formats, reflection prompts, twin synthesis.",
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
  },
  {
    icon: Database,
    title: "Prisma + SQLite",
    sub: "Conversation · Reflection · LearningSession",
    desc: "Long-term memory. Sessions, reflections, and chats persist per learner.",
    accent: "text-plum",
    tint: "bg-plum/15",
  },
  {
    icon: Workflow,
    title: "Zustand (client state)",
    sub: "Twin · App · Wellness · Health · Growth",
    desc: "Live UI state and the Digital Twin traits, persisted locally. Reactive across worlds.",
    accent: "text-primary",
    tint: "bg-primary/10",
  },
];

export function ArchitectureSlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-amber-glow-foreground">
          AI architecture
        </SlideEyebrow>
        <SlideHeading>
          A calm, explainable, privacy-first{" "}
          <span className="text-amber-glow-foreground">stack</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          No magic. No black boxes. Every layer has a job, and every AI choice
          is explainable. Built for trust from the first request.
        </p>
      </MotionDiv>

      {/* Architecture flow */}
      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {ARCH_LAYERS.map((layer, i) => (
          <MotionDiv key={layer.title} variants={fadeUp}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Card className="flex-1 p-4 nt-shadow-soft border-border/60 bg-card/80 flex items-center gap-4">
                <div
                  className={cn(
                    "size-11 rounded-xl flex items-center justify-center shrink-0",
                    layer.tint
                  )}
                >
                  <layer.icon className={cn("size-5", layer.accent)} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <p className="font-semibold">{layer.title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      {layer.sub}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {layer.desc}
                  </p>
                </div>
              </Card>
              {i < ARCH_LAYERS.length - 1 && (
                <div className="flex sm:flex-col items-center justify-center gap-1 text-muted-foreground/60">
                  <ArrowRight className="size-4 sm:rotate-90" />
                </div>
              )}
            </div>
          </MotionDiv>
        ))}
      </MotionDiv>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {[
          {
            icon: Network,
            title: "RAG-ready",
            desc: "Knowledge graph prepared for next phase.",
          },
          {
            icon: ShieldCheck,
            title: "Safety preamble",
            desc: "No-diagnose, no-shame tone enforced.",
          },
          {
            icon: Lightbulb,
            title: "Explainable guardrails",
            desc: "Twin must always justify its choices.",
          },
          {
            icon: Lock,
            title: "Privacy-first",
            desc: "Consent asked. Data stays learner-owned.",
          },
        ].map((c) => (
          <Card
            key={c.title}
            className="p-4 nt-shadow-soft border-border/60 bg-card/80"
          >
            <IconChip icon={c.icon} className="text-primary" size="sm" />
            <p className="mt-3 font-semibold text-sm">{c.title}</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {c.desc}
            </p>
          </Card>
        ))}
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 8 — Design Evolution (delegated)
   ============================================================ */

export function DesignEvolutionSlideWrapper() {
  return <DesignEvolutionSlide />;
}

/* ============================================================
   Slide 9 — Research Principles
   ============================================================ */

const PRINCIPLES = [
  {
    icon: Compass,
    title: "Self-Determination Theory",
    apply: "Autonomy, competence, relatedness baked into every interaction.",
    accent: "text-primary",
    tint: "bg-primary/10",
    card: "nt-gradient-sage",
  },
  {
    icon: TrendingUp,
    title: "Growth Mindset",
    apply: "Effort is celebrated. Outcomes are never graded. Failure is data.",
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
    card: "nt-gradient-amber",
  },
  {
    icon: Sprout,
    title: "Tiny Habits",
    apply: "Two-minute check-ins compound. Small wins beat big resolutions.",
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
    card: "nt-gradient-rose",
  },
  {
    icon: HandHeart,
    title: "Positive Reinforcement",
    apply: "Companion grows, trees bloom, stars light up. Reward is visual, not transactional.",
    accent: "text-plum",
    tint: "bg-plum/15",
    card: "nt-gradient-plum",
  },
  {
    icon: Brain,
    title: "Executive Function Support",
    apply: "External scaffolds: reminders, gentle transitions, one-tap actions. Reduces cognitive load.",
    accent: "text-primary",
    tint: "bg-primary/10",
    card: "nt-gradient-sage",
  },
  {
    icon: Users,
    title: "Universal Design for Learning",
    apply: "Multiple means of engagement, representation, and expression by default.",
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
    card: "nt-gradient-amber",
  },
  {
    icon: Layers,
    title: "Cognitive Load Theory",
    apply: "Information is chunked. Sessions are timed to attention, not to a clock.",
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
    card: "nt-gradient-rose",
  },
  {
    icon: ShieldCheck,
    title: "Trauma-Informed Design",
    apply: "No surprises. No shame. Always an exit. Always a reason why.",
    accent: "text-plum",
    tint: "bg-plum/15",
    card: "nt-gradient-plum",
  },
];

export function ResearchSlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-rose-soft">
          Research principles
        </SlideEyebrow>
        <SlideHeading>
          Every choice is grounded in{" "}
          <span className="text-rose-soft">real science</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          Not vibes. Eight bodies of research shape every interaction — each
          applied with intention, not just cited.
        </p>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {PRINCIPLES.map((p) => (
          <MotionDiv key={p.title} variants={fadeUp}>
            <Card
              className={cn(
                "h-full overflow-hidden border-border/60 nt-shadow-soft py-0 gap-0",
                p.card
              )}
            >
              <div className="p-5">
                <div
                  className={cn(
                    "size-10 rounded-xl flex items-center justify-center",
                    p.tint
                  )}
                >
                  <p.icon className={cn("size-5", p.accent)} />
                </div>
                <p className="mt-3 font-semibold text-sm leading-tight">
                  {p.title}
                </p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {p.apply}
                </p>
              </div>
            </Card>
          </MotionDiv>
        ))}
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 10 — User Feedback Timeline
   ============================================================ */

const FEEDBACK = [
  {
    week: "Week 1",
    quote:
      "“The tutor gave me a wall of text. I can't do walls of text. Why doesn't it know that?”",
    persona: "Dyslexic tester, 14",
    response: "Added Twin-led format auto-selection based on observed traits.",
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
  },
  {
    week: "Week 2",
    quote:
      "“The streak counter stressed me out. If I miss a day I lose everything?”",
    persona: "ADHD tester, 17",
    response: "Removed streak loss. Added rest days. Streaks now grow, never break.",
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
  },
  {
    week: "Week 3",
    quote:
      "“I love the calm room. But the 60-second countdown made me MORE anxious.”",
    persona: "Autistic tester, 16",
    response: "Removed all timers from Calm Room. Replaced with a soft breathing orb.",
    accent: "text-primary",
    tint: "bg-primary/10",
  },
  {
    week: "Week 4",
    quote:
      "“The Twin said 'I noticed you focus best in the morning.' That's the first time an app actually noticed me.”",
    persona: "Dyspraxic tester, 19",
    response: "Doubled down on explainable AI. Twin now narrates every adaptation.",
    accent: "text-plum",
    tint: "bg-plum/15",
  },
  {
    week: "Week 6",
    quote:
      "“When the colors got bright I almost closed the app. Then I found calm mode. Lifesaver.”",
    persona: "Sensory-sensitive tester, 21",
    response: "Made calm mode more discoverable. Added a one-tap global toggle.",
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
  },
];

export function FeedbackSlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-amber-glow-foreground">
          User feedback timeline
        </SlideEyebrow>
        <SlideHeading>
          We listened.{" "}
          <span className="text-amber-glow-foreground">Then we changed.</span>
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          Six weeks of representative feedback from neurodivergent testers —
          and exactly what we did about each one. This is what
          user-centered design actually looks like.
        </p>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative"
      >
        <div
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-rose-soft/40 via-amber-glow/40 to-plum/40"
        />
        <ol className="space-y-4">
          {FEEDBACK.map((f) => (
            <MotionDiv
              key={f.week}
              variants={fadeUp}
              className="relative pl-12"
            >
              <span
                className={cn(
                  "absolute left-0 top-3 size-10 rounded-2xl flex items-center justify-center ring-4 ring-background nt-shadow-soft",
                  f.tint
                )}
              >
                <Quote className={cn("size-4", f.accent)} />
              </span>
              <Card className="p-5 nt-shadow-soft border-border/60 bg-card/80">
                <Badge
                  variant="secondary"
                  className="rounded-full font-mono text-[11px] mb-2"
                >
                  {f.week}
                </Badge>
                <blockquote className="text-sm leading-relaxed italic">
                  {f.quote}
                </blockquote>
                <p className="text-xs text-muted-foreground mt-2">{f.persona}</p>
                <div
                  className={cn(
                    "mt-3 rounded-xl border p-3 flex items-start gap-2",
                    f.tint,
                    "border-current/15"
                  )}
                >
                  <GitBranch className={cn("size-3.5 mt-0.5 shrink-0", f.accent)} />
                  <p className="text-xs leading-relaxed">
                    <span className="font-semibold">Our response: </span>
                    {f.response}
                  </p>
                </div>
              </Card>
            </MotionDiv>
          ))}
        </ol>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 11 — Impact
   ============================================================ */

const IMPACT = [
  {
    icon: Heart,
    stat: "Emotional safety",
    desc: "Designed to give every learner a space where they never feel judged, graded, or rushed.",
    accent: "text-rose-soft",
    tint: "bg-rose-soft/15",
    card: "nt-gradient-rose",
  },
  {
    icon: TrendingUp,
    stat: "Confidence",
    desc: "Designed to increase through tiny visible wins — a tree that grows, a star that lights up.",
    accent: "text-primary",
    tint: "bg-primary/10",
    card: "nt-gradient-sage",
  },
  {
    icon: CheckCircle2,
    stat: "Consistency",
    desc: "Designed to grow through gentle, rest-day-friendly rhythms — never through guilt or streak loss.",
    accent: "text-amber-glow-foreground",
    tint: "bg-amber-glow/15",
    card: "nt-gradient-amber",
  },
  {
    icon: Compass,
    stat: "Agency",
    desc: "Designed to return control to the learner — every Twin choice can be questioned and changed.",
    accent: "text-plum",
    tint: "bg-plum/15",
    card: "nt-gradient-plum",
  },
];

export function ImpactSlide() {
  return (
    <div className="space-y-8">
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <SlideEyebrow className="text-primary">Impact</SlideEyebrow>
        <SlideHeading>
          What changes for{" "}
          <span className="text-primary">neurodivergent learners</span>.
        </SlideHeading>
        <p className="text-muted-foreground mt-4 max-w-2xl leading-relaxed">
          We won&apos;t invent numbers. We will tell you what this product is
          designed to do — and how we&apos;ll know if it&apos;s working.
        </p>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 gap-5"
      >
        {IMPACT.map((it) => (
          <MotionDiv key={it.stat} variants={fadeUp}>
            <Card
              className={cn(
                "h-full overflow-hidden border-border/60 nt-shadow-soft py-0 gap-0",
                it.card
              )}
            >
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "size-12 rounded-2xl flex items-center justify-center",
                      it.tint
                    )}
                  >
                    <it.icon className={cn("size-6", it.accent)} />
                  </div>
                  <p className={cn("font-semibold text-xl tracking-tight", it.accent)}>
                    {it.stat}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
                  {it.desc}
                </p>
              </div>
            </Card>
          </MotionDiv>
        ))}
      </MotionDiv>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="grid sm:grid-cols-3 gap-4"
      >
        {[
          {
            label: "Designed to increase",
            metric: "lesson completion",
            how: "Twin-adapted format + paced sessions + no timers.",
          },
          {
            label: "Designed to reduce",
            metric: "session abandonment",
            how: "Calm Room exit + rest-day-friendly streaks.",
          },
          {
            label: "Designed to grow",
            metric: "learner confidence",
            how: "Visible wins, explainable AI, never shame.",
          },
        ].map((c) => (
          <Card
            key={c.metric}
            className="p-5 nt-shadow-soft border-border/60 bg-card/80"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {c.label}
            </p>
            <p className="text-xl font-semibold tracking-tight mt-1">
              {c.metric}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed mt-2">
              {c.how}
            </p>
          </Card>
        ))}
      </MotionDiv>

      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
       
        className="rounded-2xl border border-border/60 bg-card/50 p-5 flex items-start gap-3"
      >
        <Target className="size-5 text-primary mt-0.5 shrink-0" />
        <p className="text-sm leading-relaxed">
          <span className="font-medium">How we&apos;ll measure it.</span>{" "}
          Session completion, return rate, self-reported confidence (weekly,
          opt-in), and Calm Room re-entry rate. Never test scores. Never
          comparison to peers.
        </p>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   Slide 12 — Roadmap (delegated)
   ============================================================ */

export function RoadmapSlideWrapper() {
  return <RoadmapSlide />;
}

/* ============================================================
   Slide 13 — Closing
   ============================================================ */

export function ClosingSlide() {
  const setView = useApp((s) => s.setView);
  const enterMindSpace = useApp((s) => s.enterMindSpace);
  const onboarded = useApp((s) => s.onboarded);
  const reduced = useAccessibility((s) => s.motion) === "reduced";

  return (
    <div className="relative">
      <div className="nt-aurora nt-motion-bg" aria-hidden />
      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center pt-8 sm:pt-12 pb-4"
      >
        <MotionDiv variants={scaleIn} className="relative mb-8">
          <div className="relative size-32 sm:size-40">
            {!reduced && (
              <>
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl nt-breathe" />
                <div
                  className="absolute inset-4 rounded-full bg-amber-glow/20 blur-xl nt-breathe"
                  style={{ animationDelay: "-2s" }}
                />
              </>
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <NeuroTwinLogo size={104} className="nt-float" />
            </div>
          </div>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="max-w-3xl">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            This AI doesn&apos;t just teach you.
            <br />
            <span className="bg-gradient-to-r from-primary via-amber-glow-foreground to-plum bg-clip-text text-transparent">
              It understands you.
            </span>
          </h2>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="mt-6 max-w-xl">
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Built with neurodivergent learners, for every kind of mind. Safe.
            Seen. Calm. Empowered. Thank you for listening.
          </p>
        </MotionDiv>

        <MotionDiv
          variants={fadeUp}
          className="mt-9 flex flex-col sm:flex-row gap-3"
        >
          <Button
            size="lg"
            className="rounded-full h-12 px-7 text-base"
            onClick={() =>
              onboarded ? enterMindSpace() : setView("onboarding")
            }
          >
            {onboarded ? "Back to MindSpace" : "Create your Digital Twin"}
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="rounded-full h-12 px-7 text-base"
            onClick={() => setView("landing")}
          >
            <ArrowLeft className="size-4" />
            Back to home
          </Button>
        </MotionDiv>

        <MotionDiv variants={fadeUp} className="mt-12 w-full max-w-2xl">
          <Card className="nt-glass nt-shadow-soft border-border/60 rounded-2xl p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <NeuroTwinLogo size={24} />
              <Wordmark className="text-sm" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed text-center max-w-md mx-auto">
              Not a medical device. Never diagnoses. Always respects your
              privacy and consent. Built with and for neurodivergent learners.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/70 border border-border/60 px-3 py-1">
                <ShieldCheck className="size-3 text-rose-soft" /> Privacy-first
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/70 border border-border/60 px-3 py-1">
                <AccessIcon className="size-3 text-amber-glow-foreground" /> WCAG AAA
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card/70 border border-border/60 px-3 py-1">
                <Heart className="size-3 text-rose-soft" /> Consent-first
              </span>
            </div>
          </Card>
        </MotionDiv>
      </MotionDiv>
    </div>
  );
}

/* ============================================================
   SLIDES metadata — exported for the orchestrator
   ============================================================ */

export type SlideMeta = {
  id: string;
  title: string;
  icon: LucideIcon;
  Component: () => React.ReactElement;
};

export const SLIDES: SlideMeta[] = [
  { id: "cover", title: "Vision", icon: Sparkles, Component: CoverSlide },
  { id: "problem", title: "Problem", icon: Heart, Component: ProblemSlide },
  { id: "solution", title: "Solution", icon: Lightbulb, Component: SolutionSlide },
  { id: "story", title: "User Story", icon: Users, Component: UserStorySlide },
  { id: "a11y", title: "Accessibility", icon: AccessIcon, Component: AccessibilitySlide },
  { id: "twin", title: "Digital Twin", icon: Brain, Component: DigitalTwinSlide },
  { id: "arch", title: "Architecture", icon: CircuitBoard, Component: ArchitectureSlide },
  {
    id: "evolution",
    title: "Design Evolution",
    icon: GitBranch,
    Component: DesignEvolutionSlideWrapper,
  },
  { id: "research", title: "Research", icon: Compass, Component: ResearchSlide },
  {
    id: "feedback",
    title: "Feedback",
    icon: MessageSquare,
    Component: FeedbackSlide,
  },
  { id: "impact", title: "Impact", icon: TrendingUp, Component: ImpactSlide },
  { id: "roadmap", title: "Roadmap", icon: Rocket, Component: RoadmapSlideWrapper },
  { id: "closing", title: "Closing", icon: Trophy, Component: ClosingSlide },
];
