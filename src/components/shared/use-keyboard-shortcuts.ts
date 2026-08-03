"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app";

interface ShortcutOpts {
  /** Called on Cmd+K / Ctrl+K — toggle companion */
  onCompanion?: () => void;
}

/**
 * Global keyboard shortcuts for MindSpace.
 * - Cmd/Ctrl + K → toggle companion dock
 * - Cmd/Ctrl + / → show shortcuts help (dispatches custom event)
 * - Esc → close companion (handled by app store)
 */
export function useKeyboardShortcuts(opts: ShortcutOpts = {}) {
  const setCompanionOpen = useApp((s) => s.setCompanionOpen);
  const companionOpen = useApp((s) => s.companionOpen);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      // Cmd/Ctrl + K → toggle companion
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (opts.onCompanion) {
          opts.onCompanion();
        } else {
          setCompanionOpen(!companionOpen);
        }
        return;
      }

      // Cmd/Ctrl + / → show shortcuts help
      if (mod && e.key === "/") {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("neurotwin:show-shortcuts"));
        return;
      }

      // Esc → close companion (only if not typing in an input/textarea)
      if (e.key === "Escape" && companionOpen) {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) {
          // let the input handle esc (blur)
          target.blur();
          return;
        }
        setCompanionOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [companionOpen, setCompanionOpen, opts]);
}
