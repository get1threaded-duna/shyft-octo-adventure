import type { Agent, AgentAuth, AgentResult } from './types'
import { makeClient } from './types'

const MODEL = 'claude-sonnet-5'

export const planner: Agent = {
  name: 'planner',
  description:
    'Turn a business goal into an actionable plan with phases, milestones, tasks, dependencies, and success metrics.',
  params: [
    {
      name: 'goal',
      description: 'The business goal or initiative to plan',
      required: true,
      type: 'string',
      example: 'Launch a B2B SaaS product in 90 days',
    },
    {
      name: 'context',
      description: 'Optional background: team size, constraints, existing resources, etc.',
      required: false,
      type: 'text',
      example: 'Team of 3 engineers, 1 designer. MVP already has auth and billing.',
    },
    {
      name: 'horizon',
      description: 'Time horizon for the plan: "30d" | "90d" | "6m" | "1y" (default: 90d)',
      required: false,
      type: 'string',
      example: '90d',
    },
  ],

  async run(params, auth: AgentAuth): Promise<AgentResult> {
    const client = makeClient(auth)
    const goal = params.goal
    const context = params.context || ''
    const horizon = params.horizon || '90d'

    const message = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system:
        'You are a seasoned product and operations strategist. Build clear, realistic plans. Be specific about what needs to happen and in what order. Flag real risks and dependencies.',
      messages: [
        {
          role: 'user',
          content: `Build an actionable plan for this goal.

Goal: ${goal}
Time horizon: ${horizon}
${context ? `Context: ${context}` : ''}

Return a JSON object with exactly these fields:
{
  "goal": "Restated goal with success criteria",
  "phases": [
    {
      "name": "Phase name (e.g., Foundation)",
      "duration": "e.g., Weeks 1-2",
      "objective": "What this phase achieves",
      "tasks": ["Task 1", "Task 2", "Task 3"],
      "milestone": "Specific, measurable milestone that marks phase completion"
    }
  ],
  "criticalPath": ["The 3-5 must-do items that everything else depends on"],
  "risks": [
    { "risk": "Risk description", "likelihood": "high|medium|low", "mitigation": "How to address it" }
  ],
  "successMetrics": ["Measurable KPI 1", "KPI 2", "KPI 3"],
  "quickWins": ["Something achievable in the first week to build momentum"]
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
