import { API } from '@/lib/axios'

interface GetAllQuery {
  pageIndex?: number | null
  oab?: string | null
  lawyerName?: string | null
  agentName?: string | null
  assistance?: string | null
  status?: string | null
}

interface GetAllServicesProps {
  services: {
    id: string
    assistance: 'PERSONALLY' | 'REMOTE'
    observation: string | null
    status: 'OPEN' | 'COMPLETED'
    createdAt: string
    finishedAt: string | null
    lawyer: {
      id: string
      name: string
      oab: string
      email: string
    }
    agent: {
      id: string
      name: string
      email: string
      role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
    }
    serviceTypes: {
      serviceType: {
        id: string
        name: string
      }
    }[]
  }[]
  total: number
}

export async function getAllServices({
  pageIndex,
  oab,
  lawyerName,
  agentName,
  assistance,
  status,
}: GetAllQuery) {
  const response = await API.get<GetAllServicesProps>('/services/all', {
    params: {
      pageIndex,
      oab,
      lawyerName,
      agentName,
      assistance,
      status,
    } as GetAllQuery,
  })

  return response.data
}
