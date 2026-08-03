import { NextRequest, NextResponse } from "next/server";
import { chat, SAFETY_PREAMBLE } from "@/lib/ai";

export const runtime = "nodejs";

interface ConceptsBody {
  concepts: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ConceptsBody;
    const concepts = body.concepts?.filter((c) => c?.trim()).slice(0, 20);

    if (!concepts || concepts.length < 2) {
      return NextResponse.json({
        connections: [],
        message: "Add at least two concepts to see how they connect.",
      });
    }

    const system = `${SAFETY_PREAMBLE}

You are the Knowledge Graph engine inside NeuroTwin OS. Given a list of concepts a learner has explored, find the most meaningful connections between them.

Return STRICT JSON only — no markdown, no explanation outside the JSON. Format:
{
  "connections": [
    {
      "from": "concept A (exact string from the list)",
      "to": "concept B (exact string from the list)",
      "bridge": "one short sentence explaining how they connect, in plain warm language for a neurodivergent learner"
    }
  ],
  "insight": "one short sentence (max 20 words) noticing a pattern in what the learner is exploring"
}

Rules:
- Return 2-5 connections, only between concepts that genuinely relate.
- The "bridge" must be concrete and simple (e.g. "Both move energy from one place to another").
- Never invent concepts not in the list.
- If no meaningful connections exist, return empty connections array + an insight.`;

    const user = `Concepts the learner has explored:\n${concepts.map((c, i) => `${i + 1}. ${c}`).join("\n")}\n\nFind the connections.`;

    const reply = await chat([{ role: "user", content: user }], { system });

    // Extract JSON from the reply
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        connections: [],
        insight: "I'm still mapping how these ideas relate.",
      });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json({
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
      insight: typeof parsed.insight === "string" ? parsed.insight : "",
    });
  } catch (e: any) {
    console.error("concepts error", e);
    return NextResponse.json(
      {
        connections: [],
        insight: "",
        error: "Couldn't map those connections right now.",
        detail: e?.message,
      },
      { status: 500 }
    );
  }
}
