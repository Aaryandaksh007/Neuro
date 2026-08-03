import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE } from "@/lib/ai";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface ExportBody {
  sessionId: string;
  profile?: { name?: string; preferredStyle?: string; goals?: string[]; interests?: string[] };
  twin?: { traits?: Record<string, any> };
  today: {
    lessons: string[];
    moods: { mood: string; energy: number }[];
    victories: string[];
    gratitudes: string[];
    healthLogs: number;
    focusMinutes: number;
  };
  format: "parent" | "educator";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ExportBody;
    const t = body.today;
    const isEducator = body.format === "educator";

    const system = `${SAFETY_PREAMBLE}

You are generating a learning summary for a ${isEducator ? "educator" : "parent/guardian"} of a neurodivergent learner using NeuroTwin OS. This is a gentle, honest, strengths-based summary — NEVER diagnostic, NEVER shaming.

Format as clean markdown with these sections:
## Learning Summary — [Name]
### What they explored
### Strengths I noticed
### Growth areas (gentle)
### How to support them

Keep it under 200 words. Focus on effort, curiosity, and patterns — not grades or deficits. Use plain, warm language.`;

    const user = `Learner: ${body.profile?.name || "the learner"}
Preferred style: ${body.profile?.preferredStyle || "unknown"}
Goals: ${body.profile?.goals?.join(", ") || "not specified"}
Interests: ${body.profile?.interests?.join(", ") || "not specified"}

Today's activity:
- Lessons: ${t.lessons.length > 0 ? t.lessons.join(", ") : "none today"}
- Mood check-ins: ${t.moods.length} (${t.moods.map((m) => m.mood).join(", ") || "none"})
- Tiny victories: ${t.victories.length} (${t.victories.join("; ") || "none"})
- Health care logs: ${t.healthLogs}
- Focus session minutes: ${t.focusMinutes}

Write the summary for a ${isEducator ? "educator" : "parent"}.`;

    const reply = await chat([{ role: "user", content: user }], { system });

    // Also fetch recent conversation history from DB for context
    let recentConversations: { role: string; content: string }[] = [];
    try {
      const convos = await db.conversation.findMany({
        where: { sessionId: body.sessionId },
        orderBy: { createdAt: "desc" },
        take: 10,
      });
      recentConversations = convos.reverse().map((c) => ({
        role: c.role,
        content: c.content,
      }));
    } catch {
      // ignore DB errors
    }

    return NextResponse.json({
      summary: reply,
      conversations: recentConversations,
      generatedAt: new Date().toISOString(),
    });
  } catch (e: any) {
    console.error("export error", e);
    return NextResponse.json(
      { error: "Couldn't generate the summary.", detail: e?.message },
      { status: 500 }
    );
  }
}
