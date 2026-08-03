import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE } from "@/lib/ai";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface ReflectionBody {
  sessionId: string;
  text: string;
  mood?: string;
  energy?: number;
  mode?: "reflect" | "reframe" | "encourage";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ReflectionBody;
    if (!body.text) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    const mode = body.mode ?? "reflect";
    const modeInstr =
      mode === "reframe"
        ? "Help gently reframe a heavy thought into a kinder, more workable one — without dismissing the feeling. Offer 1-2 tiny options."
        : mode === "encourage"
        ? "Offer a warm, specific encouragement that honors effort over outcome. One short paragraph."
        : "Reflect back what you notice in 2-3 short, validating sentences. Ask ONE gentle open question the learner can skip. Never tell them how they should feel.";

    const system = `${SAFETY_PREAMBLE}

You are the Reflection Companion. This is NOT therapy and you never diagnose.
Current mood input: ${body.mood ?? "not shared"}. Energy: ${body.energy ?? "not shared"}.

${modeInstr}`;

    const reply = await chat(
      [{ role: "user", content: body.text }],
      { system }
    );

    try {
      await db.reflection.create({
        data: {
          sessionId: body.sessionId,
          text: body.text,
          mood: body.mood ?? null,
          energy: body.energy ?? null,
        },
      });
    } catch {
      /* ignore */
    }

    return NextResponse.json({ reply });
  } catch (e: any) {
    console.error("reflection error", e);
    return NextResponse.json(
      { error: "Couldn't reflect right now.", detail: e?.message },
      { status: 500 }
    );
  }
}
