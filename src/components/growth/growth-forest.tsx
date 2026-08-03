"use client";

import { useMemo, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Sprout, Sparkles, TreePine } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGrowth, type Tree } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";

// Plum / sage / amber palette for tree canopies (no blue / indigo).
const TREE_VARIANTS: Record<
  string,
  { canopy: string; trunk: string; accent: string }
> = {
  oak: { canopy: "oklch(0.72 0.10 155)", trunk: "oklch(0.45 0.05 50)", accent: "oklch(0.82 0.10 140)" },
  pine: { canopy: "oklch(0.62 0.09 160)", trunk: "oklch(0.40 0.05 40)", accent: "oklch(0.74 0.10 155)" },
  willow: { canopy: "oklch(0.78 0.09 130)", trunk: "oklch(0.45 0.05 50)", accent: "oklch(0.86 0.10 120)" },
  sakura: { canopy: "oklch(0.82 0.08 350)", trunk: "oklch(0.45 0.05 50)", accent: "oklch(0.90 0.07 0)" },
  maple: { canopy: "oklch(0.74 0.12 50)", trunk: "oklch(0.40 0.05 40)", accent: "oklch(0.82 0.13 65)" },
  birch: { canopy: "oklch(0.82 0.08 110)", trunk: "oklch(0.86 0.02 80)", accent: "oklch(0.90 0.08 100)" },
};

function pickKind(habit: string): string {
  const kinds = Object.keys(TREE_VARIANTS);
  let h = 0;
  for (let i = 0; i < habit.length; i++) h = (h * 31 + habit.charCodeAt(i)) | 0;
  return kinds[Math.abs(h) % kinds.length];
}

function TreeShape({
  tree,
  baseX,
  groundY,
  index,
}: {
  tree: Tree;
  baseX: number;
  groundY: number;
  index: number;
}) {
  const reduced = useReducedMotion();
  const v = TREE_VARIANTS[tree.kind] ?? TREE_VARIANTS.oak;
  const height = Math.max(5, tree.height);

  // Seedling state for very young trees — a tiny mound with two leaves.
  if (height < 12) {
    return (
      <motion.g
        style={{ transformOrigin: `${baseX}px ${groundY}px` }}
        animate={reduced ? undefined : { rotate: [-0.8, 0.8, -0.8] }}
        transition={{
          duration: 4 + (index % 3),
          repeat: Infinity,
          ease: "easeInOut",
          delay: (index % 5) * 0.4,
        }}
      >
        <ellipse cx={baseX} cy={groundY + 2} rx={7} ry={2} fill="oklch(0.3 0.02 120 / 0.20)" />
        <ellipse cx={baseX} cy={groundY - 1} rx={6} ry={2.4} fill="oklch(0.42 0.05 55)" />
        <line
          x1={baseX}
          y1={groundY - 1}
          x2={baseX}
          y2={groundY - 13}
          stroke={v.trunk}
          strokeWidth={1.6}
          strokeLinecap="round"
        />
        <path d={`M${baseX},${groundY - 8} q-6,-4 -9,1 q4,1 9,-1 z`} fill={v.canopy} />
        <path d={`M${baseX},${groundY - 11} q6,-5 10,-0.5 q-5,2 -10,0.5 z`} fill={v.accent} opacity={0.9} />
      </motion.g>
    );
  }

  const scale = 0.45 + (height / 100) * 1.0;
  const trunkH = 24 * scale;
  const trunkW = 5 * scale;
  const canopyR = 16 * scale;
  const trunkTop = groundY - trunkH;

  let canopy: ReactNode;
  switch (tree.kind) {
    case "pine":
      canopy = (
        <g>
          <polygon
            points={`${baseX},${trunkTop - canopyR * 1.8} ${baseX - canopyR * 0.9},${trunkTop - canopyR * 0.4} ${baseX + canopyR * 0.9},${trunkTop - canopyR * 0.4}`}
            fill={v.canopy}
          />
          <polygon
            points={`${baseX},${trunkTop - canopyR * 1.2} ${baseX - canopyR * 1.15},${trunkTop + canopyR * 0.1} ${baseX + canopyR * 1.15},${trunkTop + canopyR * 0.1}`}
            fill={v.canopy}
            opacity={0.92}
          />
          <polygon
            points={`${baseX},${trunkTop - canopyR * 0.6} ${baseX - canopyR * 1.3},${trunkTop + canopyR * 0.5} ${baseX + canopyR * 1.3},${trunkTop + canopyR * 0.5}`}
            fill={v.canopy}
            opacity={0.85}
          />
        </g>
      );
      break;
    case "willow":
      canopy = (
        <g>
          <ellipse cx={baseX} cy={trunkTop - canopyR * 0.3} rx={canopyR * 1.1} ry={canopyR * 1.0} fill={v.canopy} opacity={0.85} />
          {Array.from({ length: 5 }).map((_, i) => {
            const px = baseX - canopyR * 0.9 + i * canopyR * 0.45;
            return (
              <path
                key={i}
                d={`M${px},${trunkTop - canopyR * 0.2} q${canopyR * 0.15},${canopyR * 0.9} ${canopyR * 0.05},${canopyR * 1.3}`}
                stroke={v.canopy}
                strokeWidth={Math.max(1.2, 2 * scale)}
                fill="none"
                opacity={0.7}
              />
            );
          })}
        </g>
      );
      break;
    case "sakura":
      canopy = (
        <g>
          <circle cx={baseX} cy={trunkTop - canopyR * 0.4} r={canopyR * 0.95} fill={v.canopy} />
          <circle cx={baseX - canopyR * 0.7} cy={trunkTop - canopyR * 0.1} r={canopyR * 0.75} fill={v.canopy} opacity={0.9} />
          <circle cx={baseX + canopyR * 0.7} cy={trunkTop - canopyR * 0.1} r={canopyR * 0.75} fill={v.canopy} opacity={0.9} />
          <circle cx={baseX + canopyR * 0.2} cy={trunkTop - canopyR * 1.05} r={canopyR * 0.55} fill={v.accent} opacity={0.7} />
          <circle cx={baseX - canopyR * 0.3} cy={trunkTop - canopyR * 1.0} r={canopyR * 0.4} fill={v.accent} opacity={0.6} />
        </g>
      );
      break;
    default:
      canopy = (
        <g>
          <circle cx={baseX} cy={trunkTop - canopyR * 0.4} r={canopyR} fill={v.canopy} />
          <circle cx={baseX - canopyR * 0.75} cy={trunkTop - canopyR * 0.05} r={canopyR * 0.75} fill={v.canopy} opacity={0.95} />
          <circle cx={baseX + canopyR * 0.75} cy={trunkTop - canopyR * 0.05} r={canopyR * 0.75} fill={v.canopy} opacity={0.95} />
          <circle cx={baseX + canopyR * 0.2} cy={trunkTop - canopyR * 1.1} r={canopyR * 0.6} fill={v.accent} opacity={0.6} />
        </g>
      );
  }

  return (
    <motion.g
      style={{ transformOrigin: `${baseX}px ${groundY}px` }}
      animate={reduced ? undefined : { rotate: [-1.1, 1.1, -1.1] }}
      transition={{
        duration: 5 + (index % 4) * 0.7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: (index % 5) * 0.4,
      }}
    >
      <ellipse cx={baseX} cy={groundY + 2} rx={canopyR * 0.75} ry={2.5} fill="oklch(0.3 0.02 120 / 0.20)" />
      <rect x={baseX - trunkW / 2} y={trunkTop} width={trunkW} height={trunkH} rx={1} fill={v.trunk} />
      {canopy}
    </motion.g>
  );
}

