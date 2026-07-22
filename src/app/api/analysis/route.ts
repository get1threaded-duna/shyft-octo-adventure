import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM = `You are an educational financial analyst. Your role is to provide clear, factual context about publicly traded securities — never personalized buy/sell recommendations.

Write in plain, direct language. Be specific with numbers and context. Avoid jargon without explanation.

Always end every response with exactly this footer line:
"Educational analysis, not investment advice. You make the decisions."`

export async function POST(req: NextRequest) {
  const authToken = process.env.ANTHROPIC_AUTH_TOKEN
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!authToken && !apiKey) {
    return NextResponse.json({ error: 'Neither ANTHROPIC_AUTH_TOKEN nor ANTHROPIC_API_KEY is set' }, { status: 500 })
  }

  try {
    const client = authToken ? new Anthropic({ authToken }) : new Anthropic({ apiKey })
    const body = await req.json()
    const { ticker, shares, avgCost, currentPrice, gainLossPct, portfolioPct } = body

    const prompt = `Provide an educational analysis brief for ${ticker}.

Position context (the user's actual data — use it to make examples concrete):
- Shares held: ${shares}
- Average cost per share: $${avgCost}
- Current price: $${currentPrice}
- Gain/loss: ${gainLossPct > 0 ? '+' : ''}${gainLossPct.toFixed(1)}%
${portfolioPct ? `- Portfolio weight: ${portfolioPct.toFixed(1)}% of total portfolio` : ''}

Return a JSON object with exactly these fields:
{
  "headline": "One-sentence summary of what this position is and why it matters",
  "valuation": "2-3 sentences: what the current valuation implies, how it compares to sector peers",
  "volatility": "2-3 sentences: typical price swing character, beta context, what causes moves",
  "recentDrivers": "2-3 sentences: key recent or ongoing catalysts driving this stock",
  ${portfolioPct && portfolioPct > 20 ? '"concentrationNote": "2 sentences about what this concentration weight means for portfolio risk",' : ''}
  "footer": "Educational analysis, not investment advice. You make the decisions."
}

Return ONLY valid JSON, no markdown.`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 600,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Parse failed', raw: text }, { status: 422 })
    }

    const brief = JSON.parse(jsonMatch[0])
    return NextResponse.json({ brief })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[/api/analysis]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
