import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `Analyze the following text and respond ONLY with a valid JSON object (no markdown, no code blocks, just raw JSON) with this exact structure:
{
  "topic": "A concise 1-2 sentence description of the main topic",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "summary": "A clear 3-5 sentence summary of the text",
  "sentiment": {
    "label": "one of: Very Positive / Positive / Neutral / Negative / Very Negative",
    "score": a number from -1.0 (most negative) to 1.0 (most positive),
    "explanation": "A brief 1-2 sentence explanation of the emotional tone"
  }
}

Text to analyze:
"""
${text}
"""`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type");
    }

    const result = JSON.parse(content.text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze text" },
      { status: 500 }
    );
  }
}
