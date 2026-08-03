"use client";

import { useMemo } from "react";
import { Sparkles, Heart, Trophy } from "lucide-react";
import { useWellness } from "@/store/wellness";
import { useGrowth } from "@/store/growth";
import { useTwin } from "@/store/twin";
import { MotionDiv, fadeUp } from "@/components/shared/motion";

type WinKind = "victory" | "achievement" | "celebration";

interface WinCard {
  id: string;
  kind: WinKind;
  title: string;
  detail?: string;
  ts: number;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const mins = Math.floor(diff / 60000);
  if (days >= 1) return `${days}d ago`;
  if (hours >= 1) return `${hours}h ago`;
  if (mins >= 1) return `${mins}m ago`;
  return "just now";
}

const KIND_META: Record<
  WinKind,
  { icon: typeof Heart; label: string; color: string; bg: string }
> = {
  victory: {
    icon: Heart,
    label: "Tiny Victory",
    color: "text-rose-soft",
    bg: "bg-rose-soft/10",
  },
  achievement: {
    icon: Trophy,
    label: "Achievement",
    color: "text-plum",
    bg: "bg-plum/10",
  },
  celebration: {
    icon: Sparkles,
    label: "Celebration",
    color: "text-amber-glow-foreground",
    bg: "bg-amber-glow/15",
  },
};

export default function BackpackOfWins() {
  const victories = useWellness((s) => s.victories);
  const achievements = useGrowth((s) => s.achievements);
  const memories = useTwin((s) => s.memories);

  const wins = useMemo<WinCard[]>(() => {
    const v: WinCard[] = victories.map((x) => ({
      id: x.id,
      kind: "victory",
      title: x.text,
      ts: x.createdAt,
    }));
    const a: WinCard[] = achievements.map((x) => ({
      id: x.id,
      kind: "achievement",
      title: x.title,
      detail: x.desc,
      ts: x.earnedAt,
    }));
    const c: WinCard[] = memories
      .filter((m) => m.kind === "celebration")
      .slice(-12)
      .map((m) => ({
        id: m.id,
        kind: "celebration",
        title: m.text,
        ts: m.createdAt,
      }));
    return [...v, ...a, ...c].sort((x, y) => y.ts - x.ts).slice(0, 30);
  }, [victories, achievements, memories]);

  return (
    <section
      aria-label="Backpack of Wins"
      className="rounded-2xl border nt-shadow-soft bg-card p-4 sm:p-6"
    >
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="size-4 text-amber-glow-foreground" aria-hidden />
            <span className="text-xs uppercase tracking-wider font-semibold text-amber-glow-foreground/80">
              Backpack of Wins
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-foreground">
            Small wins you&apos;ve collected
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Tiny victories, milestones, and moments worth keeping. Nothing here
            ever disappears.
          </p>
        </div>
        {wins.length > 0 && (
          <span className="rounded-full bg-amber-glow/15 text-amber-glow-foreground text-xs font-medium px-3 py-1.5 shrink-0">
            {wins.length} kept
          </span>
        )}
      </header>

      {wins.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <div className="mx-auto mb-3 size-11 rounded-full bg-amber-glow/10 flex items-center justify-center">
            <Sparkles className="size-5 text-amber-glow-foreground" />
          </div>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Your backpack is empty for now. Each tiny victory, achievement, and
            celebration will gather here.
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {wins.map((w, i) => {
              const meta = KIND_META[w.kind];
              const Icon = meta.icon;
              return (
                <MotionDiv
                  key={`${w.kind}-${w.id}`}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: Math.min(i * 0.04, 0.4) }}
                  className="group rounded-xl border bg-card hover:border-plum/30 hover:shadow-md transition-all p-3 flex items-start gap-3"
                >
                  <div
                    className={`size-9 rounded-lg ${meta.bg} ${meta.color} flex items-center justify-center shrink-0`}
                    aria-hidden
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-[10px] uppercase tracking-wider font-semibold ${meta.color}`}
                      >
                        {meta.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        · {timeAgo(w.ts)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-snug">
                      {w.title}
                    </p>
                    {w.detail && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {w.detail}
                      </p>
                    )}
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
