import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE } from "@/lib/ai";

export const runtime = "nodejs";

interface TwinBody {
  traits: Record<string, { label: string; value: number; evidence?: string[] }>;
  profile?: any;
  recentMoods?: { mood: string; energy: number }[];
  day?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TwinBody;
    const traitLines = Object.values(body.traits)
      .map((t) => `- ${t.label}: ${Math.round(t.value)}/100 (${(t.evidence ?? [])[0] ?? "learning"})`)
      .join("\n");
    const moodLine = body.recentMoods?.length
      ? `Recent moods: ${body.recentMoods.map((m) => `${m.mood}(${m.energy})`).join(", ")}.`
      : "No mood data yet.";

    const system = `${SAFETY_PREAMBLE}

You are the Digital Twin's voice. You synthesize what you've learned about THIS learner into a short, encouraging insight. Never diagnose. Always explain WHY you noticed something (Explainable AI). Be specific and warm. 3-5 short sentences. Optionally suggest ONE tiny, skip-able next step.`;

    const user = `Day ${body.day ?? 1}.
Traits:
${traitLines}
${moodLine}
${body.profile?.preferredStyle ? `Preferred style: ${body.profile.preferredStyle}.` : ""}

Give me a fresh insight about how this learner is doing and one gentle suggestion.`;

    const reply = await chat([{ role: "user", content: user }], { system });
    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("twin error", e);
    return NextResponse.json(
      { error: "Twin is still thinking.", detail: e?.message },
      { status: 500 }
    );
  }
}
