"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useAccessibility } from "@/store/accessibility";
import type { FontChoice, FontScale, MotionPref, ContrastPref } from "@/store/accessibility";

function applyAttrs(s: {
  font: FontChoice;
  scale: FontScale;
  motion: MotionPref;
  contrast: ContrastPref;
  calm: boolean;
}) {
  if (typeof document === "undefined") return;
  const html = document.documentElement;
  html.setAttribute("data-font", s.font);
  html.setAttribute("data-scale", s.scale);
  html.setAttribute("data-motion", s.motion);
  html.setAttribute("data-contrast", s.contrast);
  html.setAttribute("data-calm", s.calm ? "on" : "off");
}

export function AccessibilityController() {
  const a11y = useAccessibility(
    useShallow((state) => ({
      font: state.font,
      scale: state.scale,
      motion: state.motion,
      contrast: state.contrast,
      calm: state.calm,
    }))
  );

  useEffect(() => {
    applyAttrs(a11y);
  }, [a11y]);

  return null;
}
