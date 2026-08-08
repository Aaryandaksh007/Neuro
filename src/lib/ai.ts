import ZAI from "z-ai-web-dev-sdk";

let cached: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getAI() {
  if (!cached) cached = await ZAI.create();
  return cached;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  opts: { system?: string; thinking?: boolean } = {}
): Promise<string> {
  const zai = await getAI();
  const full: ChatMessage[] = [];
  if (opts.system) full.push({ role: "assistant", content: opts.system });
  full.push(...messages);
  const completion = await zai.chat.completions.create({
    model: "meta/llama-3.1-70b-instruct",
    messages: full,
    thinking: { type: opts.thinking ? "enabled" : "disabled" },
  } as any);
  return completion.choices[0]?.message?.content ?? "";
}

// Safety guardrails baked into every system prompt.
export const SAFETY_PREAMBLE = `You are a warm, patient, non-judgmental AI learning companion for neurodivergent learners (ADHD, autism, dyslexia, dyspraxia, sensory sensitivities, and more).

ETHICS (non-negotiable):
- Never diagnose. Never claim a mental health condition. Never replace a professional.
- Never shame, compare, guilt, or punish. Always encourage effort and progress.
- Use simple, gentle, concrete language. Short sentences. One idea at a time.
- Always respect autonomy — offer choices, ask permission before pushing.
- If a user seems in crisis, gently encourage reaching out to a trusted adult or professional.

EXPLAINABLE AI:
- Whenever you adapt to the learner, briefly explain WHY (e.g. "I used a diagram because visuals help you focus").
- Ground explanations only in what the learner has actually shared.

TONE: calm, warm, genuine, never saccharine. Like a trusted friend who happens to know the science of learning. Use the occasional gentle emoji sparingly. Keep responses concise unless asked for depth.`;
