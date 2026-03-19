import { API } from '@/lib/axios'
import type { AnalyticsFilters } from './get-analytics-overview'

export interface ServiceTypeItem {
  serviceTypeId: string
  serviceTypeName: string
  totalServices: number
}

export async function getByServiceType(filters: AnalyticsFilters) {
  const { data } = await API.get<ServiceTypeItem[]>(
    '/services/analytics/by-service-type',
    {
      params: filters,
    }
  )

  return data
}
