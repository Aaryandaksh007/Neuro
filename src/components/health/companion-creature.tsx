"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Check, Sprout, Heart, Sparkles } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { useHealth } from "@/store/health";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useApp } from "@/store/app";
import { MotionDiv } from "@/components/shared/motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ */
/*  Creature stage metadata                                            */
/* ------------------------------------------------------------------ */

const STAGE_NAMES = [
  "Seed",
  "Sprout",
  "Bud",
  "Little One",
  "Grown",
  "Flourishing",
];

const STAGE_POETRY = [
  "a tiny seed dreaming of growth",
  "just sprouting — first leaves unfolding",
  "growing a bud of quiet potential",
  "a curious little sprout",
  "growing stronger each day",
  "flourishing in full bloom",
];

const CREATURE_CSS = `
@keyframes nt-creature-wobble {
  0%, 100% { transform: rotate(-1.2deg); }
  50%      { transform: rotate(1.2deg); }
}
.nt-creature-wobble {
  animation: nt-creature-wobble 6s ease-in-out infinite;
  transform-origin: 50% 85%;
  transform-box: fill-box;
}
@keyframes nt-creature-blink {
  0%, 91%, 100% { transform: scaleY(1); }
  94%, 97%      { transform: scaleY(0.08); }
}
.nt-creature-blink {
  animation: nt-creature-blink 5.5s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
@keyframes nt-creature-petal {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
.nt-creature-petal {
  animation: nt-creature-petal 4s ease-in-out infinite;
  transform-origin: center;
  transform-box: fill-box;
}
/* Reduced motion disables these (global rule also covers them) */
html[data-motion="reduced"] .nt-creature-wobble,
html[data-motion="reduced"] .nt-creature-blink,
html[data-motion="reduced"] .nt-creature-petal {
  animation: none !important;
}
`;

/* ------------------------------------------------------------------ */
/*  Companion creature SVG                                             */
/* ------------------------------------------------------------------ */

