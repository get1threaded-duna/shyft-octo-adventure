import { researcher } from './researcher'
import { scribe } from './scribe'
import { planner } from './planner'
import { drafter } from './drafter'
import type { Agent } from './types'

const agents: Record<string, Agent> = {
  researcher,
  scribe,
  planner,
  drafter,
}

export function getAgent(name: string): Agent | undefined {
  return agents[name]
}

export function listAgents(): { name: string; description: string; params: Agent['params'] }[] {
  return Object.values(agents).map(({ name, description, params }) => ({
    name,
    description,
    params,
  }))
}
