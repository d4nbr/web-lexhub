'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  getFinancialLawyers,
  type FinancialLawyerItem,
  type FinancialLawyersFilters,
} from '@/api/financial/get-financial-lawyers'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'

const DEFAULT_PAGE_SIZE = 50

const SUBSECAO_OPTIONS = [
  { value: 'SAO LUIS', label: 'São Luís' },
  { value: 'CODO', label: 'Codó' },
  { value: 'PINHEIRO', label: 'Pinheiro' },
  { value: 'CAXIAS', label: 'Caxias' },
  { value: 'IMPERATRIZ', label: 'Imperatriz' },
  { value: 'BALSAS', label: 'Balsas' },
  { value: 'TIMON', label: 'Timon' },
  { value: 'BACABAL', label: 'Bacabal' },
  { value: 'SANTA INES', label: 'Santa Inês' },
  { value: 'PRESIDENTE DUTRA', label: 'Presidente Dutra' },
  { value: 'BARRA DO CORDA', label: 'Barra do Corda' },
  { value: 'GRAJAU', label: 'Grajaú' },
]

interface FinancialDraftFilters extends FinancialLawyersFilters {
  tipo_inscricao?: 'all' | 'originaria' | 'suplementar'
}

interface FinancialDashboardSummary {
  totalBase: number
  totalFiltrado: number
  adimplentes: number
  inadimplentes: number
  suplementares: number
  originarias: number
  pcdSim: number
  masculino: number
  feminino: number
  seccionalRate: Array<{
    subsecao: string
    adimplentes: number
    totalSeccional: number
    percentual: number
  }>
}

function calcPercent(value: number, total: number) {
  if (!total) return 0
  return Number(((value / total) * 100).toFixed(2))
}

async function fetchAllFinancialLawyers(filters: FinancialLawyersFilters) {
  const pageSize = 200
  const first = await getFinancialLawyers({ ...filters, page: 1, page_size: pageSize })

  const allItems: FinancialLawyerItem[] = [...first.items]
  const totalPages = first.total_pages || 1

  const pages = Array.from({ length: Math.max(totalPages - 1, 0) }, (_, i) => i + 2)
  const concurrency = 8

  for (let i = 0; i < pages.length; i += concurrency) {
    const chunk = pages.slice(i, i + concurrency)
    const results = await Promise.all(
      chunk.map(page => getFinancialLawyers({ ...filters, page, page_size: pageSize }))
    )

    results.forEach(result => {
      allItems.push(...result.items)
    })
  }

  return {
    total: first.total,
    items: allItems,
  }
}

async function getFinancialDashboardSummary(filters: FinancialLawyersFilters) {
  const { page: _p, page_size: _s, ...filterWithoutPagination } = filters

  const [baseData, filteredData] = await Promise.all([
    fetchAllFinancialLawyers({}),
    fetchAllFinancialLawyers(filterWithoutPagination),
  ])

  const baseItems = baseData.items
  const filteredItems = filteredData.items

  const totalBase = baseData.total
  const totalFiltrado = filteredData.total

  const adimplentes = filteredItems.filter(item => item.sit_fin_atual === 'ADIMPLENTE').length
  const inadimplentes = filteredItems.filter(item => item.sit_fin_atual === 'INADIMPLENTE').length
  const suplementares = filteredItems.filter(item => item.suplementar === 'SIM').length
  const originarias = filteredItems.filter(item => item.suplementar === 'NAO').length
  const pcdSim = filteredItems.filter(item => item.pcd === 'SIM').length
  const masculino = filteredItems.filter(item => item.sexo === 'M').length
  const feminino = filteredItems.filter(item => item.sexo === 'F').length

  const baseBySubsecao = new Map<string, number>()
  baseItems.forEach(item => {
    const key = item.subsecao || 'NÃO INFORMADA'
    baseBySubsecao.set(key, (baseBySubsecao.get(key) ?? 0) + 1)
  })

  const adimplentesBySubsecao = new Map<string, number>()
  filteredItems
    .filter(item => item.sit_fin_atual === 'ADIMPLENTE')
    .forEach(item => {
      const key = item.subsecao || 'NÃO INFORMADA'
      adimplentesBySubsecao.set(key, (adimplentesBySubsecao.get(key) ?? 0) + 1)
    })

  const seccionalRate = Array.from(adimplentesBySubsecao.entries())
    .map(([subsecao, adimplentesCount]) => {
      const totalSeccional = baseBySubsecao.get(subsecao) ?? 0
      return {
        subsecao,
        adimplentes: adimplentesCount,
        totalSeccional,
        percentual: calcPercent(adimplentesCount, totalSeccional),
      }
    })
    .sort((a, b) => b.percentual - a.percentual)
    .slice(0, 10)

  return {
    totalBase,
    totalFiltrado,
    adimplentes,
    inadimplentes,
    suplementares,
    originarias,
    pcdSim,
    masculino,
    feminino,
    seccionalRate,
  } satisfies FinancialDashboardSummary
}

