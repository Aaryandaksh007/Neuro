"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  HeartHandshake,
  Sparkles,
  ShieldCheck,
  Phone,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { useWellness } from "@/store/wellness";
import { useAccessibility } from "@/store/accessibility";

import { MoodWeather } from "./mood-weather";
import { BrainWeatherCard } from "./brain-weather";
import { EnergyBattery } from "./energy-battery";
import { EmotionConstellation } from "./emotion-constellation";
import { ReflectionJournal } from "./reflection-journal";
import { BreathingCompanion } from "./breathing-companion";
import { CalmRoom } from "./calm-room";
import { Grounding } from "./grounding";
import { TinyVictories } from "./tiny-victories";
import { GratitudeNotes } from "./gratitude-notes";
import { StressThermometer } from "./stress-thermometer";

type Tab = "check-in" | "reflect" | "calm";

export default function WellnessWorld() {
  const [tab, setTab] = useState<Tab>("check-in");
  const calmRoomActive = useWellness((s) => s.calmRoomActive);
  const setCalmRoom = useWellness((s) => s.setCalmRoom);
  const a11yCalm = useAccessibility((s) => s.calm);

  const openCalmRoom = () => setCalmRoom(true);

  return (
    <div className="relative min-h-screen">
      {/* Soft ambient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 -left-24 size-72 rounded-full bg-rose-soft/10 blur-3xl nt-motion-bg" />
        <div className="absolute top-1/2 -right-24 size-80 rounded-full bg-primary/10 blur-3xl nt-motion-bg" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <MotionDiv
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="mb-6 sm:mb-8"
        >
          <MotionDiv variants={fadeUp} className="flex items-start gap-3 mb-2">
            <span className="mt-1 size-11 rounded-2xl bg-gradient-to-br from-rose-soft/30 to-primary/20 flex items-center justify-center shrink-0">
              <HeartPulse className="size-5 text-rose-soft" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                Wellness
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-0.5 leading-relaxed">
                Feel what you feel — safely. Never a diagnosis.
              </p>
            </div>
          </MotionDiv>

          <MotionDiv variants={fadeUp} className="flex flex-wrap items-center gap-2 mt-3">
            <Badge
              variant="secondary"
              className="rounded-full gap-1.5 bg-rose-soft/10 text-rose-soft-foreground border-rose-soft/20"
            >
              <ShieldCheck className="size-3.5" />
              Non-clinical · Reflective
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full gap-1.5"
            >
              <Sparkles className="size-3.5 text-primary" />
              Gentle by design
            </Badge>
            {a11yCalm && (
              <Badge
                variant="secondary"
                className="rounded-full gap-1.5 bg-plum/10 text-plum-foreground border-plum/20"
              >
                <HeartHandshake className="size-3.5" />
                Calm mode on
              </Badge>
            )}
          </MotionDiv>
        </MotionDiv>

        {/* Tabs */}
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as Tab)}
          className="w-full"
        >
          <TabsList
            aria-label="Wellness sections"
            className="h-auto rounded-full p-1 bg-muted/60 backdrop-blur w-full sm:w-fit"
          >
            <TabsTrigger
              value="check-in"
              className="rounded-full px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-initial"
            >
              Check-in
            </TabsTrigger>
            <TabsTrigger
              value="reflect"
              className="rounded-full px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-initial"
            >
              Reflect
            </TabsTrigger>
            <TabsTrigger
              value="calm"
              className="rounded-full px-4 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-initial"
            >
              Calm Room
            </TabsTrigger>
          </TabsList>

          {/* Check-in tab */}
          <TabsContent value="check-in" className="mt-6 space-y-6 outline-none">
            <MoodWeather />

            {/* Bento: brain weather + energy battery + stress thermometer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2">
                <BrainWeatherCard />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                <EnergyBattery />
                <StressThermometer
                  onOpenCalmRoom={openCalmRoom}
                  onOpenBreathing={() => setTab("calm")}
                />
              </div>
            </div>

            <EmotionConstellation />
          </TabsContent>

          {/* Reflect tab */}
          <TabsContent value="reflect" className="mt-6 space-y-6 outline-none">
            <ReflectionJournal />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TinyVictories />
              <GratitudeNotes />
            </div>

            <Grounding />
          </TabsContent>

          {/* Calm Room tab */}
          <TabsContent value="calm" className="mt-6 space-y-6 outline-none">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
              <div className="lg:col-span-3">
                <BreathingCompanion />
              </div>
              <div className="lg:col-span-2 flex flex-col gap-5">
                <CalmRoomEntryCard onEnter={openCalmRoom} />
                <Grounding />
              </div>
            </div>

            <div className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-sage p-5 sm:p-6">
              <div className="flex items-start gap-3">
                <span className="size-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                  <Phone className="size-4 text-primary" />
                </span>
                <div className="text-sm leading-relaxed">
                  <p className="font-medium mb-1">
                    If you're really struggling
                  </p>
                  <p className="text-muted-foreground">
                    This isn't a substitute for human support. If you feel
                    unsafe, please reach out to someone you trust, or contact a
                    local helpline or mental health professional. You deserve
                    real help — and asking is brave.
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Calm Room overlay — driven directly by the wellness store */}
      <AnimatePresence>
        {calmRoomActive && (
          <motion.div
            key="calm-room-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CalmRoom onClose={() => setCalmRoom(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CalmRoomEntryCard({ onEnter }: { onEnter: () => void }) {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-rose-soft/20 via-primary/10 to-plum/15 nt-shadow-soft p-5 sm:p-6 h-full flex flex-col"
    >
      <div className="absolute -top-8 -right-8 size-32 rounded-full bg-rose-soft/20 blur-2xl" aria-hidden />
      <div className="absolute -bottom-6 -left-6 size-24 rounded-full bg-primary/15 blur-2xl" aria-hidden />

      <div className="relative flex-1 flex flex-col">
        <div className="size-11 rounded-xl bg-card/70 backdrop-blur flex items-center justify-center mb-3">
          <HeartHandshake className="size-5 text-rose-soft" />
        </div>
        <h3 className="text-lg font-semibold mb-1">The Calm Room</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          A quiet, full-screen space when everything feels like too much.
          Aurora gradients, soft orbs, and a simple message:{" "}
          <span className="font-medium text-foreground">you're safe here.</span>
        </p>

        <Button
          onClick={onEnter}
          className="mt-5 w-full rounded-full h-11 bg-rose-soft text-rose-soft-foreground hover:bg-rose-soft/90 self-start"
          aria-label="Enter the Calm Room"
        >
          <Sparkles className="size-4" /> Enter when ready
        </Button>

        <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
          Entering softens the whole app and tells your Twin you took a moment
          for yourself.
        </p>
      </div>
    </MotionDiv>
  );
}
