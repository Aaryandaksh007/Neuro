"use client";

import { useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, RotateCcw, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Flashcard } from "./use-learn";

type Mark = "got" | "review" | undefined;

export function Flashcards({ cards }: { cards: Flashcard[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [marks, setMarks] = useState<Record<number, Mark>>({});
  const reduced = useReducedMotion();

  if (!cards?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No flashcards came through this time. Want to try another topic?
      </p>
    );
  }

  const card = cards[i];
  const gotCount = Object.values(marks).filter((m) => m === "got").length;

  const go = (dir: 1 | -1) => {
    setI((p) => Math.min(cards.length - 1, Math.max(0, p + dir)));
    setFlipped(false);
  };

  const mark = (m: Exclude<Mark, undefined>) =>
    setMarks((prev) => ({ ...prev, [i]: prev[i] === m ? undefined : m }));

  return (
    <div className="space-y-4">
      <div
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${i + 1} of ${cards.length}. ${
          flipped ? "Showing the answer." : "Showing the concept."
        } Press Enter or Space to flip. Use arrow keys to navigate.`}
        onClick={() => setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            go(1);
          } else if (e.key === "ArrowLeft") {
            e.preventDefault();
            go(-1);
          }
        }}
        className="relative h-72 sm:h-80 w-full cursor-pointer select-none rounded-2xl outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60"
        style={{ perspective: 1200 }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: reduced ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card p-6 text-center nt-gradient-sage nt-shadow-soft"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">
              <Layers className="size-3" aria-hidden /> Concept
            </span>
            <p className="text-lg font-medium leading-snug sm:text-xl">{card.front}</p>
            <span className="absolute bottom-4 right-5 text-xs text-muted-foreground">
              tap to flip
            </span>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl border bg-card p-6 text-center nt-gradient-amber nt-shadow-soft"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-glow/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-glow-foreground">
              <Check className="size-3" aria-hidden /> Answer
            </span>
            <p className="text-base leading-relaxed sm:text-lg">{card.back}</p>
          </div>
        </motion.div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => go(-1)}
          disabled={i === 0}
          aria-label="Previous card"
        >
          <ChevronLeft className="size-4" /> Prev
        </Button>
        <span
          className="text-sm text-muted-foreground"
          aria-live="polite"
          aria-atomic="true"
        >
          {i + 1} / {cards.length}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => go(1)}
          disabled={i === cards.length - 1}
          aria-label="Next card"
        >
          Next <ChevronRight className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => mark("review")}
          aria-pressed={marks[i] === "review"}
          className={
            marks[i] === "review"
              ? "border-rose-soft/50 bg-rose-soft/10 text-rose-soft-foreground"
              : ""
          }
        >
          <RotateCcw className="size-4" /> Review again
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={() => mark("got")}
          aria-pressed={marks[i] === "got"}
        >
          <Check className="size-4" /> Got it
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={gotCount}
          initial={reduced ? false : { opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
          className="text-center text-xs text-muted-foreground"
        >
          {gotCount === 0
            ? "No pressure. Flip when you're ready."
            : `${gotCount} of ${cards.length} feeling solid. Lovely pace.`}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
