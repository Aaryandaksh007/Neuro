"use client";

import { useState } from "react";
import {
  GraduationCap,
  Wand2,
  Sparkles,
  AlertCircle,
  CornerDownLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { VoiceInput } from "@/components/shared/voice-input";
import { FormatChips } from "./format-chips";
import { LessonResult, LessonEmptyState, LessonLoading } from "./lesson-result";
import {
  useLearn,
  FORMAT_LABEL,
  type LearnFormat,
  type LearnResult,
} from "./use-learn";

const EXAMPLE_TOPICS = [
  "How photosynthesis works",
  "What is a black hole?",
  "Long division, step by step",
  "The water cycle",
  "Why is the sky blue?",
  "How the heart pumps blood",
  "What causes the seasons",
  "Fractions made simple",
];

export function AdaptiveTutor() {
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<LearnFormat>("explain");
  const [result, setResult] = useState<LearnResult | null>(null);
  const [resultMeta, setResultMeta] = useState<{
    topic: string;
    format: LearnFormat;
  } | null>(null);
  const { generate, loading, error } = useLearn();

  const submit = async (overrideTopic?: string) => {
    const t = (overrideTopic ?? topic).trim();
    if (!t || loading) return;
    setTopic(t);
    const r = await generate(t, format);
    if (r) {
      setResult(r);
      setResultMeta({ topic: t, format });
    }
  };

  return (
    <MotionDiv
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Composer card */}
      <MotionDiv
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border bg-card p-5 nt-gradient-sage nt-shadow-soft sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <GraduationCap className="size-5" aria-hidden />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight sm:text-lg">
              What do you want to learn today?
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Type any topic. Pick how you want it shaped. Your twin adapts the
              rest.
            </p>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          className="space-y-4"
        >
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How do rainbows form?"
              aria-label="Topic to learn"
              className="h-11 flex-1 rounded-xl border-border bg-background/70 text-base"
              disabled={loading}
            />
            <VoiceInput
              size="md"
              label="Speak a topic"
              currentValue={topic}
              onTranscript={(text) => setTopic(text)}
            />
            <Button
              type="submit"
              size="lg"
              className="h-11 rounded-xl px-5"
              disabled={loading || !topic.trim()}
            >
              <Wand2 className="size-4" aria-hidden />
              {loading ? "Shaping…" : "Make it click"}
            </Button>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Choose a format
            </p>
            <FormatChips
              value={format}
              onChange={setFormat}
              disabled={loading}
            />
          </div>
        </form>

        {/* Example topic quick chips */}
        {!result && !loading && (
          <div className="mt-5 border-t border-border/60 pt-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="size-3.5" aria-hidden />
              Need a starting point? Try one:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => submit(t)}
                  className="rounded-full border border-border bg-background/70 px-3 py-1.5 text-xs text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}
      </MotionDiv>

      {/* Result area */}
      {loading ? (
        <LessonLoading />
      ) : error ? (
        <MotionDiv
          variants={fadeUp}
          className="flex items-start gap-3 rounded-2xl border border-rose-soft/40 bg-rose-soft/5 p-5"
        >
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-rose-soft" aria-hidden />
          <div>
            <p className="text-sm font-medium">Hmm — that didn't quite land.</p>
            <p className="mt-1 text-sm text-muted-foreground">{error}</p>
            <Button
              size="sm"
              variant="outline"
              className="mt-3"
              onClick={() => submit()}
            >
              Try again
            </Button>
          </div>
        </MotionDiv>
      ) : result && resultMeta ? (
        <MotionDiv
          variants={fadeUp}
          className="rounded-2xl border bg-card p-5 nt-shadow-soft sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-3 border-b border-border/60 pb-3">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Lesson
              </p>
              <h4 className="truncate text-base font-semibold leading-tight">
                {resultMeta.topic}
              </h4>
            </div>
            <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {FORMAT_LABEL[resultMeta.format]}
            </span>
          </div>
          <LessonResult
            result={result}
            format={resultMeta.format}
            topic={resultMeta.topic}
          />
        </MotionDiv>
      ) : (
        <LessonEmptyState />
      )}

      {/* Keyboard hint */}
      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <CornerDownLeft className="size-3" aria-hidden />
        Press Enter to generate
      </p>
    </MotionDiv>
  );
}
