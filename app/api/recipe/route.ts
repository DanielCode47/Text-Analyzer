import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: NextRequest) {
  try {
    const { ingredients } = await req.json()
    if (!ingredients?.trim()) return NextResponse.json({ error: 'No ingredients provided' }, { status: 400 })

    const prompt = `You are an incredibly creative chef. Look at the following list of ingredients and invent a delicious, practical recipe that uses as many of them as possible. 

The output MUST follow this exact JSON structure:
{
  "recipeName": "A catchy, appetizing name for the dish",
  "time": "Estimated prep/cook time (e.g., 25 mins)",
  "steps": [
    "Step 1: clear instruction...",
    "Step 2: clear instruction...",
    "Step 3: clear instruction..."
  ],
  "missingStaples": ["salt", "olive oil", "garlic"] 
}
Note: For "missingStaples", list 1-3 basic pantry items the user probably has that would make the dish much better. If none are needed, leave the array empty.

Ingredients available:
"""
${ingredients.slice(0, 1000)}
"""`

    // THE FIX: Upgrading to the modern, active model generation
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash', // (If this ever fails, use 'gemini-2.0-flash')
      generationConfig: {
        // The newest models handle native JSON perfectly!
        responseMimeType: "application/json", 
      }
    })

    const result = await model.generateContent(prompt)
    
    // Because of responseMimeType, we can safely parse the raw text
    const parsed = JSON.parse(result.response.text())
    return NextResponse.json(parsed)

  } catch (error) {
    console.error("Gemini API Error details:", error)
    return NextResponse.json({ error: 'Failed to generate recipe' }, { status: 500 })
  }
}