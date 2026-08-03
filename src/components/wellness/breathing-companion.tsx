"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play, Square, Wind, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

type Pattern = "478" | "box";

interface PhaseDef {
  key: "in" | "hold" | "out" | "hold2";
  label: string;
  cue: string;
  // visual scale of the breathing circle
  scale: number;
  color: string; // gradient classes
}

interface PatternDef {
  key: Pattern;
  name: string;
  desc: string;
  phases: { phase: PhaseDef["key"]; duration: number }[];
}

const PHASE_DEFS: Record<PhaseDef["key"], PhaseDef> = {
  in: {
    key: "in",
    label: "Breathe in",
    cue: "Slowly in…",
    scale: 1.35,
    color: "from-rose-soft/40 via-primary/30 to-amber-glow/20",
  },
  hold: {
    key: "hold",
    label: "Hold",
    cue: "Hold gently…",
    scale: 1.35,
    color: "from-amber-glow/40 via-rose-soft/30 to-primary/20",
  },
  out: {
    key: "out",
    label: "Breathe out",
    cue: "Slowly out…",
    scale: 0.85,
    color: "from-primary/40 via-rose-soft/30 to-plum/20",
  },
  hold2: {
    key: "hold2",
    label: "Hold",
    cue: "Rest a moment…",
    scale: 0.85,
    color: "from-plum/30 via-primary/30 to-rose-soft/20",
  },
};

const PATTERNS: PatternDef[] = [
  {
    key: "478",
    name: "4 · 7 · 8",
    desc: "In for 4, hold for 7, out for 8. Calming.",
    phases: [
      { phase: "in", duration: 4 },
      { phase: "hold", duration: 7 },
      { phase: "out", duration: 8 },
    ],
  },
  {
    key: "box",
    name: "Box · 4·4·4·4",
    desc: "Even four-count breath. Balancing.",
    phases: [
      { phase: "in", duration: 4 },
      { phase: "hold", duration: 4 },
      { phase: "out", duration: 4 },
      { phase: "hold2", duration: 4 },
    ],
  },
];

