"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Heart, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuroTwinLogo } from "./logo";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";

const IDLE_THRESHOLD = 120000; // 2 minutes
const CHECK_INTERVAL = 15000; // check every 15s
const DISMISS_KEY = "neurotwin-idle-checkin-dismissed";

const CHECKIN_MESSAGES = [
  "Been a moment — how are you doing? I'm here if you need anything.",
  "You've been quiet. That's okay. Want to pick up where you left off, or rest?",
  "Checking in gently. No pressure — I'm right here whenever you're ready.",
  "Hi again. Want to try a tiny next step, or just breathe for a moment?",
];

export function IdleCheckIn() {
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const lastActivityRef = useRef<number>(Date.now());
  const shownRef = useRef(false);
  const reduced = useReducedMotion();
  const setCompanionOpen = useApp((s) => s.setCompanionOpen);
  const companionName = useApp((s) => s.companionName);
  const addMemory = useTwin((s) => s.addMemory);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (shownRef.current) {
      setShow(false);
      shownRef.current = false;
    }
  }, []);

  // Track user activity
  useEffect(() => {
    if (typeof window === "undefined") return;

    const events = ["mousedown", "keydown", "touchstart", "scroll"];

    const onActivity = () => {
      lastActivityRef.current = Date.now();
      if (shownRef.current) {
        setShow(false);
        shownRef.current = false;
      }
    };

    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
    };
  }, []);

  // Check for idle
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Don't show if already dismissed this session
    if (sessionStorage.getItem(DISMISS_KEY)) return;

    const interval = setInterval(() => {
      const idle = Date.now() - lastActivityRef.current;
      if (idle >= IDLE_THRESHOLD && !shownRef.current) {
        const msg = CHECKIN_MESSAGES[Math.floor(Math.random() * CHECKIN_MESSAGES.length)];
        setMessage(msg);
        setShow(true);
        shownRef.current = true;
        addMemory({
          text: "I gently checked in after a quiet moment.",
          kind: "observation",
        });
      }
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [addMemory]);

  const dismiss = useCallback(() => {
    setShow(false);
    shownRef.current = false;
    sessionStorage.setItem(DISMISS_KEY, "1");
  }, []);

  const openCompanion = useCallback(() => {
    setShow(false);
    shownRef.current = false;
    setCompanionOpen(true);
  }, [setCompanionOpen]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="idle-checkin"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="fixed bottom-24 right-5 z-40 max-w-xs"
          role="dialog"
          aria-label={`${companionName} checking in`}
        >
          <div className="relative rounded-2xl border bg-card nt-shadow-soft overflow-hidden">
            {/* Gradient accent */}
            <div className="absolute inset-0 nt-gradient-sage opacity-30" aria-hidden />

            <div className="relative p-4">
              <div className="flex items-start gap-3">
                <div className="relative size-10 shrink-0">
                  {!reduced && (
                    <div className="absolute inset-0 rounded-full bg-primary/20 blur-md nt-breathe" />
                  )}
                  <div className="relative size-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <NeuroTwinLogo size={24} />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="text-xs font-semibold">{companionName}</p>
                    <Sparkles className="size-3 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {message}
                  </p>
                </div>
                <button
                  onClick={dismiss}
                  className="size-6 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground shrink-0"
                  aria-label="Dismiss check-in"
                >
                  <X className="size-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <Button
                  size="sm"
                  onClick={openCompanion}
                  className="h-7 rounded-full text-xs gap-1.5 flex-1"
                >
                  <Heart className="size-3" /> Talk to me
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={dismiss}
                  className="h-7 rounded-full text-xs"
                >
                  I'm okay
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
