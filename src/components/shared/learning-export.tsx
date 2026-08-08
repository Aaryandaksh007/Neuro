"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import {
  FileText,
  X,
  Loader2,
  Printer,
  Download,
  GraduationCap,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useWellness } from "@/store/wellness";
import { useHealth } from "@/store/health";
import { useGrowth } from "@/store/growth";
import { useToast } from "@/hooks/use-toast";
import { useSessionId } from "@/components/shared/use-session-id";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const isToday = (ts: number) =>
  new Date(ts).toDateString() === new Date().toDateString();

export function LearningExport() {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<"parent" | "educator">("parent");
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profile = useApp((s) => s.profile);
  const twin = useTwin();
  const sessionId = useSessionId();
  const { toast } = useToast();
  const reduced = useReducedMotion();

  const allMoods = useWellness((s) => s.moods);
  const allVictories = useWellness((s) => s.victories);
  const allGratitudes = useWellness((s) => s.gratitudes);
  const allLogs = useHealth((s) => s.logs);
  const allSessions = useGrowth((s) => s.sessions);
  const allStars = useGrowth((s) => s.stars);

  const moods = useMemo(() => allMoods.filter((m) => isToday(m.createdAt)), [allMoods]);
  const victories = useMemo(() => allVictories.filter((v) => isToday(v.createdAt)), [allVictories]);
  const gratitudes = useMemo(() => allGratitudes.filter((g) => isToday(g.createdAt)), [allGratitudes]);
  const healthLogs = useMemo(() => allLogs.filter((l) => isToday(l.createdAt)), [allLogs]);
  const sessions = useMemo(() => allSessions.filter((s) => isToday(s.createdAt)), [allSessions]);
  const stars = useMemo(() => allStars.filter((s) => isToday(s.earnedAt)), [allStars]);

  const todayData = useMemo(
    () => ({
      lessons: stars.map((s) => s.concept),
      moods: moods.map((m) => ({ mood: m.mood, energy: m.energy })),
      victories: victories.map((v) => v.text),
      gratitudes: gratitudes.map((g) => g.text),
      healthLogs: healthLogs.length,
      focusMinutes: sessions.reduce((a, s) => a + s.minutes, 0),
    }),
    [stars, moods, victories, gratitudes, healthLogs, sessions]
  );

  const generate = async () => {
    setOpen(true);
    setLoading(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          profile,
          twin: { traits: twin.traits },
          today: todayData,
          format,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSummary(data.summary);
      toast({
        title: "Summary ready",
        description: "You can print or save this as a PDF.",
      });
    } catch (e: any) {
      setError(e?.message || "Couldn't generate the summary.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger */}
      <Button
        variant="outline"
        size="sm"
        onClick={generate}
        className="gap-1.5 rounded-full"
      >
        <FileText className="size-3.5" /> Export summary
      </Button>

      {/* Dialog */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-label="Learning summary export"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={reduced ? false : { scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={reduced ? { opacity: 0 } : { scale: 0.97, opacity: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative max-w-2xl w-full max-h-[85vh] overflow-y-auto rounded-3xl border bg-card nt-shadow-soft"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b bg-card/95 backdrop-blur print:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-base font-semibold leading-tight">
                      Learning summary
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      For a parent or educator — strengths-based, never diagnostic
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="size-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Format selector + content */}
              <div className="p-6 print:p-0">
                {!summary && !loading && !error && (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Choose who this summary is for:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setFormat("parent")}
                        aria-pressed={format === "parent"}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          format === "parent"
                            ? "border-primary bg-primary/10 nt-shadow-soft"
                            : "hover:bg-accent"
                        )}
                      >
                        <Heart className="size-5 mb-2 text-rose-soft" />
                        <p className="text-sm font-medium">For a parent</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Gentle, everyday language
                        </p>
                      </button>
                      <button
                        onClick={() => setFormat("educator")}
                        aria-pressed={format === "educator"}
                        className={cn(
                          "rounded-xl border p-4 text-left transition-all",
                          format === "educator"
                            ? "border-primary bg-primary/10 nt-shadow-soft"
                            : "hover:bg-accent"
                        )}
                      >
                        <GraduationCap className="size-5 mb-2 text-primary" />
                        <p className="text-sm font-medium">For an educator</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Learning-focused, strengths-based
                        </p>
                      </button>
                    </div>
                    <Button
                      onClick={generate}
                      className="w-full rounded-full gap-1.5"
                    >
                      <FileText className="size-4" /> Generate summary
                    </Button>
                  </div>
                )}

                {loading && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="size-4 animate-spin" />
                      Writing a gentle summary…
                    </div>
                    <div className="space-y-2">
                      <div className="nt-shimmer h-5 rounded-md w-3/4" />
                      <div className="nt-shimmer h-3 rounded-md w-full" />
                      <div className="nt-shimmer h-3 rounded-md w-11/12" />
                      <div className="nt-shimmer h-3 rounded-md w-4/5" />
                    </div>
                  </div>
                )}

                {error && (
                  <div className="text-center py-6">
                    <p className="text-sm text-rose-soft-foreground">{error}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3 rounded-full"
                      onClick={() => {
                        setError(null);
                        generate();
                      }}
                    >
                      Try again
                    </Button>
                  </div>
                )}

                {summary && !loading && (
                  <div className="space-y-4">
                    {/* Printable summary */}
                    <div className="rounded-xl border bg-background p-5 print:border-0 print:p-0">
                      <div className="prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            h2: ({ node, ...p }) => (
                              <h2 className="text-lg font-semibold mt-0 mb-3" {...p} />
                            ),
                            h3: ({ node, ...p }) => (
                              <h3 className="text-sm font-semibold mt-3 mb-1.5" {...p} />
                            ),
                            p: ({ node, ...p }) => (
                              <p className="text-sm leading-relaxed my-2" {...p} />
                            ),
                            strong: ({ node, ...p }) => (
                              <strong className="font-semibold" {...p} />
                            ),
                          }}
                        >
                          {summary}
                        </ReactMarkdown>
                      </div>

                      {/* Activity data */}
                      <div className="mt-5 pt-4 border-t">
                        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                          Today&apos;s activity
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Lessons</p>
                            <p className="font-semibold tabular-nums">{todayData.lessons.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Check-ins</p>
                            <p className="font-semibold tabular-nums">{todayData.moods.length}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Care logs</p>
                            <p className="font-semibold tabular-nums">{todayData.healthLogs}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Focus min</p>
                            <p className="font-semibold tabular-nums">{todayData.focusMinutes}</p>
                          </div>
                        </div>
                      </div>

                      <p className="text-[10px] text-muted-foreground mt-4">
                        Generated by NeuroMastishk OS · {new Date().toLocaleDateString()} · This is a
                        reflective summary, not a diagnostic or medical document.
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 print:hidden">
                      <Button
                        onClick={handlePrint}
                        className="flex-1 gap-1.5 rounded-full"
                      >
                        <Printer className="size-4" /> Print / Save as PDF
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSummary(null);
                          setOpen(false);
                        }}
                        className="rounded-full"
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
