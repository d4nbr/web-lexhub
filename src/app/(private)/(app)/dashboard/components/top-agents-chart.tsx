import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { TopAgentItem } from '@/api/dashboard/get-top-agents'
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface TopAgentsChartProps {
  data: TopAgentItem[]
  isLoading: boolean
}

function toShortName(fullName: string) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length <= 1) return fullName
  return `${parts[0]} ${parts[1]}`
}

export function TopAgentsChart({ data, isLoading }: TopAgentsChartProps) {
  const chartData = data.map(item => ({
    ...item,
    shortName: toShortName(item.agentName),
  }))

  return (
    <Card className="rounded-2xl bg-slate-800/60 border border-slate-700">
      <CardHeader>
        <CardTitle className="text-base text-slate-100">Top funcionários</CardTitle>
      </CardHeader>
      <CardContent className="h-[340px]">
        {isLoading ? (
          <Skeleton className="h-full w-full bg-slate-700" />
        ) : data.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            Nenhum atendimento no período selecionado.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 8, right: 28 }}>
              <CartesianGrid horizontal={false} stroke="#334155" opacity={0.35} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis
                type="category"
                dataKey="shortName"
                width={140}
                tick={{ fill: '#cbd5e1', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(148,163,184,0.08)' }}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: 8,
                }}
                formatter={(value: number, _name, payload: any) => [
                  `${value} atendimento(s)`,
                  payload?.payload?.agentName ?? 'Funcionário',
                ]}
              />
              <Bar dataKey="totalServices" fill="#0ea5e9" radius={[0, 6, 6, 0]}>
                <LabelList
                  dataKey="totalServices"
                  position="right"
                  fill="#cbd5e1"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
