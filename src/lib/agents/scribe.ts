import Anthropic from '@anthropic-ai/sdk'
import type { Agent, AgentResult } from './types'

const MODEL = 'claude-sonnet-5'

export const scribe: Agent = {
  name: 'scribe',
  description:
    'Extract structure from any text: meeting notes, emails, documents, call transcripts. Returns a summary, key decisions, action items with owners, and open questions.',
  params: [
    {
      name: 'text',
      description: 'The raw text to process (meeting notes, email thread, document excerpt, etc.)',
      required: true,
      type: 'text',
      example: 'Call with Acme Corp - Jan 15...',
    },
    {
      name: 'mode',
      description: '"meeting" | "email" | "document" | "auto" (default)',
      required: false,
      type: 'string',
      example: 'meeting',
    },
  ],

  async run(params, apiKey): Promise<AgentResult> {
    const client = new Anthropic({ apiKey })
    const text = params.text
    const mode = params.mode || 'auto'

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 1000,
      system:
        'You are a precise executive assistant. Extract and structure information from text with high fidelity — never invent details not present in the source.',
      messages: [
        {
          role: 'user',
          content: `Process the following ${mode === 'auto' ? 'text' : mode} and return a JSON object with exactly these fields:
{
  "title": "Short descriptive title for this document",
  "date": "Date or time period if mentioned, else null",
  "participants": ["person/org 1", "person/org 2"],
  "summary": "2-3 sentence summary of what this is about and key outcomes",
  "decisions": ["Decision made 1", "Decision 2"],
  "actions": [
    { "task": "What needs to be done", "owner": "Who (or 'TBD')", "due": "Deadline or null" }
  ],
  "openQuestions": ["Unresolved question 1", "Unresolved question 2"],
  "sentiment": "positive | neutral | negative | mixed"
}

Use empty arrays [] for sections with nothing to report. Return ONLY valid JSON.

---
${text}`,
        },
      ],
    })

    const rawText = message.content[0].type === 'text' ? message.content[0].text : '{}'
    const match = rawText.match(/\{[\s\S]*\}/)
    const output = match ? JSON.parse(match[0]) : { error: 'Parse failed', raw: rawText }

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
