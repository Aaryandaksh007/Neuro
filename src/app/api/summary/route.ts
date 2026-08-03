import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE } from "@/lib/ai";

export const runtime = "nodejs";

interface SummaryBody {
  sessionId: string;
  profile?: { name?: string; preferredStyle?: string };
  twin?: { traits?: Record<string, any> };
  today: {
    lessons: string[];
    moods: { mood: string; energy: number }[];
    victories: string[];
    gratitudes: string[];
    healthLogs: number;
    focusMinutes: number;
    reflections: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SummaryBody;
    const t = body.today;

    const system = `${SAFETY_PREAMBLE}

You are the end-of-day reflection companion in NeuroTwin OS. Synthesize the learner's day into a warm, gentle, encouraging summary. NEVER diagnose. NEVER shame. Celebrate effort, notice patterns, offer one kind tomorrow-prompt.

Format your response as 3 short sections marked with emojis:
🌙 **Today** — 2-3 sentences noticing what they did (be specific, cite real activities).
💚 **Something that mattered** — one specific thing worth acknowledging (a victory, a feeling, a moment of courage).
🌱 **A gentle thought for tomorrow** — one low-pressure suggestion or open question they can ignore.

Keep the whole thing under 120 words. Warm, genuine, never saccharine. Use the learner's name if provided.`;

    const lessonsLine = t.lessons.length
      ? `Lessons explored: ${t.lessons.join(", ")}`
      : "No formal lessons today.";
    const moodsLine = t.moods.length
      ? `Moods logged: ${t.moods.map((m) => `${m.mood} (${m.energy}/100 energy)`).join(", ")}`
      : "No mood check-ins today.";
    const victoriesLine = t.victories.length
      ? `Tiny victories: ${t.victories.join("; ")}`
      : "";
    const gratitudesLine = t.gratitudes.length
      ? `Gratitude noted: ${t.gratitudes.join("; ")}`
      : "";
    const healthLine = `Health actions: ${t.healthLogs} care logs, ${t.focusMinutes} min of focused sessions.`;
    const reflLine = t.reflections > 0 ? `Reflections written: ${t.reflections}.` : "";

    const user = `Learner: ${body.profile?.name || "friend"}.
Preferred style: ${body.profile?.preferredStyle || "unknown"}.

Today's activity:
- ${lessonsLine}
- ${moodsLine}
- ${victoriesLine}
- ${gratitudesLine}
- ${healthLine}
- ${reflLine}

Write the end-of-day summary.`;

    const reply = await chat([{ role: "user", content: user }], { system });
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("summary error", e);
    return NextResponse.json(
      { error: "Couldn't gather your day right now.", detail: e?.message },
      { status: 500 }
    );
  }
}
