import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { AnalyticsOverviewResponse } from '@/api/dashboard/get-analytics-overview'

interface OverviewCardsProps {
  data?: AnalyticsOverviewResponse
  isLoading: boolean
}

function MetricCard({
  title,
  current,
  previous,
  variation,
  isLoading,
  valueFormatter,
}: {
  title: string
  current?: number
  previous?: number
  variation?: number
  isLoading: boolean
  valueFormatter?: (value: number) => string
}) {
  return (
    <Card className="rounded-2xl shadow-2xl backdrop-blur-lg bg-slate-800/60 border border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-24 mb-3 bg-slate-700" />
            <Skeleton className="h-4 w-36 bg-slate-700" />
          </>
        ) : (
          <>
            <div className="text-3xl font-calsans text-slate-100">
              {valueFormatter ? valueFormatter(current ?? 0) : (current ?? 0)}
            </div>
            <p className="pt-2 text-xs text-slate-400">
              <span className={(variation ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {(variation ?? 0) >= 0 ? '+' : ''}
                {(variation ?? 0).toFixed(1)}%
              </span>{' '}
              vs período anterior ({valueFormatter ? valueFormatter(previous ?? 0) : (previous ?? 0)})
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function formatMinutesToHuman(minutes: number) {
  const total = Math.max(0, Math.round(minutes))
  const h = Math.floor(total / 60)
  const m = total % 60

  if (h === 0) {
    return `${String(m).padStart(2, '0')}min`
  }

  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}min`
}

export function OverviewCards({ data, isLoading }: OverviewCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        title="Total de Atendimentos"
        current={data?.totals.current.totalServices}
        previous={data?.totals.previous.totalServices}
        variation={data?.totals.variation.totalServices}
        isLoading={isLoading}
      />
      <MetricCard
        title="Atendimentos Externos"
        current={data?.totals.current.externalServices}
        previous={data?.totals.previous.externalServices}
        variation={data?.totals.variation.externalServices}
        isLoading={isLoading}
      />
      <MetricCard
        title="Média de Atendimento"
        current={data?.totals.current.averageResolutionMinutes}
        previous={data?.totals.previous.averageResolutionMinutes}
        variation={data?.totals.variation.averageResolutionMinutes}
        isLoading={isLoading}
        valueFormatter={formatMinutesToHuman}
      />
    </div>
  )
}
