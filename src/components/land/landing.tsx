"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  Sparkles,
  Brain,
  HeartPulse,
  Sprout,
  GraduationCap,
  ShieldCheck,
  Eye,
  Type,
  Wind,
  ArrowRight,
  Star,
  MessageCircleHeart,
  Accessibility as AccessIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NeuroTwinLogo, Wordmark } from "@/components/shared/logo";
import { AccessibilityToolbar } from "@/components/shared/accessibility-toolbar";
import { useApp } from "@/store/app";
import { useAccessibility } from "@/store/accessibility";
import { useMounted } from "@/hooks/use-mounted";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";

const WORLDS = [
  {
    key: "learn",
    name: "Learn",
    icon: GraduationCap,
    tagline: "Lessons that become your language",
    desc: "Turn any topic into stories, visuals, comics, flowcharts, or analogies — adapted to how your brain works.",
    gradient: "nt-gradient-sage",
    accent: "text-primary",
  },
  {
    key: "wellness",
    name: "Wellness",
    icon: HeartPulse,
    tagline: "Feel what you feel, safely",
    desc: "Mood Weather, Brain Weather, breathing, grounding, and tiny victories. Calmer when you need it. Never a diagnosis.",
    gradient: "nt-gradient-rose",
    accent: "text-rose-soft",
  },
  {
    key: "health",
    name: "Health",
    icon: Sprout,
    tagline: "A companion that grows with you",
    desc: "Track sleep, water, movement, and breaks. Your digital companion thrives on consistency — never guilt.",
    gradient: "nt-gradient-amber",
    accent: "text-amber-glow-foreground",
  },
  {
    key: "growth",
    name: "Growth",
    icon: Star,
    tagline: "Never grades. Only growth.",
    desc: "A forest that grows, a galaxy of mastered ideas, a river of focus sessions. Celebrate effort, curiosity, persistence.",
    gradient: "nt-gradient-plum",
    accent: "text-plum",
  },
];

const PRINCIPLES = [
  { icon: ShieldCheck, text: "Never punish. Never compare. Never shame." },
  { icon: Eye, text: "Reduced cognitive load, always." },
  { icon: Type, text: "Dyslexia-friendly fonts & spacing." },
  { icon: Wind, text: "Calm mode when things feel like too much." },
  { icon: AccessIcon, text: "WCAG AAA, keyboard-first, screen-reader ready." },
  { icon: MessageCircleHeart, text: "Every AI choice explained, never silent." },
];

