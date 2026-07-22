import type { Agent, AgentAuth, AgentResult } from './types'
import { makeClient } from './types'

const MODEL = 'claude-sonnet-5'

export const researcher: Agent = {
  name: 'researcher',
  description:
    'Research any topic, company, market, or competitor. Returns a structured brief with key findings, opportunities, risks, and recommendations.',
  params: [
    {
      name: 'topic',
      description: 'What to research',
      required: true,
      type: 'string',
      example: 'OpenAI competitors in the enterprise AI market',
    },
    {
      name: 'depth',
      description: '"summary" (fast) or "detailed" (thorough)',
      required: false,
      type: 'string',
      example: 'detailed',
    },
    {
      name: 'lens',
      description: 'Focus lens: "business" | "technical" | "competitive" | "general"',
      required: false,
      type: 'string',
      example: 'competitive',
    },
  ],

  async run(params, auth: AgentAuth): Promise<AgentResult> {
    const client = makeClient(auth)
    const topic = params.topic
    const depth = params.depth || 'summary'
    const lens = params.lens || 'business'
    // claude-sonnet-5 uses extended thinking; budget generously for thinking + output
    const maxTokens = depth === 'detailed' ? 8000 : 4000

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system:
        'You are a senior research analyst. Produce factual, structured briefs. Use specific numbers and examples where you can. Flag uncertainty clearly. Never fabricate statistics.',
      messages: [
        {
          role: 'user',
          content: `Research topic: "${topic}"
Depth: ${depth}
Lens: ${lens}

Return a JSON object with exactly these fields:
{
  "title": "Concise research title",
  "summary": "2-3 sentence executive summary",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"],
  "opportunities": ["Opportunity or implication 1", "Opportunity 2"],
  "risks": ["Risk or challenge 1", "Risk 2"],
  "recommendations": ["Recommended action 1", "Action 2"],
  "confidence": "high | medium | low — how confident you are in accuracy"
}

Return ONLY valid JSON, no markdown.`,
        },
      ],
    })

    const textBlock = message.content.find((b) => b.type === 'text')
    const text = textBlock && textBlock.type === 'text' ? textBlock.text : '{}'
    const match = text.match(/\{[\s\S]*\}/)
    const output = match ? JSON.parse(match[0]) : { error: 'Parse failed', raw: text }

    return {
      output,
      meta: {
        model: MODEL,
        input_tokens: message.usage.input_tokens,
        output_tokens: message.usage.output_tokens,
      },
    }
  },
}
