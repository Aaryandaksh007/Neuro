import { NextRequest, NextResponse } from "next/server";
import { getAI } from "@/lib/ai";

export const runtime = "nodejs";

interface IllustrateBody {
  topic: string;
  style?: "soft" | "vivid" | "minimal" | "storybook";
}

const STYLE_PROMPTS: Record<string, string> = {
  soft: "soft pastel illustration, gentle watercolor style, warm and calming, rounded shapes, no text",
  vivid: "vibrant educational illustration, clean digital art, friendly and engaging, no text",
  minimal: "minimalist flat illustration, simple geometric shapes, muted colors, no text",
  storybook: "children's storybook illustration, hand-drawn style, whimsical and warm, no text",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as IllustrateBody;
    const { topic, style = "soft" } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "A topic is required to illustrate." },
        { status: 400 }
      );
    }

    const styleDesc = STYLE_PROMPTS[style] || STYLE_PROMPTS.soft;
    const prompt = `An educational illustration about: ${topic.trim()}. ${styleDesc}. Suitable for neurodivergent learners — clear, uncluttered, calming, high contrast, no text or words in the image.`;

    const zai = await getAI();
    const response = await zai.images.generations.create({
      prompt,
      size: "1024x1024",
    } as any);

    const base64 = (response as any).data?.[0]?.base64;
    if (!base64) {
      throw new Error("No image returned");
    }

    // Return as a data URL so the client can use it directly
    return NextResponse.json({
      imageUrl: `data:image/png;base64,${base64}`,
      prompt,
    });
  } catch (e: any) {
    console.error("illustrate error", e);
    return NextResponse.json(
      {
        error: "Couldn't create that illustration just now.",
        detail: e?.message,
      },
      { status: 500 }
    );
  }
}
