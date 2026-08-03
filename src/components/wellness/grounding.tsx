"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Hand,
  Ear,
  Flower2,
  Coffee,
  Check,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

interface StepDef {
  count: number;
  sense: string;
  verb: string;
  icon: typeof Eye;
  prompt: string;
  accent: string;
}

const STEPS: StepDef[] = [
  {
    count: 5,
    sense: "see",
    verb: "Look",
    icon: Eye,
    prompt: "Name 5 things you can see around you.",
    accent: "text-primary",
  },
  {
    count: 4,
    sense: "touch",
    verb: "Feel",
    icon: Hand,
    prompt: "Name 4 things you can touch — fabric, table, your own hands.",
    accent: "text-amber-glow-foreground",
  },
  {
    count: 3,
    sense: "hear",
    verb: "Listen",
    icon: Ear,
    prompt: "Name 3 sounds you can hear right now.",
    accent: "text-rose-soft",
  },
  {
    count: 2,
    sense: "smell",
    verb: "Smell",
    icon: Flower2,
    prompt: "Name 2 things you can smell (or imagine the smell of).",
    accent: "text-plum",
  },
  {
    count: 1,
    sense: "taste",
    verb: "Taste",
    icon: Coffee,
    prompt: "Name 1 thing you can taste — even just the air.",
    accent: "text-amber-glow-foreground",
  },
];

export function Grounding() {
  const [stepIdx, setStepIdx] = useState(0);
  // Items collected at each step — keyed by step index, each is an array
  const [items, setItems] = useState<Record<number, string[]>>({});
  const [current, setCurrent] = useState("");

  const step = STEPS[stepIdx];
  const collected = items[stepIdx] ?? [];
  const isComplete = stepIdx === STEPS.length - 1 && collected.length >= 1;
  const allDone = STEPS.every((_, i) => (items[i]?.length ?? 0) > 0);

  const add = () => {
    if (!current.trim()) return;
    setItems((prev) => ({
      ...prev,
      [stepIdx]: [...(prev[stepIdx] ?? []), current.trim()],
    }));
    setCurrent("");
  };

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(stepIdx + 1);
  };
  const prev = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };
  const reset = () => {
    setStepIdx(0);
    setItems({});
    setCurrent("");
  };

  const Icon = step.icon;

  return (
    <section
      aria-labelledby="grounding-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-sage p-5 sm:p-6"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2">
          <Leaf className="size-4 text-primary" />
          <h2 id="grounding-heading" className="text-lg font-semibold">
            Grounding · 5-4-3-2-1
          </h2>
        </div>
        {allDone && (
          <Badge variant="secondary" className="rounded-full gap-1">
            <Check className="size-3" /> Complete
          </Badge>
        )}
      </div>
      <p className="text-sm text-muted-foreground mb-5">
        A gentle walk through your senses to help you land back in the present.
        No pressure — skip or repeat as you like.
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-1.5 mb-6" aria-hidden>
        {STEPS.map((s, i) => {
          const done = (items[i]?.length ?? 0) > 0;
          const active = i === stepIdx;
          const SIcon = s.icon;
          return (
            <div key={i} className="flex items-center gap-1.5 flex-1">
              <button
                onClick={() => setStepIdx(i)}
                aria-label={`Step ${i + 1}: ${s.count} things you can ${s.sense}`}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "size-9 rounded-full flex items-center justify-center border transition-all shrink-0",
                  active
                    ? "bg-primary text-primary-foreground border-primary"
                    : done
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-card/60 border-border/60 text-muted-foreground"
                )}
              >
                {done && !active ? (
                  <Check className="size-4" />
                ) : (
                  <SIcon className="size-4" />
                )}
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    i < stepIdx ? "bg-primary/40" : "bg-border/60"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <MotionDiv key={stepIdx} variants={fadeUp} initial="hidden" animate="visible">
        <div className="flex items-start gap-3 mb-4">
          <span
            className={cn(
              "size-11 rounded-xl bg-card/70 border border-border/40 flex items-center justify-center shrink-0",
              step.accent
            )}
          >
            <Icon className="size-5" />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
              Step {stepIdx + 1} of {STEPS.length}
            </p>
            <h3 className="text-base font-semibold">
              {step.count} things you can {step.sense}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">
              {step.prompt}
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-3">
          <Input
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={`One thing you can ${step.sense}…`}
            aria-label={`Add something you can ${step.sense}`}
            maxLength={80}
          />
          <Button
            onClick={add}
            disabled={!current.trim()}
            className="rounded-full"
            aria-label="Add item"
          >
            Add
          </Button>
        </div>

        {/* Collected items */}
        {collected.length > 0 && (
          <ul className="flex flex-wrap gap-1.5 mb-2">
            {collected.map((c, i) => (
              <motion.li
                key={`${stepIdx}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
              >
                <Badge
                  variant="secondary"
                  className="rounded-full gap-1 pl-3 pr-2 py-1"
                >
                  <span className={step.accent}>●</span>
                  {c}
                  <button
                    onClick={() =>
                      setItems((prev) => ({
                        ...prev,
                        [stepIdx]: (prev[stepIdx] ?? []).filter(
                          (_, idx) => idx !== i
                        ),
                      }))
                    }
                    className="ml-1 opacity-60 hover:opacity-100"
                    aria-label={`Remove ${c}`}
                  >
                    ×
                  </button>
                </Badge>
              </motion.li>
            ))}
          </ul>
        )}

        <p className="text-xs text-muted-foreground mb-4">
          {collected.length} of {step.count} added. You can add more, or move
          on whenever you're ready.
        </p>
      </MotionDiv>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full"
          onClick={prev}
          disabled={stepIdx === 0}
        >
          <ChevronLeft className="size-4" /> Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={reset}
          >
            <RotateCcw className="size-3.5" /> Restart
          </Button>
          {stepIdx < STEPS.length - 1 ? (
            <Button
              onClick={next}
              className="rounded-full"
              disabled={collected.length === 0}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={reset}
              className="rounded-full bg-primary text-primary-foreground"
              disabled={collected.length === 0}
            >
              <Check className="size-4" /> Finish
            </Button>
          )}
        </div>
      </div>

      {isComplete && (
        <MotionDiv
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-5 rounded-xl bg-gradient-to-br from-primary/10 to-rose-soft/10 border border-border/40 p-4 text-center"
        >
          <p className="text-sm font-medium text-foreground">
            You're here. You made it back to now.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            That took real care. Thank you for showing up for yourself.
          </p>
        </MotionDiv>
      )}
    </section>
  );
}
