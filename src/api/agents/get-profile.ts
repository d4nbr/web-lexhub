import { API } from '@/lib/axios'

interface GetProfileProps {
  agent: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
    canAccessDashboard: boolean
    canAccessServices: boolean
    canAccessFinancial: boolean
    subsecaoScope: string | null
  }
}

export async function getProfile() {
  const response = await API.get<GetProfileProps>('/agents/profile')

  return response.data
}
