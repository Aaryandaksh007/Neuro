"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useAccessibility } from "@/store/accessibility";
import type { ReactNode } from "react";

// Honors the app's reduced-motion preference (in addition to OS).
export function MotionDiv({
  children,
  className,
  variants,
  initial,
  animate,
  exit,
  transition,
  layout,
}: {
  children: ReactNode;
  className?: string;
  variants?: Variants;
  initial?: any;
  animate?: any;
  exit?: any;
  transition?: any;
  layout?: boolean;
}) {
  const osReduced = useReducedMotion();
  const appMotion = useAccessibility((s) => s.motion);
  const reduced = osReduced || appMotion === "reduced";

  if (reduced) {
    return <div className={className}>{children}</div>;
  }
  return (
    <motion.div
      className={className}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      layout={layout}
    >
      {children}
    </motion.div>
  );
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

export const containerRise = stagger;
