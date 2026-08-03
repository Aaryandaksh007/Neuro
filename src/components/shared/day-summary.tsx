"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Moon,
  X,
  Loader2,
  Sparkles,
  RefreshCw,
  Heart,
  BookOpen,
  Droplets,
  Timer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useWellness } from "@/store/wellness";
import { useHealth } from "@/store/health";
import { useGrowth } from "@/store/growth";
import { useStudy } from "@/store/study";
import { useToast } from "@/hooks/use-toast";
import { useSessionId } from "@/components/shared/use-session-id";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const isToday = (ts: number) =>
  new Date(ts).toDateString() === new Date().toDateString();

export function DaySummary() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = useApp((s) => s.profile);
  const twin = useTwin();
  const sessionId = useSessionId();
  const { toast } = useToast();
  const reduced = useReducedMotion();

  // Gather today's data from all stores — select raw arrays, filter in useMemo
  const allMoods = useWellness((s) => s.moods);
  const allVictories = useWellness((s) => s.victories);
  const allGratitudes = useWellness((s) => s.gratitudes);
  const allLogs = useHealth((s) => s.logs);
  const allSessions = useGrowth((s) => s.sessions);
  const allStars = useGrowth((s) => s.stars);

  const moods = useMemo(() => allMoods.filter((m) => isToday(m.createdAt)), [allMoods]);
  const victories = useMemo(() => allVictories.filter((v) => isToday(v.createdAt)), [allVictories]);
  const gratitudes = useMemo(() => allGratitudes.filter((g) => isToday(g.createdAt)), [allGratitudes]);
  const healthLogs = useMemo(() => allLogs.filter((l) => isToday(l.createdAt)), [allLogs]);
  const sessions = useMemo(() => allSessions.filter((s) => isToday(s.createdAt)), [allSessions]);
  const stars = useMemo(() => allStars.filter((s) => isToday(s.earnedAt)), [allStars]);

  const todayData = useMemo(
    () => ({
      lessons: stars.map((s) => s.concept),
      moods: moods.map((m) => ({ mood: m.mood, energy: m.energy })),
      victories: victories.map((v) => v.text),
      gratitudes: gratitudes.map((g) => g.text),
      healthLogs: healthLogs.length,
      focusMinutes: sessions.reduce((a, s) => a + s.minutes, 0),
      reflections: 0,
    }),
    [stars, moods, victories, gratitudes, healthLogs, sessions]
  );

  const hasActivity =
    todayData.lessons.length > 0 ||
    todayData.moods.length > 0 ||
    todayData.victories.length > 0 ||
    todayData.healthLogs > 0 ||
    todayData.focusMinutes > 0;

  const generate = async () => {
    setOpen(true);
    if (summary) return; // already have it
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          profile,
          twin: { traits: twin.traits },
          today: todayData,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSummary(data.reply);
      twin.bumpTrait("confidence", 3, "Reflected on your day.");
      twin.addMemory({
        text: "You paused to reflect on your day. That matters.",
        kind: "observation",
      });
      toast({
        title: "Your day, gathered gently",
        description: "Take what serves you from this.",
      });
    } catch (e: any) {
      setError(e?.message || "Couldn't gather your day.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSummary(null);
    setError(null);
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <Card className="relative overflow-hidden border-border/60 nt-shadow-soft nt-gradient-plum">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <div className="relative size-12 shrink-0">
                {!reduced && (
                  <div className="absolute inset-0 rounded-full bg-plum/30 blur-lg nt-breathe" />
                )}
                <div className="relative size-12 rounded-2xl bg-plum/15 flex items-center justify-center">
                  <Moon className="size-6 text-plum" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base font-semibold leading-tight">
                  How was your day?
                </h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                  Let me gather everything you did today into a gentle
                  reflection. No grades — just a kind look back.
                </p>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {todayData.lessons.length > 0 && (
                    <Badge variant="secondary" className="rounded-full text-[10px] gap-1">
                      <BookOpen className="size-3" /> {todayData.lessons.length} lesson{todayData.lessons.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {todayData.moods.length > 0 && (
                    <Badge variant="secondary" className="rounded-full text-[10px] gap-1">
                      <Heart className="size-3" /> {todayData.moods.length} check-in{todayData.moods.length === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {todayData.healthLogs > 0 && (
                    <Badge variant="secondary" className="rounded-full text-[10px] gap-1">
                      <Droplets className="size-3" /> {todayData.healthLogs} care log{todayData.healthLogs === 1 ? "" : "s"}
                    </Badge>
                  )}
                  {todayData.focusMinutes > 0 && (
                    <Badge variant="secondary" className="rounded-full text-[10px] gap-1">
                      <Timer className="size-3" /> {todayData.focusMinutes} min focus
                    </Badge>
                  )}
                  {!hasActivity && (
                    <Badge variant="secondary" className="rounded-full text-[10px]">
                      A fresh start
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={generate}
              className="mt-4 w-full gap-1.5 rounded-full bg-plum text-plum-foreground hover:bg-plum/90"
            >
              <Sparkles className="size-4" /> Gather my day
            </Button>
          </div>
        </Card>
      </MotionDiv>

      {/* Summary overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="End of day summary"
            onClick={reset}
          >
            <motion.div
              initial={reduced ? false : { scale: 0.92, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative max-w-lg w-full max-h-[85vh] overflow-y-auto rounded-3xl border bg-card nt-shadow-soft"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-card/95 backdrop-blur">
                <div className="flex items-center gap-2.5">
                  <div className="relative size-9">
                    {!reduced && (
                      <div className="absolute inset-0 rounded-full bg-plum/30 blur-md nt-breathe" />
                    )}
                    <div className="relative size-9 rounded-xl bg-plum/15 flex items-center justify-center">
                      <Moon className="size-5 text-plum" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-base font-semibold leading-tight">
                      Your day, gently
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {new Date().toLocaleDateString(undefined, {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={reset}
                  className="size-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground"
                  aria-label="Close summary"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                {loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Gathering your day…
                    </div>
                    <div className="space-y-2.5">
                      <div className="nt-shimmer h-4 rounded-md w-3/4" />
                      <div className="nt-shimmer h-3 rounded-md w-full" />
                      <div className="nt-shimmer h-3 rounded-md w-11/12" />
                      <div className="nt-shimmer h-3 rounded-md w-4/5" />
                      <div className="h-3" />
                      <div className="nt-shimmer h-4 rounded-md w-1/2" />
                      <div className="nt-shimmer h-3 rounded-md w-full" />
                      <div className="h-3" />
                      <div className="nt-shimmer h-4 rounded-md w-2/3" />
                      <div className="nt-shimmer h-3 rounded-md w-full" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-6">
                    <p className="text-sm text-rose-soft-foreground">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-full gap-1.5"
                      onClick={() => {
                        setError(null);
                        setSummary(null);
                        generate();
                      }}
                    >
                      <RefreshCw className="size-3.5" /> Try again
                    </Button>
                  </div>
                )}

                {summary && !loading && (
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="prose prose-sm max-w-none"
                  >
                    <div className="space-y-1 text-[15px] leading-relaxed text-foreground">
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...p }) => (
                            <p className="leading-relaxed my-2" {...p} />
                          ),
                          strong: ({ node, ...p }) => (
                            <strong className="font-semibold text-foreground" {...p} />
                          ),
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                    </div>

                    {/* Activity recap */}
                    <div className="mt-6 pt-5 border-t border-border/50">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                        What you did today
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <RecapItem
                          icon={BookOpen}
                          label="Lessons"
                          value={todayData.lessons.length}
                          accent="text-primary"
                        />
                        <RecapItem
                          icon={Heart}
                          label="Mood check-ins"
                          value={todayData.moods.length}
                          accent="text-rose-soft"
                        />
                        <RecapItem
                          icon={Droplets}
                          label="Care logs"
                          value={todayData.healthLogs}
                          accent="text-amber-glow-foreground"
                        />
                        <RecapItem
                          icon={Timer}
                          label="Focus minutes"
                          value={todayData.focusMinutes}
                          accent="text-plum"
                        />
                      </div>
                    </div>

                    <Button
                      onClick={reset}
                      className="mt-6 w-full rounded-full gap-1.5"
                    >
                      <Sparkles className="size-4" /> Rest well
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function RecapItem({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
      <Icon className={cn("size-4 mb-1.5", accent)} aria-hidden />
      <p className="text-lg font-bold tabular-nums leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
