'use client'

import AssistanceBadge from '@/components/app/assistance-badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogTrigger } from '@/components/ui/dialog'
import { TableCell, TableRow } from '@/components/ui/table'
import { formatFullName } from '@/utils/format-full-name'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle, CircleX, Search } from 'lucide-react'
import { useState } from 'react'
import { CancelService } from './cancel-service'
import { FinishedService } from './finished-service'
import { ServiceDetails } from './service-details'
import { getIsAgentAuthenticated } from '@/auth'

interface ServiceTableRowProps {
  services: {
    id: string
    assistance: 'PERSONALLY' | 'REMOTE'
    observation: string | null
    status: 'OPEN' | 'COMPLETED'
    createdAt: string
    finishedAt: string | null
    lawyer: {
      id: string
      name: string
      oab: string
      email: string
    }
    agent: {
      id: string
      name: string
      email: string
      role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
    }
    serviceTypes: {
      serviceType: {
        id: string
        name: string
      }
    }[]
  }
  idAgentAuthenticated: string | false
  isAgentAdmin: boolean
}

export function ServiceTableRow({
  services,
  idAgentAuthenticated,
  isAgentAdmin,
}: ServiceTableRowProps) {
  const [isFinishedDialogOpen, setIsFinishedDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  // Verifica se o atendimento pertence ao funcionário logado
  const employeeService = services.agent.id === idAgentAuthenticated

  return (
    <TableRow className="overflow-x-auto">
      <TableCell className="w-full border-r sm:w-auto">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="rounded cursor-pointer "
            >
              <Search className="size-3.5" />
              <span className="sr-only">Detalhes do atendimento</span>
            </Button>
          </DialogTrigger>

          {/* FIXME: Componente de Detalhes do Atendimento */}
          <ServiceDetails services={services} />
        </Dialog>
      </TableCell>

      <TableCell className="border-r">
        {services.status === 'OPEN' ? (
          <div className="flex items-center gap-2">
            <span className="block h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-medium">Em andamento</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="block h-2 w-2 rounded-full bg-rose-500" />
            <span className="text-xs font-medium">Encerrado</span>
          </div>
        )}
      </TableCell>

      <TableCell className="text-center border-r">
        {services.status === 'OPEN'
          ? formatDistanceToNow(new Date(services.createdAt), {
            addSuffix: true,
            locale: ptBR,
          })
          : formatDistanceToNow(
            (services.finishedAt && new Date(services.finishedAt)) as Date,
            {
              addSuffix: true,
              locale: ptBR,
            }
          )}
      </TableCell>

      <TableCell className="font-mono text-xs font-medium text-center border-r">
        <AssistanceBadge type={services.assistance} />
      </TableCell>

      <TableCell className="font-mono text-xs font-medium text-center border-r">
        {services.lawyer.oab}
      </TableCell>

      <TableCell className="font-medium truncate max-w-xs border-r">
        {formatFullName(services.lawyer.name)}
      </TableCell>

      <TableCell className="font-medium truncate max-w-xs border-r">
        {services.agent.name}
      </TableCell>

      <TableCell>
        <Dialog
          open={isFinishedDialogOpen}
          onOpenChange={setIsFinishedDialogOpen}
        >
          <DialogTrigger asChild>
            {services.status === 'OPEN' ? (
              <Button
                variant="outline"
                size="sm"
                disabled={!employeeService && !isAgentAdmin}
                className="rounded flex items-center cursor-pointer"
              >
                <CheckCircle className="size-3.5 text-yellow-600" />
                Concluir
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                disabled={services.status === 'COMPLETED'}
                className="rounded flex items-center cursor-pointer"
              >
                <CheckCircle className="size-3.5 text-emerald-600" />
                Concluído
              </Button>
            )}
          </DialogTrigger>

          {/* FIXME: Componente de Concluir Atendimento */}
          <FinishedService
            services={services}
            onOpenChange={setIsFinishedDialogOpen}
          />
        </Dialog>
      </TableCell>

      <TableCell>
        <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="rounded flex items-center cursor-pointer"
              disabled={!employeeService && !isAgentAdmin || services.status === 'COMPLETED'}
            >
              <CircleX className="size-3.5 text-rose-800" />
              Cancelar
            </Button>
          </DialogTrigger>

          {/* FIXME: Componente de Cancelar Atendimento */}
          <CancelService
            services={services}
            onOpenChange={setIsCancelDialogOpen}
          />
        </Dialog>
      </TableCell>
    </TableRow>
  )
}
