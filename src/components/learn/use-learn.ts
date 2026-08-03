"use client";

import { useCallback, useState } from "react";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useToast } from "@/hooks/use-toast";
import { useSessionId } from "@/components/shared/use-session-id";

export type LearnFormat =
  | "story"
  | "visual"
  | "comic"
  | "flowchart"
  | "analogy"
  | "quiz"
  | "flashcards"
  | "explain";

export interface Flashcard {
  front: string;
  back: string;
}

export interface LearnResult {
  reply: string;
  flashcards: Flashcard[] | null;
}

export const FORMAT_LABEL: Record<LearnFormat, string> = {
  story: "Story",
  visual: "Visual Map",
  comic: "Comic",
  flowchart: "Flowchart",
  analogy: "Analogy",
  quiz: "Quiz",
  flashcards: "Flashcards",
  explain: "Explain",
};

/**
 * Central hook for the Learn world.
 * - Calls POST /api/learn with the full twin + profile context.
 * - Fires the digital-twin side effects (bump traits, add memory, add star,
 *   set companion mood) the moment a lesson completes.
 * - Surfaces a kind toast on completion.
 */
export function useLearn() {
  const sessionId = useSessionId();
  const profile = useApp((s) => s.profile);
  const traits = useTwin((s) => s.traits);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const addMemory = useTwin((s) => s.addMemory);
  const setCompanionMood = useTwin((s) => s.setCompanionMood);
  const addStar = useGrowth((s) => s.addStar);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = useCallback(
    async (
      topic: string,
      format: LearnFormat,
      note?: string
    ): Promise<LearnResult | null> => {
      if (!topic.trim() || loading) return null;
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/learn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            topic: topic.trim(),
            format,
            profile,
            twin: { traits },
            note: note?.trim() || undefined,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || "Couldn't prepare that lesson just now.");
        }

        // Digital Twin side-effects — keep the twin alive across worlds.
        const cleanTopic = topic.trim();
        bumpTrait("confidence", 3, `You completed a lesson on ${cleanTopic}.`);
        bumpTrait("retention", 2, `Practiced ${cleanTopic}.`);
        addMemory({
          text: `You explored ${cleanTopic} as a ${FORMAT_LABEL[format]}.`,
          kind: "observation",
        });
        addStar({ concept: cleanTopic, constellation: "Learn", brightness: 40 });
        setCompanionMood("attentive");

        toast({
          title: "Nice — that's one more star in your galaxy.",
          description: `${cleanTopic.slice(0, 64)}${
            cleanTopic.length > 64 ? "…" : ""
          }`,
        });

        return {
          reply: data.reply as string,
          flashcards: data.flashcards as Flashcard[] | null,
        };
      } catch (e: any) {
        const msg = e?.message || "Something went wrong. Your topic is safe — try again?";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [
      sessionId,
      profile,
      traits,
      loading,
      bumpTrait,
      addMemory,
      addStar,
      setCompanionMood,
      toast,
    ]
  );

  const reset = useCallback(() => setError(null), []);

  return { generate, loading, error, reset };
}
