import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

const SYSTEM = `You are a financial data extractor. Given a screenshot from a brokerage or investing app (e.g. Cash App Investing), extract all visible stock/ETF positions.

Return ONLY a valid JSON array. Each element must have:
{
  "ticker": string (uppercase, e.g. "NVDA"),
  "shares": number,
  "avgCost": number (per share average cost/purchase price),
  "currentPrice": number (current market price per share, if visible),
  "confidence": "high" | "medium" | "low"
}

Rules:
- If a value is not visible, omit it (do not guess).
- avgCost is the per-share cost basis / average purchase price, NOT total invested.
- currentPrice is the current per-share market price, NOT total value.
- Be precise with decimal places as shown.
- Return ONLY the JSON array, no explanation.`

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null
    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const mediaType = (file.type || 'image/jpeg') as
      | 'image/jpeg'
      | 'image/png'
      | 'image/gif'
      | 'image/webp'

    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      system: SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64 },
            },
            {
              type: 'text',
              text: 'Extract all positions from this screenshot.',
            },
          ],
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Could not parse response', raw: text }, { status: 422 })
    }

    const positions = JSON.parse(jsonMatch[0])
    return NextResponse.json({ positions })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
