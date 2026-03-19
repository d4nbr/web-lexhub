import { API } from '@/lib/axios'

export interface ActiveAgent {
  id: string
  name: string
}

interface GetAllActiveResponse {
  agents: ActiveAgent[]
}

export async function getAllActiveAgents() {
  const { data } = await API.get<GetAllActiveResponse>('/agents/all-active')

  return data.agents
}
