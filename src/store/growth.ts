"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface MemoryStar {
  id: string;
  concept: string;
  constellation: string;
  brightness: number; // 0-100 mastery
  earnedAt: number;
}

export interface Tree {
  id: string;
  kind: string;
  plantedAt: number;
  height: number; // 0-100
  source: string; // what habit grew it
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  earnedAt: number;
}

export interface FocusSession {
  id: string;
  minutes: number;
  flow: number; // 0-100 how focused
  createdAt: number;
}

interface GrowthState {
  stars: MemoryStar[];
  trees: Tree[];
  achievements: Achievement[];
  sessions: FocusSession[];
  persistence: number; // 0-100
  kindness: number; // 0-100
  addStar: (s: Omit<MemoryStar, "id" | "earnedAt">) => void;
  addTree: (t: Omit<Tree, "id" | "plantedAt">) => void;
  growTree: (id: string, delta: number) => void;
  addAchievement: (a: Omit<Achievement, "earnedAt">) => void;
  addSession: (s: Omit<FocusSession, "id" | "createdAt">) => void;
  bumpPersistence: (d: number) => void;
  bumpKindness: (d: number) => void;
  totalStars: () => number;
}

export const useGrowth = create<GrowthState>()(
  persist(
    (set, get) => ({
      stars: [],
      trees: [
        { id: "t-seed", kind: "oak", plantedAt: Date.now(), height: 8, source: "You started your journey" },
      ],
      achievements: [],
      sessions: [],
      persistence: 20,
      kindness: 40,
      addStar: (s) =>
        set((st) => ({
          stars: [
            ...st.stars,
            { ...s, id: `s-${Date.now()}`, earnedAt: Date.now() },
          ],
        })),
      addTree: (t) =>
        set((st) => ({
          trees: [
            ...st.trees,
            { ...t, id: `t-${Date.now()}`, plantedAt: Date.now() },
          ],
        })),
      growTree: (id, delta) =>
        set((st) => ({
          trees: st.trees.map((t) =>
            t.id === id
              ? { ...t, height: Math.min(100, t.height + delta) }
              : t
          ),
        })),
      addAchievement: (a) =>
        set((st) => ({
          achievements: [
            ...st.achievements,
            { ...a, earnedAt: Date.now() },
          ],
        })),
      addSession: (s) =>
        set((st) => ({
          sessions: [
            ...st.sessions,
            { ...s, id: `f-${Date.now()}`, createdAt: Date.now() },
          ].slice(-200),
        })),
      bumpPersistence: (d) =>
        set((st) => ({
          persistence: Math.max(0, Math.min(100, st.persistence + d)),
        })),
      bumpKindness: (d) =>
        set((st) => ({
          kindness: Math.max(0, Math.min(100, st.kindness + d)),
        })),
      totalStars: () => get().stars.length,
    }),
    { name: "neurotwin-growth" }
  )
);
