"use client";

import {
  Flame,
  Droplets,
  Moon,
  Dumbbell,
  Utensils,
  StretchHorizontal,
  Eye,
  Footprints,
  Sprout,
} from "lucide-react";
import { useHealth } from "@/store/health";
import { CompanionCreature } from "./companion-creature";
import { TrackerCard } from "./tracker-card";
import { FocusTimer } from "./focus-timer";
import { Reminders } from "./reminders";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";

export default function HealthWorld() {
  const streak = useHealth((s) => s.streak());

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Header */}
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-amber-glow-foreground">
              <Sprout className="size-5" aria-hidden />
              <span className="text-xs font-semibold uppercase tracking-wide">
                Health
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mt-1">
              Health
            </h1>
            <p className="text-muted-foreground mt-1 max-w-xl">
              Small acts of care. Your companion grows with you.
            </p>
          </div>

          {/* Streak badge */}
          <div
            className="inline-flex items-center gap-2 rounded-full border border-amber-glow/30 bg-amber-glow/10 px-4 py-2 text-sm nt-shadow-soft"
            aria-label={`Current streak: ${streak} day${streak === 1 ? "" : "s"}`}
          >
            <Flame
              className="size-4 text-amber-glow-foreground"
              aria-hidden
            />
            {streak > 0 ? (
              <>
                <span className="font-semibold tabular-nums">{streak}</span>
                <span className="text-muted-foreground">
                  day{streak === 1 ? "" : "s"} of care
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                Log one care today — start a streak
              </span>
            )}
          </div>
        </header>
      </MotionDiv>

      {/* Hero: Companion creature + today summary */}
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <CompanionCreature />
      </MotionDiv>

      {/* Quick-track grid */}
      <section aria-labelledby="quicktrack-heading">
        <h2
          id="quicktrack-heading"
          className="text-lg font-semibold mb-3 flex items-center gap-2"
        >
          Quick Track
          <span className="text-sm font-normal text-muted-foreground">
            — tap to add
          </span>
        </h2>
        <MotionDiv
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <TrackerCard
            type="water"
            icon={Droplets}
            label="Water"
            unit="glass"
            goal={8}
            microCopy="Sip by sip, you're refueling."
            accent="sage"
          />
          <TrackerCard
            type="sleep"
            icon={Moon}
            label="Sleep"
            unit="log"
            goal={1}
            microCopy="Rest is productive too."
            accent="amber"
            inputMode="value"
            inputUnit="hrs"
            inputStep={0.5}
          />
          <TrackerCard
            type="exercise"
            icon={Dumbbell}
            label="Exercise"
            unit="session"
            goal={1}
            microCopy="Movement is celebration."
            accent="rose"
          />
          <TrackerCard
            type="meal"
            icon={Utensils}
            label="Meals"
            unit="meal"
            goal={3}
            microCopy="Nourish yourself gently."
            accent="amber"
          />
          <TrackerCard
            type="stretch"
            icon={StretchHorizontal}
            label="Stretch"
            unit="stretch"
            goal={3}
            microCopy="A small release goes far."
            accent="sage"
          />
          <TrackerCard
            type="eye-break"
            icon={Eye}
            label="Eye Break"
            unit="break"
            goal={6}
            microCopy="Rest your gaze, soften your mind."
            accent="plum"
          />
          <TrackerCard
            type="movement"
            icon={Footprints}
            label="Movement"
            unit="session"
            goal={2}
            microCopy="Two minutes counts."
            accent="rose"
          />
        </MotionDiv>
      </section>

      {/* Focus timer + Reminders side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <FocusTimer />
        </MotionDiv>
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <Reminders />
        </MotionDiv>
      </div>
    </div>
  );
}
