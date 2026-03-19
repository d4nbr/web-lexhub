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
}: {
  title: string
  current?: number
  previous?: number
  variation?: number
  isLoading: boolean
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
            <div className="text-3xl font-calsans text-slate-100">{current ?? 0}</div>
            <p className="pt-2 text-xs text-slate-400">
              <span className={(variation ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                {(variation ?? 0) >= 0 ? '+' : ''}
                {(variation ?? 0).toFixed(1)}%
              </span>{' '}
              vs período anterior ({previous ?? 0})
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
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
        title="Atendimentos Concluídos"
        current={data?.totals.current.completedServices}
        previous={data?.totals.previous.completedServices}
        variation={data?.totals.variation.completedServices}
        isLoading={isLoading}
      />
      <MetricCard
        title="Atendimentos Abertos"
        current={data?.totals.current.openServices}
        previous={data?.totals.previous.openServices}
        variation={data?.totals.variation.openServices}
        isLoading={isLoading}
      />
    </div>
  )
}
