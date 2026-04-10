'use client'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { calculateDurationService } from '@/utils/calculate-duration-service'
import { formatFullName } from '@/utils/format-full-name'
import { format } from 'date-fns'
import {
  CheckCircle,
  Clock,
  FileText,
  Mail,
  Monitor,
  User,
  UserCog,
  X,
  XCircle,
} from 'lucide-react'

interface ServiceDetailsProps {
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
}

export function ServiceDetails({ services }: ServiceDetailsProps) {
  // Formatação de datas
  const formattedCreatedAt = format(services.createdAt, "dd/MM/yyyy 'às' HH:mm")
  const formattedFinishedAt = services.finishedAt
    ? format(services.finishedAt, "dd/MM/yyyy 'às' HH:mm")
    : ''

  // Calcula duração do atendimento em horas
  const durationService = calculateDurationService({
    createdAt: services.createdAt,
    finishedAt: services.finishedAt,
  })

  return (
    <DialogContent className="max-w-md md:max-w-3xl overflow-y-auto px-4 rounded">
      <DialogHeader className="mt-4">
        <div className="flex items-center justify-between">
          <DialogTitle className="text-xl font-calsans font-bold">
            Detalhes do Atendimento
          </DialogTitle>
          <Badge
            variant={services.status === 'COMPLETED' ? 'closed' : 'open'}
            className="ml-2 rounded-full"
          >
            {services.status === 'COMPLETED' ? 'Concluído' : 'Em andamento'}
          </Badge>
        </div>
        <DialogDescription className="font-mono text-left text-xs tracking-tight">
          ID: {services.id}
        </DialogDescription>
      </DialogHeader>

      <Separator orientation="horizontal" />

      <div className="space-y-6 py-2">
        {/* Service Type Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Tipo de Serviço</span>
          </div>
          <div className="pl-6">
            <ul className="list-disc list-inside space-y-1 font-medium text-muted-foreground">
              {services.serviceTypes.map(data => (
                <li key={data.serviceType.id} className="text-sm">
                  {data.serviceType.name}
                </li>
              ))}
            </ul>

            <p className="text-sm flex items-center gap-2 mt-2 text-muted-foreground">
              <Monitor className="size-4" />
              Atendimento:{' '}
              {services.assistance === 'PERSONALLY' ? 'Presencial' : 'Remoto'}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      <div className="flex flex-col md:flex-row md:items-center md:gap-2">
        {/* Seção do Advogado */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <User className="size-4" />
            <span>Advogado(a)</span>
          </div>
          <div className="flex items-center gap-4 pl-6">
            <Avatar className="size-10 border">
              <AvatarFallback className="text-sm">
                {services.lawyer.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">
                {formatFullName(services.lawyer.name)}
              </p>
              <p className="text-xs text-muted-foreground">
                OAB: {services.lawyer.oab}
              </p>
              <p className="text-xs inline-flex items-center gap-1.5 text-muted-foreground">
                {services.lawyer.email ? (
                  <Mail className="size-3" />
                ) : (
                  <X className="size-3" />
                )}
                {services.lawyer.email
                  ? services.lawyer.email
                  : 'Sem e-mail cadastrado'}
              </p>
            </div>
          </div>
        </div>

        {/* Separator adaptável */}
        <Separator orientation="horizontal" className="my-4 md:hidden" />
        <Separator orientation="vertical" className="hidden md:block mx-4" />

        {/* Seção do Funcionário */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <UserCog className="size-4" />
            <span>Funcionário(a)</span>
          </div>
          <div className="flex items-center gap-4 pl-6">
            <Avatar className="size-10 border">
              <AvatarFallback className="text-sm">
                {services.agent.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium text-sm">{services.agent.name}</p>
              <p className="text-xs text-muted-foreground">
                Função:{' '}
                {services.agent.role === 'ADMIN' ? 'Administrador' : 'Membro'}
              </p>
              <p className="text-xs inline-flex items-center gap-1.5 text-muted-foreground">
                <Mail className="size-3" />
                {services.agent.email}
              </p>
            </div>
          </div>
        </div>
      </div>


      <Separator />

      {/* Seção da Observação */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <FileText className="size-4" />
          <span>Observação</span>
        </div>
        <div className="pl-6 bg-muted/50 p-3 rounded">
          <p
            className={`text-sm ${services.observation === '' && 'text-muted-foreground'}`}
          >
            {services.observation === ''
              ? 'Nenhuma observação adicionada'
              : services.observation}
          </p>
        </div>
      </div>


      <DialogFooter className="flex flex-col space-y-2 pt-2 border-t">
        <div className="flex flex-col w-full text-sm gap-2">
          <div className="flex items-center gap-1">
            <Clock className="size-4 text-muted-foreground" />
            <span className="text-muted-foreground">Criado em:</span>
            <span className="font-medium">{formattedCreatedAt}</span>
          </div>

          {services.status === 'COMPLETED' && (
            <>
              <div className="flex items-center gap-1">
                <CheckCircle className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Finalizado em:</span>
                <span className="font-medium">{formattedFinishedAt}</span>
              </div>

              <div className="flex items-center gap-1">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Duração total:</span>
                <span className="font-medium ml-1">{durationService}</span>
              </div>
            </>
          )}

          <DialogClose asChild>
            <Button className="w-full mt-2 rounded bg-sky-700 hover:bg-sky-600 text-white cursor-pointer">
              Fechar
            </Button>
          </DialogClose>
        </div>
      </DialogFooter>
    </DialogContent>
  )
}
