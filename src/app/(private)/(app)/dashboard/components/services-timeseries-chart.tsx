import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts'
import type { AnalyticsTimeseriesPoint } from '@/api/dashboard/get-analytics-timeseries'

interface ServicesTimeSeriesChartProps {
  data: AnalyticsTimeseriesPoint[]
  isLoading: boolean
  title?: string
}

export function ServicesTimeSeriesChart({ data, isLoading, title = 'Atendimentos por período' }: ServicesTimeSeriesChartProps) {
  return (
    <Card className="rounded-2xl bg-slate-800/60 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        {isLoading ? (
          <Skeleton className="h-full w-full bg-slate-700" />
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Nenhum dado encontrado para os filtros.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid vertical={false} className="stroke-slate-700" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Line type="monotone" dataKey="totalServices" stroke="#0ea5e9" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
