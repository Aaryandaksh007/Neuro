"use client";

import { useEffect } from "react";
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
  const a11y = useAccessibility();

  useEffect(() => {
    applyAttrs(a11y);
  }, [a11y.font, a11y.scale, a11y.motion, a11y.contrast, a11y.calm]);

  return null;
}
