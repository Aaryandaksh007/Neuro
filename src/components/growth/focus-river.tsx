"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Clock, TrendingUp } from "lucide-react";
import { useGrowth } from "@/store/growth";

export default function FocusRiver() {
  const sessions = useGrowth((s) => s.sessions);
  const reduced = useReducedMotion();

  const { totalMinutes, avgFlow, brightness, fullness } = useMemo(() => {
    const totalMinutes = sessions.reduce((s, x) => s + x.minutes, 0);
    const avgFlow =
      sessions.length > 0
        ? sessions.reduce((s, x) => s + x.flow, 0) / sessions.length
        : 0;
    const brightness = Math.min(100, sessions.length * 8 + avgFlow * 0.4);
    const fullness = Math.min(100, sessions.length * 12);
    return { totalMinutes, avgFlow, brightness, fullness };
  }, [sessions]);

  // Top edge of the river — grows fuller (higher) as sessions accumulate.
  const topY = 130 - (fullness / 100) * 70; // 60..130
  const stoneY = topY + 6;

  return (
    <section
      aria-label="Focus River"
      className="rounded-2xl border nt-shadow-soft nt-gradient-sage bg-card p-4 sm:p-6 h-full flex flex-col"
    >
      <header className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="size-4 text-primary" aria-hidden />
          <span className="text-xs uppercase tracking-wider font-semibold text-primary/80">
            Focus River
          </span>
        </div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground">
          {sessions.length === 0
            ? "Your river begins as a trickle"
            : `${totalMinutes} minutes of focused flow`}
        </h2>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Each session you finish adds to the flow. The river grows brighter and
          fuller with you.
        </p>
      </header>

      <div
        className="relative flex-1 min-h-[150px] rounded-xl overflow-hidden border"
        style={{ background: "linear-gradient(180deg, oklch(0.96 0.02 150 / 0.5), oklch(0.86 0.04 155 / 0.35))" }}
      >
        <svg
          viewBox="0 0 400 150"
          className="absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={`Focus river with ${sessions.length} session${sessions.length === 1 ? "" : "s"}, total ${totalMinutes} minutes, average flow ${Math.round(avgFlow)} percent`}
        >
          <defs>
            <linearGradient id="river-flow" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.7 0.10 200 / 0.55)" />
              <stop offset="35%" stopColor="oklch(0.74 0.12 155 / 0.9)" />
              <stop offset="70%" stopColor="oklch(0.82 0.13 80 / 0.9)" />
              <stop offset="100%" stopColor="oklch(0.7 0.10 200 / 0.55)" />
            </linearGradient>
            <linearGradient id="river-flow-2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="oklch(0.86 0.06 80 / 0)" />
              <stop offset="50%" stopColor="oklch(0.95 0.08 80 / 0.7)" />
              <stop offset="100%" stopColor="oklch(0.86 0.06 80 / 0)" />
            </linearGradient>
          </defs>

          {/* Main river body */}
          <path
            d={`M-10,${topY + 5} Q 80,${topY - 5} 160,${topY + 8} T 320,${topY + 2} Q 360,${topY - 2} 410,${topY + 5} L 410,160 L -10,160 Z`}
            fill="url(#river-flow)"
            opacity={0.55 + brightness / 250}
          />

          {/* Animated highlight wave (reduced-motion safe) */}
          {reduced ? (
            <path
              d={`M-10,${topY + 9} Q 80,${topY - 1} 160,${topY + 12} T 320,${topY + 6} Q 360,${topY + 2} 410,${topY + 9}`}
              stroke="oklch(0.95 0.08 80 / 0.7)"
              strokeWidth={1.5 + brightness / 60}
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <motion.path
              d={`M-10,${topY + 9} Q 80,${topY - 1} 160,${topY + 12} T 320,${topY + 6} Q 360,${topY + 2} 410,${topY + 9}`}
              stroke="url(#river-flow-2)"
              strokeWidth={1.8 + brightness / 60}
              fill="none"
              strokeLinecap="round"
              animate={{ x: [0, 16, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}

          {/* Pebbles — one per recent session */}
          {sessions.slice(-12).map((s, i) => {
            const x = 30 + i * 30;
            const y = stoneY - (s.flow / 100) * 14;
            const r = 2 + Math.min(2, s.minutes / 30);
            return (
              <circle
                key={s.id}
                cx={x}
                cy={y}
                r={r}
                fill="oklch(0.96 0.04 80)"
                opacity={0.8}
              />
            );
          })}

          {/* River banks — soft tufts */}
          {Array.from({ length: 7 }).map((_, i) => {
            const gx = (i * 60 + 10) % 400;
            return (
              <g
                key={`bank-${i}`}
                stroke="oklch(0.62 0.10 150)"
                strokeWidth={1}
                strokeLinecap="round"
                opacity={0.55}
              >
                <line x1={gx} y1={topY + 4} x2={gx - 2} y2={topY - 2} />
                <line x1={gx + 2} y1={topY + 4} x2={gx + 3} y2={topY - 1} />
              </g>
            );
          })}
        </svg>

        {/* Empty state overlay */}
        {sessions.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-muted-foreground italic px-4 text-center">
              Complete a focus session in the Learn world and the river will
              begin to flow.
            </p>
          </div>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg bg-card border p-2.5">
          <div className="text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" aria-hidden /> Total focus
          </div>
          <div className="text-sm font-semibold mt-0.5 tabular-nums">
            {totalMinutes} min
          </div>
        </div>
        <div className="rounded-lg bg-card border p-2.5">
          <div className="text-muted-foreground flex items-center gap-1">
            <TrendingUp className="size-3" aria-hidden /> Avg flow
          </div>
          <div className="text-sm font-semibold mt-0.5 tabular-nums">
            {Math.round(avgFlow)}%
          </div>
        </div>
      </div>
    </section>
  );
}
