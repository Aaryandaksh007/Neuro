"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Timer as TimerIcon,
  Play,
  Pause,
  Square,
  Check,
  ChevronRight,
  Sparkles,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useStudy, type StudyItem } from "@/store/study";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

const DURATIONS = [5, 10, 15, 20];

export function FocusedReview() {
  const items = useStudy((s) => s.items);
  const reviewItem = useStudy((s) => s.reviewItem);
  const twin = useTwin();
  const addSession = useGrowth((s) => s.addSession);
  const bumpPersistence = useGrowth((s) => s.bumpPersistence);
  const { toast } = useToast();
  const reduced = useReducedMotion();

  // Due today items for review
  const dueToday = items
    .filter((i) => i.nextReview <= Date.now())
    .sort((a, b) => a.nextReview - b.nextReview);

  const [active, setActive] = useState(false);
  const [paused, setPaused] = useState(false);
  const [duration, setDuration] = useState(10); // minutes
  const [remaining, setRemaining] = useState(duration * 60);
  const [queue, setQueue] = useState<StudyItem[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completed, setCompleted] = useState<string[]>([]);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    setActive(false);
    setPaused(false);
    setQueue([]);
    setCurrentIdx(0);
    setCompleted([]);
    setRemaining(duration * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [duration]);

  const finish = useCallback(() => {
    const mins = duration;
    addSession({ minutes: mins, flow: 75 });
    twin.bumpTrait("focusWindow", 4, `Completed a ${mins}-min focused review.`);
    twin.bumpTrait("retention", 3, "Revisited topics in a focused session.");
    bumpPersistence(4);
    twin.addMemory({
      text: `You finished a ${mins}-minute focused review of ${completed.length + 1} topic${completed.length === 0 ? "" : "s"}.`,
      kind: "celebration",
    });
    toast({
      title: "Focused review complete 💚",
      description: `That's ${mins} gentle minutes of revisiting. Nice work.`,
    });
    stop();
  }, [duration, completed.length, addSession, twin, bumpPersistence, toast, stop]);

  useEffect(() => {
    if (!active || paused) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          queueMicrotask(() => finish());
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [active, paused, finish]);

  const start = useCallback(() => {
    if (dueToday.length === 0) return;
    setQueue(dueToday);
    setCurrentIdx(0);
    setCompleted([]);
    setRemaining(duration * 60);
    setActive(true);
    setPaused(false);
    twin.setCompanionMood("attentive");
  }, [dueToday, duration, twin]);

  const togglePause = () => setPaused((p) => !p);

  const markCurrentDone = (confidence: number = 60) => {
    const current = queue[currentIdx];
    if (!current) return;
    reviewItem(current.id, confidence);
    setCompleted((c) => [...c, current.id]);
    if (currentIdx + 1 < queue.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      finish();
    }
  };

  const skipCurrent = () => {
    if (currentIdx + 1 < queue.length) {
      setCurrentIdx((i) => i + 1);
    } else {
      finish();
    }
  };

  const progress = duration > 0 ? ((duration * 60 - remaining) / (duration * 60)) * 100 : 0;
  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const current = queue[currentIdx];

  // Not active — show setup
  if (!active) {
    return (
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <Card className="p-5 nt-gradient-amber border-border/60 nt-shadow-soft">
          <div className="flex items-center gap-2 mb-3">
            <TimerIcon className="size-4 text-amber-glow-foreground" aria-hidden />
            <h3 className="text-sm font-semibold">Focused Review Session</h3>
            {dueToday.length > 0 && (
              <Badge className="rounded-full bg-amber-glow/15 text-amber-glow-foreground hover:bg-amber-glow/15 ml-auto">
                {dueToday.length} due
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Pick a duration, and I&apos;ll guide you through your due topics one
            at a time — with a gentle timer, no pressure.
          </p>

          {dueToday.length === 0 ? (
            <div className="rounded-xl bg-card/60 border border-border/50 p-4 text-center">
              <p className="text-sm text-muted-foreground">
                Nothing&apos;s due right now. You&apos;re all caught up. 🌱
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Session length
                  </p>
                  <span className="text-sm font-semibold text-amber-glow-foreground tabular-nums">
                    {duration} min
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {DURATIONS.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      aria-pressed={duration === d}
                      className={cn(
                        "flex-1 rounded-lg border py-2 text-sm font-medium transition-all",
                        duration === d
                          ? "border-amber-glow bg-amber-glow/15 text-amber-glow-foreground"
                          : "hover:bg-accent"
                      )}
                    >
                      {d}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-card/60 border border-border/50 p-3 mb-4">
                <p className="text-xs text-muted-foreground mb-1.5">
                  You&apos;ll revisit:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {dueToday.slice(0, 4).map((item) => (
                    <Badge
                      key={item.id}
                      variant="secondary"
                      className="rounded-full text-[11px] truncate max-w-[140px]"
                    >
                      {item.topic}
                    </Badge>
                  ))}
                  {dueToday.length > 4 && (
                    <Badge variant="secondary" className="rounded-full text-[11px]">
                      +{dueToday.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>

              <Button
                onClick={start}
                className="w-full gap-1.5 rounded-full bg-amber-glow text-amber-glow-foreground hover:bg-amber-glow/90"
              >
                <Play className="size-4" /> Start focused review
              </Button>
            </>
          )}
        </Card>
      </MotionDiv>
    );
  }

  // Active session
  return (
    <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
      <Card className="p-5 nt-gradient-amber border-amber-glow/40 nt-shadow-soft">
        {/* Timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TimerIcon className="size-4 text-amber-glow-foreground" aria-hidden />
            <h3 className="text-sm font-semibold">Focused Review</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="rounded-full text-[10px]">
              {currentIdx + 1} / {queue.length}
            </Badge>
            <Badge variant="secondary" className="rounded-full text-[10px] gap-1">
              <Check className="size-3" /> {completed.length} done
            </Badge>
          </div>
        </div>

        {/* Big timer */}
        <div className="relative mx-auto size-40 mb-4">
          <svg className="size-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="oklch(0.9 0.02 80 / 0.3)"
              strokeWidth="6"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="oklch(0.82 0.13 80)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 45}`}
              animate={{
                strokeDashoffset: 2 * Math.PI * 45 * (1 - progress / 100),
              }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold tabular-nums text-amber-glow-foreground">
              {mins}:{secs.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {paused ? "paused" : "remaining"}
            </span>
          </div>
        </div>

        {/* Current topic */}
        {current && (
          <div className="rounded-xl bg-card/70 border border-border/50 p-4 mb-4">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              Revisiting now
            </p>
            <p className="text-sm font-medium leading-snug">{current.topic}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Last reviewed{" "}
              {current.lastReviewed ? relativeTimeShort(current.lastReviewed) : "never"} ·{" "}
              {current.reviewCount}× before
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-2">
          <Button
            onClick={togglePause}
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full flex-1"
          >
            {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
            {paused ? "Resume" : "Pause"}
          </Button>
          <Button
            onClick={() => markCurrentDone(70)}
            size="sm"
            className="gap-1.5 rounded-full flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Check className="size-3.5" /> Got it
          </Button>
          <Button
            onClick={skipCurrent}
            variant="ghost"
            size="sm"
            className="gap-1.5 rounded-full"
          >
            Skip <ChevronRight className="size-3.5" />
          </Button>
        </div>

        <Button
          onClick={stop}
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs text-muted-foreground gap-1.5"
        >
          <Square className="size-3" /> End session early
        </Button>

        {/* Confidence quick-pick on "Got it" */}
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          Tap &ldquo;Got it&rdquo; to mark this topic revisited and move on.
        </p>
      </Card>
    </MotionDiv>
  );
}

function relativeTimeShort(ts: number): string {
  const diff = Date.now() - ts;
  const day = 86400000;
  const hour = 3600000;
  if (diff < hour) return `${Math.round(diff / 60000)}m ago`;
  if (diff < day) return `${Math.round(diff / hour)}h ago`;
  return `${Math.round(diff / day)}d ago`;
}
