'use client'

import type { ActiveAgent } from '@/api/agents/get-all-active'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DashboardFiltersProps {
  year: number
  month: number | 'all'
  agentId: string
  years: number[]
  agents: ActiveAgent[]
  agentDisabled?: boolean
  onChangeYear: (year: number) => void
  onChangeMonth: (month: number | 'all') => void
  onChangeAgent: (agentId: string) => void
}

const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function DashboardFilters({
  year,
  month,
  agentId,
  years,
  agents,
  agentDisabled = false,
  onChangeYear,
  onChangeMonth,
  onChangeAgent,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        <Select
          value={String(month)}
          onValueChange={value =>
            onChangeMonth(value === 'all' ? 'all' : Number(value))
          }
        >
          <SelectTrigger className="w-40 bg-slate-900/70 border-slate-700 text-slate-100">
            <SelectValue placeholder="Mês" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {MONTHS.map((label, index) => (
              <SelectItem key={label} value={String(index + 1)}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(year)} onValueChange={value => onChangeYear(Number(value))}>
          <SelectTrigger className="w-28 bg-slate-900/70 border-slate-700 text-slate-100">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {years.map(yearOption => (
              <SelectItem key={yearOption} value={String(yearOption)}>
                {yearOption}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={agentId} onValueChange={onChangeAgent} disabled={agentDisabled}>
          <SelectTrigger className="w-52 bg-slate-900/70 border-slate-700 text-slate-100">
            <SelectValue placeholder="Funcionário" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {agents.map(agent => (
              <SelectItem key={agent.id} value={agent.id}>
                {agent.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
