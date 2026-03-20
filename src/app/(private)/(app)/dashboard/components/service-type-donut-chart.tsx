import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ServiceTypeItem } from '@/api/dashboard/get-by-service-type'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'

interface ServiceTypeDonutChartProps {
  data: ServiceTypeItem[]
  isLoading: boolean
}

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']

export function ServiceTypeDonutChart({ data, isLoading }: ServiceTypeDonutChartProps) {
  return (
    <Card className="rounded-2xl bg-slate-800/60 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">Atendimentos por tipo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-2">
        <div className="h-[240px]">
          {isLoading ? (
            <Skeleton className="h-full w-full bg-slate-700" />
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Nenhum dado para o período selecionado.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="totalServices" nameKey="serviceTypeName" innerRadius={55} outerRadius={90}>
                  {data.map((entry, index) => (
                    <Cell key={entry.serviceTypeId} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
          {isLoading
            ? Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={String(index)} className="h-5 w-full bg-slate-700" />
              ))
            : data.map((item, index) => (
                <div key={item.serviceTypeId} className="flex items-center justify-between text-sm text-slate-200">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block size-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.serviceTypeName}</span>
                  </div>
                  <span className="font-semibold">{item.totalServices}</span>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  )
}
