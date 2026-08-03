"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type FontChoice = "default" | "dyslexic";
export type FontScale = "md" | "lg" | "xl" | "xxl";
export type MotionPref = "full" | "reduced";
export type ContrastPref = "standard" | "high";
export type ThemePref = "light" | "dark" | "system";

interface AccessibilityState {
  font: FontChoice;
  scale: FontScale;
  motion: MotionPref;
  contrast: ContrastPref;
  calm: boolean; // calm mode softens intensity when overwhelmed
  setFont: (f: FontChoice) => void;
  setScale: (s: FontScale) => void;
  setMotion: (m: MotionPref) => void;
  setContrast: (c: ContrastPref) => void;
  setCalm: (c: boolean) => void;
  toggleFont: () => void;
  toggleMotion: () => void;
  toggleContrast: () => void;
  toggleCalm: () => void;
}

export const useAccessibility = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      font: "default",
      scale: "md",
      motion: "full",
      contrast: "standard",
      calm: false,
      setFont: (font) => set({ font }),
      setScale: (scale) => set({ scale }),
      setMotion: (motion) => set({ motion }),
      setContrast: (contrast) => set({ contrast }),
      setCalm: (calm) => set({ calm }),
      toggleFont: () =>
        set({ font: get().font === "dyslexic" ? "default" : "dyslexic" }),
      toggleMotion: () =>
        set({ motion: get().motion === "reduced" ? "full" : "reduced" }),
      toggleContrast: () =>
        set({ contrast: get().contrast === "high" ? "standard" : "high" }),
      toggleCalm: () => set({ calm: !get().calm }),
    }),
    {
      name: "neurotwin-a11y",
      onRehydrateStorage: () => (state) => {
        if (state && typeof window !== "undefined") {
          const prefersReduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
          ).matches;
          if (prefersReduced && !state.motion) state.motion = "reduced";
        }
      },
    }
  )
);