export default function FinancialPage() {
  const [draft, setDraft] = useState<FinancialDraftFilters>({
    page: 1,
    page_size: DEFAULT_PAGE_SIZE,
    tipo_inscricao: 'all',
  })
  const [applied, setApplied] = useState<FinancialLawyersFilters | null>(null)
  const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false)

  const lawyersQuery = useQuery({
    queryKey: ['financial', 'lawyers', applied],
    queryFn: () => getFinancialLawyers(applied ?? {}),
    enabled: applied !== null,
  })

  const dashboardSummaryQuery = useQuery({
    queryKey: ['financial', 'dashboard-summary', applied],
    queryFn: () => getFinancialDashboardSummary(applied ?? {}),
    enabled: isDashboardModalOpen && applied !== null,
  })

  function handleSearch() {
    const normalizedSuplementar =
      draft.tipo_inscricao === 'suplementar'
        ? 'SIM'
        : draft.tipo_inscricao === 'originaria'
          ? 'NAO'
          : ''

    const { tipo_inscricao, ...rest } = draft

    setApplied({
      ...rest,
      suplementar: normalizedSuplementar,
      page: 1,
    })
  }

  function updateDraft(field: keyof FinancialDraftFilters, value?: string | number) {
    setDraft(prev => ({ ...prev, [field]: value }))
  }

  function handlePageChange(page: number) {
    if (!applied) return
    setApplied({ ...applied, page })
  }

  const data = lawyersQuery.data

  const pieData = useMemo(() => {
    if (!dashboardSummaryQuery.data) return null

    const d = dashboardSummaryQuery.data

    return {
      adimplencia: [
        { name: 'Adimplentes', value: d.adimplentes, color: '#22c55e' },
        { name: 'Restante base', value: Math.max(d.totalBase - d.adimplentes, 0), color: '#334155' },
      ],
      sexo: [
        { name: 'Masculino', value: d.masculino, color: '#38bdf8' },
        { name: 'Feminino', value: d.feminino, color: '#f472b6' },
      ],
      pcd: [
        { name: 'PCD Sim', value: d.pcdSim, color: '#a78bfa' },
        { name: 'Restante base', value: Math.max(d.totalBase - d.pcdSim, 0), color: '#334155' },
      ],
      tipoInscricao: [
        { name: 'Suplementar', value: d.suplementares, color: '#06b6d4' },
        { name: 'Originária', value: d.originarias, color: '#f59e0b' },
      ],
    }
  }, [dashboardSummaryQuery.data])

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-calsans font-bold tracking-tight">Financeiro</h1>
      <Separator orientation="horizontal" />

      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 sm:p-6 text-slate-200 space-y-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <div className="space-y-1">
            <p className="text-xs text-slate-400">Situação Financeira</p>
            <Select
              value={draft.sit_fin_atual ?? 'all'}
              onValueChange={value => updateDraft('sit_fin_atual', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Situação financeira" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="ADIMPLENTE">Adimplentes</SelectItem>
                <SelectItem value="INADIMPLENTE">Inadimplentes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Tipo Inscrição</p>
            <Select
              value={draft.tipo_inscricao ?? 'all'}
              onValueChange={value => updateDraft('tipo_inscricao', value as FinancialDraftFilters['tipo_inscricao'])}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo inscrição" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="originaria">Originária</SelectItem>
                <SelectItem value="suplementar">Suplementar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Sexo</p>
            <Select
              value={draft.sexo ?? 'all'}
              onValueChange={value => updateDraft('sexo', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">Seccional</p>
            <Select
              value={draft.subsecao ?? 'all'}
              onValueChange={value => updateDraft('subsecao', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seccional" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {SUBSECAO_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-400">PCD</p>
            <Select
              value={draft.pcd ?? 'all'}
              onValueChange={value => updateDraft('pcd', value === 'all' ? '' : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="PCD" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="SIM">Sim</SelectItem>
                <SelectItem value="NAO">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={handleSearch}>Buscar / Listar</Button>

          <Button
            variant="secondary"
            disabled={applied === null || lawyersQuery.isLoading || !data}
            onClick={() => setIsDashboardModalOpen(true)}
          >
            Gerar Dashboard
          </Button>

          <Select
            value={String(draft.page_size ?? DEFAULT_PAGE_SIZE)}
            onValueChange={value => updateDraft('page_size', Number(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Itens por página" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="25">25 / página</SelectItem>
              <SelectItem value="50">50 / página</SelectItem>
              <SelectItem value="100">100 / página</SelectItem>
              <SelectItem value="200">200 / página</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {lawyersQuery.isLoading && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 text-slate-300">
          <div className="flex items-center gap-3">
            <span className="inline-block size-4 rounded-full border-2 border-slate-500 border-t-cyan-400 animate-spin" />
            <span className="animate-pulse">Carregando dados financeiros...</span>
          </div>
        </div>
      )}

      {lawyersQuery.isError && (
        <div className="rounded-2xl border border-red-800 bg-red-950/40 p-4 text-red-200">
          Não foi possível consultar o endpoint financeiro do n8n.
        </div>
      )}

      {data && (
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-4 space-y-4">
          <div className="text-sm text-slate-300">
            Total: <strong>{data.total}</strong> | Página <strong>{data.page}</strong> de{' '}
            <strong>{data.total_pages}</strong>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Inscrição</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Suplementar</TableHead>
                  <TableHead>Sexo</TableHead>
                  <TableHead>PCD</TableHead>
                  <TableHead>UF</TableHead>
                  <TableHead>Subseção</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.items.map(item => (
                  <TableRow key={`${item.inscricao}-${item.data_nascimento ?? 'nd'}`}>
                    <TableCell>{item.inscricao}</TableCell>
                    <TableCell>{item.sit_fin_atual}</TableCell>
                    <TableCell>{item.suplementar}</TableCell>
                    <TableCell>{item.sexo}</TableCell>
                    <TableCell>{item.pcd}</TableCell>
                    <TableCell>{item.uf_res}</TableCell>
                    <TableCell>{item.subsecao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={!data.has_prev}
              onClick={() => handlePageChange((data.page || 1) - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              disabled={!data.has_next}
              onClick={() => handlePageChange((data.page || 1) + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      <Dialog open={isDashboardModalOpen} onOpenChange={setIsDashboardModalOpen}>
        <DialogContent className="border-slate-700 bg-slate-900 text-slate-100 sm:max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dashboard Financeiro (resultado da busca)</DialogTitle>
            <DialogDescription>
              Resumo considerando todo o total filtrado da busca aplicada.
            </DialogDescription>
          </DialogHeader>

          {dashboardSummaryQuery.isLoading && (
            <div className="rounded-lg border border-slate-700 p-4 text-slate-300">
              Gerando dashboard com base em todas as páginas filtradas...
            </div>
          )}

          {dashboardSummaryQuery.isError && (
            <div className="rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-200">
              Falha ao gerar resumo completo do dashboard.
            </div>
          )}

          {dashboardSummaryQuery.data && pieData && (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">Total base</p>
                  <p className="text-xl font-semibold">{dashboardSummaryQuery.data.totalBase}</p>
                </div>
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">Total do filtro aplicado</p>
                  <p className="text-xl font-semibold">{dashboardSummaryQuery.data.totalFiltrado}</p>
                </div>
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">Adimplentes / Total base</p>
                  <p className="text-xl font-semibold">
                    {dashboardSummaryQuery.data.adimplentes} / {dashboardSummaryQuery.data.totalBase}
                  </p>
                  <p className="text-xs text-emerald-400">
                    {calcPercent(
                      dashboardSummaryQuery.data.adimplentes,
                      dashboardSummaryQuery.data.totalBase
                    )}%
                  </p>
                </div>
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">Inadimplentes / Total base</p>
                  <p className="text-xl font-semibold">
                    {dashboardSummaryQuery.data.inadimplentes} / {dashboardSummaryQuery.data.totalBase}
                  </p>
                  <p className="text-xs text-rose-400">
                    {calcPercent(
                      dashboardSummaryQuery.data.inadimplentes,
                      dashboardSummaryQuery.data.totalBase
                    )}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-2">Adimplentes x Total base</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData.adimplencia} dataKey="value" nameKey="name" outerRadius={80}>
                          {pieData.adimplencia.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-2">Sexo (do resultado) x Total base</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData.sexo} dataKey="value" nameKey="name" outerRadius={80}>
                          {pieData.sexo.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-2">PCD (do resultado) x Total base</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData.pcd} dataKey="value" nameKey="name" outerRadius={80}>
                          {pieData.pcd.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-2">Tipo inscrição (resultado)</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData.tipoInscricao} dataKey="value" nameKey="name" outerRadius={80}>
                          {pieData.tipoInscricao.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-700 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">
                  Seccional: adimplentes / total da seccional (Top 10)
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardSummaryQuery.data.seccionalRate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="subsecao" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip
                        formatter={(value: number, _name, payload: any) => {
                          if (payload?.dataKey === 'percentual') {
                            return [`${value}%`, 'Percentual']
                          }
                          return [value, payload?.name ?? 'Valor']
                        }}
                      />
                      <Bar dataKey="percentual" fill="#22c55e" name="% Adimplência" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDashboardModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
