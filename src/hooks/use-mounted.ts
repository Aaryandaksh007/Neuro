"use client";

import { useState, useEffect } from "react";

/**
 * Returns false on the server and during the first client render,
 * then true after mount. Use this to avoid hydration mismatches when
 * rendering depends on persisted client-only state (e.g. Zustand persisted
 * stores, localStorage, window.matchMedia).
 *
 * Pattern:
 *   const mounted = useMounted();
 *   const reduced = mounted && (osReduced || a11y.motion === "reduced");
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);
  return mounted;
}
