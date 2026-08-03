"use client";

import { useEffect, useState } from "react";
import { Check, Bell, Plus, Pill, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHealth, type Reminder } from "@/store/health";
import { useTwin } from "@/store/twin";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface MedReminder {
  id: string;
  label: string;
  cadenceHours: number;
  lastDone: number | null;
}

const MEDS_KEY = "neurotwin-med-reminders";

function timeSince(ts: number | null): string {
  if (!ts) return "Not done yet today";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function Reminders() {
  const reminders = useHealth((s) => s.reminders);
  const markDone = useHealth((s) => s.markReminderDone);
  const bumpTrait = useTwin((s) => s.bumpTrait);
  const addLog = useHealth((s) => s.addLog);
  const { toast } = useToast();

  const [meds, setMeds] = useState<MedReminder[]>([]);
  const [newMed, setNewMed] = useState("");

  // Load local medication reminders
  useEffect(() => {
    try {
      const raw = localStorage.getItem(MEDS_KEY);
      if (raw) setMeds(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);

  // Persist meds
  useEffect(() => {
    try {
      localStorage.setItem(MEDS_KEY, JSON.stringify(meds));
    } catch {
      /* ignore */
    }
  }, [meds]);

  const handleDone = (r: Reminder) => {
    markDone(r.id);
    addLog({ type: r.type, value: 1, unit: r.type });
    bumpTrait("calm", 1, `Took care of: ${r.label.toLowerCase()}`);
    toast({
      title: "Nicely done 💚",
      description: `${r.label} — marked done.`,
    });
  };

  const handleMedDone = (id: string, label: string) => {
    setMeds((arr) =>
      arr.map((m) => (m.id === id ? { ...m, lastDone: Date.now() } : m))
    );
    bumpTrait("calm", 1, `Took care of: ${label.toLowerCase()}`);
    toast({ title: "Marked done 💚", description: label });
  };

  const addMed = () => {
    const v = newMed.trim();
    if (!v) return;
    setMeds((arr) => [
      ...arr,
      {
        id: `med-${Date.now()}`,
        label: v,
        cadenceHours: 24,
        lastDone: null,
      },
    ]);
    setNewMed("");
    toast({
      title: "Reminder added",
      description: `“${v}” — gentle nudges only.`,
    });
  };

  const removeMed = (id: string) => {
    setMeds((arr) => arr.filter((m) => m.id !== id));
  };

  return (
    <Card className="nt-gradient-amber nt-shadow-soft rounded-2xl p-6 border-amber-glow/20">
      <header className="flex items-center gap-2 mb-1">
        <Bell className="size-5 text-amber-glow-foreground" aria-hidden />
        <h3 className="text-lg font-semibold">Gentle Nudges</h3>
      </header>
      <p className="text-sm text-muted-foreground mb-5">
        Small reminders, never demands. Skip any time — your companion
        understands.
      </p>

      <ul
        className="space-y-2.5 max-h-96 overflow-y-auto pr-1"
        style={{ scrollbarWidth: "thin" }}
      >
        {reminders.map((r) => {
          const due =
            !r.lastDone ||
            (Date.now() - r.lastDone) / 3600000 >= r.cadenceHours;
          return (
            <li
              key={r.id}
              className={cn(
                "flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors",
                due
                  ? "border-amber-glow/30 bg-amber-glow/5"
                  : "border-border bg-background/40"
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{r.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {due ? (
                    <span className="text-amber-glow-foreground">
                      A gentle nudge
                    </span>
                  ) : (
                    `Done ${timeSince(r.lastDone)}`
                  )}
                  <span aria-hidden> · </span>every {r.cadenceHours}h
                </p>
              </div>
              <Button
                size="sm"
                variant={due ? "default" : "outline"}
                className="rounded-full shrink-0"
                onClick={() => handleDone(r)}
                aria-label={`Mark "${r.label}" done`}
              >
                <Check className="size-3.5" aria-hidden /> Done
              </Button>
            </li>
          );
        })}

        {meds.map((m) => {
          const due =
            !m.lastDone ||
            (Date.now() - m.lastDone) / 3600000 >= m.cadenceHours;
          return (
            <li
              key={m.id}
              className={cn(
                "flex items-center justify-between gap-3 p-3 rounded-xl border transition-colors",
                due
                  ? "border-plum/30 bg-plum/5"
                  : "border-border bg-background/40"
              )}
            >
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <Pill
                  className="size-4 text-plum shrink-0"
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{m.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {m.lastDone ? (
                      `Taken ${timeSince(m.lastDone)}`
                    ) : (
                      <span className="text-plum">A gentle reminder</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button
                  size="sm"
                  variant={due ? "default" : "outline"}
                  className="rounded-full"
                  onClick={() => handleMedDone(m.id, m.label)}
                  aria-label={`Mark "${m.label}" done`}
                >
                  <Check className="size-3.5" aria-hidden /> Done
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() => removeMed(m.id)}
                  aria-label={`Remove "${m.label}" reminder`}
                >
                  <X className="size-3.5" aria-hidden />
                </Button>
              </div>
            </li>
          );
        })}

        {reminders.length === 0 && meds.length === 0 && (
          <li className="p-4 text-center text-sm text-muted-foreground">
            No reminders yet. Add one below — gently.
          </li>
        )}
      </ul>

      {/* Add custom (medication / personal) reminder */}
      <div className="mt-4 flex gap-2">
        <Input
          value={newMed}
          onChange={(e) => setNewMed(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addMed();
          }}
          placeholder="Add a gentle reminder (e.g. evening vitamin)"
          aria-label="New reminder text"
          className="flex-1"
          maxLength={60}
        />
        <Button
          onClick={addMed}
          size="icon"
          aria-label="Add reminder"
          className="rounded-full shrink-0"
        >
          <Plus className="size-4" aria-hidden />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Custom reminders are stored on your device only.
      </p>
    </Card>
  );
}
