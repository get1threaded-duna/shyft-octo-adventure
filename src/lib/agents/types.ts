import Anthropic from '@anthropic-ai/sdk'

export interface AgentParam {
  name: string
  description: string
  required: boolean
  type: 'string' | 'text' | 'number'
  example?: string
}

export interface AgentMeta {
  name: string
  description: string
  params: AgentParam[]
}

export interface AgentResult {
  output: Record<string, unknown>
  meta: { model: string; input_tokens: number; output_tokens: number }
}

export interface AgentAuth {
  apiKey?: string
  authToken?: string
}

export type AgentRunner = (
  params: Record<string, string>,
  auth: AgentAuth
) => Promise<AgentResult>

export interface Agent extends AgentMeta {
  run: AgentRunner
}

export function makeClient(auth: AgentAuth): Anthropic {
  if (auth.authToken) {
    return new Anthropic({ authToken: auth.authToken })
  }
  return new Anthropic({ apiKey: auth.apiKey })
}
