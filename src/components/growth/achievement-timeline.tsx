"use client";

import {
  Award,
  Trophy,
  Sparkles,
  Star,
  Heart,
  Flame,
  type LucideIcon,
} from "lucide-react";
import { useGrowth } from "@/store/growth";
import { MotionDiv, fadeUp } from "@/components/shared/motion";

const ICON_MAP: Record<string, LucideIcon> = {
  Trophy,
  Award,
  Star,
  Heart,
  Flame,
  Sparkles,
};

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export default function AchievementTimeline() {
  const achievements = useGrowth((s) => s.achievements);

  return (
    <section
      aria-label="Achievement Timeline"
      className="rounded-2xl border nt-shadow-soft nt-gradient-plum bg-card p-4 sm:p-6"
    >
      <header className="flex items-start justify-between gap-3 mb-6">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="size-4 text-plum" aria-hidden />
            <span className="text-xs uppercase tracking-wider font-semibold text-plum/80">
              Achievement Timeline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
            Moments worth remembering
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Earned for showing up — not for being perfect.
          </p>
        </div>
        {achievements.length > 0 && (
          <span className="rounded-full bg-plum/10 text-plum text-xs font-medium px-3 py-1.5 shrink-0">
            {achievements.length} earned
          </span>
        )}
      </header>

      {achievements.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <div className="mx-auto mb-3 size-12 rounded-full bg-plum/10 flex items-center justify-center">
            <Award className="size-6 text-plum" />
          </div>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Achievements appear here as you keep showing up. Not for being
            perfect — for being you.
          </p>
        </div>
      ) : (
        <ol className="relative pl-8 sm:pl-10">
          {/* Vertical line */}
          <div
            className="absolute left-3 sm:left-4 top-2 bottom-2 w-px bg-gradient-to-b from-plum/40 via-plum/20 to-transparent"
            aria-hidden
          />
          {[...achievements].reverse().map((a, i) => {
            const Icon = ICON_MAP[a.icon] ?? Award;
            return (
              <MotionDiv
                key={a.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                transition={{ delay: i * 0.06 }}
                className="relative mb-5 last:mb-0"
              >
                {/* Node */}
                <div className="absolute -left-8 sm:-left-10 top-0 size-7 rounded-full bg-plum text-plum-foreground flex items-center justify-center shadow-md ring-4 ring-card">
                  <Icon className="size-3.5" aria-hidden />
                </div>
                <div className="rounded-xl border bg-card p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground leading-tight">
                        {a.title}
                      </h3>
                      {a.desc && (
                        <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
                          {a.desc}
                        </p>
                      )}
                    </div>
                    <time
                      className="text-xs text-muted-foreground whitespace-nowrap shrink-0"
                      dateTime={new Date(a.earnedAt).toISOString()}
                    >
                      {formatDate(a.earnedAt)}
                    </time>
                  </div>
                </div>
              </MotionDiv>
            );
          })}
        </ol>
      )}
    </section>
  );
}
