"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Play, Pause, RotateCcw, Eye, Timer as TimerIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGrowth } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { useHealth } from "@/store/health";
import { useAccessibility } from "@/store/accessibility";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

const DURATIONS = [5, 10, 15, 20, 25];
const RADIUS = 110;
const CIRC = 2 * Math.PI * RADIUS;

export function FocusTimer() {
  const [durationMin, setDurationMin] = useState(20);
  const [remaining, setRemaining] = useState(20 * 60);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const completedRef = useRef(false);

  const addSession = useGrowth((s) => s.addSession);
  const bumpPersistence = useGrowth((s) => s.bumpPersistence);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const addMemory = useTwin((s) => s.addMemory);
  const addLog = useHealth((s) => s.addLog);
  const { toast } = useToast();
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  // Tick every second while running. When the timer hits zero, we transition
  // to "finished" inside the interval callback (not the effect body) so we
  // don't trigger cascading renders from setState-in-effect.
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id);
          // Defer state transitions + side effects out of the state updater.
          queueMicrotask(() => {
            if (completedRef.current) return;
            completedRef.current = true;
            setRunning(false);
            setFinished(true);
            addSession({ minutes: durationMin, flow: 70 });
            bumpTrait(
              "focusWindow",
              3,
              `Completed a ${durationMin} min focus session.`
            );
            addMemory({
              text: `You focused for ${durationMin} minutes.`,
              kind: "celebration",
            });
            bumpPersistence(3);
            toast({
              title: `${durationMin} minutes — done! 🌱`,
              description: "Your companion thanks you 💚",
            });
          });
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [
    running,
    durationMin,
    addSession,
    bumpTrait,
    addMemory,
    bumpPersistence,
    toast,
  ]);

  const start = () => {
    if (finished || remaining === 0) {
      setRemaining(durationMin * 60);
      completedRef.current = false;
      setFinished(false);
    }
    setRunning(true);
  };
  const pause = () => setRunning(false);
  const reset = () => {
    setRunning(false);
    setFinished(false);
    setRemaining(durationMin * 60);
    completedRef.current = false;
  };

  const changeDuration = (min: number) => {
    setDurationMin(min);
    setRemaining(min * 60);
    setRunning(false);
    setFinished(false);
    completedRef.current = false;
  };

  const totalSec = durationMin * 60;
  const progress = ((totalSec - remaining) / totalSec) * 100;
  const dash = (progress / 100) * CIRC;
  const mm = Math.floor(remaining / 60)
    .toString()
    .padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  const handleEyeBreak = () => {
    addLog({ type: "eye-break", value: 1, unit: "break" });
    bumpTrait("calm", 1, "Took an eye break after a focus session.");
    toast({
      title: "Eye break logged 💚",
      description: "20 feet, 20 seconds — well done.",
    });
  };

  return (
    <Card className="nt-gradient-sage nt-shadow-soft rounded-2xl p-6 border-sage/20">
      <header className="flex items-center gap-2 mb-1">
        <TimerIcon className="size-5 text-sage" aria-hidden />
        <h3 className="text-lg font-semibold">Focus Timer</h3>
      </header>
      <p className="text-sm text-muted-foreground mb-5">
        A gentle focus session. Start when you&apos;re ready — no pressure.
      </p>

      {/* Duration chips */}
      <div
        className="flex flex-wrap gap-2 mb-5"
        role="group"
        aria-label="Choose duration in minutes"
      >
        {DURATIONS.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => changeDuration(d)}
            aria-pressed={durationMin === d}
            aria-label={`Set timer to ${d} minutes`}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/70",
              durationMin === d
                ? "bg-primary text-primary-foreground border-primary shadow-sm"
                : "bg-background border-border hover:border-primary/50 hover:bg-accent/40"
            )}
          >
            {d} min
          </button>
        ))}
      </div>

      {/* Timer ring */}
      <div className="flex justify-center mb-6">
        <div className="relative">
          <svg
            width="260"
            height="260"
            viewBox="0 0 260 260"
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx="130"
              cy="130"
              r={RADIUS}
              fill="none"
              stroke="oklch(0.7 0.02 150 / 0.15)"
              strokeWidth="14"
            />
            <circle
              cx="130"
              cy="130"
              r={RADIUS}
              fill="none"
              stroke="oklch(0.7 0.1 155)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              className="transition-[stroke-dasharray] duration-300 ease-linear"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className="text-5xl font-bold tabular-nums"
              aria-live="polite"
              aria-atomic="true"
            >
              {mm}:{ss}
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              {finished
                ? "Complete!"
                : running
                ? "Focusing…"
                : remaining < totalSec
                ? "Paused"
                : "Ready when you are"}
            </span>
          </div>

          {/* Reduced-motion fallback text (sr-only) */}
          <span className="sr-only" aria-live="polite">
            {finished
              ? `Focus session complete. You focused for ${durationMin} minutes.`
              : running
              ? `${mm} minutes ${ss} seconds remaining.`
              : `Timer set to ${durationMin} minutes.`}
          </span>

          {/* Celebratory halo on completion */}
          {finished && !reduced && (
            <MotionDiv
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: [0.7, 1.15, 1.0], opacity: [0, 0.8, 0] }}
              transition={{ duration: 1.8, ease: "easeOut" }}
            >
              <div className="w-[220px] h-[220px] rounded-full bg-amber-glow/30 blur-2xl" />
            </MotionDiv>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-3">
        {!running ? (
          <Button
            onClick={start}
            size="lg"
            className="rounded-full px-8"
            aria-label={finished ? "Restart focus timer" : remaining < totalSec ? "Resume focus timer" : "Start focus timer"}
          >
            <Play className="size-4" aria-hidden />
            {finished ? "Restart" : remaining < totalSec ? "Resume" : "Start"}
          </Button>
        ) : (
          <Button
            onClick={pause}
            size="lg"
            variant="outline"
            className="rounded-full px-8"
            aria-label="Pause focus timer"
          >
            <Pause className="size-4" aria-hidden /> Pause
          </Button>
        )}
        <Button
          onClick={reset}
          size="lg"
          variant="ghost"
          className="rounded-full"
          aria-label="Reset focus timer"
        >
          <RotateCcw className="size-4" aria-hidden /> Reset
        </Button>
      </div>

      {/* Eye break suggestion after completion */}
      {finished && (
        <div className="mt-5 p-3 rounded-xl bg-amber-glow/10 border border-amber-glow/25 text-sm flex items-start gap-2">
          <Eye
            className="size-4 text-amber-glow-foreground mt-0.5 shrink-0"
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-medium">Eyes feeling tired?</p>
            <p className="text-muted-foreground">
              Try the 20-20-20: look 20 feet away for 20 seconds.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 rounded-full"
              onClick={handleEyeBreak}
            >
              Log eye break
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
