"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ImagePlus, Loader2, Sparkles, RefreshCw, type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

interface LessonIllustrationProps {
  topic: string;
  className?: string;
}

const STYLES = [
  { key: "soft" as const, label: "Soft", desc: "Gentle watercolor" },
  { key: "vivid" as const, label: "Vivid", desc: "Bright & clear" },
  { key: "minimal" as const, label: "Minimal", desc: "Simple shapes" },
  { key: "storybook" as const, label: "Story", desc: "Hand-drawn" },
];

export function LessonIllustration({ topic, className }: LessonIllustrationProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [style, setStyle] = useState<"soft" | "vivid" | "minimal" | "storybook">("soft");
  const [showStylePicker, setShowStylePicker] = useState(false);

  const reduced = useReducedMotion();
  const twin = useTwin();
  const { toast } = useToast();

  const generate = async (selectedStyle?: typeof style) => {
    if (!topic.trim() || loading) return;
    const s = selectedStyle || style;
    setLoading(true);
    setError(null);
    setImageUrl(null);
    try {
      const res = await fetch("/api/illustrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, style: s }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setImageUrl(data.imageUrl);
      twin.bumpTrait("visualPreference", 2, "You generated a visual for a lesson.");
      twin.addMemory({
        text: `You created an illustration for "${topic.slice(0, 50)}".`,
        kind: "observation",
      });
      toast({
        title: "Illustration ready",
        description: "A visual for your lesson — right alongside the words.",
      });
    } catch (e: any) {
      setError(e?.message || "Couldn't create that illustration.");
    } finally {
      setLoading(false);
    }
  };

  const handleStylePick = (s: typeof style) => {
    setStyle(s);
    setShowStylePicker(false);
    if (imageUrl || loading) {
      generate(s);
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border-primary/20 nt-gradient-sage nt-shadow-soft",
        className
      )}
    >
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
              <ImagePlus className="size-4 text-primary" aria-hidden />
            </span>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold leading-tight">
                Visual for this lesson
              </h3>
              <p className="text-xs text-muted-foreground leading-tight truncate">
                See it, not just read it
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="rounded-full text-[10px] gap-1">
            <Sparkles className="size-3" /> AI-generated
          </Badge>
        </div>

        {/* Image area */}
        <div className="relative aspect-square sm:aspect-[4/3] rounded-xl overflow-hidden bg-muted/40 border border-border/50">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <div className="relative">
                {!reduced && (
                  <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl nt-breathe" />
                )}
                <Loader2 className="size-8 animate-spin text-primary relative" />
              </div>
              <p className="text-xs text-muted-foreground">
                Painting your lesson…
              </p>
              <div className="w-32 space-y-1.5">
                <div className="nt-shimmer h-2 rounded-full" />
                <div className="nt-shimmer h-2 rounded-full w-3/4" />
              </div>
            </div>
          )}

          {imageUrl && !loading && (
            <motion.div
              initial={reduced ? false : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0"
            >
              <img
                src={imageUrl}
                alt={`AI-generated illustration about ${topic}`}
                className="size-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </motion.div>
          )}

          {!imageUrl && !loading && !error && (
            <button
              onClick={() => generate()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 group hover:bg-muted/60 transition-colors"
              aria-label={`Generate an illustration about ${topic}`}
            >
              <div className="relative size-14 flex items-center justify-center">
                {!reduced && (
                  <div className="absolute inset-0 rounded-full bg-primary/15 blur-lg nt-breathe" />
                )}
                <div className="relative size-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:scale-110 transition-transform">
                  <ImagePlus className="size-6 text-primary" />
                </div>
              </div>
              <p className="text-xs font-medium text-foreground/80 text-center px-4">
                Generate a visual
              </p>
              <p className="text-[10px] text-muted-foreground text-center px-4 max-w-[200px]">
                An illustration of &ldquo;{topic.length > 40 ? topic.slice(0, 38) + "…" : topic}&rdquo;
              </p>
            </button>
          )}

          {error && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
              <p className="text-xs text-rose-soft-foreground">{error}</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => generate()}
                className="rounded-full gap-1.5"
              >
                <RefreshCw className="size-3.5" /> Try again
              </Button>
            </div>
          )}

          {/* Style picker toggle */}
          {imageUrl && !loading && (
            <button
              onClick={() => setShowStylePicker((s) => !s)}
              className="absolute top-2 right-2 size-7 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background transition-colors"
              aria-label="Change illustration style"
            >
              <RefreshCw className="size-3.5" />
            </button>
          )}
        </div>

        {/* Style picker */}
        {(showStylePicker || !imageUrl) && !loading && (
          <MotionDiv
            initial={reduced ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mt-3"
          >
            <p className="text-[11px] text-muted-foreground mb-1.5">Style</p>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s.key}
                  onClick={() => handleStylePick(s.key)}
                  aria-pressed={style === s.key}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs transition-all",
                    style === s.key
                      ? "border-primary bg-primary/15 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </MotionDiv>
        )}

        {/* Generate / regenerate button */}
        {!imageUrl && !loading && !error && (
          <Button
            onClick={() => generate()}
            className="mt-3 w-full gap-1.5 rounded-full"
            size="sm"
          >
            <Sparkles className="size-3.5" /> Illustrate this lesson
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          Illustrations are generated to be calm, clear, and uncluttered —
          designed for visual learners.
        </p>
      </div>
    </Card>
  );
}
