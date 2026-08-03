"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  GraduationCap,
  HeartPulse,
  Sprout,
  Star,
  Brain,
  Trophy,
  ArrowLeft,
  Settings2,
  Keyboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { NeuroTwinLogo } from "@/components/shared/logo";
import { AccessibilityToolbar } from "@/components/shared/accessibility-toolbar";
import { CompanionDock } from "@/components/shared/companion-dock";
import { ShortcutsHelp } from "@/components/shared/shortcuts-help";
import { IdleCheckIn } from "@/components/shared/idle-check-in";
import { SensoryAdapter } from "@/components/shared/sensory-adapter";
import { useKeyboardShortcuts } from "@/components/shared/use-keyboard-shortcuts";
import { useApp, type World } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

const LearnWorld = dynamic(() => import("@/components/learn/learn-world"), {
  loading: () => <WorldSkeleton />,
});
const WellnessWorld = dynamic(
  () => import("@/components/wellness/wellness-world"),
  { loading: () => <WorldSkeleton /> }
);
const HealthWorld = dynamic(() => import("@/components/health/health-world"), {
  loading: () => <WorldSkeleton />,
});
const GrowthWorld = dynamic(() => import("@/components/growth/growth-world"), {
  loading: () => <WorldSkeleton />,
});
const TwinPanel = dynamic(() => import("@/components/twin/twin-panel"), {
  loading: () => <WorldSkeleton />,
});

const NAV: {
  key: World | "twin";
  label: string;
  icon: any;
  desc: string;
  accent: string;
}[] = [
  { key: "learn", label: "Learn", icon: GraduationCap, desc: "Adaptive lessons", accent: "text-primary" },
  { key: "wellness", label: "Wellness", icon: HeartPulse, desc: "Feel safe", accent: "text-rose-soft" },
  { key: "health", label: "Health", icon: Sprout, desc: "Grow habits", accent: "text-amber-glow-foreground" },
  { key: "growth", label: "Growth", icon: Star, desc: "See progress", accent: "text-plum" },
  { key: "twin", label: "Digital Twin", icon: Brain, desc: "Knows you", accent: "text-primary" },
];

export function MindSpace() {
  const world = useApp((s) => s.world);
  const setWorld = useApp((s) => s.setWorld);
  const setView = useApp((s) => s.setView);
  const profile = useApp((s) => s.profile);
  const companionName = useApp((s) => s.companionName);
  const twin = useTwin();
  const a11y = useAccessibility();
  const reduced = useReducedMotion() || a11y.motion === "reduced";
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Global keyboard shortcuts (Cmd+K companion, Cmd+/ help, Esc close)
  useKeyboardShortcuts();

  const day = twin.dayCount();
  const activeKey: World | "twin" = world === "growth" ? "growth" : world;

  return (
    <div className="relative min-h-screen flex flex-col">
      <a href="#main" className="nt-skip-link">Skip to main content</a>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-3 sm:px-6 h-14">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("landing")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="Back to home"
            >
              <NeuroTwinLogo size={28} />
              <span className="font-semibold tracking-tight hidden sm:block">
                MindSpace
              </span>
            </button>
            <span className="text-muted-foreground hidden md:inline">·</span>
            <span className="text-sm text-muted-foreground hidden md:inline">
              Day {day} with {companionName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <TwinStatusPill />
            <button
              onClick={() => window.dispatchEvent(new CustomEvent("neurotwin:show-shortcuts"))}
              className="hidden md:inline-flex items-center gap-1 rounded-full border border-border/60 bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              aria-label="Show keyboard shortcuts"
            >
              <Keyboard className="size-3.5" />
              <kbd className="font-mono">⌘K</kbd>
            </button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full gap-1.5 hidden sm:flex"
              onClick={() => setView("judge")}
            >
              <Trophy className="size-4" /> Judge
            </Button>
            <AccessibilityToolbar compact />
          </div>
        </div>

        {/* Mobile world tabs */}
        <nav className="sm:hidden flex items-center gap-1 px-2 pb-2 overflow-x-auto">
          {NAV.map((n) => (
            <button
              key={n.key}
              onClick={() => setWorld(n.key as World)}
              className={cn(
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm whitespace-nowrap transition-colors",
                activeKey === n.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-accent"
              )}
            >
              <n.icon className="size-4" />
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar (desktop) */}
        <aside className="hidden sm:flex w-60 lg:w-64 flex-col border-r bg-card/40 p-3 sticky top-14 h-[calc(100vh-3.5rem)]">
          <nav className="space-y-1 flex-1">
            {NAV.map((n) => (
              <button
                key={n.key}
                onClick={() => setWorld(n.key as World)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all group relative",
                  activeKey === n.key
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent"
                )}
              >
                {activeKey === n.key && !reduced && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1 rounded-r-full bg-primary"
                  />
                )}
                <span
                  className={cn(
                    "size-9 rounded-lg flex items-center justify-center transition-colors",
                    activeKey === n.key
                      ? "bg-primary/15"
                      : "bg-muted group-hover:bg-background"
                  )}
                >
                  <n.icon className={cn("size-4.5", activeKey === n.key ? n.accent : "text-muted-foreground")} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium leading-tight">
                    {n.label}
                  </span>
                  <span className="block text-xs text-muted-foreground leading-tight truncate">
                    {n.desc}
                  </span>
                </span>
              </button>
            ))}
          </nav>

          <div className="rounded-xl bg-gradient-to-br from-primary/10 to-amber-glow/10 p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1.5">
              <Brain className="size-4 text-primary" />
              <span className="text-xs font-medium">Twin is learning</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {profile.name ? `Hi ${profile.name}. ` : ""}I'm noticing patterns
              and adapting — gently, never silently.
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="w-full mt-2 h-7 text-xs"
              onClick={() => setWorld("twin" as any)}
            >
              See my Twin →
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main id="main" className="flex-1 min-w-0 min-h-0 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeKey}
              initial={reduced ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[calc(100vh-3.5rem)] pb-28 sm:pb-24"
            >
              <SensoryAdapter />
              {activeKey === "learn" && <LearnWorld />}
              {activeKey === "wellness" && <WellnessWorld />}
              {activeKey === "health" && <HealthWorld />}
              {activeKey === "growth" && <GrowthWorld />}
              {activeKey === "twin" && <TwinPanel />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <CompanionDock feature={activeKey} />
      <ShortcutsHelp />
      <IdleCheckIn />
    </div>
  );
}

function TwinStatusPill() {
  const twin = useTwin();
  const conf = twin.traits.confidence?.value ?? 0;
  const mood = twin.companionMood;
  const setWorld = useApp((s) => s.setWorld);
  return (
    <button
      onClick={() => setWorld("twin" as any)}
      className="hidden md:flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 hover:bg-accent transition-colors"
      aria-label={`Digital Twin status: ${mood}, confidence ${Math.round(conf)}%`}
    >
      <span className="relative flex size-5 items-center justify-center">
        <span className="absolute inset-0 rounded-full bg-primary/30 nt-breathe" />
        <NeuroTwinLogo size={16} />
      </span>
      <span className="text-xs text-muted-foreground capitalize">{mood}</span>
      <span className="h-3 w-px bg-border" />
      <span className="text-xs font-medium">{Math.round(conf)}%</span>
    </button>
  );
}

function WorldSkeleton() {
  return (
    <div className="p-6 space-y-4">
      <div className="h-8 w-48 rounded-lg bg-muted nt-shimmer" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted nt-shimmer" />
        ))}
      </div>
    </div>
  );
}
