import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { text } = await req.json()
  if (!text?.trim()) return NextResponse.json({ error: 'No text provided' }, { status: 400 })

  const prompt = `Analyze the following text and respond ONLY with a valid JSON object — no preamble, no markdown, no backticks.

The JSON must follow this exact structure:
{
  "topic": "A concise topic title (5 words max)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "summary": "A clear 2-3 sentence summary of the text.",
  "emotion": {
    "primary": "The dominant emotion (e.g. Optimistic, Melancholic, Tense, Neutral, Joyful, Angry, Fearful, Inspired)",
    "score": 75,
    "breakdown": [
      { "label": "Positive", "value": 60, "color": "#4A6741" },
      { "label": "Negative", "value": 20, "color": "#C4441C" },
      { "label": "Neutral", "value": 20, "color": "#C9A84C" }
    ]
  }
}

Text to analyze:
"""
${text.slice(0, 8000)}
"""`

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text.trim()
  const parsed = JSON.parse(raw)
  return NextResponse.json(parsed)
}
