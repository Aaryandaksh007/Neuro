"use client";

import {
  GraduationCap,
  Sparkles,
  Brain,
  Flame,
  Wand2,
  type LucideIcon,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { ConfidenceMeter } from "./confidence-meter";
import { AdaptiveTutor } from "./adaptive-tutor";
import { ConceptPlayground } from "./concept-playground";
import { LearningDNAViz } from "./learning-dna-viz";
import { MemoryHeatmap } from "./memory-heatmap";

interface TabDef {
  key: string;
  label: string;
  icon: LucideIcon;
  hint: string;
}

const TABS: TabDef[] = [
  {
    key: "tutor",
    label: "Adaptive Tutor",
    icon: GraduationCap,
    hint: "Type a topic, get it in your language",
  },
  {
    key: "dna",
    label: "Learning DNA",
    icon: Brain,
    hint: "See how your brain learns best",
  },
  {
    key: "memory",
    label: "Memory Heatmap",
    icon: Flame,
    hint: "Where ideas are landing",
  },
  {
    key: "playground",
    label: "Playground",
    icon: Wand2,
    hint: "Turn any lesson into how you learn",
  },
];

export default function LearnWorld() {
  return (
    <div className="relative mx-auto w-full max-w-5xl px-4 pb-12 pt-6 sm:px-6 sm:pt-8">
      {/* Header */}
      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden rounded-2xl border bg-card p-5 nt-gradient-sage nt-shadow-soft sm:p-6"
      >
        <div className="nt-aurora nt-motion-bg" aria-hidden />
        <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              <Sparkles className="size-3" aria-hidden />
              Learn World
            </div>
            <h1 className="flex items-center gap-2 text-2xl font-semibold leading-tight sm:text-3xl">
              <GraduationCap className="size-7 text-primary" aria-hidden />
              Learn
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-muted-foreground sm:text-base">
              Lessons that become your language. Any topic, reshaped for how
              your brain works — never graded, never rushed.
            </p>
          </div>
          <div className="shrink-0 rounded-2xl border border-border/60 bg-background/60 p-4 backdrop-blur-sm">
            <ConfidenceMeter size={120} />
          </div>
        </div>
      </MotionDiv>

      {/* Tabs */}
      <MotionDiv
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="mt-6"
      >
        <Tabs defaultValue="tutor" className="w-full">
          <div className="-mx-1 overflow-x-auto px-1 pb-1">
            <TabsList className="h-auto w-fit gap-1 rounded-2xl bg-muted/60 p-1.5">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <TabsTrigger
                    key={t.key}
                    value={t.key}
                    className="rounded-xl px-3 py-2 text-sm data-[state=active]:bg-background data-[state=active]:shadow-md"
                  >
                    <Icon className="size-4" aria-hidden />
                    <span className="hidden sm:inline">{t.label}</span>
                    <span className="sm:hidden">{t.label.split(" ")[0]}</span>
                    <span className="sr-only">— {t.hint}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="tutor" className="mt-5 focus-visible:outline-none">
            <AdaptiveTutor />
          </TabsContent>
          <TabsContent value="dna" className="mt-5 focus-visible:outline-none">
            <LearningDNAViz />
          </TabsContent>
          <TabsContent value="memory" className="mt-5 focus-visible:outline-none">
            <MemoryHeatmap />
          </TabsContent>
          <TabsContent
            value="playground"
            className="mt-5 focus-visible:outline-none"
          >
            <ConceptPlayground />
          </TabsContent>
        </Tabs>
      </MotionDiv>
    </div>
  );
}
