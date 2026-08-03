"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TwinTrait {
  key: string;
  label: string;
  value: number; // 0-100
  evidence: string[]; // explainable AI notes
  lastUpdated: string;
}

export interface TwinMemory {
  id: string;
  day: number; // relative day since start
  text: string;
  kind: "observation" | "adaptation" | "celebration" | "insight";
  createdAt: number;
}

export interface TwinState {
  startedAt: number | null;
  traits: Record<string, TwinTrait>;
  memories: TwinMemory[];
  companionMood: "learning" | "calm" | "attentive" | "encouraging";
  addMemory: (m: Omit<TwinMemory, "id" | "createdAt" | "day">) => void;
  updateTrait: (key: string, patch: Partial<TwinTrait>) => void;
  bumpTrait: (key: string, delta: number, evidence?: string) => void;
  setStarted: () => void;
  setCompanionMood: (m: TwinState["companionMood"]) => void;
  dayCount: () => number;
}

const defaultTraits: Record<string, TwinTrait> = {
  visualPreference: {
    key: "visualPreference",
    label: "Visual Learning",
    value: 50,
    evidence: ["You're just starting — I'm learning your style."],
    lastUpdated: new Date().toISOString(),
  },
  sessionLength: {
    key: "sessionLength",
    label: "Ideal Session Length",
    value: 50,
    evidence: ["We'll find your sweet spot together."],
    lastUpdated: new Date().toISOString(),
  },
  focusWindow: {
    key: "focusWindow",
    label: "Focus Window",
    value: 45,
    evidence: ["Early signal: you focus best in short bursts."],
    lastUpdated: new Date().toISOString(),
  },
  retention: {
    key: "retention",
    label: "Memory Retention",
    value: 40,
    evidence: ["I'll track what sticks and what needs a refresh."],
    lastUpdated: new Date().toISOString(),
  },
  confidence: {
    key: "confidence",
    label: "Learning Confidence",
    value: 35,
    evidence: ["Every tiny win lifts this."],
    lastUpdated: new Date().toISOString(),
  },
  curiosity: {
    key: "curiosity",
    label: "Curiosity",
    value: 60,
    evidence: ["You showed up curious today."],
    lastUpdated: new Date().toISOString(),
  },
  calm: {
    key: "calm",
    label: "Calm State",
    value: 55,
    evidence: ["You're regulating well right now."],
    lastUpdated: new Date().toISOString(),
  },
};

export const useTwin = create<TwinState>()(
  persist(
    (set, get) => ({
      startedAt: null,
      traits: defaultTraits,
      memories: [
        {
          id: "m-welcome",
          day: 1,
          text: "I am learning about you. There's no rush — we go at your pace.",
          kind: "observation",
          createdAt: Date.now(),
        },
      ],
      companionMood: "learning",
      setStarted: () => {
        if (!get().startedAt) set({ startedAt: Date.now() });
      },
      addMemory: (m) =>
        set((s) => {
          const day = s.dayCount();
          const memory: TwinMemory = {
            ...m,
            id: `m-${Date.now()}`,
            day,
            createdAt: Date.now(),
          };
          return { memories: [...s.memories, memory].slice(-60) };
        }),
      updateTrait: (key, patch) =>
        set((s) => ({
          traits: {
            ...s.traits,
            [key]: {
              ...s.traits[key],
              ...patch,
              lastUpdated: new Date().toISOString(),
            },
          },
        })),
      bumpTrait: (key, delta, evidence) =>
        set((s) => {
          const t = s.traits[key];
          if (!t) return s;
          const value = Math.max(0, Math.min(100, t.value + delta));
          const ev = evidence ? [...t.evidence, evidence].slice(-5) : t.evidence;
          return {
            traits: {
              ...s.traits,
              [key]: { ...t, value, evidence: ev, lastUpdated: new Date().toISOString() },
            },
          };
        }),
      setCompanionMood: (companionMood) => set({ companionMood }),
      dayCount: () => {
        const started = get().startedAt;
        if (!started) return 1;
        return Math.max(1, Math.floor((Date.now() - started) / 86400000) + 1);
      },
    }),
    { name: "neurotwin-twin" }
  )
);
