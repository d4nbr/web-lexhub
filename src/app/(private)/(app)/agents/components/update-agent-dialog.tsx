'use client'

import { updateAgent } from '@/api/agents/update-agent'
import { Button } from '@/components/ui/button'
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { zodResolver } from '@hookform/resolvers/zod'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { LoaderCircle, Save } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { SUBSECAO_OPTIONS } from './subsecao-options'

const UpdateAgentFormSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Insira um endereço de e-mail válido.'),
    role: z.enum(['ADMIN', 'MEMBER', 'SUBSECTION']),
    canAccessDashboard: z.boolean(),
    canAccessServices: z.boolean(),
    canAccessFinancial: z.boolean(),
    subsecaoScope: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role === 'SUBSECTION' && !data.subsecaoScope) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Selecione a seccional para o perfil Subseção.',
        path: ['subsecaoScope'],
      })
    }
  })

type UpdateAgentFormType = z.infer<typeof UpdateAgentFormSchema>

interface UpdateAgentProps {
  agents: {
    id: string
    name: string
    email: string
    role: 'ADMIN' | 'MEMBER' | 'SUBSECTION'
    canAccessDashboard: boolean
    canAccessServices: boolean
    canAccessFinancial: boolean
    subsecaoScope: string | null
  }
  onOpenChange: (open: boolean) => void
}

export function UpdateAgentDialog({ agents, onOpenChange }: UpdateAgentProps) {
  const form = useForm<UpdateAgentFormType>({
    resolver: zodResolver(UpdateAgentFormSchema),
    values: {
      id: agents.id,
      name: agents.name,
      email: agents.email,
      role: agents.role,
      canAccessDashboard: agents.canAccessDashboard,
      canAccessServices: agents.canAccessServices,
      canAccessFinancial: agents.canAccessFinancial,
      subsecaoScope: agents.subsecaoScope ?? '',
    },
  })

  const queryClient = useQueryClient()
  const { mutateAsync: updateAgentFn, isPending: isLoadindUpdate } =
    useMutation({
      mutationFn: updateAgent,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['agents'] })
      },
    })

  const selectedRole = form.watch('role')

  async function handleUpdateAgent(data: UpdateAgentFormType) {
    try {
      await updateAgentFn({
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        canAccessDashboard: data.role === 'ADMIN' ? true : data.canAccessDashboard,
        canAccessServices: data.role === 'ADMIN' ? true : data.canAccessServices,
        canAccessFinancial: data.role === 'ADMIN' ? true : data.canAccessFinancial,
        subsecaoScope: data.role === 'SUBSECTION' ? data.subsecaoScope : null,
      })

      onOpenChange(false)

      toast.success('Usuário atualizado com sucesso!', {
        description: 'Confira as informações na lista de usuários.',
      })
    } catch (err) {
      form.reset()

      if (isAxiosError(err)) {
        toast.error('Houve um erro ao atualizar o usuário!', {
          description: err.response?.data.message,
        })

        return
      }

      toast.error('Houve um erro ao atualizar o usuário!', {
        description: 'Por favor, tente novamente.',
      })
    }
  }

  return (
    <DialogContent className="w-[90%] rounded">
      <DialogHeader>
        <DialogTitle className="font-calsans text-2xl">
          Editar Informações do Usuário
        </DialogTitle>
        <DialogDescription>
          Altere os dados e permissões conforme necessário.
        </DialogDescription>
      </DialogHeader>

      <Separator orientation="horizontal" />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleUpdateAgent)}>
          <div className="space-y-4 py-4">
            <div className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded" />
                    </FormControl>

                    {errors.name ? (
                      <FormMessage className="text-red-500 text-xs">
                        {errors.name.message}
                      </FormMessage>
                    ) : (
                      <FormDescription className="text-muted-foreground text-xs">
                        Por favor, insira o nome completo do usuário.
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field, formState: { errors } }) => (
                  <FormItem>
                    <FormLabel>E-mail cadastrado</FormLabel>
                    <FormControl>
                      <Input {...field} className="rounded" />
                    </FormControl>

                    {errors.email ? (
                      <FormMessage className="text-red-500 text-xs">
                        {errors.email.message}
                      </FormMessage>
                    ) : (
                      <FormDescription className="text-muted-foreground text-xs">
                        Insira o novo endereço de e-mail do usuário.
                      </FormDescription>
                    )}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Perfil</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent className="rounded">
                        <SelectItem value="ADMIN">Administrador</SelectItem>
                        <SelectItem value="MEMBER">Membro</SelectItem>
                        <SelectItem value="SUBSECTION">Subseção</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {selectedRole === 'SUBSECTION' && (
                <FormField
                  control={form.control}
                  name="subsecaoScope"
                  render={({ field, formState: { errors } }) => (
                    <FormItem>
                      <FormLabel>Seccional/Subseção vinculada</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="rounded">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded">
                          {SUBSECAO_OPTIONS.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.subsecaoScope && (
                        <FormMessage className="text-red-500 text-xs">
                          {errors.subsecaoScope.message}
                        </FormMessage>
                      )}
                    </FormItem>
                  )}
                />
              )}

              {selectedRole !== 'ADMIN' && (
                <div className="space-y-2 rounded border border-slate-700 p-3">
                  <p className="text-sm font-medium">Menus liberados</p>

                  <FormField
                    control={form.control}
                    name="canAccessDashboard"
                    render={({ field }) => (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={event => field.onChange(event.target.checked)}
                        />
                        Dashboard
                      </label>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canAccessServices"
                    render={({ field }) => (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={event => field.onChange(event.target.checked)}
                        />
                        Atendimentos
                      </label>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="canAccessFinancial"
                    render={({ field }) => (
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={event => field.onChange(event.target.checked)}
                        />
                        Financeiro
                      </label>
                    )}
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="ghost"
                type="button"
                className="rounded cursor-pointer"
              >
                Cancelar
              </Button>
            </DialogClose>

            <Button
              type="submit"
              disabled={isLoadindUpdate}
              className="bg-sky-700 hover:bg-sky-600 text-white cursor-pointer rounded"
            >
              {isLoadindUpdate ? (
                <>
                  <LoaderCircle className="animate-spin" />
                  Aplicando mudanças...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Salvar alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  )
}
