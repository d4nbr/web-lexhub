import { API } from '@/lib/axios'

interface GetAllQuery {
  pageIndex?: number | null
  name?: string | null
  role?: string | null
}

interface GetAllProps {
  agents: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
    canAccessDashboard: boolean
    canAccessServices: boolean
    canAccessFinancial: boolean
    subsecaoScope: string | null
    inactive: string | null
  }[]
  total: number
}

export async function getAll({ pageIndex, name, role }: GetAllQuery) {
  const response = await API.get<GetAllProps>('/agents/all', {
    params: {
      pageIndex,
      name,
      role,
    } as GetAllQuery,
  })

  return response.data
}
