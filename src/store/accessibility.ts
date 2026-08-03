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
  sensoryFriendly: boolean; // max reduction: motion + contrast + calm + larger font
  setFont: (f: FontChoice) => void;
  setScale: (s: FontScale) => void;
  setMotion: (m: MotionPref) => void;
  setContrast: (c: ContrastPref) => void;
  setCalm: (c: boolean) => void;
  setSensoryFriendly: (s: boolean) => void;
  toggleFont: () => void;
  toggleMotion: () => void;
  toggleContrast: () => void;
  toggleCalm: () => void;
  toggleSensoryFriendly: () => void;
}

export const useAccessibility = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      font: "default",
      scale: "md",
      motion: "full",
      contrast: "standard",
      calm: false,
      sensoryFriendly: false,
      setFont: (font) => set({ font }),
      setScale: (scale) => set({ scale }),
      setMotion: (motion) => set({ motion }),
      setContrast: (contrast) => set({ contrast }),
      setCalm: (calm) => set({ calm }),
      setSensoryFriendly: (s) =>
        set(s
          ? { sensoryFriendly: true, motion: "reduced", contrast: "high", calm: true, scale: "lg" }
          : { sensoryFriendly: false }
        ),
      toggleFont: () =>
        set({ font: get().font === "dyslexic" ? "default" : "dyslexic" }),
      toggleMotion: () =>
        set({ motion: get().motion === "reduced" ? "full" : "reduced" }),
      toggleContrast: () =>
        set({ contrast: get().contrast === "high" ? "standard" : "high" }),
      toggleCalm: () => set({ calm: !get().calm }),
      toggleSensoryFriendly: () => {
        const next = !get().sensoryFriendly;
        set(next
          ? { sensoryFriendly: true, motion: "reduced", contrast: "high", calm: true, scale: "lg" }
          : { sensoryFriendly: false }
        );
      },
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
