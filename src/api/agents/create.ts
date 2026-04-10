import { API } from '@/lib/axios'

interface CreateAgentProps {
  name: string
  email: string
  password: string
  role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
  canAccessDashboard: boolean
  canAccessServices: boolean
  canAccessFinancial: boolean
  subsecaoScope?: string | null
}

export async function createAgent({
  name,
  email,
  password,
  role,
  canAccessDashboard,
  canAccessServices,
  canAccessFinancial,
  subsecaoScope,
}: CreateAgentProps) {
  await API.post('/agents', {
    name,
    email,
    password,
    role,
    canAccessDashboard,
    canAccessServices,
    canAccessFinancial,
    subsecaoScope,
  })
}
