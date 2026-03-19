import { API } from '@/lib/axios'

export interface TopAgentsFilters {
  year: number
  month: number
  limit?: number
}

export interface TopAgentItem {
  agentId: string
  agentName: string
  totalServices: number
}

export async function getTopAgents(filters: TopAgentsFilters) {
  const { data } = await API.get<TopAgentItem[]>('/services/analytics/top-agents', {
    params: filters,
  })

  return data
}
