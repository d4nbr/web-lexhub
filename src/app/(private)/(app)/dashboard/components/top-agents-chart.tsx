import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TopAgentItem } from '@/api/dashboard/get-top-agents'
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts'

interface TopAgentsChartProps {
  data: TopAgentItem[]
  isLoading: boolean
}

export function TopAgentsChart({ data, isLoading }: TopAgentsChartProps) {
  return (
    <Card className="rounded-2xl bg-slate-800/60 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">Top funcionários</CardTitle>
      </CardHeader>
      <CardContent className="h-[280px]">
        {isLoading ? (
          <Skeleton className="h-full w-full bg-slate-700" />
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Nenhum atendimento no período selecionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <XAxis type="number" allowDecimals={false} />
              <YAxis type="category" dataKey="agentName" width={120} />
              <Bar dataKey="totalServices" fill="#14b8a6" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
