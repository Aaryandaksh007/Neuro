import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE, type ChatMessage } from "@/lib/ai";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface CompanionBody {
  sessionId: string;
  message: string;
  history?: ChatMessage[];
  context?: {
    twin?: any;
    profile?: any;
    feature?: string;
    mood?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CompanionBody;
    if (!body.message || !body.sessionId) {
      return NextResponse.json(
        { error: "message and sessionId are required" },
        { status: 400 }
      );
    }

    const ctx = body.context ?? {};
    const twinLines: string[] = [];
    if (ctx.profile?.name) twinLines.push(`Learner's name: ${ctx.profile.name}.`);
    if (ctx.profile?.preferredStyle)
      twinLines.push(`Preferred learning style: ${ctx.profile.preferredStyle}.`);
    if (ctx.profile?.sessionLength)
      twinLines.push(`Preferred session length: ~${ctx.profile.sessionLength} min.`);
    if (ctx.profile?.readingSpeed)
      twinLines.push(`Reading speed: ${ctx.profile.readingSpeed}.`);
    if (ctx.profile?.attentionSpan)
      twinLines.push(`Attention span: ${ctx.profile.attentionSpan}.`);
    if (ctx.profile?.sensoryNotes)
      twinLines.push(`Sensory notes: ${ctx.profile.sensoryNotes}.`);
    if (ctx.twin?.traits) {
      const top = Object.values(ctx.twin.traits)
        .slice(0, 4)
        .map((t: any) => `${t.label}=${Math.round(t.value)}`)
        .join(", ");
      twinLines.push(`Digital Twin snapshot: ${top}.`);
    }
    if (ctx.mood) twinLines.push(`Latest mood input: ${ctx.mood}.`);
    if (ctx.feature)
      twinLines.push(`Current screen: ${ctx.feature}. Tailor your help to it.`);

    const system = `${SAFETY_PREAMBLE}

ABOUT THIS LEARNER (use only to personalize, never to label or diagnose):
${twinLines.join("\n") || "You are still getting to know this learner."}

GUIDANCE:
- Keep replies to 2-5 short sentences unless the learner asks for depth.
- End with a gentle, low-pressure next step or an open question they can skip.
- If they seem overwhelmed, slow down, validate, and offer a tiny option.`;

    const history = body.history ?? [];
    const messages: ChatMessage[] = [
      ...history,
      { role: "user", content: body.message },
    ];

    const reply = await chat(messages, { system });

    try {
      await db.conversation.createMany({
        data: [
          {
            sessionId: body.sessionId,
            role: "user",
            content: body.message,
            context: ctx.feature ?? null,
          },
          {
            sessionId: body.sessionId,
            role: "assistant",
            content: reply,
            context: ctx.feature ?? null,
          },
        ],
      });
    } catch {
      // ignore persistence errors
    }

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("companion error", e);
    return NextResponse.json(
      {
        error: "I'm having trouble reaching my thoughts right now.",
        detail: e?.message,
      },
      { status: 500 }
    );
  }
}
