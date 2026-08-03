"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type MoodKind =
  | "sunny"
  | "cloudy"
  | "rainy"
  | "stormy"
  | "foggy"
  | "starry";

export interface MoodEntry {
  id: string;
  mood: MoodKind;
  energy: number; // 0-100
  note: string;
  createdAt: number;
}

export interface TinyVictory {
  id: string;
  text: string;
  createdAt: number;
}

export interface GratitudeNote {
  id: string;
  text: string;
  createdAt: number;
}

export interface BrainWeather {
  clarity: number; // 0-100
  focus: number;
  calm: number;
  energy: number;
}

interface WellnessState {
  moods: MoodEntry[];
  victories: TinyVictory[];
  gratitudes: GratitudeNote[];
  brainWeather: BrainWeather;
  calmRoomActive: boolean;
  addMood: (m: Omit<MoodEntry, "id" | "createdAt">) => void;
  addVictory: (text: string) => void;
  addGratitude: (text: string) => void;
  setBrainWeather: (b: Partial<BrainWeather>) => void;
  setCalmRoom: (b: boolean) => void;
  latestMood: () => MoodEntry | undefined;
}

export const useWellness = create<WellnessState>()(
  persist(
    (set, get) => ({
      moods: [],
      victories: [],
      gratitudes: [],
      brainWeather: { clarity: 60, focus: 50, calm: 60, energy: 55 },
      calmRoomActive: false,
      addMood: (m) =>
        set((s) => ({
          moods: [
            ...s.moods,
            { ...m, id: `m-${Date.now()}`, createdAt: Date.now() },
          ].slice(-50),
        })),
      addVictory: (text) =>
        set((s) => ({
          victories: [
            ...s.victories,
            { text, id: `v-${Date.now()}`, createdAt: Date.now() },
          ],
        })),
      addGratitude: (text) =>
        set((s) => ({
          gratitudes: [
            ...s.gratitudes,
            { text, id: `g-${Date.now()}`, createdAt: Date.now() },
          ],
        })),
      setBrainWeather: (b) =>
        set((s) => ({ brainWeather: { ...s.brainWeather, ...b } })),
      setCalmRoom: (calmRoomActive) => set({ calmRoomActive }),
      latestMood: () => {
        const list = get().moods;
        return list.length ? list[list.length - 1] : undefined;
      },
    }),
    { name: "neurotwin-wellness" }
  )
);

export const moodMeta: Record<
  MoodKind,
  { label: string; emoji: string; desc: string; gradient: string }
> = {
  sunny: {
    label: "Sunny",
    emoji: "☀️",
    desc: "Clear and bright",
    gradient: "from-amber-200/60 to-amber-100/40",
  },
  cloudy: {
    label: "Cloudy",
    emoji: "⛅",
    desc: "A bit muted",
    gradient: "from-slate-200/60 to-slate-100/40",
  },
  rainy: {
    label: "Rainy",
    emoji: "🌧️",
    desc: "Heavy and slow",
    gradient: "from-sky-200/50 to-sky-100/30",
  },
  stormy: {
    label: "Stormy",
    emoji: "⛈️",
    desc: "Overwhelming right now",
    gradient: "from-violet-200/50 to-slate-200/40",
  },
  foggy: {
    label: "Foggy",
    emoji: "🌫️",
    desc: "Hard to think clearly",
    gradient: "from-zinc-200/60 to-zinc-100/40",
  },
  starry: {
    label: "Starry",
    emoji: "✨",
    desc: "Quiet and reflective",
    gradient: "from-indigo-200/40 to-violet-100/30",
  },
};
