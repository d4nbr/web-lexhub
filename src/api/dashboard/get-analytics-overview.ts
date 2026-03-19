import { API } from '@/lib/axios'

export interface AnalyticsFilters {
  year: number
  month: number
  agentId: string
}

export interface AnalyticsOverviewResponse {
  period: { year: number; month: number }
  filter: { agentId: string }
  totals: {
    current: {
      totalServices: number
      completedServices: number
      openServices: number
    }
    previous: {
      totalServices: number
      completedServices: number
      openServices: number
    }
    variation: {
      totalServices: number
      completedServices: number
      openServices: number
    }
  }
}

export async function getAnalyticsOverview(filters: AnalyticsFilters) {
  const { data } = await API.get<AnalyticsOverviewResponse>(
    '/services/analytics/overview',
    {
      params: filters,
    }
  )

  return data
}
