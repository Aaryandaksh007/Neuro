# Task 6a — full-stack-developer (Learn world)

## What I built
The complete LEARN world for NeuroTwin OS — the centerpiece feature. All
files live under `src/components/learn/` only. No other paths touched.

## Files created
- `learn-world.tsx` — default export `LearnWorld`. Hero header (title,
  subtitle, aurora, prominent ConfidenceMeter) + 4-tab layout:
  Adaptive Tutor / Learning DNA / Memory Heatmap / Playground.
- `use-learn.ts` — `useLearn()` hook. POSTs to `/api/learn` with the full
  `{ sessionId, topic, format, profile, twin, note }` body and fires every
  required twin side-effect (bumpTrait confidence +3, retention +2,
  addMemory observation, addStar Learn/40, setCompanionMood attentive) plus
  the kind toast "Nice — that's one more star in your galaxy." Exports
  `LearnFormat`, `Flashcard`, `LearnResult`, `FORMAT_LABEL` types.
- `format-chips.tsx` — accessible `radiogroup` of 8 format chips with
  `aria-checked`, `aria-label` including the hint, keyboard reachable.
- `lesson-result.tsx` — renders the AI reply via `react-markdown` (custom
  component map for h1/h2/h3/p/ul/ol/li/strong/em/code/pre/blockquote/a).
  Splits the trailing "Why this helps you" line into a sage callout.
  Dispatches to Flashcards / AdaptiveQuiz for those formats. Exports
  `LessonEmptyState` + `LessonLoading` (shimmer skeleton).
- `flashcards.tsx` — 3D flip-card UI. `transform-style: preserve-3d` +
  `backfaceVisibility: hidden`. Click to flip. Keyboard: Enter/Space flip,
  ArrowLeft/Right navigate. Gentle "Got it / Review again" toggle (no score
  shaming). Live count message.
- `adaptive-quiz.tsx` — parser turns the markdown quiz reply into structured
  questions (Q/1., A)-D), Answer:). Per-question: pick option → "Check
  answer" → warm feedback (correct = sage celebration, wrong = amber
  reframe). "Try again" resets. Final summary badge never shames.
- `confidence-meter.tsx` — animated SVG circular ring with sage→amber
  gradient stroke. Animates on mount AND whenever the trait value changes.
  Kind label band: "Finding your footing" → "Steady and growing" →
  "Confident and curious" → "Shining bright".
- `learning-dna-viz.tsx` — `recharts` RadarChart over 6 twin axes (Visual,
  Focus, Retention, Confidence, Curiosity, Calm). Animation disabled for
  reduced-motion users. Side panels: explainable-AI insight rows
  (superpower + growing trait) + profile chips (preferredStyle,
  readingSpeed, attentionSpan, sessionLength).
- `memory-heatmap.tsx` — 7×5 grid of last 35 days. Intensity driven by
  `useGrowth.stars` average brightness per day; empty-day tint scales with
  `useTwin.traits.retention`. Today's cell outlined. Legend. Friendly empty
  state ("Your memory map will light up as you learn").
- `adaptive-tutor.tsx` — hero composer: topic input + format chips +
  Generate button + 8 example topic quick chips. Loading / error / empty /
  result states.
- `concept-playground.tsx` — "Turn anything into how you learn best."
  Textarea + optional label + clipboard-paste button + format chips.
  Reuses `/api/learn` with the pasted text as `topic` + `note`.

## Key decisions
- Centralized all twin side-effects in `useLearn().generate()` so every
  entry point (tutor + playground) updates the digital twin identically.
- Used the existing `/api/learn` route verbatim — no API changes.
- `react-markdown` for plain formats; dedicated interactive components for
  `flashcards` and `quiz`. The "Why this helps you" line is parsed out of
  the reply tail and rendered as its own sage callout (Explainable AI).
- All animations honor both `useReducedMotion()` and the app's
  `accessibility.motion === "reduced"` flag.
- Color palette stays inside the calm system: sage primary, amber-glow
  accents, rose-soft for errors/review, plum sparingly. No blue/indigo.

## Lint status
`npx eslint src/components/learn` → exit 0 (clean). The remaining repo
lint errors are in `wellness/*` and `health/focus-timer.tsx`, owned by
other agents — I did not touch them.

## Dev log
No new compile errors. `GET / 200` continues to render.
