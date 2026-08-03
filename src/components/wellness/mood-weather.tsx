"use client";

import { useState } from "react";
import {
  CloudSun,
  CloudRain,
  Sparkles,
  Wind,
  Moon,
  CloudFog,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { MotionDiv, fadeUp, scaleIn } from "@/components/shared/motion";
import { useWellness, moodMeta, type MoodKind } from "@/store/wellness";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Local override map — we keep moodMeta's labels/emoji/desc but
// re-map gradients to the calm palette (NO blue/indigo per design contract).
const moodVisual: Record<
  MoodKind,
  {
    icon: typeof CloudSun;
    gradient: string; // tailwind gradient utility classes
    ring: string; // ring/border color when selected
    chip: string; // soft chip background
    accent: string; // accent text color
  }
> = {
  sunny: {
    icon: CloudSun,
    gradient: "from-amber-200/70 via-amber-100/50 to-rose-100/40",
    ring: "ring-amber-glow-foreground/40",
    chip: "bg-amber-glow/15 text-amber-glow-foreground",
    accent: "text-amber-glow-foreground",
  },
  cloudy: {
    icon: Wind,
    gradient: "from-stone-200/70 via-stone-100/50 to-rose-100/30",
    ring: "ring-stone-500/30",
    chip: "bg-stone-200/60 text-stone-600 dark:text-stone-300",
    accent: "text-stone-500 dark:text-stone-300",
  },
  rainy: {
    icon: CloudRain,
    gradient: "from-rose-200/60 via-rose-100/40 to-primary/30",
    ring: "ring-rose-soft/40",
    chip: "bg-rose-soft/15 text-rose-soft-foreground",
    accent: "text-rose-soft",
  },
  stormy: {
    icon: Sparkles,
    gradient: "from-plum/40 via-rose-200/40 to-stone-200/40",
    ring: "ring-plum/40",
    chip: "bg-plum/15 text-plum-foreground",
    accent: "text-plum",
  },
  foggy: {
    icon: CloudFog,
    gradient: "from-stone-100/70 via-rose-50/50 to-amber-50/30",
    ring: "ring-stone-400/30",
    chip: "bg-stone-100/60 text-stone-600 dark:text-stone-300",
    accent: "text-stone-500 dark:text-stone-300",
  },
  starry: {
    icon: Moon,
    gradient: "from-plum/40 via-rose-100/40 to-amber-100/30",
    ring: "ring-plum/40",
    chip: "bg-plum/10 text-plum-foreground",
    accent: "text-plum",
  },
};

const MOOD_ORDER: MoodKind[] = [
  "sunny",
  "cloudy",
  "rainy",
  "stormy",
  "foggy",
  "starry",
];

export function MoodWeather() {
  const [pendingMood, setPendingMood] = useState<MoodKind | null>(null);
  const [energy, setEnergy] = useState(50);
  const [note, setNote] = useState("");

  const moods = useWellness((s) => s.moods);
  const addMood = useWellness((s) => s.addMood);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const setCompanionMood = useTwin((s) => s.setCompanionMood);
  const { toast } = useToast();

  const latest = moods.length ? moods[moods.length - 1] : null;
  const latestVisual = latest ? moodVisual[latest.mood] : null;
  const latestMeta = latest ? moodMeta[latest.mood] : null;

  const openSheet = (mood: MoodKind) => {
    setPendingMood(mood);
    setEnergy(50);
    setNote("");
  };

  const handleSave = () => {
    if (!pendingMood) return;
    addMood({ mood: pendingMood, energy, note: note.trim() });
    bumpTrait(
      "calm",
      pendingMood === "sunny" || pendingMood === "starry" ? 3 : -2,
      `Mood: ${pendingMood}`
    );
    setCompanionMood(
      pendingMood === "stormy"
        ? "calm"
        : pendingMood === "sunny"
        ? "encouraging"
        : "attentive"
    );
    toast({
      title: "Mood noted — thank you",
      description: "Whatever you feel is okay here.",
    });
    setPendingMood(null);
  };

  return (
    <section
      aria-labelledby="mood-weather-heading"
      className="space-y-4"
    >
      <div className="flex items-baseline justify-between gap-2 flex-wrap">
        <div>
          <h2 id="mood-weather-heading" className="text-xl font-semibold">
            Mood Weather
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pick the weather that feels closest right now. No wrong answer.
          </p>
        </div>
        {latest && latestMeta && (
          <Badge
            variant="secondary"
            className="rounded-full px-3 py-1 gap-1.5"
          >
            <span aria-hidden>{latestMeta.emoji}</span>
            <span className="capitalize">{latestMeta.label}</span>
            <span className="text-muted-foreground">· {latest.energy}% energy</span>
          </Badge>
        )}
      </div>

      {/* Today's latest mood — prominent */}
      {latest && latestVisual && latestMeta ? (
        <MotionDiv
          key={latest.id}
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className={cn(
            "relative overflow-hidden rounded-2xl border border-border/60 nt-shadow-soft",
            "bg-gradient-to-br",
            latestVisual.gradient
          )}
        >
          <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-5">
            <div
              className="size-16 rounded-2xl bg-card/70 backdrop-blur flex items-center justify-center text-3xl shrink-0"
              aria-hidden
            >
              {latestMeta.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
                Today you feel
              </p>
              <p className="text-2xl font-semibold capitalize">
                {latestMeta.label}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {latestMeta.desc}. Energy at {latest.energy}%.
              </p>
              {latest.note ? (
                <p className="text-sm mt-2 italic text-foreground/80">
                  “{latest.note}”
                </p>
              ) : null}
            </div>
          </div>
        </MotionDiv>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/70 p-6 text-center bg-muted/30">
          <p className="text-sm text-muted-foreground">
            No mood logged yet. Tap a weather card below to begin — it only
            takes a moment.
          </p>
        </div>
      )}

      {/* Row of mood cards */}
      <div
        role="radiogroup"
        aria-label="Choose a mood"
        className="grid grid-cols-3 sm:grid-cols-6 gap-2.5"
      >
        {MOOD_ORDER.map((mood) => {
          const meta = moodMeta[mood];
          const vis = moodVisual[mood];
          const Icon = vis.icon;
          const isActive = latest?.mood === mood;
          return (
            <MotionDiv key={mood} variants={fadeUp} initial="hidden" animate="visible">
              <button
                role="radio"
                aria-checked={isActive}
                aria-label={`Log ${meta.label.toLowerCase()} mood — ${meta.desc}`}
                onClick={() => openSheet(mood)}
                className={cn(
                  "group w-full rounded-2xl border border-border/60 p-3 sm:p-4 flex flex-col items-center gap-1.5 transition-all",
                  "bg-gradient-to-br",
                  vis.gradient,
                  "hover:-translate-y-0.5 hover:nt-shadow-soft focus-visible:ring-[3px]",
                  isActive && cn("ring-2", vis.ring)
                )}
              >
                <span className="text-2xl sm:text-3xl" aria-hidden>
                  {meta.emoji}
                </span>
                <span className={cn("text-xs font-medium", vis.accent)}>
                  {meta.label}
                </span>
                <Icon className="size-3 text-muted-foreground mt-0.5 opacity-70" aria-hidden />
              </button>
            </MotionDiv>
          );
        })}
      </div>

      {/* Mood dialog */}
      <Dialog open={!!pendingMood} onOpenChange={(o) => !o && setPendingMood(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              {pendingMood && (
                <span aria-hidden className="text-2xl">
                  {moodMeta[pendingMood].emoji}
                </span>
              )}
              {pendingMood && (
                <span className="capitalize">{moodMeta[pendingMood].label}</span>
              )}
            </DialogTitle>
            <DialogDescription>
              {pendingMood && moodMeta[pendingMood].desc}. Add a note if it
              helps — or skip it. Energy is just a snapshot, never a score.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="mood-energy"
                  className="text-sm font-medium"
                >
                  Energy right now
                </label>
                <span className="text-sm text-muted-foreground tabular-nums">
                  {energy}%
                </span>
              </div>
              <Slider
                id="mood-energy"
                value={[energy]}
                onValueChange={(v) => setEnergy(v[0])}
                aria-label="Energy level"
              />
              <div className="flex justify-between text-[11px] text-muted-foreground mt-1.5">
                <span>Running on empty</span>
                <span>Plenty left</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="mood-note"
                className="text-sm font-medium block mb-2"
              >
                A note (optional)
              </label>
              <Textarea
                id="mood-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="A word about what's here, or nothing at all."
                className="min-h-20 resize-none"
                maxLength={300}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="ghost" className="rounded-full">
                <X className="size-4" /> Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleSave}
              className="rounded-full bg-primary text-primary-foreground"
            >
              <Check className="size-4" /> Save mood
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