function Creature({
  stage,
  happiness,
  energy,
}: {
  stage: number;
  happiness: number;
  energy: number;
}) {
  // Smile geometry — always gentle, widens with happiness
  const smileW = 6 + (happiness / 100) * 14;
  const smileDepth = 4 + (happiness / 100) * 8;
  // Eyes droop a touch when energy is low
  const eyeRy = 6 + (energy / 100) * 2;
  // Body grows subtly with stage
  const bodyScale = stage >= 3 ? 0.78 + stage * 0.05 : 1;
  const creatureY = stage >= 4 ? 152 : stage === 3 ? 168 : 200;

  return (
    <svg
      viewBox="0 0 240 280"
      width="100%"
      height="100%"
      role="img"
      aria-label={`Companion creature at ${STAGE_NAMES[stage]} stage`}
      className="overflow-visible max-w-[280px]"
    >
      <defs>
        <radialGradient id="nt-body-grad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor="oklch(0.88 0.14 145)" />
          <stop offset="100%" stopColor="oklch(0.66 0.13 155)" />
        </radialGradient>
        <linearGradient id="nt-pot-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.82 0.09 60)" />
          <stop offset="100%" stopColor="oklch(0.6 0.1 45)" />
        </linearGradient>
        <linearGradient id="nt-leaf-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="oklch(0.84 0.16 145)" />
          <stop offset="100%" stopColor="oklch(0.58 0.13 155)" />
        </linearGradient>
        <radialGradient id="nt-flower-grad" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="oklch(0.93 0.13 65)" />
          <stop offset="100%" stopColor="oklch(0.78 0.16 25)" />
        </radialGradient>
        <radialGradient id="nt-bud-grad" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="oklch(0.86 0.14 80)" />
          <stop offset="100%" stopColor="oklch(0.7 0.13 50)" />
        </radialGradient>
      </defs>

      {/* Ambient sparkles (stage 5) */}
      {stage >= 5 && (
        <g aria-hidden className="nt-twinkle">
          <Sparkle x={26} y={44} r={3} />
          <Sparkle x={210} y={62} r={4} />
          <Sparkle x={36} y={140} r={2.5} />
          <Sparkle x={206} y={160} r={3.5} />
          <Sparkle x={120} y={20} r={2.5} />
        </g>
      )}

      {/* Soft halo behind creature */}
      <circle
        cx="120"
        cy="150"
        r="86"
        fill="oklch(0.82 0.13 80 / 0.14)"
        aria-hidden
      />

      {/* Pot */}
      <g transform="translate(0, 198)">
        <path
          d="M62 0 L178 0 L166 70 Q120 80 74 70 Z"
          fill="url(#nt-pot-grad)"
        />
        <ellipse cx="120" cy="0" rx="58" ry="9" fill="oklch(0.42 0.06 40)" />
        <ellipse cx="120" cy="-1" rx="58" ry="9" fill="none" stroke="oklch(0.7 0.09 60 / 0.7)" strokeWidth="2" />
      </g>

      {/* Stage 0 — seed in soil */}
      {stage === 0 && (
        <g>
          <ellipse cx="120" cy="196" rx="13" ry="9" fill="oklch(0.55 0.09 55)" />
          <path
            d="M114 192 Q120 187 126 192"
            stroke="oklch(0.38 0.06 55)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          {/* tiny hint of green below soil */}
          <path
            d="M118 200 Q120 204 122 200"
            stroke="oklch(0.7 0.13 155 / 0.6)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Stage 1 — tiny sprout */}
      {stage === 1 && (
        <g transform="translate(120, 198)" className="nt-creature-wobble">
          <path
            d="M0 0 L0 -52"
            stroke="oklch(0.6 0.13 155)"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <Leaf x={-4} y={-32} rotate={-38} scale={0.9} />
          <Leaf x={4} y={-44} rotate={38} scale={0.9} />
        </g>
      )}

      {/* Stage 2 — taller sprout with bud */}
      {stage === 2 && (
        <g transform="translate(120, 198)" className="nt-creature-wobble">
          <path
            d="M0 0 L0 -88"
            stroke="oklch(0.6 0.13 155)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <Leaf x={-6} y={-52} rotate={-48} scale={1.2} />
          <Leaf x={6} y={-68} rotate={48} scale={1.2} />
          <ellipse cx="0" cy="-100" rx="13" ry="17" fill="url(#nt-bud-grad)" />
          <path
            d="M-7 -100 Q0 -108 7 -100"
            stroke="oklch(0.45 0.1 80)"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M0 -117 L0 -110"
            stroke="oklch(0.55 0.13 155)"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      )}

      {/* Stage 3+ — full creature */}
      {stage >= 3 && (
        <g
          transform={`translate(120, ${creatureY}) scale(${bodyScale})`}
          className="nt-creature-wobble"
        >
          {/* Arms (stage 4+) */}
          {stage >= 4 && (
            <>
              <ellipse cx={-58} cy={6} rx={15} ry={11} fill="oklch(0.7 0.12 155)" />
              <ellipse cx={58} cy={6} rx={15} ry={11} fill="oklch(0.7 0.12 155)" />
            </>
          )}

          {/* Body */}
          <ellipse cx="0" cy="0" rx={62} ry={56} fill="url(#nt-body-grad)" />
          {/* Body shadow line for depth */}
          <path
            d="M-44 24 Q0 50 44 24"
            stroke="oklch(0.6 0.13 155 / 0.35)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />

          {/* Cheek blush (stage 5) */}
          {stage >= 5 && (
            <>
              <circle cx={-26} cy={6} r={7} fill="oklch(0.78 0.1 15 / 0.55)" />
              <circle cx={26} cy={6} r={7} fill="oklch(0.78 0.1 15 / 0.55)" />
            </>
          )}

          {/* Eyes */}
          <g className="nt-creature-blink">
            <ellipse cx={-18} cy={-12} rx={6} ry={eyeRy} fill="oklch(0.18 0.02 160)" />
            <ellipse cx={18} cy={-12} rx={6} ry={eyeRy} fill="oklch(0.18 0.02 160)" />
            <circle cx={-16} cy={-14} r={2} fill="oklch(0.98 0.01 150)" />
            <circle cx={20} cy={-14} r={2} fill="oklch(0.98 0.01 150)" />
          </g>

          {/* Smile */}
          <path
            d={`M${-smileW} 8 Q0 ${8 + smileDepth} ${smileW} 8`}
            stroke="oklch(0.3 0.04 30)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Leaves on top of head */}
          <Leaf x={-16} y={-52} rotate={-32} scale={1.3} />
          <Leaf x={16} y={-52} rotate={32} scale={1.3} />

          {/* Flower bud (stage 4) */}
          {stage === 4 && (
            <g transform="translate(0, -64)">
              <ellipse cx="0" cy="0" rx={11} ry={15} fill="url(#nt-bud-grad)" />
              <path
                d="M-6 0 Q0 -8 6 0"
                stroke="oklch(0.5 0.1 60)"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )}

          {/* Full open flower (stage 5) */}
          {stage >= 5 && (
            <g transform="translate(0, -70)" className="nt-creature-petal">
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse
                  key={a}
                  cx="0"
                  cy="-13"
                  rx="7"
                  ry="13"
                  fill="url(#nt-flower-grad)"
                  transform={`rotate(${a})`}
                />
              ))}
              <circle cx="0" cy="0" r="6.5" fill="oklch(0.85 0.16 75)" />
              <circle cx="0" cy="0" r="3" fill="oklch(0.6 0.14 50)" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

function Leaf({
  x,
  y,
  rotate,
  scale = 1,
}: {
  x: number;
  y: number;
  rotate: number;
  scale?: number;
}) {
  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotate}) scale(${scale})`}>
      <path
        d="M0 0 Q14 -6 22 0 Q14 6 0 0 Z"
        fill="url(#nt-leaf-grad)"
      />
      <path
        d="M0 0 L20 0"
        stroke="oklch(0.5 0.12 155 / 0.6)"
        strokeWidth="0.8"
        fill="none"
      />
    </g>
  );
}

function Sparkle({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <path
        d={`M0 ${-r} Q0 0 ${r} 0 Q0 0 0 ${r} Q0 0 ${-r} 0 Q0 0 0 ${-r} Z`}
        fill="oklch(0.85 0.13 75 / 0.85)"
      />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Vital bar                                                          */
/* ------------------------------------------------------------------ */

function VitalBar({
  label,
  value,
  hue,
  icon,
}: {
  label: string;
  value: number;
  hue: "rose" | "amber" | "sage";
  icon: React.ReactNode;
}) {
  const colorClass = {
    rose: "bg-rose-soft",
    amber: "bg-amber-glow",
    sage: "bg-sage",
  }[hue];
  const textClass = {
    rose: "text-rose-soft",
    amber: "text-amber-glow-foreground",
    sage: "text-sage",
  }[hue];
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span className={textClass} aria-hidden>{icon}</span>
          {label}
        </span>
        <span className="font-semibold tabular-nums">{Math.round(value)}%</span>
      </div>
      <div
        className="h-2.5 rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-label={label}
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-700 ease-out",
            colorClass
          )}
          style={{ width: `${Math.max(2, value)}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Companion creature hero card                                       */
/* ------------------------------------------------------------------ */

export function CompanionCreature() {
  const { toast } = useToast();
  const companionStage = useHealth((s) => s.companionStage);
  const vitals = useHealth(
    useShallow((s) => {
      const v = s.companionVitals();
      return { happiness: v.happiness, energy: v.energy };
    })
  );

  const companionName = useApp((s) => s.companionName);
  const setCompanionName = useApp((s) => s.setCompanionName);
  const addMemory = useTwin((s) => s.addMemory);
  const addAchievement = useGrowth((s) => s.addAchievement);

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(companionName);
  const prevStage = useRef(companionStage);

  const name = companionName?.trim() || "Sprout";

  // Celebrate stage growth — twin memory + achievement + toast
  useEffect(() => {
    if (companionStage > prevStage.current) {
      addMemory({
        text: `Your companion grew to stage ${companionStage} — a ${STAGE_NAMES[companionStage]}!`,
        kind: "celebration",
      });
      addAchievement({
        title: "Caretaker",
        desc: `Your companion reached stage ${companionStage}.`,
        icon: "sprout",
      });
      toast({
        title: `${name} grew! 💚`,
        description: `Now a ${STAGE_NAMES[companionStage]}. Your care is paying off.`,
      });
    }
    prevStage.current = companionStage;
  }, [companionStage, name, addMemory, addAchievement, toast]);

  const { happiness, energy } = vitals;
  const mood =
    happiness >= 80
      ? "radiant"
      : happiness >= 60
      ? "content"
      : happiness >= 40
      ? "calm"
      : "a little quiet";

  const kindMessage =
    happiness >= 80
      ? "You're glowing today — keep going gently."
      : happiness >= 60
      ? "A lovely rhythm today."
      : happiness >= 40
      ? "Steady and gentle — that counts."
      : "Be soft with yourself today.";

  const saveName = () => {
    const v = draftName.trim();
    if (v.length > 0) {
      setCompanionName(v);
      toast({
        title: `${v} says thank you 💚`,
        description: "A name is a small gift.",
      });
    } else {
      setDraftName(name);
    }
    setEditing(false);
  };

  return (
    <section
      aria-labelledby="companion-heading"
      className="nt-gradient-amber nt-shadow-soft rounded-2xl border border-amber-glow/30 bg-card overflow-hidden relative"
    >
      {/* Local keyframes for the creature */}
      <style dangerouslySetInnerHTML={{ __html: CREATURE_CSS }} />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-center p-6 sm:p-8">
        {/* Creature SVG */}
        <div className="relative flex items-center justify-center min-h-[280px]">
          {/* halo glow */}
          <div
            aria-hidden
            className="absolute inset-0 -z-10 flex items-center justify-center"
          >
            <div className="h-60 w-60 rounded-full bg-amber-glow/25 blur-3xl nt-breathe" />
          </div>
          <MotionDiv className="nt-float w-full flex items-center justify-center">
            <Creature
              stage={companionStage}
              happiness={happiness}
              energy={energy}
            />
          </MotionDiv>
        </div>

        {/* Info panel */}
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-amber-glow/20 text-amber-glow-foreground border-amber-glow/30">
              <Sprout className="size-3" aria-hidden /> Stage {companionStage} ·{" "}
              {STAGE_NAMES[companionStage]}
            </Badge>
          </div>

          {editing ? (
            <div className="flex gap-2 items-center mt-1">
              <Input
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                maxLength={20}
                aria-label="Companion name"
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveName();
                  if (e.key === "Escape") {
                    setDraftName(name);
                    setEditing(false);
                  }
                }}
                className="max-w-xs"
                autoFocus
              />
              <Button
                size="icon"
                onClick={saveName}
                aria-label="Save name"
                className="rounded-full"
              >
                <Check className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-1">
              <h2
                id="companion-heading"
                className="text-3xl sm:text-4xl font-bold tracking-tight"
              >
                {name}
              </h2>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full h-9 w-9"
                aria-label="Rename companion"
                onClick={() => {
                  setDraftName(name);
                  setEditing(true);
                }}
              >
                <Pencil className="size-4" />
              </Button>
            </div>
          )}

          <p className="text-muted-foreground mt-1.5">
            {name} is feeling <span className="font-medium text-foreground">{mood}</span> today.
          </p>
          <p className="text-sm text-amber-glow-foreground/80 italic mt-0.5">
            {name} is {STAGE_POETRY[companionStage]}.
          </p>

          {/* Vitals bars — Today summary */}
          <div className="mt-5 space-y-3 max-w-md">
            <h3 className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
              Today
            </h3>
            <VitalBar
              label="Happiness"
              value={happiness}
              hue="rose"
              icon={<Heart className="size-3.5" />}
            />
            <VitalBar
              label="Energy"
              value={energy}
              hue="amber"
              icon={<Sparkles className="size-3.5" />}
            />
            <p className="text-sm text-muted-foreground pt-1">{kindMessage}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
