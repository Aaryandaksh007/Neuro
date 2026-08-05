"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, Heart, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuizOption {
  letter: string;
  text: string;
}
interface QuizQuestion {
  prompt: string;
  options: QuizOption[];
  answer: string; // "A" | "B" | ...
  encouragement?: string;
}

/** Parse a markdown quiz reply into structured questions. */
function parseQuiz(md: string): QuizQuestion[] {
  const lines = md.split(/\r?\n/);
  const questions: QuizQuestion[] = [];
  let cur: (Partial<QuizQuestion> & { options: QuizOption[] }) | null = null;
  let answerMode = false;

  const push = () => {
    if (cur && cur.prompt && cur.options.length >= 2 && cur.answer) {
      questions.push(cur as QuizQuestion);
    }
    cur = null;
    answerMode = false;
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Stop accumulating encouragement once we hit the explainable-AI note.
    if (/why this helps/i.test(line)) {
      push();
      continue;
    }

    // Question: "Q1:", "Q:", "Question 1:", "1.", "**Q1:**"
    const qMatch = line.match(
      /^(?:\*{0,2})(?:Q|Question)\s*\d*\s*[:.):\-]\s*(.+)$/i
    );
    if (qMatch && !answerMode) {
      push();
      cur = {
        prompt: qMatch[1].replace(/\*+/g, "").trim(),
        options: [],
        answer: "",
      };
      continue;
    }

    // Numbered question: "1. What is..."  (only when no current question)
    const nMatch = line.match(/^\*{0,2}(\d+)\.\s+(.+)$/);
    if (nMatch && !cur) {
      cur = { prompt: nMatch[2].replace(/\*+/g, "").trim(), options: [], answer: "" };
      continue;
    }

    // Option: "A) text", "A. text", "A: text", "**A)** text"
    const optMatch = line.match(
      /^(?:\*{0,2})([A-D])\s*[:.)\]]\s*(.+)$/
    );
    if (optMatch && cur) {
      cur.options.push({
        letter: optMatch[1],
        text: optMatch[2].replace(/\*+/g, "").trim(),
      });
      continue;
    }

    // Answer: "Answer: A" or "**Answer:** A) text"
    const ansMatch = line.match(
      /^(?:\*{0,2})Answer\s*[:.)\]]?\s*\*{0,2}([A-D])/i
    );
    if (ansMatch && cur) {
      cur.answer = ansMatch[1].toUpperCase();
      answerMode = true;
      continue;
    }

    // Encouragement / trailing context after the answer.
    if (cur && answerMode) {
      const cleaned = line.replace(/\*+/g, "").trim();
      cur.encouragement = cur.encouragement
        ? `${cur.encouragement} ${cleaned}`
        : cleaned;
    }
  }
  push();
  return questions;
}

export function AdaptiveQuiz({ markdown }: { markdown: string }) {
  const questions = useMemo(() => parseQuiz(markdown), [markdown]);
  const reduced = useReducedMotion();
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState<Record<number, boolean>>({});

  if (!questions.length) {
    // Fallback: render as plain markdown (caller already does, but safe default).
    return (
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
        {markdown}
      </p>
    );
  }

  const correctCount = questions.filter(
    (q, i) => submitted[i] && selected[i] === q.answer
  ).length;

  const allDone = questions.every((_, i) => submitted[i]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {questions.length} gentle questions. No timer, no score shaming.
        </p>
        {allDone && (
          <motion.span
            initial={reduced ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
          >
            <Sparkles className="size-3.5" aria-hidden />
            {correctCount}/{questions.length} found their spark
          </motion.span>
        )}
      </div>

      {questions.map((q, qi) => {
        const sel = selected[qi];
        const isSubmitted = submitted[qi];
        const isCorrect = sel === q.answer;

        return (
          <div
            key={qi}
            className="rounded-2xl border bg-card p-5 nt-shadow-soft"
          >
            <p className="mb-3 font-medium leading-snug">
              <span className="mr-2 text-primary">{qi + 1}.</span>
              {q.prompt}
            </p>
            <div className="space-y-2">
              {q.options.map((opt) => {
                const isSel = opt.letter === sel;
                const isAns = opt.letter === q.answer;
                const showCorrect = isSubmitted && isAns;
                const showWrong = isSubmitted && isSel && !isAns;

                return (
                  <button
                    key={opt.letter}
                    type="button"
                    disabled={isSubmitted}
                    onClick={() =>
                      setSelected((p) => ({ ...p, [qi]: opt.letter }))
                    }
                    aria-pressed={isSel}
                    aria-label={`Option ${opt.letter}: ${opt.text}${
                      showCorrect ? " (correct answer)" : ""
                    }${showWrong ? " (your choice)" : ""}`}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                      "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
                      !isSubmitted &&
                        isSel &&
                        "border-primary/50 bg-primary/5",
                      !isSubmitted &&
                        !isSel &&
                        "border-border hover:border-primary/40 hover:bg-primary/5",
                      showCorrect &&
                        "border-primary/60 bg-primary/10 text-foreground",
                      showWrong &&
                        "border-rose-soft/50 bg-rose-soft/10 text-foreground",
                      isSubmitted &&
                        !showCorrect &&
                        !showWrong &&
                        "border-border opacity-70"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        showCorrect &&
                          "border-primary bg-primary text-primary-foreground",
                        showWrong &&
                          "border-rose-soft bg-rose-soft text-rose-soft-foreground",
                        !showCorrect &&
                          !showWrong &&
                          isSel &&
                          "border-primary text-primary",
                        !isSel &&
                          !showCorrect &&
                          "border-border text-muted-foreground"
                      )}
                      aria-hidden
                    >
                      {showCorrect ? (
                        <Check className="size-3.5" />
                      ) : (
                        opt.letter
                      )}
                    </span>
                    <span className="leading-relaxed">{opt.text}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center gap-3">
              {!isSubmitted ? (
                <>
                  <Button
                    size="sm"
                    onClick={() =>
                      setSubmitted((p) => ({ ...p, [qi]: true }))
                    }
                    disabled={!sel}
                  >
                    <Heart className="size-4" /> Check answer
                  </Button>
                  {!sel && (
                    <span className="text-xs text-muted-foreground">
                      Pick the one that feels right. There's no rush.
                    </span>
                  )}
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setSubmitted((p) => ({ ...p, [qi]: false }));
                    setSelected((p) => {
                      const n = { ...p };
                      delete n[qi];
                      return n;
                    });
                  }}
                >
                  <RotateCcw className="size-4" /> Try again
                </Button>
              )}
            </div>

            <AnimatePresence initial={false}>
              {isSubmitted && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={reduced ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div
                    className={cn(
                      "mt-3 rounded-xl border p-4 text-sm leading-relaxed",
                      isCorrect
                        ? "border-primary/30 bg-primary/5"
                        : "border-amber-glow/30 bg-amber-glow/5"
                    )}
                  >
                    <p className="mb-1 font-medium">
                      {isCorrect
                        ? "Lovely — that's the one. ✨"
                        : "Not quite — and that's totally okay."}
                    </p>
                    {q.encouragement && (
                      <p className="text-muted-foreground">
                        {q.encouragement}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
