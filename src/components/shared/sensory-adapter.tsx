"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Check,
  X,
  Lightbulb,
  Accessibility,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/store/app";
import { useAccessibility } from "@/store/accessibility";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

interface Suggestion {
  id: string;
  setting: "motion" | "contrast" | "calm" | "font";
  value: any;
  label: string;
  reason: string;
  apply: () => void;
  check: () => boolean;
}

export function SensoryAdapter() {
  const profile = useApp((s) => s.profile);
  const a11y = useAccessibility();
  const { toast } = useToast();
  const reduced = useReducedMotion();
  const [dismissed, setDismissed] = useState(false);

  // Parse sensory selections from profile.sensoryNotes (pipe-delimited keys)
  const sensoryKeys = useMemo(() => {
    const raw = profile.sensoryNotes || "";
    return raw.split("|").filter((k) => k && !k.includes(" ") && k.length < 30);
  }, [profile.sensoryNotes]);

  // Build suggestions based on sensory profile
  const suggestions = useMemo<Suggestion[]>(() => {
    const list: Suggestion[] = [];

    if (sensoryKeys.includes("bright-lights")) {
      list.push({
        id: "calm-bright",
        setting: "calm",
        value: true,
        label: "Calm mode",
        reason: "You mentioned bright lights bother you — calm mode softens colors and reduces visual intensity.",
        apply: () => a11y.setCalm(true),
        check: () => a11y.calm === true,
      });
    }

    if (sensoryKeys.includes("changes") || sensoryKeys.includes("focusing")) {
      list.push({
        id: "motion-reduced",
        setting: "motion",
        value: "reduced",
        label: "Reduced motion",
        reason: "You noted sudden changes or distraction sensitivity — reduced motion minimizes animations that could overwhelm.",
        apply: () => a11y.setMotion("reduced"),
        check: () => a11y.motion === "reduced",
      });
    }

    if (sensoryKeys.includes("focusing") || sensoryKeys.includes("eye-contact")) {
      list.push({
        id: "contrast-high",
        setting: "contrast",
        value: "high",
        label: "High contrast",
        reason: "You find filtering distractions or focus challenging — high contrast makes things clearer and easier to distinguish.",
        apply: () => a11y.setContrast("high"),
        check: () => a11y.contrast === "high",
      });
    }

    return list;
  }, [sensoryKeys, a11y]);

  // Don't show if no suggestions, already dismissed, or all applied
  const pendingSuggestions = suggestions.filter((s) => !s.check());
  const shouldShow = pendingSuggestions.length > 0 && !dismissed && sensoryKeys.length > 0;

  const applyAll = () => {
    pendingSuggestions.forEach((s) => s.apply());
    toast({
      title: "Settings adapted to you 💚",
      description: `Applied ${pendingSuggestions.length} gentle adjustment${pendingSuggestions.length === 1 ? "" : "s"} based on what you shared.`,
    });
    setDismissed(true);
  };

  const applyOne = (s: Suggestion) => {
    s.apply();
    toast({
      title: `${s.label} on`,
      description: "You can change this anytime in the accessibility menu.",
    });
  };

  if (!shouldShow) return null;

  return (
    <AnimatePresence>
      <MotionDiv
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, height: 0 }}
      >
        <Card className="relative overflow-hidden border-primary/30 nt-gradient-sage nt-shadow-soft">
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="relative size-10 shrink-0">
                {!reduced && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-md nt-breathe" />
                )}
                <div className="relative size-10 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Wand2 className="size-5 text-primary" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold">
                    I can adapt to your sensory world
                  </h3>
                  <Badge variant="secondary" className="rounded-full text-[10px] gap-1 shrink-0">
                    <Sparkles className="size-3" /> Explainable AI
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on what you shared, here are settings that might feel
                  gentler. Take what serves you — skip the rest.
                </p>
              </div>
              <button
                onClick={() => setDismissed(true)}
                className="size-7 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground shrink-0"
                aria-label="Dismiss suggestions"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {pendingSuggestions.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={reduced ? false : { opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border/50 bg-card/70 p-3.5"
                >
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{s.label}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-1.5">
                        <Lightbulb className="size-3 text-amber-glow-foreground shrink-0 mt-0.5" />
                        {s.reason}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => applyOne(s)}
                      className="rounded-full gap-1.5 shrink-0 text-xs h-7"
                    >
                      <Check className="size-3" /> Apply
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={applyAll}
                className="flex-1 gap-1.5 rounded-full"
                size="sm"
              >
                <Sparkles className="size-3.5" /> Apply all {pendingSuggestions.length} suggestions
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDismissed(true)}
                className="rounded-full"
              >
                Not now
              </Button>
            </div>
          </div>
        </Card>
      </MotionDiv>
    </AnimatePresence>
  );
}
