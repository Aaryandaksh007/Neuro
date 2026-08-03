"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const SHORTCUTS = [
  { keys: ["⌘", "K"], desc: "Open / close your companion" },
  { keys: ["⌘", "/"], desc: "Show this shortcuts list" },
  { keys: ["Esc"], desc: "Close companion or dialog" },
  { keys: ["Enter"], desc: "Send a message or generate a lesson" },
  { keys: ["Shift", "Enter"], desc: "New line in chat" },
  { keys: ["Tab"], desc: "Move between interactive elements" },
];

export function ShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("neurotwin:show-shortcuts", handler);
    return () => window.removeEventListener("neurotwin:show-shortcuts", handler);
  }, []);

  // Detect platform for ⌘ vs Ctrl display
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? "⌘" : "Ctrl";

  const displayKeys = (keys: string[]) =>
    keys.map((k) => (k === "⌘" ? modKey : k));

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduced ? { opacity: 0 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={reduced ? false : { scale: 0.95, y: 16, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0.97, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 24 }}
            className="relative max-w-md w-full rounded-2xl border bg-card nt-shadow-soft overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div className="flex items-center gap-2.5">
                <span className="size-9 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Keyboard className="size-5 text-primary" />
                </span>
                <div>
                  <h2 className="text-base font-semibold leading-tight">
                    Keyboard shortcuts
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Everything works without a mouse
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="size-8 rounded-full hover:bg-accent flex items-center justify-center text-muted-foreground"
                aria-label="Close shortcuts"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {SHORTCUTS.map((s, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="text-sm text-foreground/90">{s.desc}</span>
                  <div className="flex items-center gap-1 shrink-0">
                    {displayKeys(s.keys).map((k, j) => (
                      <kbd
                        key={j}
                        className="min-w-[28px] text-center rounded-md border border-border bg-muted px-2 py-1 text-xs font-mono font-medium text-muted-foreground"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <Button
                onClick={() => setOpen(false)}
                className="w-full rounded-full"
                size="sm"
              >
                Got it
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
