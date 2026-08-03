"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  LayoutGrid,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NeuroTwinLogo, Wordmark } from "@/components/shared/logo";
import { useApp } from "@/store/app";
import { useAccessibility } from "@/store/accessibility";
import { SLIDES } from "./slides";
import { cn } from "@/lib/utils";

/**
 * JudgeMode — presentation deck for hackathon judges.
 * 13 slides, sticky top bar, keyboard nav (←/→), dot indicators,
 * Framer Motion transitions that honor reduced motion.
 */
export function JudgeMode() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);

  const setView = useApp((s) => s.setView);
  const enterMindSpace = useApp((s) => s.enterMindSpace);
  const onboarded = useApp((s) => s.onboarded);
  const appMotion = useAccessibility((s) => s.motion);
  const osReduced = useReducedMotion();
  const reduced = osReduced || appMotion === "reduced";

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const total = SLIDES.length;
  const Current = SLIDES[index].Component;

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(total - 1, next));
      setDirection(clamped > index ? 1 : -1);
      setIndex(clamped);
      setMenuOpen(false);
      // Reset scroll position on slide change.
      if (scrollRef.current) scrollRef.current.scrollTo({ top: 0 });
    },
    [index, total]
  );

  const goNext = useCallback(() => go(index + 1), [go, index]);
  const goPrev = useCallback(() => go(index - 1), [go, index]);

  // Keyboard navigation — left/right arrows, Home/End, Esc to exit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      // Ignore when typing in inputs/textareas.
      if (tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable)
        return;

      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        goPrev();
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(total - 1);
      } else if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, goNext, goPrev, total]);

  const backToApp = () => {
    if (onboarded) enterMindSpace();
    else setView("landing");
  };

  const slideVariants = reduced
    ? {
        enter: { opacity: 1 },
        center: { opacity: 1 },
        exit: { opacity: 0 },
      }
    : {
        enter: (dir: number) => ({
          opacity: 0,
          x: dir > 0 ? 40 : -40,
        }),
        center: { opacity: 1, x: 0 },
        exit: (dir: number) => ({
          opacity: 0,
          x: dir > 0 ? -40 : 40,
        }),
      };

  const currentMeta = SLIDES[index];

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      {/* Skip link */}
      <a href="#judge-main" className="nt-skip-link">
        Skip to slide content
      </a>

      {/* Sticky top bar */}
      <header className="sticky top-0 z-50 nt-glass border-b border-border/60">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          {/* Left: logo + label */}
          <div className="flex items-center gap-2.5 min-w-0">
            <NeuroTwinLogo size={32} />
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <Wordmark className="text-sm sm:text-base" />
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                Judge Mode
              </span>
            </div>
          </div>

          {/* Center: slide nav (desktop) */}
          <nav
            aria-label="Slide navigation"
            className="hidden md:flex items-center gap-2"
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full"
              onClick={goPrev}
              disabled={index === 0}
              aria-label="Previous slide"
            >
              <ChevronLeft className="size-4" />
            </Button>

            {/* Dot indicators */}
            <div
              className="flex items-center gap-1.5"
              role="tablist"
              aria-label="Jump to slide"
            >
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}: ${s.title}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-primary"
                      : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                  )}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="size-9 rounded-full"
              onClick={goNext}
              disabled={index === total - 1}
              aria-label="Next slide"
            >
              <ChevronRight className="size-4" />
            </Button>
          </nav>

          {/* Right: slide counter + back button */}
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="font-semibold text-foreground">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span aria-hidden>/</span>
              <span>{String(total).padStart(2, "0")}</span>
            </span>

            {/* Mobile slide menu */}
            <Button
              variant="outline"
              size="sm"
              className="md:hidden rounded-full h-9 gap-1.5"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-label="Open slide menu"
            >
              <LayoutGrid className="size-4" />
              <span className="text-xs font-mono">
                {index + 1}/{total}
              </span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="rounded-full hidden sm:inline-flex"
              onClick={backToApp}
            >
              <ArrowLeft className="size-4" />
              {onboarded ? "Back to app" : "Back to home"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden size-9 rounded-full"
              onClick={backToApp}
              aria-label={onboarded ? "Back to app" : "Back to home"}
            >
              <ArrowLeft className="size-4" />
            </Button>
          </div>
        </div>

        {/* Slide title bar (sub-bar showing current slide) */}
        <div className="border-t border-border/40 bg-background/40">
          <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 h-9 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <currentMeta.icon className="size-3.5 text-primary shrink-0" />
              <span className="font-medium truncate">
                {currentMeta.title}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-card font-mono text-[10px]">
                ←
              </kbd>
              <kbd className="px-1.5 py-0.5 rounded border border-border/60 bg-card font-mono text-[10px]">
                →
              </kbd>
              <span className="text-[11px]">to navigate</span>
            </div>
          </div>
        </div>

        {/* Mobile slide menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-border/60 bg-background/95 backdrop-blur overflow-hidden"
            >
              <div className="max-w-7xl mx-auto px-3 py-3 grid grid-cols-2 gap-1.5 max-h-[60vh] overflow-y-auto">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => go(i)}
                    aria-pressed={i === index}
                    className={cn(
                      "flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                      i === index
                        ? "bg-primary/15 text-primary font-medium"
                        : "hover:bg-accent"
                    )}
                  >
                    <s.icon className="size-3.5 shrink-0" />
                    <span className="truncate">
                      <span className="font-mono text-[10px] text-muted-foreground mr-1.5">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {s.title}
                    </span>
                  </button>
                ))}
                <button
                  onClick={() => setMenuOpen(false)}
                  className="col-span-2 mt-1 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                >
                  <X className="size-3.5" /> Close
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress bar */}
        <div className="h-0.5 bg-border/40">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-amber-glow to-plum"
            initial={false}
            animate={{ width: `${((index + 1) / total) * 100}%` }}
            transition={{ duration: reduced ? 0 : 0.4, ease: "easeOut" }}
          />
        </div>
      </header>

      {/* Slide content */}
      <main
        id="judge-main"
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 lg:py-16">
          <AnimatePresence
            mode="wait"
            custom={direction}
            initial={false}
          >
            <motion.section
              key={SLIDES[index].id}
              role="region"
              aria-label={`Slide ${index + 1} of ${total}: ${SLIDES[index].title}`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                reduced
                  ? { duration: 0.15 }
                  : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
            >
              <Current />
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Bottom nav (mobile-friendly) */}
        <div className="sticky bottom-0 z-40 nt-glass border-t border-border/60">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={goPrev}
              disabled={index === 0}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="flex items-center gap-1.5 md:hidden">
              {SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => go(i)}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/40"
                  )}
                />
              ))}
            </div>

            <span className="hidden md:block text-xs text-muted-foreground font-mono">
              {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")} · {SLIDES[index].title}
            </span>

            <Button
              size="sm"
              className="rounded-full"
              onClick={goNext}
              disabled={index === total - 1}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
