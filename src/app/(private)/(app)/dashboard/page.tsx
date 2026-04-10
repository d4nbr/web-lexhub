'use client'

import { useEffect, useMemo } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { DashboardFilters } from './components/dashboard-filters'
import { OverviewCards } from './components/overview-cards'
import { ServicesTimeSeriesChart } from './components/services-timeseries-chart'
import { TopAgentsChart } from './components/top-agents-chart'
import { ServiceTypeDonutChart } from './components/service-type-donut-chart'
import { getAllActiveAgents } from '@/api/agents/get-all-active'
import { getAnalyticsOverview } from '@/api/dashboard/get-analytics-overview'
import { getAnalyticsTimeseries } from '@/api/dashboard/get-analytics-timeseries'
import { getTopAgents } from '@/api/dashboard/get-top-agents'
import { getByServiceType } from '@/api/dashboard/get-by-service-type'
import { getAnalyticsYears } from '@/api/dashboard/get-analytics-years'

const TABS = [
  { key: 'overview', label: 'Visão Geral' },
  { key: 'employee', label: 'Por Funcionário' },
  { key: 'comparative', label: 'Comparativos' },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function DashboardPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1
  const yearParam = searchParams.get('year')
  const monthParam = searchParams.get('month')
  const year = Number(yearParam ?? currentYear)
  const month: number | 'all' =
    !monthParam || monthParam === 'all' ? 'all' : Number(monthParam)
  const agentId = searchParams.get('agentId') ?? 'all'
  const tab = (searchParams.get('tab') ?? 'overview') as TabKey

  const effectiveAgentId = tab === 'overview' ? 'all' : agentId

  const filters = useMemo(
    () => ({ year, month, agentId: effectiveAgentId }),
    [year, month, effectiveAgentId]
  )

  const updateSearchParam = (changes: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString())

    for (const [key, value] of Object.entries(changes)) {
      params.set(key, value)
    }

    router.replace(`${pathname}?${params.toString()}`)
  }

  const activeAgentsQuery = useQuery({
    queryKey: ['agents', 'all-active'],
    queryFn: getAllActiveAgents,
  })

  const yearsQuery = useQuery({
    queryKey: ['dashboard', 'years'],
    queryFn: getAnalyticsYears,
  })

  const overviewQuery = useQuery({
    queryKey: ['dashboard', 'overview', filters],
    queryFn: () => getAnalyticsOverview(filters),
  })

  const timeseriesQuery = useQuery({
    queryKey: ['dashboard', 'timeseries', { ...filters, groupBy: 'day' }],
    queryFn: () => getAnalyticsTimeseries({ ...filters, groupBy: 'day' }),
  })

  const monthlyTimeseriesQuery = useQuery({
    queryKey: ['dashboard', 'timeseries', { ...filters, groupBy: 'month' }],
    queryFn: () => getAnalyticsTimeseries({ ...filters, groupBy: 'month' }),
  })

  const topAgentsQuery = useQuery({
    queryKey: ['dashboard', 'top-agents', { year, month }],
    queryFn: () => getTopAgents({ year, month, limit: 10 }),
    enabled: effectiveAgentId === 'all',
  })

  const byServiceTypeQuery = useQuery({
    queryKey: ['dashboard', 'by-service-type', filters],
    queryFn: () => getByServiceType(filters),
  })

  const hasError =
    overviewQuery.isError ||
    timeseriesQuery.isError ||
    byServiceTypeQuery.isError ||
    topAgentsQuery.isError ||
    monthlyTimeseriesQuery.isError

  useEffect(() => {
    const shouldSetDefaults = !yearParam || !monthParam

    if (!shouldSetDefaults) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())

    if (!yearParam) {
      params.set('year', String(currentYear))
    }

    if (!monthParam) {
      params.set('month', 'all')
    }

    if (!params.get('tab')) {
      params.set('tab', 'overview')
    }

    if (!params.get('agentId')) {
      params.set('agentId', 'all')
    }

    router.replace(`${pathname}?${params.toString()}`)
  }, [monthParam, yearParam, pathname, router, searchParams, currentYear, currentMonth])

  useEffect(() => {
    if (tab !== 'overview' || agentId === 'all') {
      return
    }

    updateSearchParam({ agentId: 'all' })
  }, [tab, agentId])

  useEffect(() => {
    if (!hasError) {
      return
    }

    toast.error('Falha ao carregar analytics do dashboard.', {
      action: {
        label: 'Tentar novamente',
        onClick: () => {
          overviewQuery.refetch()
          timeseriesQuery.refetch()
          byServiceTypeQuery.refetch()
          topAgentsQuery.refetch()
          monthlyTimeseriesQuery.refetch()
        },
      },
    })
  }, [hasError])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl sm:text-3xl font-calsans font-bold tracking-tight">Dashboard Analytics</h1>

      <Separator orientation="horizontal" />

      <div className="flex gap-2 overflow-x-auto pb-1">
        <div className="flex min-w-max gap-2">
        {TABS.map(item => (
          <Button
            key={item.key}
            variant={tab === item.key ? 'default' : 'outline'}
            className={`${tab === item.key ? '' : 'border-slate-700 text-slate-200'} h-9 px-3 whitespace-nowrap`}
            onClick={() =>
              updateSearchParam({
                tab: item.key,
                ...(item.key === 'overview' ? { agentId: 'all' } : {}),
              })
            }
          >
            {item.label}
          </Button>
        ))}
        </div>
      </div>

      <DashboardFilters
        year={year}
        month={month}
        agentId={effectiveAgentId}
        years={yearsQuery.data ?? [currentYear]}
        agents={activeAgentsQuery.data ?? []}
        agentDisabled={tab === 'overview'}
        onChangeMonth={value => updateSearchParam({ month: String(value) })}
        onChangeYear={value => updateSearchParam({ year: String(value) })}
        onChangeAgent={value => updateSearchParam({ agentId: value })}
      />

      {(tab === 'overview' || tab === 'employee') && (
        <OverviewCards data={overviewQuery.data} isLoading={overviewQuery.isLoading} />
      )}

      {tab === 'overview' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <ServicesTimeSeriesChart
            data={timeseriesQuery.data ?? []}
            isLoading={timeseriesQuery.isLoading}
            showValueLabels
            title={month === 'all' ? 'Evolução no ano' : 'Evolução diária no mês'}
            xTickFormatter={value => {
              if (month === 'all') {
                const monthMap: Record<string, string> = {
                  '01': 'jan',
                  '02': 'fev',
                  '03': 'mar',
                  '04': 'abr',
                  '05': 'mai',
                  '06': 'jun',
                  '07': 'jul',
                  '08': 'ago',
                  '09': 'set',
                  '10': 'out',
                  '11': 'nov',
                  '12': 'dez',
                }
                const parts = value.split('-')
                if (parts.length >= 2) {
                  return monthMap[parts[1]] ?? value
                }
              }

              const parts = value.split('-')
              if (parts.length === 3) {
                return parts[2]
              }

              return value
            }}
          />
          <ServiceTypeDonutChart
            data={byServiceTypeQuery.data ?? []}
            isLoading={byServiceTypeQuery.isLoading}
          />
          {effectiveAgentId === 'all' && (
            <div className="xl:col-span-2">
              <TopAgentsChart data={topAgentsQuery.data ?? []} isLoading={topAgentsQuery.isLoading} />
            </div>
          )}
        </div>
      )}

      {tab === 'employee' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <ServicesTimeSeriesChart
            data={timeseriesQuery.data ?? []}
            isLoading={timeseriesQuery.isLoading}
            showValueLabels
            title={
              month === 'all'
                ? agentId === 'all'
                  ? 'Evolução no ano (todos)'
                  : 'Evolução no ano (funcionário)'
                : agentId === 'all'
                  ? 'Evolução diária (todos)'
                  : 'Evolução diária (funcionário)'
            }
            xTickFormatter={value => {
              if (month === 'all') {
                const monthMap: Record<string, string> = {
                  '01': 'jan',
                  '02': 'fev',
                  '03': 'mar',
                  '04': 'abr',
                  '05': 'mai',
                  '06': 'jun',
                  '07': 'jul',
                  '08': 'ago',
                  '09': 'set',
                  '10': 'out',
                  '11': 'nov',
                  '12': 'dez',
                }
                const parts = value.split('-')
                if (parts.length >= 2) {
                  return monthMap[parts[1]] ?? value
                }
              }

              const parts = value.split('-')
              if (parts.length === 3) {
                return parts[2]
              }

              return value
            }}
          />
          <ServiceTypeDonutChart
            data={byServiceTypeQuery.data ?? []}
            isLoading={byServiceTypeQuery.isLoading}
          />
        </div>
      )}

      {tab === 'comparative' && (
        <div className="grid gap-4 xl:grid-cols-2">
          <ServicesTimeSeriesChart
            data={timeseriesQuery.data ?? []}
            isLoading={timeseriesQuery.isLoading}
            title="Comparativo diário"
            showValueLabels
            valueLabelFormatter={value => `(${value})`}
            xTickFormatter={value => {
              const parts = value.split('-')
              if (parts.length === 3) {
                return parts[2]
              }

              return value
            }}
          />
          <ServicesTimeSeriesChart
            data={monthlyTimeseriesQuery.data ?? []}
            isLoading={monthlyTimeseriesQuery.isLoading}
            title="Comparativo mensal"
            showValueLabels
            valueLabelFormatter={value => `(${value})`}
          />
        </div>
      )}
    </div>
  )
}
