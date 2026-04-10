import { API } from '@/lib/axios'

interface UpdateAgentProps {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
  canAccessDashboard: boolean
  canAccessServices: boolean
  canAccessFinancial: boolean
  subsecaoScope?: string | null
}

export async function updateAgent({
  id,
  name,
  email,
  role,
  canAccessDashboard,
  canAccessServices,
  canAccessFinancial,
  subsecaoScope,
}: UpdateAgentProps) {
  await API.put(`/agents/update/${id}`, {
    name,
    email,
    role,
    canAccessDashboard,
    canAccessServices,
    canAccessFinancial,
    subsecaoScope,
  })
}
