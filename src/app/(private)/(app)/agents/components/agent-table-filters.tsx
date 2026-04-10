'use client'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { zodResolver } from '@hookform/resolvers/zod'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const agentTableFiltersSchema = z.object({
  name: z.string().optional(),
  role: z.string().optional(),
})

type AgentTableFiltersType = z.infer<typeof agentTableFiltersSchema>

export function AgentTableFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const name = searchParams.get('name')
  const role = searchParams.get('role')

  const form = useForm<AgentTableFiltersType>({
    resolver: zodResolver(agentTableFiltersSchema),
    defaultValues: {
      name: name ?? '',
      role: role ?? '',
    },
  })

  function handleFilterAgent({ name, role }: AgentTableFiltersType) {
    const url = new URLSearchParams(searchParams.toString())

    if (name) url.set('name', name.toString())
    else url.delete('name')

    if (role) url.set('role', role.toString())
    else url.delete('role')

    // Reseta o parâmetro "page" para 1 quando os filtros mudam
    url.set('page', '1')

    // Atualiza a URL no navegador sem recarregar a página
    router.push(`?${url.toString()}`)
  }

  function handleClearFilters() {
    const url = new URLSearchParams()

    // Reseta o parâmetro "page" para 1 quando os filtros mudam
    url.set('page', '1')

    // Atualiza a URL no navegador sem recarregar a página
    router.push(`?${url.toString()}`)

    form.reset()
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFilterAgent)}
        className="flex items-center gap-2"
      >
        <span className="text-sm font-semibold">Filtros:</span>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Nome do Funcionário"
                  className="h-8 w-80 rounded"
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-8 w-40 rounded">
                    <SelectValue placeholder="Perfil" />
                  </SelectTrigger>
                </FormControl>

                <SelectContent className="rounded">
                  <SelectItem value="ALL">Todos</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="MEMBER">Membro</SelectItem>
                  <SelectItem value="SUBSECTION">Subseção</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="sm"
          className="cursor-pointer rounded bg-sky-700 hover:bg-sky-600 text-white"
        >
          <Search className="size-4" />
          Filtrar resultados
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          className="cursor-pointer rounded"
          onClick={handleClearFilters}
        >
          <X className="size-4" />
          Remover filtros
        </Button>
      </form>
    </Form>
  )
}
