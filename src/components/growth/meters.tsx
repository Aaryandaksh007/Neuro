"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Compass, Mountain, Heart, CalendarCheck } from "lucide-react";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useHealth } from "@/store/health";

interface MeterDef {
  key: string;
  label: string;
  meaning: string;
  value: number;
  icon: typeof Compass;
  color: string;
}

function MeterRing({ def, index }: { def: MeterDef; index: number }) {
  const reduced = useReducedMotion();
  const v = Math.max(0, Math.min(100, def.value));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (v / 100) * circumference;
  const Icon = def.icon;

  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="flex flex-col items-center text-center"
    >
      <div
        className="relative size-20 sm:size-24"
        role="img"
        aria-label={`${def.label}: ${Math.round(v)} out of 100. ${def.meaning}`}
      >
        <svg className="size-full -rotate-90" viewBox="0 0 80 80" aria-hidden>
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="oklch(0.85 0.02 150 / 0.25)"
            strokeWidth="6"
          />
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={def.color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={reduced ? false : { strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{
              delay: 0.2 + index * 0.08,
              duration: 1,
              ease: "easeOut",
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon
            className="size-3.5 sm:size-4 mb-0.5"
            style={{ color: def.color }}
            aria-hidden
          />
          <span className="text-base sm:text-lg font-semibold tabular-nums text-foreground">
            {Math.round(v)}
          </span>
        </div>
      </div>
      <div className="mt-2 px-1">
        <div className="text-sm font-medium text-foreground">{def.label}</div>
        <div className="text-xs text-muted-foreground mt-0.5 leading-tight">
          {def.meaning}
        </div>
      </div>
    </motion.div>
  );
}

export default function Meters() {
  const curiosity = useTwin((s) => s.traits.curiosity?.value ?? 50);
  const persistence = useGrowth((s) => s.persistence);
  const kindness = useGrowth((s) => s.kindness);
  const streak = useHealth((s) => s.streak());

  const consistency = Math.min(100, streak * 12);

  const meters: MeterDef[] = [
    {
      key: "curiosity",
      label: "Curiosity",
      meaning: "Following what lights you up",
      value: curiosity,
      icon: Compass,
      color: "oklch(0.74 0.12 155)",
    },
    {
      key: "persistence",
      label: "Persistence",
      meaning: "Returning to hard things, gently",
      value: persistence,
      icon: Mountain,
      color: "oklch(0.62 0.13 330)",
    },
    {
      key: "kindness",
      label: "Kindness",
      meaning: "Care you give yourself and others",
      value: kindness,
      icon: Heart,
      color: "oklch(0.78 0.09 15)",
    },
    {
      key: "consistency",
      label: "Consistency",
      meaning:
        streak === 0
          ? "Showing up — even once — counts"
          : `${streak}-day streak of showing up`,
      value: consistency,
      icon: CalendarCheck,
      color: "oklch(0.82 0.13 80)",
    },
  ];

  return (
    <section
      aria-label="Growth Meters"
      className="rounded-2xl border nt-shadow-soft nt-gradient-plum bg-card p-4 sm:p-6 h-full"
    >
      <header className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Compass className="size-4 text-plum" aria-hidden />
          <span className="text-xs uppercase tracking-wider font-semibold text-plum/80">
            Growth Meters
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          Qualities, not scores
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          These never go down because of a &quot;bad day.&quot; They grow when
          you do.
        </p>
      </header>
      <div className="grid grid-cols-2 gap-4 sm:gap-5">
        {meters.map((m, i) => (
          <MeterRing key={m.key} def={m} index={i} />
        ))}
      </div>
    </section>
  );
}