export function Landing() {
  const setView = useApp((s) => s.setView);
  const enterMindSpace = useApp((s) => s.enterMindSpace);
  const onboarded = useApp((s) => s.onboarded);
  const a11y = useAccessibility();
  const mounted = useMounted();
  const osReduced = useReducedMotion();
  const reduced = mounted && (osReduced || a11y.motion === "reduced");

  const start = () => (onboarded ? enterMindSpace() : setView("onboarding"));
  // Guard against hydration mismatch: onboarded is persisted (localStorage),
  // so it's false on the server but could be true on the client.
  const showOnboarded = mounted && onboarded;

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip">
      {/* Aurora background */}
      <div className="nt-aurora nt-motion-bg" aria-hidden />

      {/* Skip link */}
      <a href="#main" className="nt-skip-link">
        Skip to content
      </a>

      {/* Top nav */}
      <header className="relative z-10 px-4 sm:px-6 lg:px-10 pt-5">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2.5">
            <NeuroTwinLogo size={36} />
            <Wordmark className="text-lg" />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hidden sm:flex"
              onClick={() => setView("judge")}
            >
              Judge Mode
            </Button>
            <AccessibilityToolbar compact />
            <Button size="sm" className="rounded-full" onClick={start}>
              {showOnboarded ? "Enter MindSpace" : "Begin"}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </nav>
      </header>

      <main id="main" className="relative z-10 flex-1 px-4 sm:px-6 lg:px-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero */}
          <section className="relative pt-12 sm:pt-20 pb-16 text-center">
            {/* Animated gradient mesh backdrop */}
            {!reduced && (
              <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden>
                <motion.div
                  className="absolute -top-20 left-1/4 size-96 rounded-full bg-primary/15 blur-3xl"
                  animate={{ x: [0, 60, 0], y: [0, 40, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute top-10 right-1/4 size-80 rounded-full bg-amber-glow/12 blur-3xl"
                  animate={{ x: [0, -50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute -bottom-10 left-1/3 size-72 rounded-full bg-plum/10 blur-3xl"
                  animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                />
              </div>
            )}
            <MotionDiv
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col items-center"
            >
              <MotionDiv variants={fadeUp}>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 gap-1.5 mb-6"
                >
                  <Sparkles className="size-3.5 text-primary" />
                  For every kind of mind
                </Badge>
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
                  NeuroTwin OS is an AI learning companion that adapts to every
                  individual brain — not the other way around. Built with and
                  for neurodivergent learners. Safe. Seen. Calm. Empowered.
                </p>
              </MotionDiv>

              {/* Stats strip */}
              <MotionDiv variants={fadeUp} className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
                {[
                  { v: "4", l: "Living worlds" },
                  { v: "8", l: "Lesson formats" },
                  { v: "6", l: "Accessibility modes" },
                  { v: "AAA", l: "WCAG target" },
                ].map((s, i) => (
                  <div key={s.l} className="flex items-center gap-2">
                    {i > 0 && (
                      <span className="hidden sm:block h-8 w-px bg-border" aria-hidden />
                    )}
                    <div className="text-center">
                      <p className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary to-plum bg-clip-text text-transparent tabular-nums">
                        {s.v}
                      </p>
                      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                        {s.l}
                      </p>
                    </div>
                  </div>
                ))}
              </MotionDiv>

              <MotionDiv variants={fadeUp} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="rounded-full text-base h-12 px-7" onClick={start}>
                  {showOnboarded ? "Open MindSpace" : "Create your Digital Twin"}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full text-base h-12 px-7"
                  onClick={() => setView("judge")}
                >
                  See the vision
                </Button>
              </MotionDiv>

              {/* Floating orb */}
              <MotionDiv variants={fadeUp} className="mt-10 relative">
                <div className="relative size-36 sm:size-44">
                  {!reduced && (
                    <>
                      <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl nt-breathe" />
                      <div className="absolute inset-4 rounded-full bg-amber-glow/20 blur-xl nt-breathe" style={{ animationDelay: "-2s" }} />
                    </>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <NeuroTwinLogo size={108} className="nt-float" />
                  </div>
                </div>
              </MotionDiv>
            </MotionDiv>
          </section>

          {/* Four worlds */}
          <section className="py-12 sm:py-16">
            <div className="text-center mb-10">
              <p className="text-sm font-medium text-primary uppercase tracking-wider">
                MindSpace
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-2">
                Four living worlds, one companion
              </h2>
              <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                Not a dashboard. A personal universe that grows with you.
              </p>
            </div>
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {WORLDS.map((w) => (
                <MotionDiv key={w.key} variants={fadeUp}>
                  <Card
                    className={`relative h-full overflow-hidden border-border/60 nt-shadow-soft ${w.gradient} hover:-translate-y-1 transition-transform duration-300 cursor-default`}
                  >
                    <div className="p-6">
                      <div className="size-11 rounded-xl bg-card/80 flex items-center justify-center nt-shadow-soft mb-4">
                        <w.icon className={`size-5 ${w.accent}`} />
                      </div>
                      <h3 className="text-lg font-semibold">{w.name}</h3>
                      <p className={`text-sm font-medium ${w.accent} mt-0.5`}>
                        {w.tagline}
                      </p>
                      <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                        {w.desc}
                      </p>
                    </div>
                  </Card>
                </MotionDiv>
              ))}
            </motion.div>
          </section>

          {/* Digital Twin */}
          <section className="py-12 sm:py-16">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <MotionDiv
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Badge variant="secondary" className="rounded-full mb-4 gap-1.5">
                  <Brain className="size-3.5" /> The Digital Twin
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                  An AI that actually learns{" "}
                  <span className="text-primary">you</span>
                </h2>
                <p className="text-muted-foreground mt-4 leading-relaxed">
                  Your Digital Twin quietly observes how you learn, focus, rest,
                  and recharge — then adapts every lesson to fit. It explains
                  itself every time. It never labels you. Over time, it grows
                  from a stranger into a companion that knows your rhythm.
                </p>
                <ul className="mt-6 space-y-2.5">
                  {[
                    "Learning style, reading speed, attention span",
                    "Best focus windows & stress patterns",
                    "Motivation triggers & sensory preferences",
                    "Day 1 → Day 30: visibly more personal",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 size-5 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                        <Sparkles className="size-3" />
                      </span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </MotionDiv>

              <MotionDiv
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <Card className="p-6 nt-shadow-soft nt-gradient-sage border-border/60">
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
                    {[
                      { l: "Visual learning", v: 78 },
                      { l: "Focus window", v: 62 },
                      { l: "Memory retention", v: 54 },
                      { l: "Confidence", v: 48 },
                    ].map((b) => (
                      <div key={b.l}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{b.l}</span>
                          <span className="font-medium">{b.v}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-gradient-to-r from-primary to-amber-glow"
                            initial={reduced ? false : { width: 0 }}
                            animate={{ width: `${b.v}%` }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 rounded-xl bg-card/70 p-3 text-sm border border-border/50">
                    <p className="text-muted-foreground text-xs mb-1">
                      Twin says:
                    </p>
                    <p>
                      “I noticed diagrams help you focus, so I'll lead with
                      visuals today. We'll keep it to 18 minutes — that's your
                      sweet spot.”
                    </p>
                  </div>
                </Card>
              </MotionDiv>
            </div>
          </section>

          {/* Principles */}
          <section className="py-12 sm:py-16">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">
                Accessibility isn't a feature. It's the foundation.
              </h2>
              <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
                Designed for ADHD, autism, dyslexia, dyspraxia, and sensory
                sensitivities — by default, not as an afterthought.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PRINCIPLES.map((p, i) => (
                <MotionDiv
                  key={p.text}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="p-5 flex items-start gap-3 nt-shadow-soft border-border/60 h-full">
                    <span className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <p.icon className="size-4.5" />
                    </span>
                    <p className="text-sm leading-relaxed pt-1">{p.text}</p>
                  </Card>
                </MotionDiv>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 sm:py-24">
            <Card className="relative overflow-hidden nt-gradient-sage border-border/60 nt-shadow-soft p-8 sm:p-12 text-center">
              <div className="relative z-10 max-w-2xl mx-auto">
                <NeuroTwinLogo size={56} className="mx-auto nt-float" />
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mt-5">
                  This AI doesn't just teach you.
                  <br />
                  <span className="bg-gradient-to-r from-primary to-plum bg-clip-text text-transparent">
                    It understands you.
                  </span>
                </h2>
                <p className="text-muted-foreground mt-4">
                  Create your Digital Twin in about two minutes. You can change
                  everything later — there's no wrong answer.
                </p>
                <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" className="rounded-full h-12 px-7 text-base" onClick={start}>
                    {showOnboarded ? "Enter MindSpace" : "Begin onboarding"}
                    <ArrowRight className="size-4" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full h-12 px-7 text-base"
                    onClick={() => setView("judge")}
                  >
                    Explore Judge Mode
                  </Button>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t bg-card/50 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <NeuroTwinLogo size={26} />
          <div className="leading-tight">
            <Wordmark className="text-sm" />
            <p className="text-[11px] text-muted-foreground">
              Built with and for neurodivergent learners.
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center sm:text-right max-w-md">
          Not a medical device. Never diagnoses. Always respects your privacy
          and consent. Privacy-first · Consent-first · Transparency-first.
        </p>
      </div>
    </footer>
  );
}
