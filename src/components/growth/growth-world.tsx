"use client";

import { useEffect } from "react";
import { useTwin } from "@/store/twin";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import GrowthForest from "./growth-forest";
import MemoryGalaxy from "./memory-galaxy";
import Meters from "./meters";
import FocusRiver from "./focus-river";
import BackpackOfWins from "./backpack-of-wins";
import AchievementTimeline from "./achievement-timeline";
import FutureSelf from "./future-self";
import { StreakCelebration } from "./streak-celebration";

export default function GrowthWorld() {
  const setCompanionMood = useTwin((s) => s.setCompanionMood);

  // Visiting Growth → companion becomes encouraging.
  useEffect(() => {
    setCompanionMood("encouraging");
  }, [setCompanionMood]);

  return (
    <div className="relative px-4 sm:px-6 lg:px-10 py-6 sm:py-10 max-w-7xl mx-auto">
      <StreakCelebration />
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <header className="mb-8 sm:mb-10">
          <p className="text-xs uppercase tracking-[0.18em] font-semibold text-plum/80 mb-2">
            Growth
          </p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
            Never grades. Only growth.
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base max-w-2xl leading-relaxed">
            Everything here celebrates effort, curiosity, and kindness. There
            are no comparisons, no rankings, no failing. Just a record of how
            far you&apos;ve come — at your own pace.
          </p>
        </header>
      </MotionDiv>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-8"
      >
        <MotionDiv variants={fadeUp}>
          <GrowthForest />
        </MotionDiv>

        <MotionDiv variants={fadeUp}>
          <MemoryGalaxy />
        </MotionDiv>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MotionDiv variants={fadeUp} className="lg:col-span-1">
            <Meters />
          </MotionDiv>
          <MotionDiv variants={fadeUp} className="lg:col-span-2">
            <FocusRiver />
          </MotionDiv>
        </div>

        <MotionDiv variants={fadeUp}>
          <BackpackOfWins />
        </MotionDiv>

        <MotionDiv variants={fadeUp}>
          <AchievementTimeline />
        </MotionDiv>

        <MotionDiv variants={fadeUp}>
          <FutureSelf />
        </MotionDiv>

        <footer className="pt-2 pb-6 text-center">
          <p className="text-xs text-muted-foreground italic">
            Growth is gentle here. Take what serves you, leave the rest.
          </p>
        </footer>
      </MotionDiv>
    </div>
  );
}
