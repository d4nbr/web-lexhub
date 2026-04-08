import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CartesianGrid,
  LabelList,
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
  xTickFormatter?: (value: string) => string
  showValueLabels?: boolean
}

export function ServicesTimeSeriesChart({
  data,
  isLoading,
  title = 'Atendimentos por período',
  xTickFormatter,
  showValueLabels = false,
}: ServicesTimeSeriesChartProps) {
  return (
    <Card className="rounded-2xl bg-slate-800/60 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[230px] sm:h-[280px]">
        {isLoading ? (
          <Skeleton className="h-full w-full bg-slate-700" />
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Nenhum dado encontrado para os filtros.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: showValueLabels ? 26 : 8, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} className="stroke-slate-700" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                minTickGap={16}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                tickFormatter={value =>
                  xTickFormatter ? xTickFormatter(String(value)) : String(value)
                }
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                domain={showValueLabels ? [0, (dataMax: number) => Math.max(dataMax + 1, 1)] : [0, 'auto']}
              />
              <Line type="monotone" dataKey="totalServices" stroke="#0ea5e9" strokeWidth={2}>
                {showValueLabels && (
                  <LabelList
                    dataKey="totalServices"
                    position="top"
                    offset={8}
                    className="fill-slate-200"
                    fontSize={11}
                  />
                )}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
