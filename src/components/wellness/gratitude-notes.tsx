"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HandHeart, Plus, Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/components/shared/motion";
import { useWellness } from "@/store/wellness";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useToast } from "@/hooks/use-toast";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function GratitudeNotes() {
  const [text, setText] = useState("");
  const gratitudes = useWellness((s) => s.gratitudes);
  const addGratitude = useWellness((s) => s.addGratitude);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const bumpKindness = useGrowth((s) => s.bumpKindness);
  const { toast } = useToast();

  const handleAdd = () => {
    if (!text.trim()) return;
    addGratitude(text.trim());
    bumpTrait("calm", 2, "Practiced gratitude.");
    bumpKindness(2);
    toast({
      title: "Noted with care 🌿",
      description: "Gratitude doesn't fix anything. It just lights a candle.",
    });
    setText("");
  };

  const recent = [...gratitudes].reverse().slice(0, 20);

  return (
    <section
      aria-labelledby="gratitude-notes-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-rose p-5 sm:p-6 h-full"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="size-8 rounded-lg bg-rose-soft/15 flex items-center justify-center">
          <HandHeart className="size-4 text-rose-soft" />
        </span>
        <div>
          <h2 id="gratitude-notes-heading" className="text-lg font-semibold">
            Gratitude Notes
          </h2>
          <p className="text-xs text-muted-foreground">
            Tiny candles in the dark.
          </p>
        </div>
      </div>

      <div className="flex gap-2 mt-4 mb-4">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
          placeholder="The sun on my desk · A kind text · …"
          aria-label="Add a gratitude note"
          maxLength={120}
        />
        <Button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="rounded-full bg-rose-soft text-rose-soft-foreground hover:bg-rose-soft/90"
          aria-label="Add gratitude"
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-xl bg-muted/30 border border-dashed border-border/60 p-4 text-center">
          <Heart className="size-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">
            Nothing yet — that's okay. Even “I made it here today” counts.
          </p>
        </div>
      ) : (
        <ul
          className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1 -mr-1"
          aria-label="Your gratitude notes"
        >
          <AnimatePresence initial={false}>
            {recent.map((g) => (
              <motion.li
                key={g.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="rounded-xl bg-gradient-to-br from-rose-soft/10 to-primary/5 border border-border/40 p-3 flex flex-col gap-1.5"
              >
                <div className="flex items-start gap-2">
                  <Sparkles className="size-3.5 text-rose-soft shrink-0 mt-0.5" />
                  <p className="text-sm leading-snug">{g.text}</p>
                </div>
                <p className="text-[11px] text-muted-foreground ml-5">
                  {timeAgo(g.createdAt)}
                </p>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {recent.length > 0 && (
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <Heart className="size-3" />
          {recent.length} candles lit · Keep going gently.
        </p>
      )}
    </section>
  );
}
