"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  FlaskConical,
  Play,
  Pause,
  RotateCcw,
  Droplet,
  Sun,
  Cloud,
  ArrowDown,
  ArrowUp,
  type LucideIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

type SimKey = "water-cycle" | "fractions" | "ph-scale";

interface SimDef {
  key: SimKey;
  label: string;
  icon: LucideIcon;
  desc: string;
}

const SIMS: SimDef[] = [
  {
    key: "water-cycle",
    label: "Water Cycle",
    icon: Cloud,
    desc: "Watch water move through the sky",
  },
  {
    key: "fractions",
    label: "Fractions",
    icon: FlaskConical,
    desc: "See parts of a whole",
  },
  {
    key: "ph-scale",
    label: "pH Scale",
    icon: Droplet,
    desc: "Explore acids and bases",
  },
];

export function InteractiveSimulations() {
  const [active, setActive] = useState<SimKey>("water-cycle");
  const reduced = useReducedMotion();

  return (
    <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
      <Card className="overflow-hidden border-border/60 nt-shadow-soft">
        <div className="p-4 sm:p-5 border-b border-border/50">
          <div className="flex items-center gap-2 mb-1">
            <span className="size-8 rounded-lg bg-plum/15 flex items-center justify-center">
              <FlaskConical className="size-4 text-plum" />
            </span>
            <div>
              <h3 className="text-sm font-semibold leading-tight">
                Interactive Simulations
              </h3>
              <p className="text-xs text-muted-foreground">
                Play with concepts — they make sense when you move them
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          <Tabs value={active} onValueChange={(v) => setActive(v as SimKey)}>
            <TabsList className="h-auto rounded-full p-1 bg-muted/60 w-full sm:w-fit">
              {SIMS.map((s) => (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="rounded-full px-3 py-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm flex-1 sm:flex-initial"
                >
                  <s.icon className="size-3.5 mr-1.5" />
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{s.label.split(" ")[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="water-cycle" className="mt-4 outline-none">
              <WaterCycleSim reduced={reduced} />
            </TabsContent>
            <TabsContent value="fractions" className="mt-4 outline-none">
              <FractionsSim />
            </TabsContent>
            <TabsContent value="ph-scale" className="mt-4 outline-none">
              <PHScaleSim />
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </MotionDiv>
  );
}

/* ===================== Water Cycle Simulation ===================== */
function WaterCycleSim({ reduced }: { reduced: boolean | null }) {
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState(0); // 0-100 cycle
  const twin = useTwin((s) => s.bumpTrait);
  const { toast } = useToast();

  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + speed * 0.5) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, [playing, speed]);

  const reset = () => {
    setPhase(0);
    setSpeed(1);
    setPlaying(true);
    twin("curiosity", 2, "Explored the water cycle simulation.");
  };

  // Phase: 0-25 evaporation, 25-50 condensation, 50-75 precipitation, 75-100 collection
  const phaseName =
    phase < 25 ? "Evaporation" : phase < 50 ? "Condensation" : phase < 75 ? "Precipitation" : "Collection";
  const phaseDesc =
    phase < 25
      ? "Sun heats water → it rises as vapor"
      : phase < 50
        ? "Vapor cools → forms clouds"
        : phase < 75
          ? "Drops get heavy → rain falls"
          : "Water flows back → ready to repeat";

  return (
    <div>
      <div
        className="relative h-64 rounded-xl overflow-hidden border border-border/40"
        style={{
          background: "linear-gradient(to bottom, oklch(0.85 0.08 200 / 0.2), oklch(0.9 0.05 180 / 0.1))",
        }}
        aria-label="Water cycle simulation"
        role="img"
      >
        {/* Sun */}
        <motion.div
          className="absolute top-3 right-3"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={reduced ? undefined : { duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="size-8 text-amber-glow-foreground" />
        </motion.div>

        {/* Cloud (moves in based on condensation phase) */}
        <motion.div
          className="absolute top-8 left-1/2 -translate-x-1/2"
          animate={{
            opacity: phase > 15 && phase < 75 ? 1 : 0.2,
            x: phase > 25 && phase < 50 ? (phase - 25) * 2 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <Cloud className="size-12 text-muted-foreground/60" />
        </motion.div>

        {/* Evaporation arrows (phase 0-25) */}
        {phase < 30 && (
          <div className="absolute bottom-20 left-1/3">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                initial={reduced ? undefined : { y: 0, opacity: 0 }}
                animate={reduced ? undefined : { y: -60, opacity: [0, 1, 0] }}
                transition={{
                  duration: 2,
                  delay: i * 0.6,
                  repeat: Infinity,
                }}
                className="text-primary/50"
                style={{ marginLeft: i * 20 }}
              >
                <ArrowUp className="size-4" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Rain (phase 50-75) */}
        {phase >= 50 && phase < 80 && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 w-32">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                initial={reduced ? undefined : { y: 0, opacity: 0 }}
                animate={reduced ? undefined : { y: 100, opacity: [0, 1, 0] }}
                transition={{
                  duration: 1,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
                style={{ left: `${i * 12}px` }}
              >
                <Droplet className="size-3 text-primary/60 fill-primary/40" />
              </motion.div>
            ))}
          </div>
        )}

        {/* Water body at bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 rounded-b-xl"
          style={{
            background: "linear-gradient(to bottom, oklch(0.7 0.1 200 / 0.3), oklch(0.6 0.12 200 / 0.5))",
          }}
        >
          {/* Wave animation */}
          {!reduced && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1"
              style={{ background: "oklch(0.8 0.08 200 / 0.4)" }}
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </div>

        {/* Phase label */}
        <div className="absolute top-3 left-3 rounded-lg bg-background/80 backdrop-blur px-3 py-1.5">
          <p className="text-xs font-semibold text-foreground">{phaseName}</p>
          <p className="text-[10px] text-muted-foreground">{phaseDesc}</p>
        </div>

        {/* Progress bar */}
        <div className="absolute bottom-2 left-3 right-3 h-1 rounded-full bg-background/50 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary via-amber-glow to-primary"
            style={{ width: `${phase}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="mt-4 flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setPlaying((p) => !p)}
          className="gap-1.5 rounded-full"
        >
          {playing ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          {playing ? "Pause" : "Play"}
        </Button>
        <Button size="sm" variant="ghost" onClick={reset} className="gap-1.5 rounded-full">
          <RotateCcw className="size-3.5" /> Reset
        </Button>
        <div className="flex-1 flex items-center gap-2">
          <span className="text-xs text-muted-foreground shrink-0">Speed</span>
          <Slider
            value={[speed]}
            onValueChange={(v) => setSpeed(v[0])}
            min={0.5}
            max={3}
            step={0.5}
            className="flex-1"
            aria-label="Simulation speed"
          />
          <span className="text-xs font-medium tabular-nums w-8">{speed}×</span>
        </div>
      </div>
    </div>
  );
}

/* ===================== Fractions Simulation ===================== */
function FractionsSim() {
  const [numerator, setNumerator] = useState(3);
  const [denominator, setDenominator] = useState(4);
  const twin = useTwin((s) => s.bumpTrait);

  useEffect(() => {
    twin("curiosity", 1, "Explored the fractions simulation.");
  }, [twin]);

  const segments = Array.from({ length: denominator }).map((_, i) => i < numerator);
  const decimal = (numerator / denominator).toFixed(2);
  const percent = Math.round((numerator / denominator) * 100);

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Circle visualization */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/40 bg-muted/20 p-6">
          <svg viewBox="0 0 100 100" className="size-40">
            {segments.map((filled, i) => {
              const angle = (i / denominator) * 360;
              const startAngle = (i / denominator) * 2 * Math.PI - Math.PI / 2;
              const endAngle = ((i + 1) / denominator) * 2 * Math.PI - Math.PI / 2;
              const x1 = 50 + 45 * Math.cos(startAngle);
              const y1 = 50 + 45 * Math.sin(startAngle);
              const x2 = 50 + 45 * Math.cos(endAngle);
              const y2 = 50 + 45 * Math.sin(endAngle);
              const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
              return (
                <path
                  key={i}
                  d={`M 50 50 L ${x1} ${y1} A 45 45 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={filled ? "oklch(0.74 0.12 155 / 0.8)" : "oklch(0.9 0.01 150 / 0.3)"}
                  stroke="oklch(0.6 0.02 150)"
                  strokeWidth="0.5"
                />
              );
            })}
            <circle cx="50" cy="50" r="45" fill="none" stroke="oklch(0.5 0.02 150)" strokeWidth="1" />
          </svg>
          <p className="mt-3 text-2xl font-bold tabular-nums">
            {numerator}/{denominator}
          </p>
        </div>

        {/* Bar visualization + controls */}
        <div className="space-y-4">
          <div>
            <div className="flex h-8 rounded-lg overflow-hidden border border-border/40">
              {segments.map((filled, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-1 border-r border-border/40 last:border-r-0 transition-colors",
                    filled ? "bg-primary/70" : "bg-muted/40"
                  )}
                />
              ))}
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
              <span>0</span>
              <span>1</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-muted/30 p-2.5 text-center">
              <p className="text-muted-foreground">Decimal</p>
              <p className="text-lg font-bold tabular-nums text-primary">{decimal}</p>
            </div>
            <div className="rounded-lg bg-muted/30 p-2.5 text-center">
              <p className="text-muted-foreground">Percent</p>
              <p className="text-lg font-bold tabular-nums text-amber-glow-foreground">{percent}%</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Parts shaded (numerator)</label>
              <span className="text-xs font-medium tabular-nums">{numerator}</span>
            </div>
            <Slider
              value={[numerator]}
              onValueChange={(v) => setNumerator(Math.min(v[0], denominator))}
              min={0}
              max={denominator}
              step={1}
              aria-label="Numerator"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-muted-foreground">Total parts (denominator)</label>
              <span className="text-xs font-medium tabular-nums">{denominator}</span>
            </div>
            <Slider
              value={[denominator]}
              onValueChange={(v) => {
                setDenominator(v[0]);
                if (numerator > v[0]) setNumerator(v[0]);
              }}
              min={2}
              max={12}
              step={1}
              aria-label="Denominator"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================== pH Scale Simulation ===================== */
function PHScaleSim() {
  const [ph, setPh] = useState(7);
  const twin = useTwin((s) => s.bumpTrait);

  useEffect(() => {
    twin("curiosity", 1, "Explored the pH scale simulation.");
  }, [twin]);

  const phColor = (p: number) => {
    if (p < 3) return "oklch(0.6 0.2 25)"; // red
    if (p < 5) return "oklch(0.7 0.15 40)"; // orange
    if (p < 6) return "oklch(0.8 0.12 70)"; // yellow
    if (p < 8) return "oklch(0.8 0.08 150)"; // green
    if (p < 9) return "oklch(0.7 0.1 180)"; // teal
    if (p < 11) return "oklch(0.6 0.12 240)"; // blue
    return "oklch(0.5 0.15 280)"; // purple
  };

  const phLabel = (p: number) => {
    if (p < 3) return "Strong acid";
    if (p < 7) return "Acidic";
    if (p === 7) return "Neutral";
    if (p < 11) return "Basic";
    return "Strong base";
  };

  const examples = (p: number) => {
    if (p < 3) return "Lemon juice, vinegar";
    if (p < 5) return "Tomato, coffee";
    if (p < 7) return "Milk, rain water";
    if (p === 7) return "Pure water";
    if (p < 9) return "Blood, seawater";
    if (p < 11) return "Soap, baking soda";
    return "Bleach, drain cleaner";
  };

  return (
    <div>
      <div className="flex flex-col items-center rounded-xl border border-border/40 bg-muted/20 p-6">
        {/* Liquid tube */}
        <div className="relative w-16 h-48 rounded-full border-2 border-border bg-muted/40 overflow-hidden">
          <motion.div
            className="absolute bottom-0 left-0 right-0"
            animate={{ height: `${100 - (ph / 14) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ background: phColor(ph) }}
          />
          {/* Level marks */}
          {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((mark) => (
            <div
              key={mark}
              className="absolute right-0 flex items-center gap-1"
              style={{ bottom: `${(mark / 14) * 100}%` }}
            >
              <div className="w-2 h-px bg-border" />
              <span className="text-[8px] text-muted-foreground tabular-nums">{mark}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 text-center">
          <p className="text-4xl font-bold tabular-nums" style={{ color: phColor(ph) }}>
            {ph}
          </p>
          <p className="text-sm font-medium mt-1" style={{ color: phColor(ph) }}>
            {phLabel(ph)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{examples(ph)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Acid ← pH → Base</span>
          <span className="text-xs font-medium tabular-nums">pH {ph}</span>
        </div>
        <div
          className="h-3 rounded-full mb-3"
          style={{
            background:
              "linear-gradient(to right, oklch(0.6 0.2 25), oklch(0.8 0.12 70), oklch(0.8 0.08 150), oklch(0.7 0.1 180), oklch(0.5 0.15 280))",
          }}
        />
        <Slider
          value={[ph]}
          onValueChange={(v) => setPh(v[0])}
          min={0}
          max={14}
          step={1}
          aria-label="pH level"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>0</span>
          <span>7</span>
          <span>14</span>
        </div>
      </div>
    </div>
  );
}
