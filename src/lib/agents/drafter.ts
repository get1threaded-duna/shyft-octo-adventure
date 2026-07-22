import Anthropic from '@anthropic-ai/sdk'
import type { Agent, AgentResult } from './types'

const MODEL = 'claude-sonnet-5'

export const drafter: Agent = {
  name: 'drafter',
  description:
    'Draft business communications: emails, proposals, executive summaries, investor updates, follow-ups, and more. Returns a ready-to-send draft plus a shorter alternative.',
  params: [
    {
      name: 'type',
      description:
        'What to draft: "email" | "proposal" | "exec-summary" | "investor-update" | "follow-up" | "announcement"',
      required: true,
      type: 'string',
      example: 'email',
    },
    {
      name: 'intent',
      description: 'What you need this communication to achieve',
      required: true,
      type: 'string',
      example: 'Follow up on the Q4 pricing proposal sent to Acme Corp last Tuesday',
    },
    {
      name: 'context',
      description: 'Relevant background: recipient, relationship, prior history, key points to hit',
      required: false,
      type: 'text',
      example:
        'Recipient is Sarah Chen, VP Procurement. We met at SaaStr. She seemed interested but went quiet after the proposal.',
    },
    {
      name: 'tone',
      description: '"professional" | "warm" | "direct" | "formal" (default: professional)',
      required: false,
      type: 'string',
      example: 'warm',
    },
  ],

  async run(params, apiKey): Promise<AgentResult> {
    const client = new Anthropic({ apiKey })
    const type = params.type
    const intent = params.intent
    const context = params.context || ''
    const tone = params.tone || 'professional'

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1200,
      system:
        'You are a senior communications specialist. Write clear, purposeful business communications that get results. Every word should earn its place. Never be verbose or use filler phrases.',
      messages: [
        {
          role: 'user',
          content: `Draft a ${type} with the following parameters.

Intent: ${intent}
Tone: ${tone}
${context ? `Context: ${context}` : ''}

Return a JSON object with exactly these fields:
{
  "subjectLine": "Subject line or title (for emails/proposals)",
  "draft": "The full, ready-to-send draft text",
  "shortVersion": "A shorter alternative (if applicable — for emails, a 2-3 sentence version)",
  "keyMessages": ["The 2-3 core points this communication makes"],
  "callToAction": "The specific action you want the recipient to take",
  "warnings": ["Any risks or things to double-check before sending — or empty array"]
}

Return ONLY valid JSON. Use \\n for line breaks within the draft text.`,
        },
      ],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
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
