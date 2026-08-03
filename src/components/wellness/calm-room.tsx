"use client";

import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X, Heart, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWellness } from "@/store/wellness";
import { useAccessibility } from "@/store/accessibility";
import { useTwin } from "@/store/twin";

interface CalmRoomProps {
  onClose: () => void;
}

/**
 * Full-screen calm overlay. Mount/unmount is controlled by the parent
 * (via AnimatePresence). On mount, it softly enables global calm mode and
 * tells the Twin that the learner took a moment for themselves. On unmount,
 * those are reset.
 */
export function CalmRoom({ onClose }: CalmRoomProps) {
  const setCalmRoom = useWellness((s) => s.setCalmRoom);
  const setCalm = useAccessibility((s) => s.setCalm);
  const addMemory = useTwin((s) => s.addMemory);
  const reduced = useReducedMotion();

  // Mount: enable calm mode + record twin memory.
  // Unmount: reset calm mode.
  // (These are Zustand store actions, not React state setters — safe in effects.)
  useEffect(() => {
    setCalmRoom(true);
    setCalm(true);
    addMemory({ text: "You visited the Calm Room.", kind: "observation" });
    return () => {
      setCalmRoom(false);
      setCalm(false);
    };
  }, [setCalmRoom, setCalm, addMemory]);

  // ESC closes; lock body scroll while mounted.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Calm Room"
      aria-describedby="calm-room-msg"
      className="fixed inset-0 z-[100] overflow-hidden"
    >
      {/* Aurora background — slow, calming */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 120% at 20% 20%, oklch(0.78 0.08 15 / 0.45), transparent 50%)," +
            "radial-gradient(120% 120% at 80% 30%, oklch(0.7 0.1 155 / 0.40), transparent 55%)," +
            "radial-gradient(120% 120% at 50% 90%, oklch(0.6 0.12 330 / 0.35), transparent 55%)," +
            "radial-gradient(120% 120% at 10% 80%, oklch(0.82 0.13 80 / 0.30), transparent 55%)",
        }}
      />
      <div className="absolute inset-0 bg-background/20 backdrop-blur-sm" />

      {/* Floating orbs (only when motion allowed) */}
      {!reduced && (
        <>
          <motion.div
            aria-hidden
            className="absolute size-72 rounded-full bg-rose-soft/30 blur-3xl"
            initial={{ x: "-10vw", y: "20vh" }}
            animate={{
              x: ["-10vw", "60vw", "20vw", "-10vw"],
              y: ["20vh", "10vh", "70vh", "20vh"],
              scale: [1, 1.2, 0.9, 1],
            }}
            transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute size-80 rounded-full bg-primary/25 blur-3xl"
            initial={{ x: "70vw", y: "60vh" }}
            animate={{
              x: ["70vw", "10vw", "50vw", "70vw"],
              y: ["60vh", "30vh", "80vh", "60vh"],
              scale: [1, 0.85, 1.15, 1],
            }}
            transition={{ duration: 36, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="absolute size-64 rounded-full bg-amber-glow/20 blur-3xl"
            initial={{ x: "30vw", y: "10vh" }}
            animate={{
              x: ["30vw", "70vw", "20vw", "30vw"],
              y: ["10vh", "70vh", "30vh", "10vh"],
            }}
            transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      )}

      {/* Center content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-md"
        >
          <div className="size-16 mx-auto rounded-full bg-card/40 backdrop-blur flex items-center justify-center mb-6 nt-breathe">
            <Heart className="size-7 text-rose-soft" />
          </div>

          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-foreground mb-3">
            You're safe here.
          </h2>

          <p
            id="calm-room-msg"
            className="text-base sm:text-lg text-foreground/80 leading-relaxed mb-8"
          >
            Nothing is asked of you. Nothing is graded. Take all the time you
            need — your breath is enough.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={onClose}
              size="lg"
              className="rounded-full h-12 px-6 bg-card/80 text-foreground hover:bg-card backdrop-blur border border-border/40"
            >
              <X className="size-4" /> When I'm ready
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-8 flex items-center justify-center gap-1.5">
            <TreePine className="size-3" />
            Press Esc anytime to leave.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
