"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AppView =
  | "landing"
  | "onboarding"
  | "mindspace"
  | "judge";

export type World = "learn" | "wellness" | "health" | "growth" | "twin";

export type LearningStyle = "visual" | "verbal" | "auditory" | "kinesthetic" | "reading";

export interface LearnerProfile {
  name: string;
  ageBand: "under-13" | "13-17" | "18-24" | "25+" | "";
  goals: string[];
  interests: string[];
  preferredStyle: LearningStyle;
  sessionLength: number; // preferred minutes
  readingSpeed: "slow" | "moderate" | "fast";
  attentionSpan: "short" | "medium" | "long";
  sensoryNotes: string;
  feelsSafeWith: string[];
}

const defaultProfile: LearnerProfile = {
  name: "",
  ageBand: "",
  goals: [],
  interests: [],
  preferredStyle: "visual",
  sessionLength: 20,
  readingSpeed: "moderate",
  attentionSpan: "medium",
  sensoryNotes: "",
  feelsSafeWith: [],
};

interface AppState {
  view: AppView;
  world: World;
  onboarded: boolean;
  profile: LearnerProfile;
  companionName: string;
  companionOpen: boolean;
  setView: (v: AppView) => void;
  setWorld: (w: World) => void;
  setOnboarded: (b: boolean) => void;
  setProfile: (p: Partial<LearnerProfile>) => void;
  resetProfile: () => void;
  setCompanionName: (n: string) => void;
  setCompanionOpen: (b: boolean) => void;
  enterMindSpace: () => void;
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      view: "landing",
      world: "learn",
      onboarded: false,
      profile: defaultProfile,
      companionName: "Nova",
      companionOpen: false,
      setView: (view) => set({ view }),
      setWorld: (world) => set({ world }),
      setOnboarded: (onboarded) => set({ onboarded }),
      setProfile: (p) => set({ profile: { ...get().profile, ...p } }),
      resetProfile: () => set({ profile: defaultProfile }),
      setCompanionName: (companionName) => set({ companionName }),
      setCompanionOpen: (companionOpen) => set({ companionOpen }),
      enterMindSpace: () => set({ view: "mindspace", onboarded: true }),
    }),
    {
      name: "neurotwin-app",
      partialize: (s) => ({
        onboarded: s.onboarded,
        profile: s.profile,
        companionName: s.companionName,
      }),
    }
  )
);
