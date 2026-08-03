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
  Zap,
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

type SimKey = "water-cycle" | "fractions" | "ph-scale" | "photosynthesis" | "gravity" | "circuits" | "waves" | "chemistry";

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
  {
    key: "photosynthesis",
    label: "Photosynthesis",
    icon: Sun,
    desc: "How plants make food from light",
  },
  {
    key: "gravity",
    label: "Gravity",
    icon: ArrowDown,
    desc: "Drop things, see gravity work",
  },
  {
    key: "circuits",
    label: "Circuits",
    icon: Zap,
    desc: "Build a path for electricity",
  },
  {
    key: "waves",
    label: "Waves",
    icon: Droplet,
    desc: "See waves interfere",
  },
  {
    key: "chemistry",
    label: "Chemistry",
    icon: FlaskConical,
    desc: "Mix elements, see reactions",
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
            <TabsContent value="photosynthesis" className="mt-4 outline-none">
              <PhotosynthesisSim reduced={reduced} />
            </TabsContent>
            <TabsContent value="gravity" className="mt-4 outline-none">
              <GravitySim reduced={reduced} />
            </TabsContent>
            <TabsContent value="circuits" className="mt-4 outline-none">
              <CircuitSim />
            </TabsContent>
            <TabsContent value="waves" className="mt-4 outline-none">
              <WaveSim reduced={reduced} />
            </TabsContent>
            <TabsContent value="chemistry" className="mt-4 outline-none">
              <ChemistrySim />
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

/* ===================== Photosynthesis Simulation ===================== */
function PhotosynthesisSim({ reduced }: { reduced: boolean | null }) {
  const [light, setLight] = useState(60); // sunlight intensity 0-100
  const [water, setWater] = useState(50); // water 0-100
  const [co2, setCo2] = useState(40); // CO2 0-100
  const twin = useTwin((s) => s.bumpTrait);

  useEffect(() => {
    twin("curiosity", 1, "Explored the photosynthesis simulation.");
  }, [twin]);

  // Glucose output = min of the three (limiting factor principle)
  const glucose = Math.min(light, water, co2);
  const oxygen = Math.round(glucose * 0.8);

  return (
    <div>
      <div
        className="relative h-64 rounded-xl overflow-hidden border border-border/40"
        style={{
          background: `linear-gradient(to bottom, oklch(0.85 0.08 ${60 + light * 0.3} / ${0.15 + light * 0.003}), oklch(0.78 0.1 155 / 0.1))`,
        }}
        role="img"
        aria-label="Photosynthesis simulation"
      >
        {/* Sun (brightness scales with light) */}
        <motion.div
          className="absolute top-3 right-3"
          animate={reduced ? undefined : { rotate: 360 }}
          transition={reduced ? undefined : { duration: 25, repeat: Infinity, ease: "linear" }}
          style={{ opacity: 0.3 + (light / 100) * 0.7 }}
        >
          <Sun className="size-10 text-amber-glow-foreground" />
        </motion.div>

        {/* Light rays */}
        {!reduced && light > 20 &&
          [0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${30 + i * 12}%`, top: "15%" }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, light / 150, 0], y: [0, 80] }}
              transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
            >
              <div
                className="w-0.5 h-8 rounded-full"
                style={{ background: "oklch(0.84 0.13 80 / 0.6)" }}
              />
            </motion.div>
          ))}

        {/* Plant */}
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2">
          <svg viewBox="0 0 100 120" className="size-32">
            {/* Pot */}
            <path d="M25 90 L30 115 L70 115 L75 90 Z" fill="oklch(0.6 0.08 40)" />
            <rect x="23" y="85" width="54" height="8" rx="2" fill="oklch(0.55 0.09 35)" />
            {/* Stem */}
            <rect
              x="47"
              y={90 - glucose * 0.5}
              width="6"
              height={glucose * 0.5}
              fill="oklch(0.55 0.12 150)"
            />
            {/* Leaves (more with higher glucose) */}
            {glucose > 10 && (
              <ellipse cx="35" cy={85 - glucose * 0.2} rx="12" ry="6" fill="oklch(0.65 0.13 155)" transform={`rotate(-20 35 ${85 - glucose * 0.2})`} />
            )}
            {glucose > 25 && (
              <ellipse cx="65" cy={80 - glucose * 0.2} rx="12" ry="6" fill="oklch(0.7 0.12 155)" transform={`rotate(20 65 ${80 - glucose * 0.2})`} />
            )}
            {glucose > 50 && (
              <ellipse cx="40" cy={65 - glucose * 0.1} rx="10" ry="5" fill="oklch(0.72 0.11 155)" transform={`rotate(-15 40 ${65 - glucose * 0.1})`} />
            )}
            {glucose > 75 && (
              <circle cx="50" cy="50" r="6" fill="oklch(0.84 0.13 80)" />
            )}
          </svg>
        </div>

        {/* Oxygen bubbles rising */}
        {!reduced && oxygen > 10 &&
          [0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{ left: `${45 + i * 8}%`, bottom: "40%" }}
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: [0, oxygen / 120, 0], y: [0, -60] }}
              transition={{ duration: 2, delay: i * 0.6, repeat: Infinity }}
            >
              <div className="size-2 rounded-full border border-primary/50" />
            </motion.div>
          ))}

        {/* Output labels */}
        <div className="absolute top-3 left-3 rounded-lg bg-background/80 backdrop-blur px-3 py-1.5">
          <p className="text-xs font-semibold">Glucose: <span className="text-primary tabular-nums">{Math.round(glucose)}%</span></p>
          <p className="text-[10px] text-muted-foreground">Oxygen: {oxygen}% · The limiting factor wins</p>
        </div>
      </div>

      {/* Sliders */}
      <div className="mt-4 space-y-3">
        <SliderRow label="Sunlight" value={light} onChange={setLight} color="oklch(0.84 0.13 80)" icon={<Sun className="size-3.5" />} />
        <SliderRow label="Water" value={water} onChange={setWater} color="oklch(0.7 0.1 200)" icon={<Droplet className="size-3.5" />} />
        <SliderRow label="CO₂" value={co2} onChange={setCo2} color="oklch(0.6 0.05 150)" icon={<Cloud className="size-3.5" />} />
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Plants need all three. Whichever is lowest limits growth — that&apos;s the
        &ldquo;limiting factor.&rdquo; Balance them to maximize glucose.
      </p>
    </div>
  );
}

function SliderRow({ label, value, onChange, color, icon }: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          {icon} {label}
        </span>
        <span className="text-xs font-medium tabular-nums" style={{ color }}>{value}%</span>
      </div>
      <Slider value={[value]} onValueChange={(v) => onChange(v[0])} min={0} max={100} step={5} aria-label={label} />
    </div>
  );
}

/* ===================== Gravity Simulation ===================== */
function GravitySim({ reduced }: { reduced: boolean | null }) {
  const [planet, setPlanet] = useState<"earth" | "moon" | "jupiter">("earth");
  const [height, setHeight] = useState(50);
  const [dropping, setDropping] = useState(false);
  const [dropY, setDropY] = useState(0);
  const twin = useTwin((s) => s.bumpTrait);

  const gravity = { earth: 9.8, moon: 1.6, jupiter: 24.8 }[planet];
  const fallTime = Math.sqrt((2 * height) / gravity);
  const impactSpeed = Math.sqrt(2 * gravity * height);

  useEffect(() => {
    twin("curiosity", 1, "Explored the gravity simulation.");
  }, [twin]);

  useEffect(() => {
    if (!dropping) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const dist = 0.5 * gravity * elapsed * elapsed;
      const pct = Math.min(100, (dist / height) * 100);
      setDropY(pct);
      if (pct >= 100) {
        clearInterval(interval);
        queueMicrotask(() => setDropping(false));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [dropping, gravity, height]);

  const planetColor = {
    earth: "oklch(0.6 0.1 220)",
    moon: "oklch(0.75 0.02 60)",
    jupiter: "oklch(0.7 0.08 40)",
  }[planet];

  return (
    <div>
      <div className="relative h-64 rounded-xl overflow-hidden border border-border/40 bg-gradient-to-b from-background to-muted/30">
        {/* Ball */}
        <motion.div
          className="absolute left-1/2 -translate-x-1/2 size-8 rounded-full"
          style={{
            top: `${10 + dropY * 0.7}%`,
            background: planetColor,
            boxShadow: `0 0 12px ${planetColor}`,
          }}
          animate={reduced ? undefined : undefined}
        />

        {/* Ground */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-muted to-transparent border-t border-border/40" />

        {/* Height marker */}
        <div className="absolute left-4 top-4 bottom-12 w-px bg-border/40">
          <div className="absolute -left-1 w-2 h-px bg-border/60" style={{ top: 0 }} />
          <div className="absolute -left-8 -translate-y-1/2 text-[10px] text-muted-foreground tabular-nums" style={{ top: `${100 - height}%` }}>
            {height}m
          </div>
        </div>

        {/* Stats */}
        <div className="absolute top-3 right-3 rounded-lg bg-background/80 backdrop-blur px-3 py-1.5 text-right">
          <p className="text-xs font-semibold">g = {gravity} m/s²</p>
          <p className="text-[10px] text-muted-foreground">Fall: {fallTime.toFixed(2)}s · Impact: {impactSpeed.toFixed(1)} m/s</p>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex gap-1.5">
          {(["earth", "moon", "jupiter"] as const).map((p) => (
            <button
              key={p}
              onClick={() => { setPlanet(p); setDropY(0); }}
              aria-pressed={planet === p}
              className={cn(
                "flex-1 rounded-lg border py-2 text-xs font-medium capitalize transition-all",
                planet === p ? "border-primary bg-primary/15 text-primary" : "hover:bg-accent"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <SliderRow label="Drop height" value={height} onChange={(v) => { setHeight(v); setDropY(0); }} color="oklch(0.7 0.1 200)" icon={<ArrowUp className="size-3.5" />} />
        <Button onClick={() => setDropping(true)} disabled={dropping} className="w-full rounded-full gap-1.5" size="sm">
          {dropping ? "Falling…" : "Drop it"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Same height, different planets → different fall times. Higher gravity =
        faster fall. The moon is gentle; Jupiter is intense.
      </p>
    </div>
  );
}

/* ===================== Circuit Simulation ===================== */
function CircuitSim() {
  const [battery, setBattery] = useState(true);
  const [wire1, setWire1] = useState(true);
  const [bulb, setBulb] = useState(true);
  const [wire2, setWire2] = useState(true);
  const twin = useTwin((s) => s.bumpTrait);
  const reduced = useReducedMotion();

  useEffect(() => {
    twin("curiosity", 1, "Explored the circuits simulation.");
  }, [twin]);

  const complete = battery && wire1 && bulb && wire2;
  const flowing = complete;

  return (
    <div>
      <div className="relative h-56 rounded-xl overflow-hidden border border-border/40 bg-muted/20 p-6">
        <svg viewBox="0 0 300 200" className="w-full h-full">
          {/* Wire path (top: battery → wire1 → bulb → wire2 → back) */}
          <path
            d="M 50 150 L 50 50 L 120 50 L 120 80 M 120 120 L 120 150 L 50 150"
            fill="none"
            stroke={complete ? "oklch(0.7 0.1 200)" : "oklch(0.7 0.02 150 / 0.3)"}
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Right side wire (always connected if bulb present) */}
          <path
            d="M 180 50 L 250 50 L 250 150 L 120 150"
            fill="none"
            stroke={complete ? "oklch(0.7 0.1 200)" : "oklch(0.7 0.02 150 / 0.3)"}
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Battery (left) */}
          <g onClick={() => setBattery((v) => !v)} className="cursor-pointer">
            <rect x="38" y="90" width="24" height="20" rx="2" fill={battery ? "oklch(0.7 0.1 200)" : "oklch(0.8 0.01 150)"} stroke="oklch(0.5 0.02 150)" strokeWidth="1" />
            <text x="50" y="125" textAnchor="middle" className="text-[8px] fill-muted-foreground">Battery</text>
            {!battery && <text x="50" y="85" textAnchor="middle" className="text-[8px] fill-rose-soft-foreground">✕</text>}
          </g>

          {/* Wire 1 (top left) */}
          <g onClick={() => setWire1((v) => !v)} className="cursor-pointer">
            <line x1="50" y1="50" x2="120" y2="50" stroke={wire1 ? "transparent" : "oklch(0.6 0.02 150 / 0.5)"} strokeWidth="6" strokeLinecap="round" strokeDasharray={wire1 ? "0" : "4 4"} />
            {!wire1 && <text x="85" y="42" textAnchor="middle" className="text-[8px] fill-rose-soft-foreground">✕ broken</text>}
          </g>

          {/* Bulb (center) */}
          <g onClick={() => setBulb((v) => !v)} className="cursor-pointer">
            <circle cx="150" cy="50" r="20" fill={bulb && flowing ? "oklch(0.9 0.15 80)" : bulb ? "oklch(0.85 0.02 80)" : "oklch(0.8 0.01 150)"} stroke="oklch(0.5 0.02 150)" strokeWidth="1.5" />
            {bulb && flowing && (
              <circle cx="150" cy="50" r="28" fill="oklch(0.9 0.15 80 / 0.3)" className={reduced ? "" : "nt-breathe"} />
            )}
            <text x="150" y="85" textAnchor="middle" className="text-[8px] fill-muted-foreground">Bulb</text>
            {!bulb && <text x="150" y="40" textAnchor="middle" className="text-[8px] fill-rose-soft-foreground">✕ missing</text>}
          </g>

          {/* Wire 2 (bottom) */}
          <g onClick={() => setWire2((v) => !v)} className="cursor-pointer">
            <line x1="120" y1="150" x2="250" y2="150" stroke={wire2 ? "transparent" : "oklch(0.6 0.02 150 / 0.5)"} strokeWidth="6" strokeLinecap="round" strokeDasharray={wire2 ? "0" : "4 4"} />
            {!wire2 && <text x="185" y="165" textAnchor="middle" className="text-[8px] fill-rose-soft-foreground">✕ broken</text>}
          </g>

          {/* Current flow animation */}
          {flowing && !reduced && (
            <circle r="3" fill="oklch(0.84 0.13 80)">
              <animateMotion dur="2s" repeatCount="indefinite" path="M 50 150 L 50 50 L 250 50 L 250 150 L 50 150" />
            </circle>
          )}
        </svg>

        {/* Status */}
        <div className="absolute top-3 right-3 rounded-lg bg-background/80 backdrop-blur px-3 py-1.5">
          <p className={cn("text-xs font-semibold", flowing ? "text-amber-glow-foreground" : "text-muted-foreground")}>
            {flowing ? "⚡ Circuit complete — bulb on!" : "Circuit broken"}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        {[
          { label: "Battery", state: battery, set: setBattery },
          { label: "Wire 1", state: wire1, set: setWire1 },
          { label: "Bulb", state: bulb, set: setBulb },
          { label: "Wire 2", state: wire2, set: setWire2 },
        ].map((c) => (
          <button
            key={c.label}
            onClick={() => c.set((v: boolean) => !v)}
            className={cn(
              "rounded-lg border py-2 px-3 text-xs font-medium transition-all flex items-center justify-between",
              c.state ? "border-primary bg-primary/10 text-primary" : "border-rose-soft/40 bg-rose-soft/5 text-rose-soft-foreground"
            )}
          >
            {c.label}
            <span className="text-[10px]">{c.state ? "✓ connected" : "✕ broken"}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Electricity needs a complete loop. Tap any part to break or fix it. The
        bulb only lights when the whole circuit is connected.
      </p>
    </div>
  );
}

/* ===================== Wave Interference Simulation ===================== */
function WaveSim({ reduced }: { reduced: boolean | null }) {
  const [freq1, setFreq1] = useState(2);
  const [freq2, setFreq2] = useState(3);
  const [amp1, setAmp1] = useState(20);
  const [amp2, setAmp2] = useState(15);
  const [phase, setPhase] = useState(0);
  const twin = useTwin((s) => s.bumpTrait);

  useEffect(() => {
    twin("curiosity", 1, "Explored the wave interference simulation.");
  }, [twin]);

  useEffect(() => {
    if (reduced) return;
    const interval = setInterval(() => {
      setPhase((p) => (p + 0.08) % (Math.PI * 2));
    }, 40);
    return () => clearInterval(interval);
  }, [reduced]);

  // Generate wave points
  const width = 280;
  const height = 120;
  const points = 80;
  const wave1Points: string[] = [];
  const wave2Points: string[] = [];
  const combinedPoints: string[] = [];

  for (let i = 0; i <= points; i++) {
    const x = (i / points) * width;
    const t = (i / points) * Math.PI * 4;
    const y1 = height / 2 + amp1 * Math.sin(freq1 * t + phase);
    const y2 = height / 2 + amp2 * Math.sin(freq2 * t + phase * 1.2);
    const yc = height / 2 + (y1 - height / 2) + (y2 - height / 2);
    wave1Points.push(`${x},${y1}`);
    wave2Points.push(`${x},${y2}`);
    combinedPoints.push(`${x},${yc}`);
  }

  return (
    <div>
      <div className="rounded-xl border border-border/40 bg-muted/20 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
          {/* Center line */}
          <line x1="0" y1={height / 2} x2={width} y2={height / 2} stroke="oklch(0.8 0.01 150)" strokeWidth="0.5" strokeDasharray="2 2" />
          {/* Wave 1 */}
          <polyline
            points={wave1Points.join(" ")}
            fill="none"
            stroke="oklch(0.74 0.12 155 / 0.5)"
            strokeWidth="2"
          />
          {/* Wave 2 */}
          <polyline
            points={wave2Points.join(" ")}
            fill="none"
            stroke="oklch(0.82 0.13 80 / 0.5)"
            strokeWidth="2"
          />
          {/* Combined */}
          <polyline
            points={combinedPoints.join(" ")}
            fill="none"
            stroke="oklch(0.7 0.13 330)"
            strokeWidth="2.5"
          />
        </svg>
        <div className="flex items-center justify-center gap-4 mt-2 text-[10px]">
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{background:"oklch(0.74 0.12 155 / 0.7)"}} /> Wave 1</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{background:"oklch(0.82 0.13 80 / 0.7)"}} /> Wave 2</span>
          <span className="flex items-center gap-1"><span className="size-2 rounded-full" style={{background:"oklch(0.7 0.13 330)"}} /> Combined</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <SliderRow label="Wave 1 freq" value={freq1} onChange={setFreq1} color="oklch(0.74 0.12 155)" icon={<Cloud className="size-3.5" />} />
        <SliderRow label="Wave 2 freq" value={freq2} onChange={setFreq2} color="oklch(0.82 0.13 80)" icon={<Sun className="size-3.5" />} />
        <SliderRow label="Wave 1 amp" value={amp1} onChange={setAmp1} color="oklch(0.74 0.12 155)" icon={<ArrowUp className="size-3.5" />} />
        <SliderRow label="Wave 2 amp" value={amp2} onChange={setAmp2} color="oklch(0.82 0.13 80)" icon={<ArrowUp className="size-3.5" />} />
      </div>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        When two waves meet, they add together. Same direction = bigger
        (constructive). Opposite = cancel out (destructive). That&apos;s
        interference.
      </p>
    </div>
  );
}

/* ===================== Chemistry Reaction Simulation ===================== */
function ChemistrySim() {
  const [elemA, setElemA] = useState<"H" | "Na" | "Fe" | "C">("H");
  const [elemB, setElemB] = useState<"O" | "Cl" | "S" | "O">("O");
  const [mixed, setMixed] = useState(false);
  const twin = useTwin((s) => s.bumpTrait);
  const reduced = useReducedMotion();

  useEffect(() => {
    twin("curiosity", 1, "Explored the chemistry simulation.");
  }, [twin]);

  const REACTIONS: Record<string, { product: string; name: string; color: string; desc: string }> = {
    "H+O": { product: "H₂O", name: "Water", color: "oklch(0.7 0.1 200)", desc: "Two hydrogens + one oxygen = the stuff of life." },
    "Na+Cl": { product: "NaCl", name: "Table Salt", color: "oklch(0.9 0.01 60)", desc: "A metal + a toxic gas = the salt on your food." },
    "Fe+S": { product: "FeS", name: "Iron Sulfide", color: "oklch(0.4 0.02 40)", desc: "A dark, smelly compound — very different from its parts." },
    "C+O": { product: "CO₂", name: "Carbon Dioxide", color: "oklch(0.6 0.05 150)", desc: "What you breathe out. Plants breathe it in." },
  };

  const key = `${elemA}+${elemB}`;
  const reaction = REACTIONS[key];

  const ELEMENT_COLORS: Record<string, string> = {
    H: "oklch(0.7 0.1 200)",
    Na: "oklch(0.78 0.08 15)",
    Fe: "oklch(0.55 0.05 40)",
    C: "oklch(0.3 0.02 60)",
    O: "oklch(0.65 0.15 25)",
    Cl: "oklch(0.7 0.1 150)",
    S: "oklch(0.8 0.14 90)",
  };

  return (
    <div>
      <div className="rounded-xl border border-border/40 bg-muted/20 p-6">
        <div className="flex items-center justify-center gap-4">
          {/* Element A */}
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-2xl font-bold border-2"
            style={{
              background: `${ELEMENT_COLORS[elemA]}30`,
              borderColor: ELEMENT_COLORS[elemA],
              color: ELEMENT_COLORS[elemA],
            }}
          >
            {elemA}
          </div>

          {/* Plus / Arrow */}
          <div className="text-2xl text-muted-foreground">
            {mixed && reaction ? "→" : "+"}
          </div>

          {/* Element B */}
          <div
            className="size-16 rounded-2xl flex items-center justify-center text-2xl font-bold border-2"
            style={{
              background: `${ELEMENT_COLORS[elemB]}30`,
              borderColor: ELEMENT_COLORS[elemB],
              color: ELEMENT_COLORS[elemB],
            }}
          >
            {elemB}
          </div>

          {/* Product */}
          {mixed && reaction && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="size-20 rounded-2xl flex flex-col items-center justify-center border-2"
              style={{
                background: `${reaction.color}30`,
                borderColor: reaction.color,
                color: reaction.color,
              }}
            >
              <span className="text-xl font-bold">{reaction.product}</span>
            </motion.div>
          )}
        </div>

        {/* Result label */}
        {mixed && reaction && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-sm font-semibold" style={{ color: reaction.color }}>
              {reaction.name}
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              {reaction.desc}
            </p>
          </motion.div>
        )}

        {mixed && !reaction && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Hmm, that combination doesn&apos;t have a known reaction here. Try
            another pair!
          </p>
        )}
      </div>

      {/* Element selectors */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Element A</p>
          <div className="flex gap-1.5">
            {(["H", "Na", "Fe", "C"] as const).map((e) => (
              <button
                key={e}
                onClick={() => { setElemA(e); setMixed(false); }}
                aria-pressed={elemA === e}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-bold transition-all",
                  elemA === e ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1.5">Element B</p>
          <div className="flex gap-1.5">
            {(["O", "Cl", "S"] as const).map((e) => (
              <button
                key={e}
                onClick={() => { setElemB(e); setMixed(false); }}
                aria-pressed={elemB === e}
                className={cn(
                  "flex-1 rounded-lg border py-2 text-sm font-bold transition-all",
                  elemB === e ? "border-primary bg-primary/10 text-primary" : "hover:bg-accent"
                )}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        onClick={() => setMixed(true)}
        disabled={mixed}
        className="mt-4 w-full rounded-full gap-1.5"
        size="sm"
      >
        <FlaskConical className="size-3.5" /> Mix them
      </Button>
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Elements combine to form completely new substances. The result has
        properties nothing like its parts.
      </p>
    </div>
  );
}
