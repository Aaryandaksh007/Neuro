"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Sparkles, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { useWellness } from "@/store/wellness";
import { useAccessibility } from "@/store/accessibility";
import { useAIChat } from "./use-ai-chat";
import { useSessionId } from "./use-session-id";
import { NeuroTwinLogo } from "./logo";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "I'm feeling overwhelmed",
  "Help me start a tiny task",
  "Explain something simply",
  "Celebrate a small win with me",
];

export function CompanionDock({ feature }: { feature?: string }) {
  const open = useApp((s) => s.companionOpen);
  const setOpen = useApp((s) => s.setCompanionOpen);
  const name = useApp((s) => s.companionName);
  const profile = useApp((s) => s.profile);
  const twin = useTwin();
  const latestMood = useWellness((s) => s.moods[s.moods.length - 1]);
  const sessionId = useSessionId();
  const a11y = useAccessibility();

  const { messages, loading, send } = useAIChat({
    endpoint: "/api/companion",
    sessionId,
    context: {
      twin: { traits: twin.traits },
      profile,
      feature,
      mood: latestMood?.mood,
    },
  });

  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() || a11y.motion === "reduced";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages.length, loading]);

  const submit = () => {
    if (!input.trim()) return;
    send(input);
    setInput("");
  };

  return (
    <>
      {/* Floating launcher */}
      <AnimatePresence>
        {!open && (
          <motion.button
            key="launcher"
            initial={reduced ? false : { scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduced ? { opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            onClick={() => setOpen(true)}
            aria-label={`Open ${name}, your companion`}
            className="fixed bottom-5 right-5 z-50 group flex items-center gap-2 rounded-full bg-primary text-primary-foreground pl-3 pr-4 py-3 nt-shadow-soft hover:scale-[1.03] transition-transform"
          >
            <span className="relative flex size-9 items-center justify-center">
              <span className="absolute inset-0 rounded-full bg-primary-foreground/30 nt-pulse-ring" />
              <NeuroTwinLogo size={30} />
            </span>
            <span className="text-sm font-medium hidden sm:block">
              Talk to {name}
            </span>
            <Sparkles className="size-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            initial={reduced ? false : { y: 40, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { y: 40, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="fixed bottom-4 right-4 left-4 sm:left-auto z-50 w-auto sm:w-[400px] max-h-[78vh] flex flex-col rounded-2xl border bg-card nt-shadow-soft overflow-hidden"
            role="dialog"
            aria-label={`${name} companion`}
          >
            {/* header */}
            <div className="flex items-center justify-between px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-amber-glow/10">
              <div className="flex items-center gap-2.5">
                <span className="relative flex size-8 items-center justify-center">
                  <span className="absolute inset-0 rounded-full bg-primary/20 nt-breathe" />
                  <NeuroTwinLogo size={26} />
                </span>
                <div className="leading-tight">
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    Your companion · here for you
                  </p>
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="size-8"
                onClick={() => setOpen(false)}
                aria-label="Close companion"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* messages */}
            <ScrollArea className="flex-1 min-h-0" ref={scrollRef as any}>
              <div className="p-4 space-y-3">
                {messages.length === 0 && (
                  <div className="space-y-3">
                    <Bubble role="assistant">
                      Hi{profile.name ? `, ${profile.name}` : ""}. I'm{" "}
                      <span className="font-medium">{name}</span>. No pressure
                      here — tell me what's on your mind, or pick a starting
                      point.
                    </Bubble>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button
                          key={s}
                          onClick={() => send(s)}
                          className="text-xs rounded-full border bg-background px-3 py-1.5 hover:bg-accent transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {messages.map((m, i) => (
                  <Bubble key={i} role={m.role}>
                    {m.content}
                  </Bubble>
                ))}
                {loading && (
                  <Bubble role="assistant">
                    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      thinking with care…
                    </span>
                  </Bubble>
                )}
              </div>
            </ScrollArea>

            {/* input */}
            <div className="border-t p-3 flex items-end gap-2 bg-card">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                  }
                }}
                placeholder="Type freely — I won't judge."
                className="min-h-[44px] max-h-32 resize-none text-sm"
                aria-label="Message your companion"
              />
              <Button
                onClick={submit}
                disabled={loading || !input.trim()}
                size="icon"
                className="size-10 rounded-xl shrink-0"
                aria-label="Send message"
              >
                <Send className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant";
  children: React.ReactNode;
}) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-muted text-foreground rounded-bl-md"
        )}
      >
        {children}
      </div>
    </div>
  );
}
