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
  type FinancialLawyersFilters,
} from '@/api/financial/get-financial-lawyers'
import {
  getFinancialDashboard,
  type FinancialDashboardResponse,
} from '@/api/financial/get-financial-dashboard'
import { LoadingDashboard } from './components/loading-dashboard'
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
  Legend,
} from 'recharts'

const DEFAULT_PAGE_SIZE = 50

const SUBSECAO_OPTIONS = [
  { value: 'ACAILANDIA', label: 'Açailândia' },
  { value: 'BACABAL', label: 'Bacabal' },
  { value: 'BALSAS', label: 'Balsas' },
  { value: 'BARRA DO CORDA', label: 'Barra do Corda' },
  { value: 'BARREIRINHAS', label: 'Barreirinhas' },
  { value: 'BURITICUPU', label: 'Buriticupu' },
  { value: 'CAXIAS', label: 'Caxias' },
  { value: 'CHAPADINHA', label: 'Chapadinha' },
  { value: 'CODO', label: 'Codó' },
  { value: 'COROATA', label: 'Coroatá' },
  { value: 'ESTREITO', label: 'Estreito' },
  { value: 'GOVERNADOR NUNES FREIRE', label: 'Governador Nunes Freire' },
  { value: 'GRAJAU', label: 'Grajaú' },
  { value: 'IMPERATRIZ', label: 'Imperatriz' },
  { value: 'PEDREIRAS', label: 'Pedreiras' },
  { value: 'PINHEIRO', label: 'Pinheiro' },
  { value: 'PRESIDENTE DUTRA', label: 'Presidente Dutra' },
  { value: 'SANTA INES', label: 'Santa Inês' },
  { value: 'SAO JOAO DOS PATOS', label: 'São João dos Patos' },
  { value: 'SAO LUIS', label: 'São Luís' },
  { value: 'TIMON', label: 'Timon' },
]

interface FinancialDraftFilters extends FinancialLawyersFilters {
  tipo_inscricao?: 'all' | 'originaria' | 'suplementar'
}

function calcPercent(value: number, total: number) {
  if (!total) return 0
  return Number(((value / total) * 100).toFixed(2))
}

