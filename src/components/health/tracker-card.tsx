"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHealth, type HealthLog } from "@/store/health";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export type Accent = "amber" | "sage" | "rose" | "plum";

const ACCENT_RING: Record<Accent, string> = {
  amber: "oklch(0.82 0.13 80)",
  sage: "oklch(0.7 0.1 155)",
  rose: "oklch(0.78 0.08 15)",
  plum: "oklch(0.6 0.12 330)",
};

const ACCENT_ICON_BG: Record<Accent, string> = {
  amber: "bg-amber-glow/15 text-amber-glow-foreground",
  sage: "bg-sage/15 text-sage",
  rose: "bg-rose-soft/15 text-rose-soft",
  plum: "bg-plum/15 text-plum",
};

const ACCENT_DONE_BG: Record<Accent, string> = {
  amber: "bg-amber-glow text-amber-glow-foreground hover:bg-amber-glow/90",
  sage: "bg-sage text-sage-foreground hover:bg-sage/90",
  rose: "bg-rose-soft text-rose-soft-foreground hover:bg-rose-soft/90",
  plum: "bg-plum text-plum-foreground hover:bg-plum/90",
};

interface TrackerCardProps {
  type: HealthLog["type"];
  icon: LucideIcon;
  label: string;
  unit: string; // display unit, e.g. "glass", "hours"
  goal: number; // count goal for the day
  microCopy: string;
  accent: Accent;
  inputMode?: "count" | "value"; // count = +1 button, value = numeric input
  inputUnit?: string; // suffix label for value mode (e.g. "hrs")
  inputStep?: number;
}

export function TrackerCard({
  type,
  icon: Icon,
  label,
  unit,
  goal,
  microCopy,
  accent,
  inputMode = "count",
  inputUnit = "",
  inputStep = 1,
}: TrackerCardProps) {
  const { toast } = useToast();
  const count = useHealth((s) => s.todaysCount(type));
  const addLog = useHealth((s) => s.addLog);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const [val, setVal] = useState("");
  const [justAdded, setJustAdded] = useState(false);

  const progress = Math.min(100, (count / goal) * 100);
  const complete = count >= goal;

  const ringStroke = ACCENT_RING[accent];
  const RADIUS = 18;
  const CIRC = 2 * Math.PI * RADIUS;
  const dash = (progress / 100) * CIRC;

  const triggerJustAdded = () => {
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 800);
  };

  const handleQuickAdd = () => {
    addLog({ type, value: 1, unit });
    bumpTrait("calm", 1, `Took care of: ${label.toLowerCase()}`);
    const newCount = count + 1;
    if (newCount >= goal && count < goal) {
      toast({
        title: `${label} goal reached 🌱`,
        description: microCopy,
      });
    } else {
      toast({
        title: `${label} +1`,
        description: microCopy,
      });
    }
    triggerJustAdded();
  };

  const handleValueAdd = () => {
    const parsed = parseFloat(val);
    if (Number.isNaN(parsed) || parsed <= 0) {
      toast({ title: "Try a positive number", description: "" });
      return;
    }
    addLog({ type, value: parsed, unit });
    bumpTrait("calm", 1, `Took care of: ${label.toLowerCase()}`);
    const newCount = count + 1;
    if (newCount >= goal && count < goal) {
      toast({
        title: `${label} logged — goal met 🌱`,
        description: microCopy,
      });
    } else {
      toast({
        title: `${label}: ${parsed}${inputUnit} logged 💚`,
        description: microCopy,
      });
    }
    setVal("");
    triggerJustAdded();
  };

  return (
    <Card
      className={cn(
        "nt-shadow-soft rounded-2xl p-4 sm:p-5 transition-transform duration-200",
        justAdded && "scale-[1.02]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              "inline-flex h-10 w-10 items-center justify-center rounded-xl shrink-0",
              ACCENT_ICON_BG[accent]
            )}
            aria-hidden
          >
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-semibold leading-tight">{label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {microCopy}
            </p>
          </div>
        </div>

        {/* Progress ring */}
        <div
          className="relative shrink-0"
          role="img"
          aria-label={`${count} of ${goal} ${unit} today, ${Math.round(progress)}% of goal`}
        >
          <svg
            width="44"
            height="44"
            viewBox="0 0 44 44"
            className="-rotate-90"
            aria-hidden
          >
            <circle
              cx="22"
              cy="22"
              r={RADIUS}
              fill="none"
              stroke="oklch(0.7 0.02 150 / 0.18)"
              strokeWidth="4"
            />
            <circle
              cx="22"
              cy="22"
              r={RADIUS}
              fill="none"
              stroke={ringStroke}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${dash} ${CIRC}`}
              className="transition-[stroke-dasharray] duration-700 ease-out"
            />
          </svg>
          <span
            className={cn(
              "absolute inset-0 flex items-center justify-center text-xs font-semibold tabular-nums",
              complete && "text-sage"
            )}
          >
            {count}
          </span>
        </div>
      </div>

      {/* Footer: count info + quick-add */}
      <div className="mt-4 flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{count}</span>
          {" / "}
          <span className="tabular-nums">{goal}</span> {unit} today
          {complete && (
            <span className="ml-1.5 text-sage font-medium inline-flex items-center gap-0.5">
              <Check className="size-3" /> met
            </span>
          )}
        </p>

        {inputMode === "count" ? (
          <Button
            size="sm"
            className={cn("rounded-full h-8 px-3", ACCENT_DONE_BG[accent])}
            onClick={handleQuickAdd}
            aria-label={`Add one ${unit} to ${label}`}
          >
            <Plus className="size-3.5" /> Add
          </Button>
        ) : (
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              min={0}
              step={inputStep}
              value={val}
              onChange={(e) => setVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleValueAdd()}
              aria-label={`${label} value in ${inputUnit || unit}`}
              className="h-8 w-20 text-sm tabular-nums"
              placeholder="0"
            />
            {inputUnit && (
              <span className="text-xs text-muted-foreground">{inputUnit}</span>
            )}
            <Button
              size="sm"
              className={cn("rounded-full h-8 px-3", ACCENT_DONE_BG[accent])}
              onClick={handleValueAdd}
              aria-label={`Log ${label}`}
            >
              <Check className="size-3.5" /> Log
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
