import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/ai";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { audio } = body as { audio?: string };

    if (!audio || typeof audio !== "string") {
      return NextResponse.json(
        { error: "Audio data is required (base64 string)." },
        { status: 400 }
      );
    }

    // Strip any data: URI prefix
    const base64 = audio.replace(/^data:audio\/[a-zA-Z]+;base64,/, "");

    const zai = await getAI();
    const response = await zai.audio.asr.create({
      file_base64: base64,
    } as any);

    const text = (response as any).text?.trim() || "";

    if (!text) {
      return NextResponse.json(
        { error: "I couldn't catch that. Could you try again?" },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (e: any) {
    console.error("asr error", e);
    return NextResponse.json(
      {
        error: "I couldn't hear that clearly right now.",
        detail: e?.message,
      },
      { status: 500 }
    );
  }
}
