"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { useAccessibility } from "@/store/accessibility";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EmotionDef {
  word: string;
  hue: string; // dot color
}

// Purely reflective — these are feelings, never diagnoses.
const EMOTIONS: EmotionDef[] = [
  { word: "calm", hue: "var(--color-sage)" },
  { word: "anxious", hue: "var(--color-rose-soft)" },
  { word: "excited", hue: "var(--color-amber-glow)" },
  { word: "tired", hue: "var(--color-stone-500, oklch(0.5 0.02 150))" },
  { word: "hopeful", hue: "var(--color-amber-glow)" },
  { word: "frustrated", hue: "var(--color-rose-soft)" },
  { word: "curious", hue: "var(--color-sage)" },
  { word: "overwhelmed", hue: "var(--color-plum)" },
  { word: "grateful", hue: "var(--color-amber-glow)" },
  { word: "restless", hue: "var(--color-plum)" },
  { word: "proud", hue: "var(--color-sage)" },
  { word: "lonely", hue: "var(--color-rose-soft)" },
];

// Deterministic pseudo-random placement based on index — stable across renders.
function placePoint(index: number, total: number) {
  const cx = 100;
  const cy = 100;
  const radius = 70;
  // Spread points around a circle with a gentle offset for organic feel
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const t = (index + 0.5) / total;
  const r = Math.sqrt(t) * radius;
  const a = index * goldenAngle;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

export function EmotionConstellation() {
  const [picked, setPicked] = useState<string[]>([]);
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  const toggle = (word: string) => {
    setPicked((p) =>
      p.includes(word) ? p.filter((w) => w !== word) : [...p, word]
    );
  };

  const points = useMemo(() => {
    return picked.map((word, i) => {
      const def = EMOTIONS.find((e) => e.word === word)!;
      return {
        word,
        hue: def.hue,
        ...placePoint(i, Math.max(picked.length, 4)),
      };
    });
  }, [picked]);

  return (
    <section
      aria-labelledby="emotion-constellation-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-plum p-5 sm:p-6"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-plum" />
            <h2 id="emotion-constellation-heading" className="text-lg font-semibold">
              Emotion Constellation
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tap the words that fit right now. They'll arrange into a quiet
            little sky. Just a reflection — never a label.
          </p>
        </div>
        {picked.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-xs"
            onClick={() => setPicked([])}
          >
            <RotateCcw className="size-3" /> Clear
          </Button>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-5 mt-4">
        {/* SVG constellation */}
        <div
          className="relative rounded-xl bg-gradient-to-br from-background/60 to-plum/10 border border-border/40 overflow-hidden"
          style={{ aspectRatio: "1 / 1" }}
        >
          <svg
            viewBox="0 0 200 200"
            className="absolute inset-0 w-full h-full"
            aria-hidden
          >
            {/* Faint connecting lines */}
            {points.length > 1 &&
              points.map((p, i) =>
                points.slice(i + 1).map((q, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={p.x}
                    y1={p.y}
                    x2={q.x}
                    y2={q.y}
                    stroke="currentColor"
                    className="text-plum/30"
                    strokeWidth={0.5}
                  />
                ))
              )}
            {/* Dots */}
            {points.map((p, i) => (
              <g key={p.word}>
                {reduced ? (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill={p.hue}
                    fillOpacity={0.85}
                  />
                ) : (
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={6}
                    fill={p.hue}
                    fillOpacity={0.85}
                    initial={{ opacity: 0, scale: 0.3 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.04, duration: 0.4 }}
                    style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                  />
                )}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={2}
                  fill="white"
                  fillOpacity={0.7}
                />
                <text
                  x={p.x}
                  y={p.y + 14}
                  textAnchor="middle"
                  className="fill-foreground"
                  style={{ fontSize: 8, fontWeight: 500 }}
                >
                  {p.word}
                </text>
              </g>
            ))}
          </svg>

          {picked.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Your constellation will appear here. Begin by tapping a word.
              </p>
            </div>
          )}
        </div>

        {/* Word picker */}
        <div>
          <div className="flex flex-wrap gap-2">
            {EMOTIONS.map((e) => {
              const active = picked.includes(e.word);
              return (
                <button
                  key={e.word}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggle(e.word)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm border transition-all",
                    active
                      ? "bg-plum/15 text-plum-foreground border-plum/40 ring-1 ring-plum/30"
                      : "bg-card/60 border-border/60 hover:bg-accent"
                  )}
                >
                  <span
                    className="inline-block size-2 rounded-full mr-1.5 align-middle"
                    style={{ background: e.hue }}
                    aria-hidden
                  />
                  {e.word}
                </button>
              );
            })}
          </div>

          {picked.length > 0 && (
            <MotionDiv
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-5 rounded-xl bg-card/70 border border-border/50 p-4"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium mb-2">
                You're holding
              </p>
              <div className="flex flex-wrap gap-1.5">
                {picked.map((w) => (
                  <Badge
                    key={w}
                    variant="secondary"
                    className="rounded-full capitalize"
                  >
                    {w}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                Feelings aren't facts. They're weather. Thank you for noticing.
              </p>
            </MotionDiv>
          )}
        </div>
      </div>
    </section>
  );
}
