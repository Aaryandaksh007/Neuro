"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface StudyItem {
  id: string;
  topic: string;
  createdAt: number;
  lastReviewed: number | null;
  reviewCount: number;
  /** 0-100 confidence the learner reports; drives spacing */
  confidence: number;
  /** next suggested review timestamp */
  nextReview: number;
  /** minutes spent */
  minutes: number;
}

// Spaced repetition: intervals grow with review count + confidence.
// Low confidence → review sooner. High confidence → review later.
export function computeNextReview(
  reviewCount: number,
  confidence: number
): number {
  const now = Date.now();
  const day = 86400000;
  // Base interval grows: 1d, 2d, 4d, 7d, 12d, 21d, 34d...
  const baseIntervals = [1, 2, 4, 7, 12, 21, 34, 55];
  const idx = Math.min(reviewCount, baseIntervals.length - 1);
  let intervalDays = baseIntervals[idx];
  // Adjust by confidence: low confidence halves interval, high extends it.
  const confFactor = 0.5 + (confidence / 100) * 1.0; // 0.5 - 1.5
  intervalDays = Math.max(0.5, intervalDays * confFactor);
  return now + intervalDays * day;
}

interface StudyState {
  items: StudyItem[];
  addItem: (topic: string, minutes?: number) => void;
  removeItem: (id: string) => void;
  reviewItem: (id: string, confidence: number) => void;
  dueToday: () => StudyItem[];
  upcoming: () => StudyItem[];
  totalTopics: () => number;
}

export const useStudy = create<StudyState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (topic, minutes = 0) =>
        set((s) => {
          // Don't duplicate exact topics
          const existing = s.items.find(
            (i) => i.topic.toLowerCase() === topic.toLowerCase()
          );
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.id === existing.id
                  ? { ...i, minutes: i.minutes + minutes, createdAt: i.createdAt }
                  : i
              ),
            };
          }
          const item: StudyItem = {
            id: `st-${Date.now()}`,
            topic,
            createdAt: Date.now(),
            lastReviewed: null,
            reviewCount: 0,
            confidence: 40,
            nextReview: computeNextReview(0, 40),
            minutes,
          };
          return { items: [item, ...s.items] };
        }),
      removeItem: (id) =>
        set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      reviewItem: (id, confidence) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id
              ? {
                  ...i,
                  lastReviewed: Date.now(),
                  reviewCount: i.reviewCount + 1,
                  confidence,
                  nextReview: computeNextReview(i.reviewCount + 1, confidence),
                }
              : i
          ),
        })),
      dueToday: () => {
        const now = Date.now();
        return get()
          .items.filter((i) => i.nextReview <= now)
          .sort((a, b) => a.nextReview - b.nextReview);
      },
      upcoming: () => {
        const now = Date.now();
        return get()
          .items.filter((i) => i.nextReview > now)
          .sort((a, b) => a.nextReview - b.nextReview);
      },
      totalTopics: () => get().items.length,
    }),
    { name: "neurotwin-study" }
  )
);
