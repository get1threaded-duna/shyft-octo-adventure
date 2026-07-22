import { NextRequest, NextResponse } from 'next/server'
import { getAgent } from '@/lib/agents/registry'
import type { AgentAuth } from '@/lib/agents/types'

export async function POST(req: NextRequest) {
  const auth: AgentAuth = {
    authToken: process.env.ANTHROPIC_AUTH_TOKEN,
    apiKey: process.env.ANTHROPIC_API_KEY,
  }

  if (!auth.authToken && !auth.apiKey) {
    return NextResponse.json(
      { error: 'Neither ANTHROPIC_AUTH_TOKEN nor ANTHROPIC_API_KEY is set' },
      { status: 500 }
    )
  }

  let body: { agent?: string; params?: Record<string, string> }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { agent: agentName, params = {} } = body

  if (!agentName) {
    return NextResponse.json({ error: 'Missing "agent" field' }, { status: 400 })
  }

  const agent = getAgent(agentName)
  if (!agent) {
    return NextResponse.json(
      { error: `Unknown agent: "${agentName}"`, available: ['researcher', 'scribe', 'planner', 'drafter'] },
      { status: 404 }
    )
  }

  const missing = agent.params
    .filter((p) => p.required && !params[p.name])
    .map((p) => p.name)

  if (missing.length > 0) {
    return NextResponse.json(
      { error: `Missing required params: ${missing.join(', ')}` },
      { status: 400 }
    )
  }

  try {
    const startMs = Date.now()
    const result = await agent.run(params, auth)
    const durationMs = Date.now() - startMs

    return NextResponse.json({
      agent: agentName,
      durationMs,
      ...result,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error(`[/api/agents/run] agent=${agentName}`, message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
