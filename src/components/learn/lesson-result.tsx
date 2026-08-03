"use client";

import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { Lightbulb, Sparkles, FileText } from "lucide-react";
import { MotionDiv } from "@/components/shared/motion";
import { Flashcards } from "./flashcards";
import { AdaptiveQuiz } from "./adaptive-quiz";
import { VoicePlayer } from "./voice-player";
import { LessonIllustration } from "./lesson-illustration";
import type { LearnFormat, LearnResult } from "./use-learn";

/** Split off a trailing "Why this helps you" line so we can render it as a callout. */
function splitWhyThisHelps(reply: string): { body: string; why?: string } {
  // Match a final line that starts (case-insensitive) with "Why this helps"
  const lines = reply.split(/\r?\n/);
  for (let i = lines.length - 1; i >= 0; i--) {
    const t = lines[i].trim();
    if (!t) continue;
    const m = t.match(
      /^(?:\*{0,2})why this helps (?:you|me)?\s*[:.\-]?\s*(.+)$/i
    );
    if (m) {
      const why = m[1].replace(/\*+/g, "").trim();
      const body = lines.slice(0, i).join("\n").replace(/\s+$/, "");
      return { body, why };
    }
    // Stop after the first non-empty last line — we only want a trailing note.
    break;
  }
  return { body: reply };
}

function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-foreground">
      <ReactMarkdown
        components={{
          h1: ({ node, ...p }) => (
            <h2 className="text-xl font-semibold mt-2" {...p} />
          ),
          h2: ({ node, ...p }) => (
            <h3 className="text-lg font-semibold mt-2" {...p} />
          ),
          h3: ({ node, ...p }) => (
            <h4 className="text-base font-semibold mt-1" {...p} />
          ),
          p: ({ node, ...p }) => <p className="leading-relaxed" {...p} />,
          ul: ({ node, ...p }) => (
            <ul className="list-disc space-y-1 pl-5" {...p} />
          ),
          ol: ({ node, ...p }) => (
            <ol className="list-decimal space-y-1 pl-5" {...p} />
          ),
          li: ({ node, ...p }) => <li className="leading-relaxed" {...p} />,
          strong: ({ node, ...p }) => (
            <strong className="font-semibold text-foreground" {...p} />
          ),
          em: ({ node, ...p }) => (
            <em className="italic text-muted-foreground" {...p} />
          ),
          code: ({ node, ...p }) => (
            <code
              className="rounded bg-muted px-1.5 py-0.5 font-mono text-[13px]"
              {...p}
            />
          ),
          pre: ({ node, ...p }) => (
            <pre
              className="overflow-x-auto rounded-xl border bg-muted/60 p-4 text-[13px] leading-relaxed"
              {...p}
            />
          ),
          blockquote: ({ node, ...p }) => (
            <blockquote
              className="border-l-2 border-primary/40 pl-4 italic text-muted-foreground"
              {...p}
            />
          ),
          a: ({ node, ...p }) => (
            <a
              className="text-primary underline underline-offset-4 hover:text-primary/80"
              target="_blank"
              rel="noreferrer noopener"
              {...p}
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function LessonResult({
  result,
  format,
  topic,
}: {
  result: LearnResult;
  format: LearnFormat;
  topic: string;
}) {
  const { body, why } = useMemo(
    () => splitWhyThisHelps(result.reply),
    [result.reply]
  );

  // Flashcards — server returns a parsed array.
  if (format === "flashcards" && result.flashcards && result.flashcards.length) {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5"
      >
        <Flashcards cards={result.flashcards} />
        {why && <WhyCard why={why} />}
      </MotionDiv>
    );
  }

  // Quiz — parse the markdown into interactive questions.
  if (format === "quiz") {
    return (
      <MotionDiv
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="space-y-5"
      >
        <AdaptiveQuiz markdown={body} />
        {why && <WhyCard why={why} />}
      </MotionDiv>
    );
  }

  // Default: render the markdown body + the explainable-AI callout.
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-4"
    >
      <VoicePlayer text={body} label="Listen to this lesson" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-start">
        <div className="max-h-[60vh] overflow-y-auto pr-1 order-2 lg:order-1">
          <MarkdownBody>{body}</MarkdownBody>
        </div>
        <div className="order-1 lg:order-2 lg:sticky lg:top-2">
          <LessonIllustration topic={topic} />
        </div>
      </div>
      {why && <WhyCard why={why} />}
    </MotionDiv>
  );
}

function WhyCard({ why }: { why: string }) {
  return (
    <div
      role="note"
      aria-label="Why this helps you"
      className="rounded-2xl border border-primary/20 bg-primary/5 p-4 nt-gradient-sage"
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Lightbulb className="size-4" aria-hidden />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Why this helps you
          </p>
          <p className="text-sm leading-relaxed text-foreground">{why}</p>
        </div>
      </div>
    </div>
  );
}

/** Empty state used inside the tutor / playground before first submit. */
export function LessonEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
      <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary nt-breathe">
        <FileText className="size-6" aria-hidden />
      </div>
      <p className="text-sm font-medium">Your lesson will appear here.</p>
      <p className="mt-1 max-w-sm text-xs text-muted-foreground">
        Pick a format above and share a topic. The tutor adapts to how your brain
        works best — and explains every choice it makes.
      </p>
    </div>
  );
}

/** Loading skeleton with shimmer. */
export function LessonLoading() {
  return (
    <div className="space-y-4" aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="size-4 nt-breathe" aria-hidden />
        Shaping this for you…
      </div>
      <div className="space-y-3 rounded-2xl border bg-card p-5">
        <div className="nt-shimmer h-5 w-2/3 rounded-md" />
        <div className="nt-shimmer h-3 w-full rounded-md" />
        <div className="nt-shimmer h-3 w-11/12 rounded-md" />
        <div className="nt-shimmer h-3 w-10/12 rounded-md" />
        <div className="nt-shimmer h-3 w-3/4 rounded-md" />
        <div className="h-2" />
        <div className="nt-shimmer h-4 w-1/3 rounded-md" />
        <div className="nt-shimmer h-3 w-full rounded-md" />
        <div className="nt-shimmer h-3 w-9/12 rounded-md" />
      </div>
    </div>
  );
}
