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
  LabelList,
} from 'recharts'

const DEFAULT_PAGE_SIZE = 50

const DASHBOARD_COLORS = {
  line: '#6fa79f',
  label: '#e2e8f0',
  adimplente: '#2f9e95',
  inadimplente: '#d16464',
  sexoM: '#3fb6ab',
  sexoF: '#74d2c9',
  pcdSim: '#56bfb5',
  pcdNao: '#3c536b',
  suplementar: '#2fa69b',
  originaria: '#7ccfc7',
} as const

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

interface DashboardChartVisibility {
  situacao: boolean
  sexo: boolean
  pcd: boolean
  tipoInscricao: boolean
  seccional: boolean
  seccionalComparativo: boolean
}

type BarLabelMode = 'absolute' | 'percent'
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
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={DASHBOARD_COLORS.line} fill="none" strokeWidth={1} />
      <circle cx={ex} cy={ey} r={2} fill={DASHBOARD_COLORS.line} />
      <text
        x={ex + (textAnchor === 'start' ? 5 : -5)}
        y={ey}
        textAnchor={textAnchor}
        dominantBaseline="central"
        fill={DASHBOARD_COLORS.label}
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
  const [chartVisibility, setChartVisibility] = useState<DashboardChartVisibility>({
    situacao: true,
    sexo: true,
    pcd: true,
    tipoInscricao: true,
    seccional: true,
    seccionalComparativo: true,
  })
  const [seccionalLabelMode, setSeccionalLabelMode] = useState<BarLabelMode>('absolute')
  const [seccionalComparativoLabelMode, setSeccionalComparativoLabelMode] = useState<BarLabelMode>('absolute')

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

  function toggleChartVisibility(key: keyof DashboardChartVisibility) {
    setChartVisibility(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const data = lawyersQuery.data

  const isDashboardResultReady = !!dashboardSummaryQuery.data
  const dashboardLoadingModalClass =
    'financial-dashboard-loading-modal w-[92vw] max-w-[1480px] border-slate-700 bg-slate-900 text-slate-100 max-h-[88vh] overflow-y-auto'
  const dashboardResultModalClass =
    'financial-dashboard-result-modal !w-[92vw] sm:!w-[92vw] !max-w-[92vw] xl:!max-w-[1680px] border-slate-700 bg-slate-900 text-slate-100 h-[90vh] max-h-[90vh] overflow-y-auto overflow-x-hidden'

  const seccionalData = dashboardSummaryQuery.data?.seccionalDistribuicao ?? []
  const seccionalChartWidth = Math.max(1200, seccionalData.length * 56)
  const seccionalBarSize = seccionalData.length > 16 ? 9 : seccionalData.length > 10 ? 12 : 18

  const seccionalComparativoData = useMemo(
    () =>
      (dashboardSummaryQuery.data?.seccionalComparativo ?? []).map(item => ({
        ...item,
        adimplentesPctLabel: `${((item.percentual_adimplentes ?? 0)).toFixed(1).replace('.', ',')}%`,
        inadimplentesPctLabel: `${((item.percentual_inadimplentes ?? 0)).toFixed(1).replace('.', ',')}%`,
      })),
    [dashboardSummaryQuery.data?.seccionalComparativo]
  )
  const seccionalComparativoWidth = Math.max(1280, seccionalComparativoData.length * 68)
  const seccionalComparativoBarSize =
    seccionalComparativoData.length > 16 ? 7 : seccionalComparativoData.length > 10 ? 9 : 11

  const pieData = useMemo(() => {
    if (!dashboardSummaryQuery.data) return null

    const d = dashboardSummaryQuery.data

    return {
      adimplencia: [
        { name: 'Adimplentes', value: d.adimplentes, color: DASHBOARD_COLORS.adimplente },
        { name: 'Inadimplentes', value: d.inadimplentes, color: DASHBOARD_COLORS.inadimplente },
      ],
      sexo: [
        { name: 'Masculino', value: d.masculino, color: DASHBOARD_COLORS.sexoM },
        { name: 'Feminino', value: d.feminino, color: DASHBOARD_COLORS.sexoF },
      ],
      pcd: [
        { name: 'PCD Sim', value: d.pcdSim, color: DASHBOARD_COLORS.pcdSim },
        { name: 'PCD Não', value: d.pcdNao, color: DASHBOARD_COLORS.pcdNao },
      ],
      tipoInscricao: [
        { name: 'Suplementar', value: d.suplementares, color: DASHBOARD_COLORS.suplementar },
        { name: 'Originária', value: d.originarias, color: DASHBOARD_COLORS.originaria },
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
            {isDashboardResultReady && (
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant={chartVisibility.situacao ? 'default' : 'outline'}
                  onClick={() => toggleChartVisibility('situacao')}
                >
                  Situação
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={chartVisibility.sexo ? 'default' : 'outline'}
                  onClick={() => toggleChartVisibility('sexo')}
                >
                  Sexo
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={chartVisibility.pcd ? 'default' : 'outline'}
                  onClick={() => toggleChartVisibility('pcd')}
                >
                  PCD
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={chartVisibility.tipoInscricao ? 'default' : 'outline'}
                  onClick={() => toggleChartVisibility('tipoInscricao')}
                >
                  Tipo inscrição
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={chartVisibility.seccional ? 'default' : 'outline'}
                  onClick={() => toggleChartVisibility('seccional')}
                >
                  Seccional
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={chartVisibility.seccionalComparativo ? 'default' : 'outline'}
                  onClick={() => toggleChartVisibility('seccionalComparativo')}
                >
                  Adimpl x Inadimpl
                </Button>
              </div>
            )}
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
                {chartVisibility.situacao && (
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
                )}

                {chartVisibility.sexo && (
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
                )}

                {chartVisibility.pcd && (
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
                )}

                {chartVisibility.tipoInscricao && (
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
                )}
              </div>

              {chartVisibility.seccional && (
                <div className="rounded-lg border border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">Seccional</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant={seccionalLabelMode === 'absolute' ? 'default' : 'outline'}
                      onClick={() =>
                        setSeccionalLabelMode(prev =>
                          prev === 'absolute' ? 'percent' : 'absolute'
                        )
                      }
                    >
                      Label: {seccionalLabelMode === 'absolute' ? 'Absoluto' : '%'}
                    </Button>
                  </div>
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
                          <BarChart data={seccionalData} barCategoryGap="8%">
                            <CartesianGrid strokeDasharray="3 3" stroke={DASHBOARD_COLORS.pcdNao} />
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
                                  const total = payload?.payload?.total ?? 0
                                  if (seccionalLabelMode === 'absolute') {
                                    return [`${value}%`, 'Participação']
                                  }
                                  return [`${total}`, 'Valor absoluto']
                                }
                                return [value, payload?.name ?? 'Valor']
                              }}
                            />
                            <Bar
                              dataKey="percentual"
                              fill={DASHBOARD_COLORS.adimplente}
                              name="% no universo atual"
                              barSize={seccionalBarSize}
                              minPointSize={2}
                            >
                              <LabelList
                                dataKey={seccionalLabelMode === 'absolute' ? 'total' : 'percentual'}
                                formatter={(value: number) =>
                                  seccionalLabelMode === 'absolute'
                                    ? value
                                    : `${Number(value).toFixed(1).replace('.', ',')}%`
                                }
                                position="top"
                                fill={DASHBOARD_COLORS.label}
                                fontSize={9}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {chartVisibility.seccionalComparativo && (
                <div className="rounded-lg border border-slate-700 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">Adimplentes x Inadimplentes por Seccional</h3>
                    <Button
                      type="button"
                      size="sm"
                      variant={seccionalComparativoLabelMode === 'absolute' ? 'default' : 'outline'}
                      onClick={() =>
                        setSeccionalComparativoLabelMode(prev =>
                          prev === 'absolute' ? 'percent' : 'absolute'
                        )
                      }
                    >
                      Label: {seccionalComparativoLabelMode === 'absolute' ? 'Absoluto' : '%'}
                    </Button>
                  </div>

                  {dashboardSummaryQuery.isLoading && (
                    <div className="rounded-md border border-slate-700 p-3 text-sm text-slate-300 animate-pulse">
                      Carregando comparativo por seccional...
                    </div>
                  )}

                  {!dashboardSummaryQuery.isLoading && !seccionalComparativoData.length && (
                    <div className="rounded-md border border-slate-700 p-3 text-sm text-slate-300">
                      Sem dados comparativos de seccional para o filtro atual.
                    </div>
                  )}

                  {!!seccionalComparativoData.length && (
                    <div className="overflow-x-auto pb-2">
                      <div style={{ width: `${seccionalComparativoWidth}px` }} className="h-[360px] min-w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={seccionalComparativoData} barGap={4} barCategoryGap="10%">
                            <CartesianGrid strokeDasharray="3 3" stroke={DASHBOARD_COLORS.pcdNao} />
                            <XAxis
                              dataKey="subsecao"
                              tick={{ fontSize: 10 }}
                              interval={0}
                              angle={-55}
                              textAnchor="end"
                              height={104}
                            />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip
                              formatter={(value: number, name: string, payload: any) => {
                                if (name === 'Adimplentes') {
                                  const total = payload?.payload?.total ?? 0
                                  const pctVal = total ? ((value / total) * 100).toFixed(2) : '0.00'
                                  if (seccionalComparativoLabelMode === 'absolute') {
                                    return [`${pctVal}%`, 'Adimplentes (%)']
                                  }
                                  return [value, 'Adimplentes (valor)']
                                }
                                if (name === 'Inadimplentes') {
                                  const total = payload?.payload?.total ?? 0
                                  const pctVal = total ? ((value / total) * 100).toFixed(2) : '0.00'
                                  if (seccionalComparativoLabelMode === 'absolute') {
                                    return [`${pctVal}%`, 'Inadimplentes (%)']
                                  }
                                  return [value, 'Inadimplentes (valor)']
                                }
                                return [value, name]
                              }}
                            />
                            <Legend verticalAlign="top" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                            <Bar
                              dataKey="adimplentes"
                              fill={DASHBOARD_COLORS.adimplente}
                              name="Adimplentes"
                              barSize={seccionalComparativoBarSize}
                              minPointSize={2}
                            >
                              <LabelList
                                dataKey={
                                  seccionalComparativoLabelMode === 'absolute'
                                    ? 'adimplentes'
                                    : 'adimplentesPctLabel'
                                }
                                position="top"
                                fill={DASHBOARD_COLORS.label}
                                fontSize={9}
                                offset={10}
                              />
                            </Bar>
                            <Bar
                              dataKey="inadimplentes"
                              fill={DASHBOARD_COLORS.inadimplente}
                              name="Inadimplentes"
                              barSize={seccionalComparativoBarSize}
                              minPointSize={2}
                            >
                              <LabelList
                                dataKey={
                                  seccionalComparativoLabelMode === 'absolute'
                                    ? 'inadimplentes'
                                    : 'inadimplentesPctLabel'
                                }
                                position="top"
                                fill={DASHBOARD_COLORS.label}
                                fontSize={9}
                                offset={2}
                              />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
