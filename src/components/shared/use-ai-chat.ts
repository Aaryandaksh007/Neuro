"use client";

import { useCallback, useState } from "react";
import type { ChatMessage } from "@/lib/ai";

interface UseAIChatOpts {
  endpoint: string;
  sessionId: string;
  context?: any;
  systemHint?: string;
}

export function useAIChat<T extends { reply: string }>({
  endpoint,
  sessionId,
  context,
}: UseAIChatOpts) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;
      setLoading(true);
      setError(null);
      const next: ChatMessage[] = [
        ...messages,
        { role: "user", content: text },
      ];
      setMessages(next);
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            message: text,
            history: messages,
            context,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        const reply: string = data.reply;
        setMessages((m) => [...m, { role: "assistant", content: reply }]);
        return reply as string;
      } catch (e: any) {
        setError(e?.message || "Something went wrong");
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content:
              "I'm having trouble connecting right now. Your message is safe with me — want to try again?",
          },
        ]);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, sessionId, context, messages, loading]
  );

  const reset = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  return { messages, loading, error, send, reset, setMessages };
}
