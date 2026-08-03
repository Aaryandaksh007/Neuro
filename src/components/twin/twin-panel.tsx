"use client";

import {
  Brain,
  Sparkles,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Lightbulb,
} from "lucide-react";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useWellness } from "@/store/wellness";
import { useToast } from "@/hooks/use-toast";
import { useSessionId } from "@/components/shared/use-session-id";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { TwinOrb, MOOD_THEMES, type TwinMood } from "./twin-orb";
import { TraitGrid } from "./trait-card";
import { TwinTimeline } from "./twin-timeline";
import { ProfileCards } from "./profile-cards";
import { MoodSelector } from "./mood-selector";
import { InsightCard } from "./insight-card";
import { LearningExport } from "@/components/shared/learning-export";

export default function TwinPanel() {
  const sessionId = useSessionId();
  const profile = useApp((s) => s.profile);
  const companionName = useApp((s) => s.companionName);

  const traits = useTwin((s) => s.traits);
  const memories = useTwin((s) => s.memories);
  const companionMood = useTwin((s) => s.companionMood);
  const setCompanionMood = useTwin((s) => s.setCompanionMood);
  const addMemory = useTwin((s) => s.addMemory);
  const dayCount = useTwin((s) => s.dayCount);

  const moods = useWellness((s) => s.moods);
  const { toast } = useToast();

  const day = dayCount();
  const mood = companionMood as TwinMood;
  const moodTheme = MOOD_THEMES[mood];

  // Strip down to the API contract — only label/value/evidence
  const traitsPayload = Object.fromEntries(
    Object.entries(traits).map(([k, t]) => [
      k,
      {
        label: t.label,
        value: t.value,
        evidence: t.evidence,
      },
    ])
  );

  const recentMoods = moods
    .slice(-5)
    .reverse()
    .map((m) => ({ mood: m.mood, energy: m.energy }));

  const handleMoodChange = (m: TwinMood) => {
    setCompanionMood(m);
    toast({
      title: `${companionName} is now ${MOOD_THEMES[m].label.toLowerCase()}`,
      description: MOOD_THEMES[m].status,
    });
  };

  const handleInsight = (insight: string) => {
    addMemory({ text: insight, kind: "insight" });
    toast({
      title: "Added to your timeline",
      description: "I'll remember this. You can see it in the timeline below.",
    });
  };

  return (
    <MotionDiv
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10"
    >
      {/* Header */}
      <MotionDiv variants={fadeUp} className="space-y-2">
        <header>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Brain className="size-3.5" />
              Digital Twin
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Calendar className="size-3.5" />
              Day {day} with {companionName}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight">
            Your Digital Twin
          </h1>
          <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
            It learns you, gently. And always explains why.
          </p>
        </header>
      </MotionDiv>

      {/* ORB HERO */}
      <MotionDiv variants={fadeUp}>
        <section
          aria-label="Digital Twin companion overview"
          className="relative overflow-hidden rounded-3xl border nt-gradient-sage nt-shadow-soft"
        >
          {/* aurora wash */}
          <div className="nt-aurora nt-motion-bg" aria-hidden />
          {/* subtle dotted overlay */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.18] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(oklch(0.62 0.11 155 / 0.18) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr,1fr] items-center p-5 sm:p-8">
            {/* Orb column */}
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <TwinOrb
                mood={mood}
                size={232}
                ambient
                ariaLabel={`${companionName}, your Digital Twin, in ${moodTheme.label} mood`}
              />
              <div className="mt-4 sm:mt-6">
                <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                  {companionName}
                </h2>
                <p
                  className="mt-1 text-sm sm:text-base text-muted-foreground italic leading-relaxed max-w-md"
                  aria-live="polite"
                >
                  {moodTheme.status}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 justify-center lg:justify-start">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium"
                    style={{
                      background: moodTheme.halo.replace(/[\d.]+\)$/, "0.18)"),
                      color: moodTheme.c2,
                    }}
                  >
                    <span
                      className="size-1.5 rounded-full nt-breathe"
                      style={{ background: moodTheme.c1 }}
                      aria-hidden
                    />
                    {moodTheme.label}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border bg-card/70 px-2.5 py-1 text-[11px] text-muted-foreground">
                    <ShieldCheck className="size-3" />
                    Never diagnoses · always explains
                  </span>
                </div>
              </div>
            </div>

            {/* Controls column */}
            <div className="flex flex-col gap-5">
              {/* Mood selector */}
              <div className="rounded-2xl border bg-card/70 backdrop-blur-sm p-4 sm:p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold">
                    How should {companionName} be today?
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    You&apos;re in charge. Change this anytime.
                  </p>
                </div>
                <MoodSelector value={mood} onChange={handleMoodChange} />
              </div>

              {/* Insight */}
              <div className="rounded-2xl border bg-card/70 backdrop-blur-sm p-4 sm:p-5">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5">
                    <Sparkles className="size-4 text-amber-glow-foreground" />
                    A fresh Twin insight
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    One observation, in plain words. Grounded only in what
                    you&apos;ve shared.
                  </p>
                </div>
                <InsightCard
                  traits={traitsPayload}
                  profile={profile}
                  recentMoods={recentMoods}
                  day={day}
                  companionName={companionName}
                  mood={mood}
                  onInsight={handleInsight}
                />
              </div>
            </div>
          </div>
        </section>
      </MotionDiv>

      {/* LIVING TRAIT PROFILE */}
      <MotionDiv variants={fadeUp}>
        <section aria-label="Living trait profile" className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="size-4 text-sage" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Living trait profile
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                What I&apos;ve learned about your learning
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                These grow as you learn with me. Each card shows what I noticed —
                and why I adapt the way I do.
              </p>
            </div>
          </div>
          <TraitGrid traits={traits} />

          {/* Explainable AI banner */}
          <div className="flex items-start gap-3 rounded-2xl border bg-muted/40 p-4">
            <Lightbulb className="size-5 text-amber-glow-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground/85">
                Explainable AI, always.{" "}
              </span>
              Every adaptation has a reason you can see. If something feels off,
              tell me — I&apos;ll relearn. I never decide silently.
            </p>
          </div>
        </section>
      </MotionDiv>

      {/* DAY 1 → 30 TIMELINE */}
      <MotionDiv variants={fadeUp}>
        <section
          aria-label="Day 1 to Day 30 growth timeline"
          className="space-y-4"
        >
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="size-4 text-plum" />
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Growth timeline
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                How I&apos;m growing with you
              </h2>
              <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">
                From Day 1 — &quot;I am learning about you&quot; — to a rhythm
                that feels like yours. This is the long, gentle arc.
              </p>
            </div>
            <div className="hidden sm:block text-right shrink-0">
              <div className="text-3xl font-semibold tabular-nums text-plum">
                {day}
              </div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
                of 30
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card/40 p-4 sm:p-6 nt-shadow-soft">
            <TwinTimeline memories={memories} currentDay={day} />
          </div>
        </section>
      </MotionDiv>

      {/* WHAT I'VE LEARNED ABOUT YOU */}
      <MotionDiv variants={fadeUp}>
        <section
          aria-label="What I've learned about you"
          className="space-y-4"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain className="size-4 text-sage" />
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                Your profile, through my eyes
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
              What I&apos;ve learned about you
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-2xl leading-relaxed">
              A snapshot of how you learn best — based on what you&apos;ve told
              me and what I&apos;ve noticed. Gentle. Editable. Never a label.
            </p>
          </div>
          <ProfileCards profile={profile} />
        </section>
      </MotionDiv>

      {/* Export summary */}
      <MotionDiv variants={fadeUp} className="flex justify-center">
        <LearningExport />
      </MotionDiv>

      {/* Footer promise */}
      <MotionDiv variants={fadeUp}>
        <footer className="rounded-2xl nt-gradient-plum p-5 sm:p-6 nt-shadow-soft">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="shrink-0">
              <TwinOrb mood={mood} size={64} ambient={false} />
            </div>
            <div>
              <h3 className="text-base font-semibold">My promise to you</h3>
              <p className="mt-1.5 text-sm text-foreground/85 leading-relaxed">
                I learn about you, gently. I explain every choice. I never
                diagnose, never compare, never push. You can change anything,
                anytime — and I&apos;ll relearn, quietly. This is your space,
                and I&apos;m here as your companion.
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                — {companionName}, your Digital Twin · session{" "}
                <span className="font-mono">{sessionId.slice(0, 10)}</span>
              </p>
            </div>
          </div>
        </footer>
      </MotionDiv>
    </MotionDiv>
  );
}
