"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Plus, PartyPopper, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fadeUp } from "@/components/shared/motion";
import { useWellness } from "@/store/wellness";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

export function TinyVictories() {
  const [text, setText] = useState("");
  const victories = useWellness((s) => s.victories);
  const addVictory = useWellness((s) => s.addVictory);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const bumpPersistence = useGrowth((s) => s.bumpPersistence);
  const { toast } = useToast();

  const handleAdd = () => {
    if (!text.trim()) return;
    addVictory(text.trim());
    bumpTrait("confidence", 4, "Logged a tiny victory.");
    bumpPersistence(1);
    toast({
      title: "Tiny victory celebrated 🌱",
      description: `"${text.trim()}" — counted. Always.`,
    });
    setText("");
  };

  const recent = [...victories].reverse().slice(0, 20);

  return (
    <section
      aria-labelledby="tiny-victories-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-amber p-5 sm:p-6 h-full"
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="size-8 rounded-lg bg-amber-glow/15 flex items-center justify-center">
          <Trophy className="size-4 text-amber-glow-foreground" />
        </span>
        <div>
          <h2 id="tiny-victories-heading" className="text-lg font-semibold">
            Tiny Victories
          </h2>
          <p className="text-xs text-muted-foreground">
            Small counts. Always.
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
          placeholder="I drank water · I started my homework · …"
          aria-label="Add a tiny victory"
          maxLength={120}
        />
        <Button
          onClick={handleAdd}
          disabled={!text.trim()}
          className="rounded-full bg-amber-glow text-amber-glow-foreground hover:bg-amber-glow/90"
          aria-label="Add victory"
        >
          <Plus className="size-4" /> Add
        </Button>
      </div>

      {recent.length === 0 ? (
        <div className="rounded-xl bg-muted/30 border border-dashed border-border/60 p-4 text-center">
          <Sparkles className="size-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">
            No victories yet — and that's okay. The smallest one counts as a
            start.
          </p>
        </div>
      ) : (
        <ul
          className="space-y-2 max-h-72 overflow-y-auto pr-1 -mr-1"
          aria-label="Your tiny victories"
        >
          <AnimatePresence initial={false}>
            {recent.map((v, i) => (
              <motion.li
                key={v.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: 20 }}
                className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-amber-glow/10 to-rose-soft/5 border border-border/40 p-3"
              >
                <span
                  className={cn(
                    "mt-0.5 size-6 rounded-full flex items-center justify-center shrink-0",
                    i === 0
                      ? "bg-amber-glow/25 text-amber-glow-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  {i === 0 ? (
                    <PartyPopper className="size-3.5" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-snug">{v.text}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {timeAgo(v.createdAt)}
                  </p>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {recent.length > 0 && (
        <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5">
          <Sparkles className="size-3" />
          {recent.length} logged · You're showing up for yourself.
        </p>
      )}
    </section>
  );
}
