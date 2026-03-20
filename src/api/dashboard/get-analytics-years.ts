import { API } from '@/lib/axios'

interface AnalyticsYearsResponse {
  years: number[]
}

export async function getAnalyticsYears() {
  const { data } = await API.get<AnalyticsYearsResponse>('/services/analytics/years')
  return data.years
}
