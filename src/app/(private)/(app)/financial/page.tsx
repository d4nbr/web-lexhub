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

  const pageSummary = useMemo(() => {
    const items = data?.items ?? []

    const adimplentes = items.filter(item => item.sit_fin_atual === 'ADIMPLENTE').length
    const inadimplentes = items.filter(item => item.sit_fin_atual === 'INADIMPLENTE').length
    const suplementares = items.filter(item => item.suplementar === 'SIM').length
    const pcdSim = items.filter(item => item.pcd === 'SIM').length
    const masculino = items.filter(item => item.sexo === 'M').length
    const feminino = items.filter(item => item.sexo === 'F').length

    return {
      pageCount: items.length,
      adimplentes,
      inadimplentes,
      suplementares,
      pcdSim,
      masculino,
      feminino,
    }
  }, [data])

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
          Carregando dados financeiros...
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
        <DialogContent className="border-slate-700 bg-slate-900 text-slate-100 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dashboard Financeiro (resultado da busca)</DialogTitle>
            <DialogDescription>
              Resumo baseado no retorno atual da busca/listagem aplicada.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Total filtrado (todas as páginas)</p>
              <p className="text-xl font-semibold">{data?.total ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Registros na página atual</p>
              <p className="text-xl font-semibold">{pageSummary.pageCount}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Adimplentes (página atual)</p>
              <p className="text-xl font-semibold">{pageSummary.adimplentes}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Inadimplentes (página atual)</p>
              <p className="text-xl font-semibold">{pageSummary.inadimplentes}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Suplementares (página atual)</p>
              <p className="text-xl font-semibold">{pageSummary.suplementares}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">PCD = Sim (página atual)</p>
              <p className="text-xl font-semibold">{pageSummary.pcdSim}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Masculino (página atual)</p>
              <p className="text-xl font-semibold">{pageSummary.masculino}</p>
            </div>
            <div className="rounded-lg border border-slate-700 p-3">
              <p className="text-xs text-slate-400">Feminino (página atual)</p>
              <p className="text-xl font-semibold">{pageSummary.feminino}</p>
            </div>
          </div>

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
