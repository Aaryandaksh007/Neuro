"use client";

import { useState } from "react";

export function useSessionId() {
  // Lazy init on the client only. We never render sessionId to the DOM,
  // so there's no hydration mismatch — it's only used inside fetch calls.
  const [sessionId] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const KEY = "neurotwin-session";
    let id = localStorage.getItem(KEY);
    if (!id) {
      id = `s-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(KEY, id);
    }
    return id;
  });

  return sessionId;
}
