import { API } from '@/lib/axios'

export interface AnalyticsFilters {
  year: number
  month: number | 'all'
  agentId: string
}

export interface AnalyticsOverviewResponse {
  period: { year: number; month: number }
  filter: { agentId: string }
  totals: {
    current: {
      totalServices: number
      externalServices: number
      averageResolutionMinutes: number
    }
    previous: {
      totalServices: number
      externalServices: number
      averageResolutionMinutes: number
    }
    variation: {
      totalServices: number
      externalServices: number
      averageResolutionMinutes: number
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
