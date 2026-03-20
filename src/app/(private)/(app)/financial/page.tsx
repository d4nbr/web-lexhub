import { Separator } from '@/components/ui/separator'

export default function FinancialPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-calsans font-bold tracking-tight">Financeiro</h1>
      <Separator orientation="horizontal" />

      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-6 text-slate-300">
        Módulo financeiro em preparação.
      </div>
    </div>
  )
}
