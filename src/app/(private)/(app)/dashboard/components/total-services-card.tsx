'use client'

import { getAllQuantityPerDay } from '@/api/dashboard/get-all-quantity-per-day'
import { getAllQuantityServices } from '@/api/dashboard/get-all-quantity-services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { ClipboardList } from 'lucide-react'

export function TotalServicesCard() {
  const { data: totalServices, isLoading } = useQuery({
    queryKey: ['metrics', 'services-general'],
    queryFn: getAllQuantityServices,
  })

  const { data: totalServicesDay, isLoading: isLoadingDay } = useQuery({
    queryKey: ['metrics', 'services-day'],
    queryFn: getAllQuantityPerDay,
  })

  const total = totalServices?.total ?? 0 // Garante que seja 0 caso undefined

  const totalDay = totalServicesDay?.totalTheDay ?? 0
  const totalLastDay = totalServicesDay?.totalLastDay ?? 0

  let variationDay = 0
  if (totalLastDay > 0) {
    variationDay = ((totalDay - totalLastDay) / totalLastDay) * 100
  } else if (totalDay > 0) {
    variationDay = 100 // Se não houver registros no dia anterior, considera 100% de crescimento
  }

  return (
    <Card className="rounded-2xl shadow-2xl backdrop-blur-lg bg-slate-800/60 border border-slate-700 hover:border-sky-800 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white">
          Total de Atendimentos cadastrados
        </CardTitle>
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-10 rounded mb-3" />
        ) : (
          <div className="text-3xl font-bold font-calsans text-white">
            {total.toLocaleString('pt-BR', {
              minimumIntegerDigits: 2,
              useGrouping: false,
            })}
          </div>
        )}

        <div className="flex items-center justify-end flex-wrap gap-10">
          <div>
            {isLoadingDay ? (
              <Skeleton className="h-3 w-10 rounded-full mt-2" />
            ) : (
              <p className="text-sm font-medium text-white">Hoje</p>
            )}

            {isLoadingDay ? (
              <Skeleton className="h-3 w-20 rounded-full mt-2" />
            ) : (
              <div className="flex items-baseline">
                <span className="text-sm text-white">
                  {totalDay.toLocaleString('pt-BR', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                  })}
                </span>
                <span
                  className={`text-xs ml-2 ${variationDay >= 0 ? 'text-emerald-500' : 'text-red-400'}`}
                >
                  {variationDay >= 0 ? '+' : ''}
                  {variationDay.toFixed(1)}%
                </span>
              </div>
            )}
          </div>

          <div>
            {isLoadingDay ? (
              <Skeleton className="h-3 w-14 rounded-full mt-2" />
            ) : (
              <p className="text-sm font-medium text-muted-foreground">Ontem</p>
            )}

            {isLoadingDay ? (
              <Skeleton className="h-3 w-8 rounded-full mt-2" />
            ) : (
              <span className="text-sm text-muted-foreground">
                {totalLastDay.toLocaleString('pt-BR', {
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
