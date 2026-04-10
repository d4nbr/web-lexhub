'use client'

import { getAll } from '@/api/agents/get-all'
import { Pagination } from '@/components/app/pagination'
import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { z } from 'zod'
import { AgentTableFilters } from './agent-table-filters'
import { AgentTableRow } from './agent-table-row'
import { AgentsTableSkeleton } from './agents-table-skeleton'

export function AgentsList() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const pageIndex = z.coerce.number().parse(searchParams.get('page') ?? '1')

  const name = searchParams.get('name')
  const role = searchParams.get('role')

  // Query para pegar os funcionários
  const { data: results, isLoading } = useQuery({
    queryKey: ['agents', pageIndex, name, role],
    queryFn: () =>
      getAll({ pageIndex, name, role: role === 'ALL' ? null : role }),
    staleTime: Number.POSITIVE_INFINITY,
  })

  function handlePageChange(pageIndex: number) {
    // Cria uma instância de URLSearchParams baseada nos parâmetros de busca atuais
    const params = new URLSearchParams(searchParams.toString())

    // Atualiza o parâmetro "page" com o novo índice da página
    params.set('page', pageIndex.toString())

    // Atualiza a URL no navegador sem recarregar a página
    router.push(`?${params.toString()}`)
  }

  return (
    <>
      {/* FIXME: Componente Agent Table Filters */}
      <AgentTableFilters />

      <div className="border rounded mt-8">
        <Table>
          {results?.agents.length === 0 && (
            <TableCaption className="pb-4 text-muted-foreground">
              Não encontramos nenhum funcionário cadastrado.
            </TableCaption>
          )}

          <TableHeader>
            <TableRow>
              <TableHead className="w-1" />
              <TableHead>Nome do Funcionário</TableHead>
              <TableHead>E-mail cadastrado</TableHead>
              <TableHead className="w-52 text-center">Perfil</TableHead>
              <TableHead className="w-64">Acessos</TableHead>
              <TableHead className="w-56 text-center">Situação</TableHead>
              <TableHead className="w-32" />
            </TableRow>
          </TableHeader>

          {/* FIXME: Componente Agent Table Row */}
          <TableBody>
            {isLoading && <AgentsTableSkeleton />}

            {results?.agents.map(agent => {
              return <AgentTableRow key={agent.id} agents={agent} />
            })}
          </TableBody>
        </Table>
      </div>

      {/* FIXME: Componente de Paginação */}
      <Pagination
        onPageChange={handlePageChange}
        pageIndex={pageIndex}
        totalCount={results?.total ?? 0}
        perPage={10}
        finalText="funcionário(s)"
      />
    </>
  )
}
