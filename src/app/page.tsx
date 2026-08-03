"use client";

import { useEffect } from "react";
import { useApp } from "@/store/app";
import { useTwin } from "@/store/twin";
import { Landing } from "@/components/land/landing";
import { Onboarding } from "@/components/onboarding/onboarding";
import { MindSpace } from "@/components/shell/mindspace";
import dynamic from "next/dynamic";

const JudgeMode = dynamic(
  () => import("@/components/judge/judge-mode").then((m) => m.JudgeMode),
  { ssr: false }
);

export default function Home() {
  const view = useApp((s) => s.view);
  const onboarded = useApp((s) => s.onboarded);
  const setView = useApp((s) => s.setView);
  const setStarted = useTwin((s) => s.setStarted);

  // Ensure twin has a start timestamp once onboarded.
  useEffect(() => {
    if (onboarded) setStarted();
  }, [onboarded, setStarted]);

  // Auto-route: if onboarded but on landing, that's fine (user can roam).

  if (view === "landing") return <Landing />;
  if (view === "onboarding") return <Onboarding />;
  if (view === "judge") return <JudgeMode />;
  return <MindSpace />;
}
