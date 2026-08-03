"use client";

import { useState } from "react";
import { FileText, Wand2, AlertCircle, ClipboardPaste } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { FormatChips } from "./format-chips";
import { LessonResult, LessonEmptyState, LessonLoading } from "./lesson-result";
import {
  useLearn,
  FORMAT_LABEL,
  type LearnFormat,
  type LearnResult,
} from "./use-learn";

const SAMPLE_NOTE = `Paste anything — class notes, a textbook paragraph, a Wikipedia snippet, even your own messy draft. The tutor will turn it into how you learn best.`;

export function ConceptPlayground() {
  const [note, setNote] = useState("");
  const [topic, setTopic] = useState("");
  const [format, setFormat] = useState<LearnFormat>("story");
  const [result, setResult] = useState<LearnResult | null>(null);
  const [resultMeta, setResultMeta] = useState<{
    topic: string;
    format: LearnFormat;
  } | null>(null);
  const { generate, loading, error } = useLearn();

  const derivedTopic = topic.trim() || deriveTopicFromNote(note);

  const submit = async () => {
    if ((!note.trim() && !topic.trim()) || loading) return;
    // Pass the note as both topic (for the AI's main instruction) and as the
    // dedicated `note` field so the API can keep the topic label short.
    const label = topic.trim() || firstLine(note) || "Your pasted lesson";
    const r = await generate(label, format, note.trim() || undefined);
    if (r) {
      setResult(r);
      setResultMeta({ topic: label, format });
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const t = await navigator.clipboard.readText();
      if (t) setNote(t);
    } catch {
      // Clipboard not available — no problem.
    }
  };

  return (
    <MotionDiv
      variants={stagger}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      <MotionDiv
        variants={fadeUp}
        className="relative overflow-hidden rounded-2xl border bg-card p-5 nt-gradient-amber nt-shadow-soft sm:p-6"
      >
        <div className="mb-4 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-glow/20 text-amber-glow-foreground">
            <FileText className="size-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold leading-tight sm:text-lg">
              Turn anything into how you learn best.
            </h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Paste a lesson, a paragraph, your own notes. Pick a format. We
              reshape it for your brain.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <label
              htmlFor="pg-topic"
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Quick label (optional)
            </label>
            <input
              id="pg-topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Cell membrane transport"
              className="h-9 flex-1 rounded-lg border border-border bg-background/70 px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
              disabled={loading}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={pasteFromClipboard}
              disabled={loading}
              className="h-9"
              aria-label="Paste from clipboard"
            >
              <ClipboardPaste className="size-4" /> Paste
            </Button>
          </div>

          <div>
            <label
              htmlFor="pg-note"
              className="mb-1 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Your lesson or note
            </label>
            <Textarea
              id="pg-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={SAMPLE_NOTE}
              rows={6}
              disabled={loading}
              className="resize-y bg-background/70 text-[15px] leading-relaxed"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              {note.length.toLocaleString()} characters · stays on your device
              until you generate.
            </p>
          </div>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Reshape as
            </p>
            <FormatChips
              value={format}
              onChange={setFormat}
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={submit}
              size="lg"
              disabled={loading || !note.trim()}
              className="rounded-xl px-5"
            >
              <Wand2 className="size-4" aria-hidden />
              {loading ? "Reshaping…" : "Reshape it"}
            </Button>
          </div>
        </div>
      </MotionDiv>

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
            <Button size="sm" variant="outline" className="mt-3" onClick={submit}>
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
                Reshaped lesson
              </p>
              <h4 className="truncate text-base font-semibold leading-tight">
                {resultMeta.topic}
              </h4>
            </div>
            <span className="shrink-0 rounded-full bg-amber-glow/15 px-3 py-1 text-xs font-medium text-amber-glow-foreground">
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
    </MotionDiv>
  );
}

function firstLine(s: string): string {
  const t = s.trim();
  if (!t) return "";
  const line = t.split(/\r?\n/)[0];
  return line.length > 80 ? line.slice(0, 77) + "…" : line;
}

function deriveTopicFromNote(note: string): string {
  const line = firstLine(note);
  if (!line) return "";
  // Strip leading markdown list markers.
  return line.replace(/^[\-\*\d\.\)\s]+/, "").trim();
}
