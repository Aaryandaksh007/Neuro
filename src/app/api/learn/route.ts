import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE } from "@/lib/ai";
import { db } from "@/lib/db";

export const runtime = "nodejs";

interface LearnBody {
  sessionId: string;
  topic: string;
  format:
    | "story"
    | "visual"
    | "comic"
    | "flowchart"
    | "analogy"
    | "quiz"
    | "flashcards"
    | "explain";
  profile?: {
    preferredStyle?: string;
    readingSpeed?: string;
    attentionSpan?: string;
    sessionLength?: number;
  };
  twin?: { traits?: Record<string, any> };
  note?: string; // any learner note
}

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  story:
    "Turn this lesson into a SHORT, vivid story (3-5 short paragraphs) with a relatable character and a clear payoff. Use sensory, concrete language. End with one gentle takeaway.",
  visual:
    "Describe a learning diagram in structured steps a learner could picture or draw. Output as a titled 'Visual Map' with 3-6 labeled nodes and how they connect. Be concrete.",
  comic:
    "Write a 4-panel comic script. For each panel give: PANEL N — Scene (one line), Caption (one line), Character line (optional). Keep language simple and warm.",
  flowchart:
    "Convert the lesson into a plain-text flowchart using -> arrows between steps, with decision branches labeled 'if X ->'. Keep nodes short.",
  analogy:
    "Explain this with 2 vivid real-life analogies a neurodivergent learner would find familiar. One analogy per heading. Then one line on how it maps back.",
  quiz:
    "Create a 3-question gentle adaptive quiz. For each: the question, 4 options labeled A-D, then the answer and a one-line encouragement. No timers, no score shaming.",
  flashcards:
    "Create 5 flashcards as a JSON array: [{\"front\":\"...\",\"back\":\"...\"}]. Front = concept/question, back = simple answer. Output ONLY the JSON array.",
  explain:
    "Explain this in plain, warm language. Use short sentences, one idea at a time. Include a 'Why it matters' line and a tiny real example.",
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LearnBody;
    if (!body.topic || !body.format) {
      return NextResponse.json({ error: "topic and format required" }, { status: 400 });
    }

    const p = body.profile ?? {};
    const instr = FORMAT_INSTRUCTIONS[body.format] ?? FORMAT_INSTRUCTIONS.explain;

    let twinNote = "";
    if (body.twin?.traits) {
      const top = Object.values(body.twin.traits)
        .slice(0, 3)
        .map((t: any) => `${t.label} ${Math.round(t.value)}`)
        .join(", ");
      twinNote = `\nDigital Twin signal: ${top}. If visual preference is high, lean visual; if session length is low, keep it SHORT.`;
    }

    const system = `${SAFETY_PREAMBLE}

You are the Adaptive Tutor inside NeuroTwin OS. You transform ANY lesson into the format the learner's brain prefers.
- Preferred style: ${p.preferredStyle ?? "unknown"}.
- Reading speed: ${p.readingSpeed ?? "moderate"} (slow => simpler words, shorter sentences).
- Attention span: ${p.attentionSpan ?? "medium"} (short => briefer, chunked).
- Target session: ~${p.sessionLength ?? 20} min.
${twinNote}

TASK INSTRUCTION:
${instr}

Always end (unless format is flashcards/quiz) with a one-line "Why this helps you" note explaining your adaptation (Explainable AI). Never diagnose. Keep it encouraging.`;

    const user = `Lesson / topic: ${body.topic}${body.note ? `\nLearner note: ${body.note}` : ""}`;

    const reply = await chat([{ role: "user", content: user }], { system });

    try {
      await db.learningSession.create({
        data: {
          sessionId: body.sessionId,
          topic: body.topic,
          style: p.preferredStyle ?? "unknown",
          format: body.format,
          summary: reply.slice(0, 500),
        },
      });
    } catch {
      /* ignore */
    }

    let flashcards: { front: string; back: string }[] | null = null;
    if (body.format === "flashcards") {
      try {
        const match = reply.match(/\[[\s\S]*\]/);
        flashcards = match ? JSON.parse(match[0]) : null;
      } catch {
        flashcards = null;
      }
    }

    return NextResponse.json({ reply, flashcards });
  } catch (e: any) {
    console.error("learn error", e);
    return NextResponse.json(
      { error: "Couldn't prepare that lesson just now.", detail: e?.message },
      { status: 500 }
    );
  }
}
