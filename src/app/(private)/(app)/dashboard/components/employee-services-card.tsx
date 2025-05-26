'use client'

import { getAllQuantityByAgent } from '@/api/dashboard/get-all-quantity-by-agent'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { is, ptBR } from 'date-fns/locale'
import { useQuery } from '@tanstack/react-query'
import { Users } from 'lucide-react'
import { subMonths, format } from 'date-fns'
import { getProfile } from '@/api/agents/get-profile'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface EmployeeServicesCardProps {
  idAgentAuthenticated: string | false
}

export function EmployeeServicesCard({
  idAgentAuthenticated,
}: EmployeeServicesCardProps) {
  const { data: totalByAgent, isLoading: isTotalByAgentLoading } = useQuery({
    queryKey: ['metrics', 'services-by-agent', idAgentAuthenticated],
    queryFn: () => getAllQuantityByAgent({ id: idAgentAuthenticated }),
  })

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['metrics', 'get-profile'],
    queryFn: getProfile,
  })

  // Busca o mês atual
  const currentMonth = format(new Date(), 'MMMM', { locale: ptBR })
  // Capitaliza a primeira letra
  const currentMonthFormatted =
    currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1)

  // Busca o mês passado para comparação de crescimento
  const lastMonth = format(subMonths(new Date(), 1), 'MMMM', { locale: ptBR })
  // Capitaliza a primeira letra
  const lastMonthFormatted =
    lastMonth.charAt(0).toUpperCase() + lastMonth.slice(1)

  // Define valores padrão para evitar erros
  const totalGeneral = totalByAgent?.totalGeneral ?? 0
  const totalCurrentMonth = totalByAgent?.totalOnMonth ?? 0
  const totalPreviousMonth = totalByAgent?.totalOnPreviousMonth ?? 0

  // Calcula a variação do mês de forma segura
  let variationMonth = 0
  if (totalPreviousMonth > 0) {
    variationMonth =
      ((totalCurrentMonth - totalPreviousMonth) / totalPreviousMonth) * 100
  } else if (totalCurrentMonth > 0) {
    variationMonth = 100 // Se não houver registros no mẽs anterior, considera 100% de crescimento
  }

  return (
    <Card className="rounded-2xl shadow-2xl backdrop-blur-lg bg-slate-800/60 border border-slate-700 hover:border-sky-800 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">
          Atendimentos por Funcionário
        </CardTitle>
        <Users className="size-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-sm font-medium text-white mb-2">
          {isProfileLoading ? (
            <Skeleton className="h-4 w-72 rounded-full" />
          ) : (
            profile?.agent.name
          )}
        </div>

        {isTotalByAgentLoading ? (
          <Skeleton className="h-10 w-10 rounded" />
        ) : (
          <div className="text-3xl text-white font-calsans">
            {totalGeneral.toLocaleString('pt-BR', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
          </div>
        )}

        <div className="flex items-center justify-end flex-wrap gap-10">
          <div>
            {isTotalByAgentLoading ? (
              <Skeleton className="h-3 w-10 rounded-full mt-2" />
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                {currentMonthFormatted}
              </p>
            )}

            {isTotalByAgentLoading ? (
              <Skeleton className="h-3 w-20 rounded-full mt-2" />
            ) : (
              <div className="flex items-baseline">
                <span className="text-sm">
                  {totalCurrentMonth.toLocaleString('pt-BR', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  })}
                </span>
                <span
                  className={`text-xs ml-2 ${variationMonth >= 0 ? 'text-emerald-500' : 'text-red-400'}`}
                >
                  {variationMonth >= 0 ? '+' : ''}
                  {variationMonth.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div>
            {isTotalByAgentLoading ? (
              <Skeleton className="h-3 w-14 rounded-full mt-2" />
            ) : (
              <p className="text-sm font-medium text-muted-foreground">
                {lastMonthFormatted}
              </p>
            )}

            {isTotalByAgentLoading ? (
              <Skeleton className="h-3 w-8 rounded-full mt-2" />
            ) : (
              <span className="text-sm text-white">
                {totalPreviousMonth.toLocaleString('pt-BR', {
                  minimumIntegerDigits: 2,
                  useGrouping: false,
                })}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
