"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Flame, X, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHealth } from "@/store/health";
import { useGrowth } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { useApp } from "@/store/app";

const MILESTONES = [1, 3, 7, 14, 30];

const MILESTONE_MESSAGES: Record<number, { title: string; desc: string }> = {
  1: {
    title: "Day one. You showed up. 💚",
    desc: "That's the hardest part — starting. Your forest just gained its first root.",
  },
  3: {
    title: "Three days of showing up",
    desc: "A pattern is forming. Your companion notices, and so should you.",
  },
  7: {
    title: "A full week. That's real. 🌱",
    desc: "Seven gentle days. Consistency isn't about perfection — it's this.",
  },
  14: {
    title: "Two weeks of care",
    desc: "Look how far tiny steps carry you. Your future self is grateful.",
  },
  30: {
    title: "Thirty days. You built something. 🌳",
    desc: "This is who you are now — someone who shows up. Celebrate that.",
  },
};

export function StreakCelebration() {
  const streak = useHealth((s) => s.streak());
  const addAchievement = useGrowth((s) => s.addAchievement);
  const addMemory = useTwin((s) => s.addMemory);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const profile = useApp((s) => s.profile);

  const reduced = useReducedMotion();
  const [show, setShow] = useState(false);
  const [shownStreak, setShownStreak] = useState<number | null>(null);
  const celebratedRef = useRef<Set<number>>(new Set());

  // Check for milestone on mount + when streak changes.
  // Side-effects (twin/growth) fire once per milestone; the "show" state is
  // set via a microtask to avoid synchronous setState-in-effect cascades.
  useEffect(() => {
    if (!streak) return;
    if (celebratedRef.current.has(streak)) return;
    const isMilestone = MILESTONES.includes(streak);
    if (!isMilestone) return;
    if (typeof window === "undefined") return;
    const seenKey = `neurotwin-streak-seen-${streak}`;
    if (localStorage.getItem(seenKey)) {
      celebratedRef.current.add(streak);
      return;
    }

    // First time seeing this milestone — celebrate!
    celebratedRef.current.add(streak);
    localStorage.setItem(seenKey, "1");

    // Twin + growth tie-ins (fire-and-forget)
    addMemory({
      text: `You reached a ${streak}-day streak. That matters.`,
      kind: "celebration",
    });
    bumpTrait("confidence", 5, `Hit a ${streak}-day streak.`);
    addAchievement({
      title: `${streak}-Day Streak`,
      desc: `You showed up ${streak} days in a row. Gentle, consistent, real.`,
      icon: "flame",
    });

    // Show the celebration via microtask (decoupled from effect body)
    queueMicrotask(() => {
      setShownStreak(streak);
      setShow(true);
    });
  }, [streak, addMemory, bumpTrait, addAchievement]);

  const milestone = shownStreak ? MILESTONE_MESSAGES[shownStreak] : null;

  return (
    <AnimatePresence>
      {show && milestone && (
        <motion.div
          key="streak-celebration"
          initial={reduced ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Streak celebration"
          onClick={() => setShow(false)}
        >
          <motion.div
            initial={reduced ? false : { scale: 0.85, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="relative max-w-md w-full rounded-3xl border bg-card nt-shadow-soft overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Confetti / ambient particles */}
            {!reduced && (
              <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i / 12) * Math.PI * 2;
                  const colors = [
                    "oklch(0.74 0.12 155)",
                    "oklch(0.82 0.13 80)",
                    "oklch(0.78 0.08 15)",
                    "oklch(0.7 0.13 330)",
                  ];
                  return (
                    <motion.span
                      key={i}
                      className="absolute size-2 rounded-full"
                      style={{
                        background: colors[i % colors.length],
                        left: "50%",
                        top: "50%",
                      }}
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos(angle) * 140,
                        y: Math.sin(angle) * 140,
                        opacity: [0, 1, 0],
                        scale: [0, 1.5, 0.5],
                      }}
                      transition={{
                        duration: 1.8,
                        delay: 0.2 + i * 0.05,
                        repeat: Infinity,
                        repeatDelay: 1.5,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {/* Glow background */}
            <div
              className="absolute inset-0 nt-gradient-amber opacity-40"
              aria-hidden
            />

            <div className="relative p-8 text-center">
              {/* Flame icon with glow */}
              <div className="relative mx-auto mb-4 size-20">
                {!reduced && (
                  <div className="absolute inset-0 rounded-full bg-amber-glow/40 blur-2xl nt-breathe" />
                )}
                <motion.div
                  initial={reduced ? false : { scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
                  className="relative size-20 rounded-full bg-gradient-to-br from-amber-glow to-rose-soft flex items-center justify-center"
                >
                  <Flame className="size-10 text-white" />
                </motion.div>
              </div>

              {/* Streak number */}
              <motion.p
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-5xl font-bold tabular-nums bg-gradient-to-r from-amber-glow-foreground to-rose-soft-foreground bg-clip-text text-transparent"
              >
                {shownStreak}
              </motion.p>
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mt-1">
                day streak
              </p>

              {/* Message */}
              <motion.div
                initial={reduced ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-5"
              >
                <h2 className="text-xl font-semibold leading-tight">
                  {milestone.title}
                </h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {milestone.desc}
                </p>
                {profile.name && (
                  <p className="text-xs text-muted-foreground mt-3 italic">
                    — and {profile.name ? "you" : "you"} did it gently, your way.
                  </p>
                )}
              </motion.div>

              {/* Stats row */}
              <motion.div
                initial={reduced ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center justify-center gap-6"
              >
                <div className="text-center">
                  <TrendingUp className="size-4 text-primary mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Confidence</p>
                  <p className="text-sm font-semibold text-primary">+5</p>
                </div>
                <div className="h-8 w-px bg-border" />
                <div className="text-center">
                  <Sparkles className="size-4 text-amber-glow-foreground mx-auto mb-1" />
                  <p className="text-xs text-muted-foreground">Achievement</p>
                  <p className="text-sm font-semibold text-amber-glow-foreground">
                    Earned
                  </p>
                </div>
              </motion.div>

              {/* Dismiss */}
              <Button
                onClick={() => setShow(false)}
                className="mt-7 w-full rounded-full gap-1.5"
                size="lg"
              >
                <Sparkles className="size-4" /> Thank you — keep going
              </Button>

              <button
                onClick={() => setShow(false)}
                className="absolute top-3 right-3 size-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground"
                aria-label="Close celebration"
              >
                <X className="size-4" />
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
