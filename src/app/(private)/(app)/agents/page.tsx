import { Separator } from '@/components/ui/separator'
import type { Metadata } from 'next'
import { AgentsList } from './components/agents-list'
import { NewAgent } from './components/new-agent'

export const metadata: Metadata = {
  title: 'Gestão de Usuários | OAB Atende',
}

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-calsans font-bold tracking-tight">
          Gestão de Usuários
        </h1>

        {/* FIXME: Componente de Novo Funcionario */}
        <NewAgent />
      </div>

      <Separator orientation="horizontal" />

      <div className="space-y-2.5 mt-4">
        {/* FIXME: Componente que lista os funcionários */}
        <AgentsList />
      </div>
    </div>
  )
}
