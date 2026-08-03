"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Check, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useHealth } from "@/store/health";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

const isSameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export function StreakTimeline() {
  const logs = useHealth((s) => s.logs);
  const reduced = useReducedMotion();

  // Build last 14 days
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: { date: Date; hasActivity: boolean; count: number; isToday: boolean }[] = [];

    for (let i = 13; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(day.getDate() - i);
      const dayLogs = logs.filter((l) => isSameDay(l.createdAt, day.getTime()));
      result.push({
        date: day,
        hasActivity: dayLogs.length > 0,
        count: dayLogs.length,
        isToday: i === 0,
      });
    }
    return result;
  }, [logs]);

  const activeDays = days.filter((d) => d.hasActivity).length;
  const currentStreak = (() => {
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].hasActivity) streak++;
      else if (i === days.length - 1) continue; // today not yet active is okay
      else break;
    }
    return streak;
  })();

  return (
    <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
      <Card className="p-5 sm:p-6 nt-gradient-amber border-amber-glow/30 nt-shadow-soft">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="relative size-9">
              {!reduced && (
                <div className="absolute inset-0 rounded-full bg-amber-glow/30 blur-md nt-breathe" />
              )}
              <div className="relative size-9 rounded-xl bg-amber-glow/20 flex items-center justify-center">
                <Flame className="size-5 text-amber-glow-foreground" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                Consistency Journey
              </h3>
              <p className="text-xs text-muted-foreground">
                Last 14 days · gentle, never punishing
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="rounded-full bg-amber-glow/20 text-amber-glow-foreground border-amber-glow/30 gap-1">
              <Flame className="size-3" /> {currentStreak} day{currentStreak === 1 ? "" : "s"}
            </Badge>
            <Badge variant="secondary" className="rounded-full">
              {activeDays}/14 active
            </Badge>
          </div>
        </div>

        {/* Day dots timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-muted rounded-full" aria-hidden />
          <motion.div
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-amber-glow to-rose-soft rounded-full"
            initial={reduced ? false : { width: 0 }}
            animate={{
              width: `${(activeDays / 14) * 100}%`,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          />

          {/* Day markers */}
          <div className="relative grid grid-cols-14 gap-0.5" style={{ gridTemplateColumns: "repeat(14, 1fr)" }}>
            {days.map((day, i) => {
              const dayLabel = day.date.toLocaleDateString(undefined, { weekday: "short" })[0];
              const dateNum = day.date.getDate();
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5"
                >
                  <motion.div
                    initial={reduced ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.04, type: "spring", stiffness: 200 }}
                    className={cn(
                      "relative size-8 rounded-full flex items-center justify-center border-2 transition-all z-10",
                      day.hasActivity
                        ? "bg-amber-glow border-amber-glow text-white nt-shadow-soft"
                        : "bg-card border-muted text-muted-foreground",
                      day.isToday && "ring-2 ring-primary ring-offset-2 ring-offset-card"
                    )}
                    title={`${day.date.toLocaleDateString()} — ${day.count} care action${day.count === 1 ? "" : "s"}`}
                  >
                    {day.hasActivity ? (
                      <Check className="size-4" />
                    ) : (
                      <Circle className="size-3" />
                    )}
                    {day.hasActivity && day.count >= 3 && !reduced && (
                      <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-rose-soft nt-twinkle" />
                    )}
                  </motion.div>
                  <span className={cn(
                    "text-[9px] tabular-nums",
                    day.isToday ? "font-bold text-primary" : "text-muted-foreground"
                  )}>
                    {dateNum}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Encouraging message */}
        <div className="mt-5 rounded-xl bg-card/70 border border-border/40 p-3">
          <p className="text-xs text-muted-foreground leading-relaxed text-center">
            {currentStreak === 0 && activeDays === 0 && (
              <>Your journey begins with one small step. Log one care today. 🌱</>
            )}
            {currentStreak === 0 && activeDays > 0 && (
              <>You&apos;ve shown up {activeDays} time{activeDays === 1 ? "" : "s"} recently. Today is a fresh start.</>
            )}
            {currentStreak > 0 && currentStreak < 3 && (
              <>{currentStreak} day{currentStreak === 1 ? "" : "s"} of showing up. A pattern is forming. 💚</>
            )}
            {currentStreak >= 3 && currentStreak < 7 && (
              <>{currentStreak} days strong. This is who you are now — someone who shows up.</>
            )}
            {currentStreak >= 7 && (
              <>{currentStreak} days. That&apos;s real consistency. Your future self is grateful. 🌳</>
            )}
          </p>
        </div>
      </Card>
    </MotionDiv>
  );
}