function renderPieValueLabel(props: any) {
  const { cx, cy, midAngle, outerRadius, percent, value } = props
  if (!percent || percent < 0.025) return null

  const RADIAN = Math.PI / 180
  const sx = cx + (outerRadius + 4) * Math.cos(-midAngle * RADIAN)
  const sy = cy + (outerRadius + 4) * Math.sin(-midAngle * RADIAN)
  const mx = cx + (outerRadius + 16) * Math.cos(-midAngle * RADIAN)
  const my = cy + (outerRadius + 16) * Math.sin(-midAngle * RADIAN)
  const ex = mx + (Math.cos(-midAngle * RADIAN) >= 0 ? 16 : -16)
  const ey = my
  const textAnchor = ex > cx ? 'start' : 'end'
  const pct = `${(percent * 100).toFixed(1).replace('.', ',')}%`

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke="#94a3b8" fill="none" strokeWidth={1} />
      <circle cx={ex} cy={ey} r={2} fill="#94a3b8" />
      <text
        x={ex + (textAnchor === 'start' ? 5 : -5)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill="#e2e8f0"
        fontSize={11}
        fontWeight={600}
      >
        {`${value} (${pct})`}
      </text>
    </g>
  )
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

  const dashboardSummaryQuery = useQuery<FinancialDashboardResponse>({
    queryKey: ['financial', 'dashboard-summary', applied],
    queryFn: () => {
      const { page: _p, page_size: _s, ...filters } = applied ?? {}
      return getFinancialDashboard(filters)
    },
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

  const isDashboardResultReady = !!dashboardSummaryQuery.data
  const dashboardLoadingModalClass =
    'financial-dashboard-loading-modal w-[92vw] max-w-[1480px] border-slate-700 bg-slate-900 text-slate-100 max-h-[88vh] overflow-y-auto'
  const dashboardResultModalClass =
    'financial-dashboard-result-modal !w-[92vw] sm:!w-[92vw] !max-w-[92vw] xl:!max-w-[1680px] border-slate-700 bg-slate-900 text-slate-100 h-[90vh] max-h-[90vh] overflow-y-auto'

  const seccionalData = dashboardSummaryQuery.data?.seccionalDistribuicao ?? []
  const seccionalChartWidth = Math.max(1300, seccionalData.length * 64)
  const seccionalBarSize = seccionalData.length > 16 ? 12 : seccionalData.length > 10 ? 16 : 22

  const pieData = useMemo(() => {
    if (!dashboardSummaryQuery.data) return null

    const d = dashboardSummaryQuery.data

    return {
      adimplencia: [
        { name: 'Adimplentes', value: d.adimplentes, color: '#22c55e' },
        { name: 'Inadimplentes', value: d.inadimplentes, color: '#ef4444' },
      ],
      sexo: [
        { name: 'Masculino', value: d.masculino, color: '#38bdf8' },
        { name: 'Feminino', value: d.feminino, color: '#f472b6' },
      ],
      pcd: [
        { name: 'PCD Sim', value: d.pcdSim, color: '#a78bfa' },
        { name: 'PCD Não', value: d.pcdNao, color: '#334155' },
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
              value={draft.sit_fin_atual || 'all'}
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
              value={draft.tipo_inscricao || 'all'}
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
              value={draft.sexo || 'all'}
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
              value={draft.subsecao || 'all'}
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
              value={draft.pcd || 'all'}
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
        <DialogContent
          className={isDashboardResultReady ? dashboardResultModalClass : dashboardLoadingModalClass}
        >
          <DialogHeader>
            <DialogTitle>Dashboard Financeiro</DialogTitle>
          </DialogHeader>

          {dashboardSummaryQuery.isLoading && <LoadingDashboard />}

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
                  <p className="text-xs text-slate-400">Total final com filtros</p>
                  <p className="text-xl font-semibold">{dashboardSummaryQuery.data.totalFiltrado}</p>
                </div>
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">Universo único (100%)</p>
                  <p className="text-xl font-semibold">{dashboardSummaryQuery.data.totalFiltrado}</p>
                </div>
                <div className="rounded-lg border border-slate-700 p-3">
                  <p className="text-xs text-slate-400">Regra de cálculo</p>
                  <p className="text-sm font-medium text-slate-200">Todos os gráficos usam o Total final com filtros</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-1">Situação financeira</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
                        <Pie
                          data={pieData.adimplencia}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={72}
                          label={renderPieValueLabel}
                          labelLine={false}
                        >
                          {pieData.adimplencia.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-1">Sexo</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
                        <Pie
                          data={pieData.sexo}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={72}
                          label={renderPieValueLabel}
                          labelLine={false}
                        >
                          {pieData.sexo.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-1">PCD</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
                        <Pie
                          data={pieData.pcd}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={72}
                          label={renderPieValueLabel}
                          labelLine={false}
                        >
                          {pieData.pcd.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-700 p-4">
                  <p className="text-sm font-semibold mb-1">Tipo inscrição</p>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 8, right: 36, bottom: 8, left: 36 }}>
                        <Pie
                          data={pieData.tipoInscricao}
                          dataKey="value"
                          nameKey="name"
                          outerRadius={72}
                          label={renderPieValueLabel}
                          labelLine={false}
                        >
                          {pieData.tipoInscricao.map(slice => (
                            <Cell key={slice.name} fill={slice.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-slate-700 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Seccional</h3>
                <p className="text-xs text-slate-400">Base de cálculo: Total final com filtros ({dashboardSummaryQuery.data.totalFiltrado})</p>

                {dashboardSummaryQuery.isLoading && (
                  <div className="rounded-md border border-slate-700 p-3 text-sm text-slate-300 animate-pulse">
                    Carregando distribuição por seccional...
                  </div>
                )}

                {!dashboardSummaryQuery.isLoading && !seccionalData.length && (
                  <div className="rounded-md border border-slate-700 p-3 text-sm text-slate-300">
                    Sem dados de seccional para o filtro atual.
                  </div>
                )}

                {!!seccionalData.length && (
                  <div className="overflow-x-auto pb-2">
                    <div style={{ width: `${seccionalChartWidth}px` }} className="h-[340px] min-w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={seccionalData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis
                            dataKey="subsecao"
                            tick={{ fontSize: 10 }}
                            interval={0}
                            angle={-55}
                            textAnchor="end"
                            height={102}
                          />
                          <YAxis tick={{ fontSize: 11 }} />
                          <Tooltip
                            formatter={(value: number, _name, payload: any) => {
                              if (payload?.dataKey === 'percentual') {
                                const quantidade = payload?.payload?.total ?? 0
                                return [`${value}% (${quantidade} advogados)`, 'Participação']
                              }
                              return [value, payload?.name ?? 'Valor']
                            }}
                          />
                          <Bar
                            dataKey="percentual"
                            fill="#22c55e"
                            name="% no universo atual"
                            barSize={seccionalBarSize}
                            minPointSize={2}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
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
