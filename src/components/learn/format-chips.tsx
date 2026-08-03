"use client";

import {
  BookOpen,
  LayoutGrid,
  Speech,
  Workflow,
  Lightbulb,
  HelpCircle,
  Layers,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LearnFormat } from "./use-learn";

export interface FormatOption {
  key: LearnFormat;
  label: string;
  icon: LucideIcon;
  hint: string;
}

export const FORMAT_OPTIONS: FormatOption[] = [
  { key: "story", label: "Story", icon: BookOpen, hint: "A short, vivid tale" },
  { key: "visual", label: "Visual Map", icon: LayoutGrid, hint: "Picture the idea" },
  { key: "comic", label: "Comic", icon: Speech, hint: "A 4-panel script" },
  { key: "flowchart", label: "Flowchart", icon: Workflow, hint: "Step-by-step arrows" },
  { key: "analogy", label: "Analogy", icon: Lightbulb, hint: "Two familiar comparisons" },
  { key: "quiz", label: "Quiz", icon: HelpCircle, hint: "Three gentle questions" },
  { key: "flashcards", label: "Flashcards", icon: Layers, hint: "Flip & remember" },
  { key: "explain", label: "Explain", icon: Sparkles, hint: "Plain, warm words" },
];

export function FormatChips({
  value,
  onChange,
  disabled,
  id,
}: {
  value: LearnFormat;
  onChange: (f: LearnFormat) => void;
  disabled?: boolean;
  id?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label="Choose how to learn this"
      id={id}
      className="flex flex-wrap gap-2"
    >
      {FORMAT_OPTIONS.map((f) => {
        const Icon = f.icon;
        const pressed = value === f.key;
        return (
          <button
            key={f.key}
            type="button"
            role="radio"
            aria-checked={pressed}
            aria-label={`${f.label} — ${f.hint}`}
            disabled={disabled}
            onClick={() => onChange(f.key)}
            className={cn(
              "group inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/60",
              "disabled:opacity-50 disabled:pointer-events-none",
              pressed
                ? "border-primary/40 bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            <span>{f.label}</span>
          </button>
        );
      })}
    </div>
  );
}
