"use client";

import { useState, useEffect } from "react";
import { Thermometer, Wind, HeartPulse, Sparkles } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

interface StressThermometerProps {
  onOpenCalmRoom?: () => void;
  onOpenBreathing?: () => void;
}

interface LevelDef {
  label: string;
  blurb: string;
  color: string;
  fill: string;
  suggestion?: "calm" | "breathing";
}

function describe(value: number): LevelDef {
  if (value < 25)
    return {
      label: "Light",
      blurb: "Most things feel manageable right now. A good window.",
      color: "text-primary",
      fill: "from-primary/60 to-primary",
    };
  if (value < 50)
    return {
      label: "Some weight",
      blurb: "A bit on your plate. Pace yourself; small steps help.",
      color: "text-amber-glow-foreground",
      fill: "from-amber-glow/60 to-amber-glow",
    };
  if (value < 75)
    return {
      label: "Heavy",
      blurb: "A lot is being carried. The breathing companion could help.",
      color: "text-rose-soft",
      fill: "from-rose-soft/60 to-rose-soft",
      suggestion: "breathing",
    };
  return {
    label: "Very heavy",
    blurb: "This is a lot. The Calm Room is open whenever you want it.",
    color: "text-plum",
    fill: "from-plum/60 to-plum",
    suggestion: "calm",
  };
}

export function StressThermometer({
  onOpenCalmRoom,
  onOpenBreathing,
}: StressThermometerProps) {
  // Local-only state — purely reflective, never stored to avoid pathologizing.
  const [value, setValue] = useState(30);
  const level = describe(value);

  // Gently remind on very high values (after a moment, only once per peak)
  useEffect(() => {
    // no-op — purely reflective. We don't auto-trigger anything.
  }, [value]);

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-plum p-5 h-full"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="size-8 rounded-lg bg-plum/15 flex items-center justify-center">
          <Thermometer className="size-4 text-plum" />
        </span>
        <div>
          <h3 className="font-semibold leading-tight">Stress Thermometer</h3>
          <p className="text-xs text-muted-foreground">
            How much is on your plate right now?
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary" className={cn("rounded-full", level.color)}>
            {level.label}
          </Badge>
          <span className="text-sm font-medium tabular-nums">{value}</span>
        </div>
        <Slider
          value={[value]}
          onValueChange={(v) => setValue(v[0])}
          aria-label="Stress level"
          className="[&_[data-slot=slider-range]]:bg-plum"
        />
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
          <span>Almost nothing</span>
          <span>A lot</span>
        </div>
      </div>

      <p className={cn("text-sm leading-relaxed mt-3", level.color)}>
        {level.blurb}
      </p>

      {/* Visual thermometer fill */}
      <div
        className="mt-3 h-2 rounded-full bg-muted overflow-hidden"
        aria-hidden
      >
        <MotionDiv
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.4 }}
          className={cn("h-full rounded-full bg-gradient-to-r", level.fill)}
        />
      </div>

      {/* Suggestion */}
      {level.suggestion && (
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-4 rounded-xl bg-card/70 border border-border/50 p-3"
        >
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
            <Sparkles className="size-3 text-plum" /> A gentle option
          </p>
          <div className="flex flex-wrap gap-2">
            {level.suggestion === "calm" && onOpenCalmRoom && (
              <Button
                onClick={onOpenCalmRoom}
                size="sm"
                className="rounded-full bg-plum text-plum-foreground hover:bg-plum/90"
              >
                <HeartPulse className="size-3.5" /> Open Calm Room
              </Button>
            )}
            {level.suggestion === "breathing" && onOpenBreathing && (
              <Button
                onClick={onOpenBreathing}
                size="sm"
                className="rounded-full bg-rose-soft text-rose-soft-foreground hover:bg-rose-soft/90"
              >
                <Wind className="size-3.5" /> Try breathing
              </Button>
            )}
            <p className="text-xs text-muted-foreground self-center max-w-[14rem]">
              Or just notice. Noticing is enough.
            </p>
          </div>
        </MotionDiv>
      )}

      <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
        Reflective only — never a diagnosis. If you're really struggling, please
        reach out to a trusted adult or professional.
      </p>
    </MotionDiv>
  );
}
