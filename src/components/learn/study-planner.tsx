"use client";

import { useState, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  CalendarClock,
  Plus,
  Check,
  Trash2,
  Sparkles,
  Brain,
  TrendingUp,
  Clock,
  RotateCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStudy, type StudyItem } from "@/store/study";
import { useTwin } from "@/store/twin";
import { useGrowth } from "@/store/growth";
import { useApp } from "@/store/app";
import { useToast } from "@/hooks/use-toast";
import { MotionDiv, fadeUp, stagger } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

function relativeTime(ts: number): string {
  const diff = ts - Date.now();
  const abs = Math.abs(diff);
  const day = 86400000;
  const hour = 3600000;
  if (abs < hour) return diff > 0 ? "in <1h" : "just now";
  if (abs < day) {
    const h = Math.round(abs / hour);
    return diff > 0 ? `in ${h}h` : `${h}h ago`;
  }
  const d = Math.round(abs / day);
  return diff > 0 ? `in ${d}d` : `${d}d ago`;
}

export function StudyPlanner() {
  const items = useStudy((s) => s.items);
  const addItem = useStudy((s) => s.addItem);
  const reviewItem = useStudy((s) => s.reviewItem);
  const removeItem = useStudy((s) => s.removeItem);
  const twin = useTwin();
  const addStar = useGrowth((s) => s.addStar);
  const bumpPersistence = useGrowth((s) => s.bumpPersistence);
  const { toast } = useToast();
  const reduced = useReducedMotion();

  const [newTopic, setNewTopic] = useState("");
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewConfidence, setReviewConfidence] = useState(50);

  // Compute derived lists with useMemo to avoid new-reference infinite loops.
  const dueToday = useMemo(() => {
    const now = Date.now();
    return items
      .filter((i) => i.nextReview <= now)
      .sort((a, b) => a.nextReview - b.nextReview);
  }, [items]);

  const upcoming = useMemo(() => {
    const now = Date.now();
    return items
      .filter((i) => i.nextReview > now)
      .sort((a, b) => a.nextReview - b.nextReview);
  }, [items]);

  const handleAdd = () => {
    if (!newTopic.trim()) return;
    addItem(newTopic.trim());
    toast({
      title: "Added to your study plan",
      description: `I'll remind you to revisit "${newTopic.trim()}" at the right time.`,
    });
    setNewTopic("");
  };

  const handleReview = (item: StudyItem) => {
    setReviewingId(item.id);
    setReviewConfidence(item.confidence);
  };

  const confirmReview = () => {
    if (!reviewingId) return;
    const item = items.find((i) => i.id === reviewingId);
    if (!item) return;
    reviewItem(reviewingId, reviewConfidence);
    // Twin + growth tie-ins
    twin.bumpTrait("retention", 3, `Reviewed ${item.topic}.`);
    twin.bumpTrait("confidence", 2, `Recalled ${item.topic}.`);
    bumpPersistence(2);
    addStar({
      concept: item.topic,
      constellation: "Revision",
      brightness: Math.min(100, 30 + reviewConfidence * 0.7),
    });
    twin.addMemory({
      text: `You revisited "${item.topic}" — that's how memory sticks.`,
      kind: "celebration",
    });
    toast({
      title: "Nice revisit 💚",
      description: `I'll bring "${item.topic}" back at the right moment.`,
    });
    setReviewingId(null);
  };

  const prediction = useMemo(() => {
    const total = items.length;
    if (total === 0) return null;
    const reviewed = items.filter((i) => i.reviewCount > 0).length;
    const avgConf =
      items.reduce((a, i) => a + i.confidence, 0) / total;
    const mastery = Math.round(avgConf);
    const retentionEstimate = Math.min(
      95,
      Math.round(40 + (reviewed / Math.max(1, total)) * 40 + (mastery - 50) * 0.3)
    );
    return { total, reviewed, mastery, retentionEstimate };
  }, [items]);

  return (
    <div className="space-y-5">
      {/* Revision Predictor */}
      {prediction && (
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <Card className="p-5 nt-gradient-sage border-border/60 nt-shadow-soft">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="size-4 text-primary" aria-hidden />
              <h3 className="text-sm font-semibold">Revision Predictor</h3>
              <Badge variant="secondary" className="rounded-full text-[10px] ml-auto">
                Explainable AI
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat
                icon={Clock}
                label="Topics tracked"
                value={String(prediction.total)}
              />
              <Stat
                icon={RotateCw}
                label="Revisited"
                value={String(prediction.reviewed)}
              />
              <Stat
                icon={TrendingUp}
                label="Avg confidence"
                value={`${prediction.mastery}%`}
              />
              <Stat
                icon={Sparkles}
                label="Est. retention"
                value={`${prediction.retentionEstimate}%`}
                highlight
              />
            </div>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Based on how often you revisit topics and how confident you feel,
              I estimate you&apos;ll retain about{" "}
              <strong className="text-foreground">
                {prediction.retentionEstimate}%
              </strong>{" "}
              of what you&apos;ve learned. Gentle, regular revisits lift this
              over time — never cramming.
            </p>
          </Card>
        </MotionDiv>
      )}

      {/* Add topic */}
      <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
        <Card className="p-4 border-border/60 nt-shadow-soft">
          <div className="flex items-center gap-2">
            <Input
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Add a topic to your study plan..."
              className="flex-1"
              aria-label="New study topic"
            />
            <Button
              onClick={handleAdd}
              disabled={!newTopic.trim()}
              className="gap-1.5 rounded-full"
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
        </Card>
      </MotionDiv>

      {/* Due today */}
      {dueToday.length > 0 && (
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="size-4 text-amber-glow-foreground" aria-hidden />
              <h3 className="text-sm font-semibold">
                Gentle revisit — ready when you are
              </h3>
              <Badge className="rounded-full bg-amber-glow/15 text-amber-glow-foreground hover:bg-amber-glow/15">
                {dueToday.length}
              </Badge>
            </div>
            <div className="space-y-2">
              {dueToday.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={reduced ? false : { opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="p-3.5 border-amber-glow/30 bg-amber-glow/5 nt-shadow-soft">
                    <div className="flex items-center gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {item.topic}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Reviewed {item.reviewCount}× · last{" "}
                          {item.lastReviewed
                            ? relativeTime(item.lastReviewed)
                            : "never"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleReview(item)}
                        className="gap-1.5 shrink-0"
                      >
                        <RotateCw className="size-3.5" /> Revisit
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="size-8 shrink-0 text-muted-foreground hover:text-rose-soft-foreground"
                        aria-label={`Remove ${item.topic}`}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </MotionDiv>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <CalendarClock className="size-4 text-primary" aria-hidden />
              Coming up
            </h3>
            <ScrollArea className="max-h-72">
              <div className="space-y-2 pr-2">
                {upcoming.map((item) => (
                  <Card
                    key={item.id}
                    className="p-3 border-border/60 flex items-center gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{item.topic}</p>
                      <p className="text-xs text-muted-foreground">
                        Next revisit {relativeTime(item.nextReview)} ·{" "}
                        {item.reviewCount}× reviewed
                      </p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="size-7 shrink-0 text-muted-foreground hover:text-rose-soft-foreground"
                      aria-label={`Remove ${item.topic}`}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        </MotionDiv>
      )}

      {/* Empty state */}
      {items.length === 0 && (
        <MotionDiv variants={fadeUp} initial="hidden" animate="visible">
          <Card className="p-8 text-center border-dashed border-border bg-muted/30">
            <div className="mx-auto mb-3 size-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CalendarClock className="size-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Your study plan is empty</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Add topics as you learn them. I&apos;ll suggest the perfect moment
              to revisit each one — based on how your memory actually works.
            </p>
          </Card>
        </MotionDiv>
      )}

      {/* Review dialog */}
      <Dialog
        open={!!reviewingId}
        onOpenChange={(o) => !o && setReviewingId(null)}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>How well did that come back to you?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              There&apos;s no wrong answer. Be honest — it helps me space the
              next revisit perfectly for you.
            </p>
            <div className="rounded-xl bg-muted/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Confidence</span>
                <span className="text-sm font-semibold text-primary tabular-nums">
                  {reviewConfidence}%
                </span>
              </div>
              <Slider
                value={[reviewConfidence]}
                onValueChange={(v) => setReviewConfidence(v[0])}
                min={0}
                max={100}
                step={5}
                aria-label="Confidence in recall"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>Fuzzy</span>
                <span>Clear</span>
                <span>Rock solid</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {reviewConfidence < 33
                ? "I'll bring this back soon — that's totally okay."
                : reviewConfidence < 66
                  ? "Solid. I'll revisit it in a few days."
                  : "You've got this. I'll space it wider now."}
            </p>
            <Button
              onClick={confirmReview}
              className="w-full gap-1.5 rounded-full"
            >
              <Check className="size-4" /> Mark revisited
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: any;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl p-3 border",
        highlight
          ? "bg-primary/10 border-primary/20"
          : "bg-card/60 border-border/50"
      )}
    >
      <Icon
        className={cn("size-4 mb-1.5", highlight ? "text-primary" : "text-muted-foreground")}
        aria-hidden
      />
      <p
        className={cn(
          "text-lg font-bold tabular-nums leading-none",
          highlight && "text-primary"
        )}
      >
        {value}
      </p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}
