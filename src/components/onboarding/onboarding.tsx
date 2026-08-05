"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Eye,
  Ear,
  Hand,
  BookOpen,
  Clock,
  Gauge,
  Heart,
  Brain,
  ShieldCheck,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { NeuroTwinLogo } from "@/components/shared/logo";
import { AccessibilityToolbar } from "@/components/shared/accessibility-toolbar";
import { useApp, type LearningStyle } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useAccessibility } from "@/store/accessibility";
import { cn } from "@/lib/utils";

const STEPS = ["Welcome", "Learning DNA", "Goals", "Safety", "Sensory", "Your Twin"];

export function Onboarding() {
  const [step, setStep] = useState(0);
  const profile = useApp((s) => s.profile);
  const setProfile = useApp((s) => s.setProfile);
  const companionName = useApp((s) => s.companionName);
  const setCompanionName = useApp((s) => s.setCompanionName);
  const enterMindSpace = useApp((s) => s.enterMindSpace);
  const twin = useTwin();
  const a11y = useAccessibility();
  const reduced = useReducedMotion() || a11y.motion === "reduced";

  const setStarted = twin.setStarted;
  const bumpTrait = twin.bumpTrait;
  const addMemory = twin.addMemory;

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    setStarted();
    // Seed twin traits from onboarding (explainable AI: first personalization)
    const styleMap: Record<LearningStyle, [string, number]> = {
      visual: ["visualPreference", 30],
      verbal: ["visualPreference", -10],
      auditory: ["visualPreference", -5],
      kinesthetic: ["visualPreference", 5],
      reading: ["visualPreference", -15],
    };
    const [trait, delta] = styleMap[profile.preferredStyle];
    bumpTrait(trait, delta, `You told me you prefer ${profile.preferredStyle} learning.`);
    bumpTrait("sessionLength", (profile.sessionLength - 20) * 1.5, `You chose ~${profile.sessionLength}-minute sessions.`);
    bumpTrait("confidence", 8, "You completed onboarding — that takes courage.");
    bumpTrait("curiosity", 10, "You shared your interests and goals.");
    addMemory({
      text: `Welcome aboard, ${profile.name || "friend"}. I've learned your preferred style is ${profile.preferredStyle}, and you like ~${profile.sessionLength}-minute sessions. I'll adapt everything to fit.`,
      kind: "adaptation",
    });
    enterMindSpace();
  };

  const canProceed = () => {
    if (step === 0) return profile.name.trim().length > 0;
    return true;
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-clip">
      <div className="nt-aurora nt-motion-bg" aria-hidden />
      <a href="#main" className="nt-skip-link">Skip to content</a>

      {/* Top bar */}
      <header className="relative z-10 px-4 sm:px-6 pt-5">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NeuroTwinLogo size={32} />
            <span className="font-semibold tracking-tight">
              NeuroTwin<span className="text-primary"> OS</span>
            </span>
          </div>
          <AccessibilityToolbar compact />
        </div>
      </header>

      <main id="main" className="relative z-10 flex-1 px-4 sm:px-6 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>
                Step {step + 1} of {STEPS.length}
              </span>
              <span>{STEPS[step]}</span>
            </div>
            <Progress value={((step + 1) / STEPS.length) * 100} className="h-1.5" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={reduced ? false : { opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === 0 && (
                <StepWelcome
                  profile={profile}
                  setProfile={setProfile}
                  companionName={companionName}
                  setCompanionName={setCompanionName}
                />
              )}
              {step === 1 && (
                <StepLearningDNA profile={profile} setProfile={setProfile} />
              )}
              {step === 2 && <StepGoals profile={profile} setProfile={setProfile} />}
              {step === 3 && <StepSafety profile={profile} setProfile={setProfile} />}
              {step === 4 && <StepSensory profile={profile} setProfile={setProfile} />}
              {step === 5 && <StepTwin profile={profile} companionName={companionName} />}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 0}
              className="gap-1.5"
            >
              <ArrowLeft className="size-4" /> Back
            </Button>
            <div className="flex items-center gap-2">
              {step < STEPS.length - 1 ? (
                <Button onClick={next} disabled={!canProceed()} className="gap-1.5 rounded-full">
                  Continue <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button onClick={finish} className="gap-1.5 rounded-full">
                  <PartyPopper className="size-4" /> Enter MindSpace
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mt-auto border-t bg-card/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-5 text-center">
          <p className="text-xs text-muted-foreground">
            Everything here can change later. There are no wrong answers.
          </p>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Steps ---------- */

function StepWelcome({
  profile,
  setProfile,
  companionName,
  setCompanionName,
}: any) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto size-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <NeuroTwinLogo size={40} className="nt-float" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Let's get to know each other
        </h1>
        <p className="text-muted-foreground mt-2">
          I'll ask a few gentle questions to build your Digital Twin. Skip
          anything you like — we can learn the rest together.
        </p>
      </div>

      <Card className="p-5 nt-shadow-soft space-y-4 border-border/60">
        <div>
          <Label htmlFor="name">What should I call you?</Label>
          <Input
            id="name"
            value={profile.name}
            onChange={(e) => setProfile({ name: e.target.value })}
            placeholder="A name, nickname, or just a letter"
            className="mt-1.5"
            autoFocus
          />
        </div>
        <div>
          <Label htmlFor="age">Age (optional — helps me pitch things right)</Label>
          <div className="grid grid-cols-4 gap-2 mt-1.5">
            {[
              ["under-13", "Under 13"],
              ["13-17", "13–17"],
              ["18-24", "18–24"],
              ["25+", "25+"],
            ].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setProfile({ ageBand: k })}
                className={cn(
                  "rounded-lg border px-2 py-2.5 text-sm transition-colors",
                  profile.ageBand === k
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="comp">Name your companion</Label>
          <Input
            id="comp"
            value={companionName}
            onChange={(e) => setCompanionName(e.target.value)}
            placeholder="Nova (default) or pick your own"
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            This is your AI companion. You can rename it anytime.
          </p>
        </div>
      </Card>
    </div>
  );
}

const STYLES: { key: LearningStyle; label: string; icon: any; desc: string }[] = [
  { key: "visual", label: "Visual", icon: Eye, desc: "Diagrams, pictures, colors" },
  { key: "verbal", label: "Verbal", icon: Sparkles, desc: "Talking it through" },
  { key: "auditory", label: "Auditory", icon: Ear, desc: "Listening & sound" },
  { key: "kinesthetic", label: "Hands-on", icon: Hand, desc: "Doing & moving" },
  { key: "reading", label: "Reading", icon: BookOpen, desc: "Text & notes" },
];

function StepLearningDNA({ profile, setProfile }: any) {
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="rounded-full gap-1.5 mb-3">
          <Brain className="size-3.5" /> Learning DNA
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          How does your brain like to learn?
        </h1>
        <p className="text-muted-foreground mt-2">
          There's no right answer. This is just a starting point — I'll keep
          learning as we go.
        </p>
      </div>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <p className="text-sm font-medium mb-3">I learn best through…</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {STYLES.map((s) => (
            <button
              key={s.key}
              onClick={() => setProfile({ preferredStyle: s.key })}
              className={cn(
                "rounded-xl border p-3 text-left transition-all",
                profile.preferredStyle === s.key
                  ? "border-primary bg-primary/10 nt-shadow-soft"
                  : "hover:bg-accent hover:-translate-y-0.5"
              )}
            >
              <s.icon
                className={cn(
                  "size-5 mb-2",
                  profile.preferredStyle === s.key ? "text-primary" : "text-muted-foreground"
                )}
              />
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card className="p-5 nt-shadow-soft border-border/60 space-y-5">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="size-4" /> Ideal session length
            </Label>
            <span className="text-sm font-medium text-primary">
              ~{profile.sessionLength} min
            </span>
          </div>
          <Slider
            value={[profile.sessionLength]}
            onValueChange={(v) => setProfile({ sessionLength: v[0] })}
            min={5}
            max={60}
            step={5}
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Short bursts are powerful. You can always pause.
          </p>
        </div>

        <div>
          <Label className="flex items-center gap-1.5 mb-2">
            <Gauge className="size-4" /> Reading speed
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {["slow", "moderate", "fast"].map((r) => (
              <button
                key={r}
                onClick={() => setProfile({ readingSpeed: r })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm capitalize transition-colors",
                  profile.readingSpeed === r
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="flex items-center gap-1.5 mb-2">
            <Brain className="size-4" /> Attention span
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {["short", "medium", "long"].map((r) => (
              <button
                key={r}
                onClick={() => setProfile({ attentionSpan: r })}
                className={cn(
                  "rounded-lg border px-2 py-2 text-sm capitalize transition-colors",
                  profile.attentionSpan === r
                    ? "border-primary bg-primary/10 text-primary font-medium"
                    : "hover:bg-accent"
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

const GOAL_PRESETS = [
  "Focus better",
  "Worry less about mistakes",
  "Remember what I learn",
  "Start tasks more easily",
  "Feel calmer",
  "Build a study routine",
  "Enjoy learning again",
  "Prepare for an exam",
];
const INTEREST_PRESETS = [
  "Space",
  "Animals",
  "Music",
  "Art",
  "Coding",
  "Stories",
  "Sports",
  "Nature",
  "History",
  "Math puzzles",
];

function StepGoals({ profile, setProfile }: any) {
  const toggle = (field: "goals" | "interests", v: string) => {
    const arr = profile[field] as string[];
    setProfile({
      [field]: arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v],
    });
  };
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="rounded-full gap-1.5 mb-3">
          <Heart className="size-3.5" /> What matters to you
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          What are you hoping for?
        </h1>
        <p className="text-muted-foreground mt-2">
          Pick any that feel true. I'll keep them in mind.
        </p>
      </div>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <p className="text-sm font-medium mb-3">Goals</p>
        <div className="flex flex-wrap gap-2">
          {GOAL_PRESETS.map((g) => (
            <Chip
              key={g}
              active={profile.goals.includes(g)}
              onClick={() => toggle("goals", g)}
            >
              {g}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <p className="text-sm font-medium mb-3">Things you love</p>
        <div className="flex flex-wrap gap-2">
          {INTEREST_PRESETS.map((g) => (
            <Chip
              key={g}
              active={profile.interests.includes(g)}
              onClick={() => toggle("interests", g)}
            >
              {g}
            </Chip>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          I'll weave your interests into lessons and examples.
        </p>
      </Card>
    </div>
  );
}

function StepSafety({ profile, setProfile }: any) {
  const SAFE = [
    "Short sentences",
    "Calm colors",
    "No timers",
    "Gentle sounds off",
    "Clear structure",
    "Small steps",
  ];
  const toggle = (v: string) => {
    const arr = profile.feelsSafeWith as string[];
    setProfile({
      feelsSafeWith: arr.includes(v)
        ? arr.filter((x) => x !== v)
        : [...arr, v],
    });
  };
  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="rounded-full gap-1.5 mb-3">
          <ShieldCheck className="size-3.5" /> Your safety
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          What helps you feel safe?
        </h1>
        <p className="text-muted-foreground mt-2">
          This stays private to you. I'll shape the experience around it.
        </p>
      </div>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <div className="flex flex-wrap gap-2">
          {SAFE.map((s) => (
            <Chip
              key={s}
              active={profile.feelsSafeWith.includes(s)}
              onClick={() => toggle(s)}
            >
              {s}
            </Chip>
          ))}
        </div>
      </Card>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <Label htmlFor="sensory">
          Anything else I should know? (optional)
        </Label>
        <Textarea
          id="sensory"
          value={profile.sensoryNotes}
          onChange={(e) => setProfile({ sensoryNotes: e.target.value })}
          placeholder="e.g. Bright flashing things overwhelm me, or I like knowing what comes next."
          className="mt-1.5 min-h-[90px]"
        />
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Never diagnosed, never shared.
          Only used to make things gentler for you.
        </p>
      </Card>
    </div>
  );
}

function StepSensory({ profile, setProfile }: any) {
  const SENSORY_ITEMS = [
    { key: "bright-lights", label: "Bright lights bother me", icon: "💡" },
    { key: "loud-sounds", label: "Loud sounds overwhelm me", icon: "🔊" },
    { key: "textures", label: "Certain textures bother me", icon: "✋" },
    { key: "crowds", label: "Crowds feel like too much", icon: "👥" },
    { key: "changes", label: "Sudden changes are hard", icon: "🔄" },
    { key: "focusing", label: "Hard to filter distractions", icon: "🎯" },
    { key: "sitting-still", label: "I need to move to focus", icon: "🚶" },
    { key: "eye-contact", label: "Eye contact feels intense", icon: "👁️" },
  ];

  const toggle = (key: string) => {
    const arr = (profile.sensoryNotes ? profile.sensoryNotes.split("|") : []).filter(Boolean);
    // Use sensoryNotes as a pipe-delimited list of sensory keys for structured data
    // (the free-text note is preserved separately if present)
    if (arr.includes(key)) {
      const next = arr.filter((k: string) => k !== key);
      setProfile({ sensoryNotes: next.join("|") });
    } else {
      const next = [...arr, key];
      setProfile({ sensoryNotes: next.join("|") });
    }
  };

  const selected = (profile.sensoryNotes || "").split("|").filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <Badge variant="secondary" className="rounded-full gap-1.5 mb-3">
          <Sparkles className="size-3.5" /> Your sensory world
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          What feels like too much?
        </h1>
        <p className="text-muted-foreground mt-2">
          This helps me soften the experience for you. There&apos;s no right
          answer — and you can change anything later. Skip what doesn&apos;t fit.
        </p>
      </div>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <p className="text-sm font-medium mb-3">Tap anything that feels true:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SENSORY_ITEMS.map((s) => {
            const active = selected.includes(s.key);
            return (
              <button
                key={s.key}
                onClick={() => toggle(s.key)}
                aria-pressed={active}
                className={cn(
                  "rounded-xl border p-3 text-left transition-all flex items-center gap-2.5",
                  active
                    ? "border-primary bg-primary/10 nt-shadow-soft"
                    : "hover:bg-accent hover:-translate-y-0.5"
                )}
              >
                <span className="text-lg shrink-0">{s.icon}</span>
                <span className="text-sm font-medium flex-1">{s.label}</span>
                {active && <Check className="size-4 text-primary shrink-0" />}
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 nt-shadow-soft border-border/60">
        <Label htmlFor="sensory-extra">Anything else I should know? (optional)</Label>
        <Textarea
          id="sensory-extra"
          value={selected.length > 0 ? "" : profile.sensoryNotes || ""}
          onChange={(e) => setProfile({ sensoryNotes: e.target.value })}
          placeholder="e.g. I love knowing the plan ahead, or certain sounds help me focus."
          className="mt-1.5 min-h-[70px]"
        />
        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" /> Never diagnosed, never shared. Only
          used to make things gentler for you.
        </p>
      </Card>
    </div>
  );
}

function StepTwin({ profile, companionName }: any) {
  return (
    <div className="space-y-6 text-center">
      <div className="relative mx-auto size-24">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl nt-breathe" />
        <div className="absolute inset-0 flex items-center justify-center">
          <NeuroTwinLogo size={84} className="nt-float" />
        </div>
      </div>
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Your Digital Twin is ready
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md mx-auto">
          {companionName} will learn alongside you. The more you use MindSpace,
          the more it understands — and it always explains why.
        </p>
      </div>

      <Card className="p-5 nt-shadow-soft border-border/60 text-left nt-gradient-sage">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          What I've learned so far
        </p>
        <ul className="space-y-2.5 text-sm">
          <TwinRow label="Name" value={profile.name || "—"} />
          <TwinRow label="Learning style" value={profile.preferredStyle} />
          <TwinRow label="Session length" value={`~${profile.sessionLength} min`} />
          <TwinRow label="Reading speed" value={profile.readingSpeed} />
          <TwinRow label="Attention span" value={profile.attentionSpan} />
          <TwinRow
            label="Goals"
            value={profile.goals.length ? profile.goals.join(", ") : "—"}
          />
          <TwinRow
            label="Interests"
            value={profile.interests.length ? profile.interests.join(", ") : "—"}
          />
        </ul>
      </Card>

      <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
        <Check className="size-4 text-primary" />
        You can change any of this anytime in settings.
      </p>
    </div>
  );
}

function TwinRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium capitalize text-right">{value}</span>
    </li>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-sm transition-all flex items-center gap-1.5",
        active
          ? "border-primary bg-primary/10 text-primary font-medium"
          : "hover:bg-accent hover:-translate-y-0.5"
      )}
    >
      {active && <Check className="size-3.5" />}
      {children}
    </button>
  );
}