export function BreathingCompanion() {
  const [pattern, setPattern] = useState<Pattern>("478");
  const [running, setRunning] = useState(false);
  // Combined state — single setState drives phase + countdown together.
  const [phase, setPhase] = useState<{ idx: number; countdown: number }>({
    idx: 0,
    countdown: 0,
  });
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activePattern = PATTERNS.find((p) => p.key === pattern)!;

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setRunning(false);
    setPhase({ idx: 0, countdown: 0 });
  }, []);

  const start = useCallback(() => {
    setRunning(true);
    setPhase({ idx: 0, countdown: activePattern.phases[0].duration });
  }, [activePattern]);

  // Single interval drives every tick — no setState-in-effect cascade.
  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setPhase((p) => {
        if (p.countdown > 1) {
          return { idx: p.idx, countdown: p.countdown - 1 };
        }
        // Advance to next phase and seed its duration atomically.
        const next = (p.idx + 1) % activePattern.phases.length;
        return {
          idx: next,
          countdown: activePattern.phases[next].duration,
        };
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, activePattern]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const phaseIdx = phase.idx;
  const countdown = phase.countdown;
  const currentPhase =
    activePattern.phases[phaseIdx % activePattern.phases.length];
  const phaseDef = PHASE_DEFS[currentPhase.phase];

  return (
    <section
      aria-labelledby="breathing-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-rose overflow-hidden"
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
          <div className="flex items-center gap-2">
            <Wind className="size-4 text-rose-soft" />
            <h2 id="breathing-heading" className="text-lg font-semibold">
              Breathing Companion
            </h2>
          </div>
          <TooltipProvider delayDuration={200}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="About this exercise"
                >
                  <Info className="size-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                A gentle rhythm to help your body settle. Skip anytime — there's
                no wrong way.
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground mb-5">
          Follow the circle. Or just read the words. Whatever helps.
        </p>

        {/* Pattern picker */}
        <div
          role="radiogroup"
          aria-label="Breathing pattern"
          className="flex flex-wrap gap-2 mb-6"
        >
          {PATTERNS.map((p) => (
            <button
              key={p.key}
              role="radio"
              aria-checked={pattern === p.key}
              onClick={() => {
                if (running) stop();
                setPattern(p.key);
              }}
              className={cn(
                "rounded-full px-3 py-1.5 text-sm border transition-all",
                pattern === p.key
                  ? "bg-primary/15 text-primary border-primary/40 ring-1 ring-primary/30"
                  : "bg-card/60 border-border/60 hover:bg-accent"
              )}
              aria-label={`${p.name} pattern: ${p.desc}`}
            >
              {p.name}
            </button>
          ))}
        </div>

        {/* Breathing visual */}
        <div
          className="relative flex items-center justify-center"
          style={{ minHeight: "320px" }}
        >
          {/* Ambient rings (decoration) */}
          <div
            aria-hidden
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="absolute size-48 rounded-full bg-rose-soft/5 blur-2xl" />
            <div className="absolute size-64 rounded-full bg-primary/5 blur-3xl" />
          </div>

          {/* Reduced motion: static gentle pulse + text */}
          {reduced ? (
            <div className="relative flex flex-col items-center gap-4">
              <div
                className={cn(
                  "size-44 rounded-full bg-gradient-to-br border border-border/40 flex items-center justify-center nt-breathe",
                  phaseDef.color
                )}
                aria-hidden
              >
                <span className="text-3xl font-semibold tabular-nums text-foreground">
                  {running ? countdown : "—"}
                </span>
              </div>
              <p
                className="text-base font-medium text-rose-soft"
                aria-live="polite"
              >
                {running ? phaseDef.cue : "Press start when you're ready."}
              </p>
            </div>
          ) : (
            <div className="relative flex flex-col items-center gap-4">
              {/* Pulse rings */}
              {running && (
                <>
                  <motion.div
                    aria-hidden
                    className="absolute size-40 rounded-full border border-rose-soft/30"
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{
                      duration: activePattern.phases.reduce(
                        (s, p) => s + p.duration,
                        0
                      ),
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    aria-hidden
                    className="absolute size-40 rounded-full border border-primary/20"
                    animate={{ scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{
                      duration: activePattern.phases.reduce(
                        (s, p) => s + p.duration,
                        0
                      ),
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1,
                    }}
                  />
                </>
              )}

              {/* Main breathing circle */}
              <motion.div
                className={cn(
                  "size-44 rounded-full bg-gradient-to-br border border-white/30 flex items-center justify-center shadow-lg",
                  phaseDef.color
                )}
                animate={
                  running
                    ? {
                        scale: phaseDef.scale,
                        opacity: 1,
                      }
                    : { scale: 1, opacity: 0.9 }
                }
                transition={{
                  duration: running ? currentPhase.duration : 0.6,
                  ease: "easeInOut",
                }}
                aria-hidden
              >
                <div className="text-center">
                  <div className="text-4xl font-semibold tabular-nums text-foreground drop-shadow-sm">
                    {running ? countdown : "♡"}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">
                    {running ? "seconds" : "ready"}
                  </div>
                </div>
              </motion.div>

              {/* Phase label */}
              <div className="h-7 flex items-center justify-center">
                <motion.p
                  key={`${phaseIdx}-${running}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-base font-medium text-rose-soft"
                  aria-live="polite"
                >
                  {running
                    ? `${phaseDef.cue} ${countdown}`
                    : "Press start when you're ready."}
                </motion.p>
              </div>

              {/* Phase progress dots */}
              <div
                className="flex items-center gap-1.5"
                aria-hidden
              >
                {activePattern.phases.map((p, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 rounded-full transition-all",
                      i === phaseIdx && running
                        ? "w-6 bg-rose-soft"
                        : "w-1.5 bg-border"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {running ? (
            <Button
              onClick={stop}
              variant="outline"
              className="rounded-full h-11 px-6"
              aria-label="Stop breathing exercise"
            >
              <Square className="size-4" /> Stop
            </Button>
          ) : (
            <Button
              onClick={start}
              className="rounded-full h-11 px-6 bg-primary text-primary-foreground"
              aria-label="Start breathing exercise"
            >
              <Play className="size-4" /> Begin
            </Button>
          )}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Badge
            variant="secondary"
            className="rounded-full gap-1"
          >
            {activePattern.name}
          </Badge>
          <span>{activePattern.desc}</span>
        </div>

        {reduced && (
          <p className="text-xs text-center text-muted-foreground mt-3">
            Reduced motion is on — showing a gentle pulse and text cues only.
          </p>
        )}
      </div>
    </section>
  );
}
