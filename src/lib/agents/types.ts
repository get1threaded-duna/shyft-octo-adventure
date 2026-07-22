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

export type AgentRunner = (
  params: Record<string, string>,
  apiKey: string
) => Promise<AgentResult>

export interface Agent extends AgentMeta {
  run: AgentRunner
}
