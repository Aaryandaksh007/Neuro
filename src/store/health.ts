"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HealthLog {
  id: string;
  type: "sleep" | "water" | "exercise" | "meal" | "stretch" | "eye-break" | "movement";
  value: number;
  unit: string;
  note?: string;
  createdAt: number;
}

export interface Reminder {
  id: string;
  type: HealthLog["type"];
  label: string;
  cadenceHours: number;
  lastDone: number | null;
}

interface HealthState {
  logs: HealthLog[];
  reminders: Reminder[];
  companionStage: number; // 0-5 growth stage of the digital companion
  addLog: (l: Omit<HealthLog, "id" | "createdAt">) => void;
  markReminderDone: (id: string) => void;
  todaysCount: (type: HealthLog["type"]) => number;
  companionVitals: () => { happiness: number; energy: number; stage: number };
  streak: () => number;
}

const defaultReminders: Reminder[] = [
  { id: "r-water", type: "water", label: "Sip some water", cadenceHours: 2, lastDone: null },
  { id: "r-eye", type: "eye-break", label: "Look 20ft away for 20s", cadenceHours: 1, lastDone: null },
  { id: "r-stretch", type: "stretch", label: "Gentle stretch", cadenceHours: 3, lastDone: null },
  { id: "r-movement", type: "movement", label: "Move for 2 minutes", cadenceHours: 4, lastDone: null },
];

const isSameDay = (a: number, b: number) =>
  new Date(a).toDateString() === new Date(b).toDateString();

export const useHealth = create<HealthState>()(
  persist(
    (set, get) => ({
      logs: [],
      reminders: defaultReminders,
      companionStage: 0,
      addLog: (l) =>
        set((s) => {
          const log: HealthLog = { ...l, id: `h-${Date.now()}`, createdAt: Date.now() };
          const logs = [...s.logs, log].slice(-300);
          // recompute companion stage based on consistency
          const today = Date.now();
          const todayLogs = logs.filter((x) => isSameDay(x.createdAt, today));
          let stage = s.companionStage;
          if (todayLogs.length >= 6) stage = Math.min(5, Math.max(stage, 5));
          else if (todayLogs.length >= 4) stage = Math.min(5, Math.max(stage, 4));
          else if (todayLogs.length >= 3) stage = Math.min(5, Math.max(stage, 3));
          else if (todayLogs.length >= 2) stage = Math.min(5, Math.max(stage, 2));
          else if (todayLogs.length >= 1) stage = Math.min(5, Math.max(stage, 1));
          return { logs, companionStage: stage };
        }),
      markReminderDone: (id) =>
        set((s) => ({
          reminders: s.reminders.map((r) =>
            r.id === id ? { ...r, lastDone: Date.now() } : r
          ),
        })),
      todaysCount: (type) => {
        const today = Date.now();
        return get().logs.filter(
          (l) => l.type === type && isSameDay(l.createdAt, today)
        ).length;
      },
      companionVitals: () => {
        const today = Date.now();
        const todayLogs = get().logs.filter((l) => isSameDay(l.createdAt, today));
        const happiness = Math.min(100, 40 + todayLogs.length * 12);
        const energy = Math.min(100, 30 + todayLogs.length * 14);
        return { happiness, energy, stage: get().companionStage };
      },
      streak: () => {
        const logs = get().logs;
        if (!logs.length) return 0;
        let streak = 0;
        let day = new Date();
        for (let i = 0; i < 60; i++) {
          const has = logs.some((l) => isSameDay(l.createdAt, day.getTime()));
          if (has) {
            streak++;
            day.setDate(day.getDate() - 1);
          } else if (i === 0) {
            day.setDate(day.getDate() - 1);
          } else {
            break;
          }
        }
        return streak;
      },
    }),
    { name: "neurotwin-health" }
  )
);
