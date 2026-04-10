'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatDistanceToNow, isValid, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Edit3, Lock, LockOpen } from 'lucide-react'
import { useMemo, useState } from 'react'
import { ActiveAgent } from './active-agent'
import { InactiveAgent } from './inactive-agent'
import { UpdateAgentDialog } from './update-agent-dialog'

interface AgentTableRowProps {
  agents: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
    canAccessDashboard: boolean
    canAccessServices: boolean
    canAccessFinancial: boolean
    subsecaoScope: string | null
    inactive: string | null
  }
}

export function AgentTableRow({ agents }: AgentTableRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInactiveDialogOpen, isSetInactiveDialogOpen] = useState(false)
  const [isActiveDialogOpen, isSetActiveDialogOpen] = useState(false)

  const permissions = useMemo(() => {
    if (agents.role === 'ADMIN') return 'Todos os módulos'

    const modules: string[] = []
    if (agents.canAccessDashboard) modules.push('Dashboard')
    if (agents.canAccessServices) modules.push('Atendimentos')
    if (agents.canAccessFinancial) modules.push('Financeiro')

    return modules.length ? modules.join(', ') : 'Sem módulo liberado'
  }, [agents])

  const inactiveDate = agents.inactive ? (
    (() => {
      const data = parseISO(agents.inactive)
      return (
        isValid(data) &&
        `Inativo há ${formatDistanceToNow(data, { locale: ptBR })}`
      )
    })()
  ) : (
    <Badge className="bg-emerald-700 text-white font-bold rounded-full gap-1.5 px-3 py-1">
      <span className="relative flex size-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full size-2 bg-white" />
      </span>
      ATIVO
    </Badge>
  )

  return (
    <TableRow className="overflow-x-auto">
      <TableCell />

      <TableCell
        className={`font-medium truncate max-w-xs border-r ${
          agents.inactive && 'opacity-40'
        }`}
      >
        {agents.name}
      </TableCell>

      <TableCell
        className={`font-medium truncate max-w-xs border-r ${
          agents.inactive && 'opacity-40'
        }`}
      >
        {agents.email}
      </TableCell>

      <TableCell
        className={`font-mono text-xs font-medium border-r text-center ${
          agents.inactive && 'opacity-40'
        }`}
      >
        {agents.role === 'ADMIN' ? (
          <Badge className="bg-purple-900 border border-purple-900 text-slate-200 rounded-full font-bold">
            ADMINISTRADOR
          </Badge>
        ) : agents.role === 'SUBSECTION' ? (
          <Badge className="bg-amber-900 border border-amber-900 text-slate-200 rounded-full font-bold">
            SUBSEÇÃO
          </Badge>
        ) : (
          <Badge className="bg-cyan-900 border border-cyan-900 text-slate-200 rounded-full font-bold">
            MEMBRO
          </Badge>
        )}
      </TableCell>

      <TableCell className={`text-xs border-r ${agents.inactive && 'opacity-40'}`}>
        <div className="space-y-1">
          <p className="text-slate-200">{permissions}</p>
          {agents.role === 'SUBSECTION' && agents.subsecaoScope && (
            <p className="text-slate-400">Seccional: {agents.subsecaoScope}</p>
          )}
        </div>
      </TableCell>

      <TableCell
        className={`font-mono tracking-tight text-xs truncate max-w-xs border-r text-center ${
          agents.inactive && 'opacity-40'
        }`}
      >
        {inactiveDate}
      </TableCell>

      <TableCell className="flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={agents.inactive !== null}
              className="rounded flex items-center gap-2 cursor-pointer group hover:border-emerald-500 transition-colors disabled:cursor-not-allowed"
            >
              <Edit3 className="size-3.5 group-hover:text-emerald-500" />
              Alterar
            </Button>
          </DialogTrigger>

          <UpdateAgentDialog agents={agents} onOpenChange={setIsDialogOpen} />
        </Dialog>

        {agents.inactive === null ? (
          <Dialog
            open={isInactiveDialogOpen}
            onOpenChange={isSetInactiveDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded flex items-center gap-2 cursor-pointer"
              >
                <Lock className="size-3.5 text-rose-600" />
                Revogar
              </Button>
            </DialogTrigger>

            <InactiveAgent
              agents={agents}
              onOpenChange={isSetInactiveDialogOpen}
            />
          </Dialog>
        ) : (
          <Dialog
            open={isActiveDialogOpen}
            onOpenChange={isSetActiveDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="rounded flex items-center gap-2 cursor-pointer"
              >
                <LockOpen className="size-3.5 text-green-600" />
                Permitir
              </Button>
            </DialogTrigger>

            <ActiveAgent agents={agents} onOpenChange={isSetActiveDialogOpen} />
          </Dialog>
        )}
      </TableCell>
    </TableRow>
  )
}
