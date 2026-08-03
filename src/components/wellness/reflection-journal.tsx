"use client";

import { useState } from "react";
import {
  NotebookPen,
  Send,
  Sparkles,
  RotateCcw,
  Loader2,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MotionDiv, fadeUp } from "@/components/shared/motion";
import { useWellness } from "@/store/wellness";
import { useSessionId } from "@/components/shared/use-session-id";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type Mode = "reflect" | "reframe" | "encourage";

interface ModeDef {
  key: Mode;
  label: string;
  blurb: string;
  accent: string;
}

const MODES: ModeDef[] = [
  {
    key: "reflect",
    label: "Reflect",
    blurb: "Mirror back what's here.",
    accent: "text-primary",
  },
  {
    key: "reframe",
    label: "Reframe",
    blurb: "Find a kinder angle.",
    accent: "text-amber-glow-foreground",
  },
  {
    key: "encourage",
    label: "Encourage",
    blurb: "A warm word for effort.",
    accent: "text-rose-soft",
  },
];

interface LocalEntry {
  id: string;
  text: string;
  reply: string;
  mode: Mode;
  createdAt: number;
}

export function ReflectionJournal() {
  const sessionId = useSessionId();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<Mode>("reflect");
  const [loading, setLoading] = useState(false);
  const [entries, setEntries] = useState<LocalEntry[]>([]);
  const { toast } = useToast();

  const latestMood = useWellness((s) => s.latestMood());

  const handleSubmit = async () => {
    if (!text.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/reflection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          text: text.trim(),
          mood: latestMood?.mood,
          energy: latestMood?.energy,
          mode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reflection failed");
      setEntries((prev) => [
        {
          id: `r-${Date.now()}`,
          text: text.trim(),
          reply: data.reply as string,
          mode,
          createdAt: Date.now(),
        },
        ...prev,
      ]);
      setText("");
      toast({
        title: "Reflection saved",
        description: "Your words are held gently here.",
      });
    } catch (e: any) {
      toast({
        title: "Couldn't reflect right now",
        description: e?.message || "Please try again in a moment.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    // Cmd/Ctrl + Enter to submit — but never force
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section
      aria-labelledby="reflection-journal-heading"
      className="rounded-2xl border border-border/60 bg-card nt-shadow-soft nt-gradient-rose p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 mb-1">
        <NotebookPen className="size-4 text-rose-soft" />
        <h2 id="reflection-journal-heading" className="text-lg font-semibold">
          Reflection Journal
        </h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Write what's on your mind. A gentle AI reflection will appear below.
        This is not therapy — just a kind mirror.
      </p>

      {/* Mode chips */}
      <div
        role="radiogroup"
        aria-label="Reflection mode"
        className="flex flex-wrap gap-2 mb-3"
      >
        {MODES.map((m) => (
          <button
            key={m.key}
            role="radio"
            aria-checked={mode === m.key}
            aria-label={`${m.label} — ${m.blurb}`}
            onClick={() => setMode(m.key)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm border transition-all",
              mode === m.key
                ? "bg-rose-soft/15 text-rose-soft-foreground border-rose-soft/40 ring-1 ring-rose-soft/30"
                : "bg-card/60 border-border/60 hover:bg-accent"
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder="Today I noticed… (or whatever wants to be written)"
        maxLength={2000}
        className="min-h-32 resize-y"
        aria-label="Your reflection"
      />

      <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
        <p className="text-xs text-muted-foreground">
          {text.length}/2000 · ⌘/Ctrl + Enter to send
        </p>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full"
            onClick={() => setText("")}
            disabled={!text || loading}
          >
            <RotateCcw className="size-3.5" /> Clear
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!text.trim() || loading}
            className="rounded-full bg-rose-soft text-rose-soft-foreground hover:bg-rose-soft/90"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Reflecting…
              </>
            ) : (
              <>
                <Send className="size-4" /> Reflect with me
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Entries */}
      {entries.length > 0 && (
        <div className="mt-6 space-y-3 max-h-96 overflow-y-auto pr-1 -mr-1">
          {entries.map((entry) => {
            const m = MODES.find((x) => x.key === entry.mode)!;
            return (
              <MotionDiv
                key={entry.id}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
                className="rounded-2xl border border-border/50 bg-background/60 p-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    variant="secondary"
                    className={cn("rounded-full capitalize", m.accent)}
                  >
                    {m.label}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-3 italic text-foreground/80">
                  “{entry.text}”
                </p>
                <div className="rounded-xl bg-gradient-to-br from-rose-soft/10 to-primary/5 border border-rose-soft/20 p-3">
                  <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-rose-soft font-medium mb-1.5">
                    <Heart className="size-3" /> A gentle reflection
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {entry.reply}
                  </p>
                </div>
              </MotionDiv>
            );
          })}
        </div>
      )}

      {entries.length === 0 && (
        <div className="mt-5 rounded-xl bg-muted/40 border border-dashed border-border/60 p-4 text-center">
          <Sparkles className="size-4 mx-auto text-muted-foreground mb-1" />
          <p className="text-xs text-muted-foreground">
            Your reflections will appear here, kept only on your device.
          </p>
        </div>
      )}
    </section>
  );
}
