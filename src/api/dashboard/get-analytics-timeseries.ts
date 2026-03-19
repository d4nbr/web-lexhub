import { API } from '@/lib/axios'
import type { AnalyticsFilters } from './get-analytics-overview'

export interface AnalyticsTimeseriesFilters extends AnalyticsFilters {
  groupBy: 'day' | 'month'
}

export interface AnalyticsTimeseriesPoint {
  date: string
  totalServices: number
}

export async function getAnalyticsTimeseries(filters: AnalyticsTimeseriesFilters) {
  const { data } = await API.get<AnalyticsTimeseriesPoint[]>(
    '/services/analytics/timeseries',
    {
      params: filters,
    }
  )

  return data
}