export default function GrowthForest() {
  const trees = useGrowth((s) => s.trees);
  const addTree = useGrowth((s) => s.addTree);
  const addMemory = useTwin((s) => s.addMemory);
  const bumpPersistence = useGrowth((s) => s.bumpPersistence);
  const { toast } = useToast();
  const reduced = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [habit, setHabit] = useState("");

  const sceneW = 800;
  const sceneH = 360;
  const groundY = 280;

  const positions = useMemo(() => {
    const n = trees.length;
    if (n === 0) return [];
    if (n === 1) return [{ x: sceneW / 2 }];
    const padding = 70;
    const usable = sceneW - padding * 2;
    return trees.map((t, i) => {
      const baseX = padding + (usable * i) / (n - 1);
      const h = (t.id + t.kind).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
      const jitter = ((h % 17) - 8) * 1.4;
      return { x: Math.max(40, Math.min(sceneW - 40, baseX + jitter)) };
    });
  }, [trees]);

  const totalHeight = trees.reduce((s, t) => s + t.height, 0);
  const isSeedlingState = trees.length <= 1 && totalHeight < 30;

  const handlePlant = () => {
    const habitName = habit.trim();
    if (!habitName) return;
    const kind = pickKind(habitName);
    addTree({ kind, height: 5, source: habitName });
    addMemory({ text: `You planted a tree for ${habitName}.`, kind: "celebration" });
    bumpPersistence(2);
    toast({
      title: "A new tree took root",
      description: `Your forest is growing — "${habitName}" begins its journey.`,
    });
    setHabit("");
    setOpen(false);
  };

  return (
    <section
      aria-label="Growth Forest"
      className="relative rounded-2xl overflow-hidden border nt-shadow-soft bg-card"
    >
      <div className="relative">
        <svg
          viewBox={`0 0 ${sceneW} ${sceneH}`}
          className="block w-full h-auto"
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={`Growth forest with ${trees.length} ${trees.length === 1 ? "tree" : "trees"} growing under a soft dawn sky`}
        >
          <defs>
            <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.55 0.10 340)" />
              <stop offset="35%" stopColor="oklch(0.72 0.10 20)" />
              <stop offset="72%" stopColor="oklch(0.85 0.09 75)" />
              <stop offset="100%" stopColor="oklch(0.92 0.06 95)" />
            </linearGradient>
            <radialGradient id="forest-sun" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="oklch(0.95 0.12 75)" />
              <stop offset="40%" stopColor="oklch(0.88 0.10 60 / 0.7)" />
              <stop offset="100%" stopColor="oklch(0.88 0.10 60 / 0)" />
            </radialGradient>
            <linearGradient id="forest-ground" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.74 0.10 155)" />
              <stop offset="100%" stopColor="oklch(0.55 0.10 150)" />
            </linearGradient>
            <linearGradient id="forest-ground-far" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.78 0.09 150 / 0.7)" />
              <stop offset="100%" stopColor="oklch(0.66 0.10 150 / 0.5)" />
            </linearGradient>
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width={sceneW} height={sceneH} fill="url(#forest-sky)" />

          {/* Sun with glow */}
          <circle cx="640" cy="80" r="60" fill="url(#forest-sun)" />
          <circle cx="640" cy="80" r="26" fill="oklch(0.96 0.10 80)" opacity="0.95" />

          {/* Distant hills */}
          <path
            d={`M0,${groundY - 30} Q 200,${groundY - 60} 400,${groundY - 35} T 800,${groundY - 25} L 800,${sceneH} L 0,${sceneH} Z`}
            fill="url(#forest-ground-far)"
            opacity="0.6"
          />

          {/* Floating motes / fireflies (reduced-motion safe) */}
          {!reduced &&
            Array.from({ length: 8 }).map((_, i) => (
              <motion.circle
                key={i}
                cx={100 + i * 90 + (i % 3) * 20}
                cy={120 + (i % 4) * 30}
                r={1.6}
                fill="oklch(0.95 0.06 80 / 0.6)"
                animate={{ y: [0, -10, 0], opacity: [0.4, 0.9, 0.4] }}
                transition={{
                  duration: 4 + i * 0.3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.5,
                }}
              />
            ))}

          {/* Trees */}
          {trees.map((t, i) => (
            <TreeShape
              key={t.id}
              tree={t}
              baseX={positions[i]?.x ?? sceneW / 2}
              groundY={groundY}
              index={i}
            />
          ))}

          {/* Ground */}
          <path
            d={`M0,${groundY} Q 200,${groundY - 8} 400,${groundY} T 800,${groundY - 4} L 800,${sceneH} L 0,${sceneH} Z`}
            fill="url(#forest-ground)"
          />

          {/* Foreground grass tufts */}
          {Array.from({ length: 12 }).map((_, i) => {
            const gx = (i * 70 + 20) % sceneW;
            return (
              <g
                key={`grass-${i}`}
                stroke="oklch(0.6 0.11 150)"
                strokeWidth={1.2}
                strokeLinecap="round"
                opacity={0.7}
              >
                <line x1={gx} y1={groundY + 4} x2={gx - 2} y2={groundY - 4} />
                <line x1={gx + 2} y1={groundY + 4} x2={gx + 4} y2={groundY - 3} />
                <line x1={gx + 1} y1={groundY + 4} x2={gx + 1} y2={groundY - 5} />
              </g>
            );
          })}
        </svg>

        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="flex items-start justify-between gap-3 p-4 sm:p-6 pointer-events-auto">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <TreePine className="size-4 text-plum" aria-hidden />
                <span className="text-xs uppercase tracking-wider font-semibold text-plum/80">
                  Growth Forest
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                {isSeedlingState
                  ? "Your forest begins with one small step"
                  : trees.length === 1
                    ? "One tree, growing with you"
                    : `${trees.length} trees growing in your care`}
              </h2>
              <p className="text-sm text-muted-foreground mt-1 max-w-md">
                Each gentle habit you keep waters a tree. There&apos;s no rush —
                growth happens in its own time.
              </p>
            </div>
            <Button
              onClick={() => setOpen(true)}
              className="bg-plum text-plum-foreground hover:bg-plum/90 shadow-sm rounded-full shrink-0"
              aria-label="Plant a new tree for a habit"
            >
              <Sprout className="size-4" /> Plant a tree
            </Button>
          </div>
        </div>
      </div>

      {/* Plant-a-tree dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-amber-glow-foreground" aria-hidden />
              Plant a tree
            </DialogTitle>
            <DialogDescription>
              Name a small habit or kindness you want to nurture. A seedling will
              grow with your care.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="habit-name">What would you like to grow?</Label>
            <Input
              id="habit-name"
              autoFocus
              value={habit}
              onChange={(e) => setHabit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handlePlant();
              }}
              placeholder="e.g. Read for 5 minutes, Stretch, Be patient with myself"
              maxLength={60}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handlePlant}
              disabled={!habit.trim()}
              className="bg-plum text-plum-foreground hover:bg-plum/90"
            >
              <Sprout className="size-4" /> Plant it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
