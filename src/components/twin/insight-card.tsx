"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, Quote, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAccessibility } from "@/store/accessibility";
import { TwinOrb, type TwinMood } from "./twin-orb";
import { cn } from "@/lib/utils";

interface InsightCardProps {
  traits: Record<string, { label: string; value: number; evidence?: string[] }>;
  profile: any;
  recentMoods: { mood: string; energy: number }[];
  day: number;
  companionName: string;
  mood: TwinMood;
  onInsight?: (insight: string) => void;
}

export function InsightCard({
  traits,
  profile,
  recentMoods,
  day,
  companionName,
  mood,
  onInsight,
}: InsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  const ask = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/twin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traits, profile, recentMoods, day }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Twin is still thinking.");
      const text: string = data.reply?.trim() || "I'm here, gently listening.";
      setInsight(text);
      onInsight?.(text);
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Ask button */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          onClick={ask}
          disabled={loading}
          size="lg"
          className="rounded-full gap-2 nt-shadow-soft"
          aria-label="Ask my Twin what it noticed about me"
        >
          {loading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Sparkles className="size-4" />
          )}
          {loading ? "Thinking with care…" : "Ask my Twin what it noticed"}
        </Button>
        {insight && !loading && (
          <Button
            onClick={ask}
            variant="ghost"
            size="sm"
            className="rounded-full gap-1.5 text-muted-foreground"
            aria-label="Ask for a fresh insight"
          >
            <RefreshCw className="size-3.5" />
            Ask again
          </Button>
        )}
      </div>

      {/* Result area */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            className="rounded-2xl border bg-card nt-shadow-soft p-5 sm:p-6"
          >
            <div className="flex items-center gap-4">
              <TwinOrb mood={mood} size={88} ambient={false} />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 rounded-full bg-muted nt-shimmer" />
                <div className="h-3 w-full rounded-full bg-muted nt-shimmer" />
                <div className="h-3 w-5/6 rounded-full bg-muted nt-shimmer" />
                <p className="text-xs text-muted-foreground pt-1 flex items-center gap-1.5">
                  <span className="inline-block size-1.5 rounded-full bg-primary nt-breathe" />
                  {companionName} is reflecting on what you've shared…
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && error && (
          <motion.div
            key="error"
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            className="rounded-2xl border bg-card nt-shadow-soft p-5"
            role="alert"
          >
            <p className="text-sm text-foreground/90 leading-relaxed">
              I had trouble gathering my thoughts just then. No rush — try
              again when you're ready.
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">{error}</p>
          </motion.div>
        )}

        {!loading && !error && insight && (
          <motion.div
            key="insight"
            initial={reduced ? false : { opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative rounded-2xl border nt-gradient-plum nt-shadow-soft p-5 sm:p-6 overflow-hidden"
            aria-live="polite"
          >
            <Quote
              className="absolute top-4 right-4 size-10 text-primary/15"
              aria-hidden
            />
            <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-5">
              <div className="shrink-0 mx-auto sm:mx-0">
                <TwinOrb mood={mood} size={96} ambient />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-primary">
                    Fresh insight from {companionName}
                  </span>
                </div>
                <p className="text-base sm:text-lg leading-relaxed text-foreground font-medium">
                  {insight}
                </p>
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <ShieldCheck className="size-3.5" />
                  <span>
                    Saved to your timeline below. Grounded only in what you've
                    shared — never a diagnosis.
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && !insight && (
          <motion.div
            key="hint"
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-dashed bg-muted/30 p-5 text-center"
          >
            <p className="text-sm text-muted-foreground leading-relaxed">
              Tap the button above and I'll share one fresh thing I've noticed —
              in plain language, with the why.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
