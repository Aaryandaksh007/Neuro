"use client";

import { useEffect, useState, useCallback } from "react";
import { Trees, Star, Gauge, Waves, Backpack, Award, TrendingUp } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface Section {
  id: string;
  label: string;
  icon: any;
}

const SECTIONS: Section[] = [
  { id: "forest", label: "Forest", icon: Trees },
  { id: "galaxy", label: "Galaxy", icon: Star },
  { id: "meters", label: "Qualities", icon: Gauge },
  { id: "river", label: "River", icon: Waves },
  { id: "backpack", label: "Backpack", icon: Backpack },
  { id: "timeline", label: "Timeline", icon: Award },
  { id: "future", label: "Future", icon: TrendingUp },
];

export default function GrowthWorld() {
  const setCompanionMood = useTwin((s) => s.setCompanionMood);
  const [activeSection, setActiveSection] = useState("forest");

  useEffect(() => {
    setCompanionMood("encouraging");
  }, [setCompanionMood]);

  // Track which section is in view for the sub-nav highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
    }
  }, []);

  return (
    <div className="relative px-4 sm:px-6 lg:px-10 py-6 sm:py-10 max-w-7xl mx-auto">
      <StreakCelebration />
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <header className="mb-6 sm:mb-8">
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

      {/* Sticky sub-navigation */}
      <div className="sticky top-14 z-20 -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8">
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border bg-card/80 backdrop-blur-xl p-1.5 nt-shadow-soft">
          {SECTIONS.map((s) => {
            const Icon = s.icon;
            const active = activeSection === s.id;
            return (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap",
                  active
                    ? "bg-plum/15 text-plum"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="space-y-6 sm:space-y-8"
      >
        <MotionDiv variants={fadeUp} id="forest" className="scroll-mt-32">
          <GrowthForest />
        </MotionDiv>

        <MotionDiv variants={fadeUp} id="galaxy" className="scroll-mt-32">
          <MemoryGalaxy />
        </MotionDiv>

        <div id="meters" className="grid grid-cols-1 lg:grid-cols-3 gap-6 scroll-mt-32">
          <MotionDiv variants={fadeUp} className="lg:col-span-1">
            <Meters />
          </MotionDiv>
          <MotionDiv variants={fadeUp} className="lg:col-span-2" id="river">
            <FocusRiver />
          </MotionDiv>
        </div>

        <MotionDiv variants={fadeUp} id="backpack" className="scroll-mt-32">
          <BackpackOfWins />
        </MotionDiv>

        <MotionDiv variants={fadeUp} id="timeline" className="scroll-mt-32">
          <AchievementTimeline />
        </MotionDiv>

        <MotionDiv variants={fadeUp} id="future" className="scroll-mt-32">
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
