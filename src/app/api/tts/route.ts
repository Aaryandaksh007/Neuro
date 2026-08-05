import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/ai";

export const runtime = "nodejs";

// Split long text into TTS-friendly chunks (max 1000 chars, on sentence boundaries)
function splitText(text: string, maxLen = 1000): string[] {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= maxLen) return [clean];
  const sentences = clean.match(/[^.!?]+[.!?]+/g) || [clean];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if ((cur + s).length <= maxLen) {
      cur += s;
    } else {
      if (cur) chunks.push(cur.trim());
      cur = s;
    }
  }
  if (cur) chunks.push(cur.trim());
  return chunks;
}

// Strip markdown for cleaner speech
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/_{2,}/g, "")
    .replace(/\n{2,}/g, ". ")
    .replace(/\n/g, ". ")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, voice = "tongtong", speed = 1.0, chunkIndex = 0 } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const clean = stripMarkdown(text);
    const chunks = splitText(clean, 1000);

    const idx = Math.max(0, Math.min(chunks.length - 1, Number(chunkIndex)));
    const chunk = chunks[idx];

    if (!chunk) {
      return NextResponse.json({ error: "No text to speak" }, { status: 400 });
    }

    const zai = await getAI();
    const response = await zai.audio.tts.create({
      input: chunk,
      voice,
      speed: Math.max(0.5, Math.min(2.0, Number(speed) || 1.0)),
      response_format: "wav",
      stream: false,
    } as any);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(new Uint8Array(arrayBuffer));

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/wav",
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "no-cache",
        "X-Chunk-Index": String(idx),
        "X-Chunk-Total": String(chunks.length),
      },
    });
  } catch (e: any) {
    console.error("tts error", e);
    return NextResponse.json(
      { error: "Couldn't generate audio right now.", detail: e?.message },
      { status: 500 }
    );
  }
}
