'use client'

import { createAgent } from '@/api/agents/create'
import { PasswordInput } from '@/components/app/password-input'
import { Button } from '@/components/ui/button'
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
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'
import { CirclePlus, LoaderCircle, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { SUBSECAO_OPTIONS } from './subsecao-options'

const NewAgentFormSchema = z
  .object({
    name: z.string().min(1, 'O nome é obrigatório.'),
    email: z.string().email('Insira um endereço de e-mail válido.'),
    password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
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

type NewAgentFormType = z.infer<typeof NewAgentFormSchema>

export function NewAgent() {
  const [sheetIsOpen, setSheetIsOpen] = useState(false)

  const form = useForm<NewAgentFormType>({
    shouldUnregister: true,
    resolver: zodResolver(NewAgentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '@102030@',
      role: 'MEMBER',
      canAccessDashboard: true,
      canAccessServices: true,
      canAccessFinancial: false,
      subsecaoScope: '',
    },
  })

  const queryClient = useQueryClient()
  const { mutateAsync: createAgentFn, isPending: isCreating } = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  const selectedRole = form.watch('role')

  async function handleNewAgent(data: NewAgentFormType) {
    const isAdmin = data.role === 'ADMIN'

    try {
      await createAgentFn({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        canAccessDashboard: isAdmin ? true : data.canAccessDashboard,
        canAccessServices: isAdmin ? true : data.canAccessServices,
        canAccessFinancial: isAdmin ? true : data.canAccessFinancial,
        subsecaoScope: data.role === 'SUBSECTION' ? data.subsecaoScope : null,
      })

      setSheetIsOpen(false)

      toast.success('Usuário registrado com sucesso!', {
        description: 'Confira as informações do usuário na lista.',
      })
    } catch (err) {
      form.reset()

      if (isAxiosError(err)) {
        toast.error('Houve um erro ao registrar o usuário!', {
          description: err.response?.data.message,
        })

        return
      }

      toast.error('Houve um erro ao registrar o usuário!', {
        description: 'Por favor, tente novamente.',
      })
    }
  }

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-sky-700 flex items-center cursor-pointer rounded text-white hover:bg-sky-600">
          <CirclePlus className="size-5" />
          Novo Usuário
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto px-4 w-full">
        <SheetHeader className="mt-2">
          <SheetTitle className="font-calsans text-2xl">Novo Usuário</SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Preencha as informações para registrar um novo usuário
          </SheetDescription>
        </SheetHeader>

        <Separator orientation="horizontal" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleNewAgent)}
            className="space-y-6 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
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
                  <FormLabel>E-mail para acesso</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded" />
                  </FormControl>

                  {errors.email ? (
                    <FormMessage className="text-red-500 text-xs">
                      {errors.email.message}
                    </FormMessage>
                  ) : (
                    <FormDescription className="text-muted-foreground text-xs">
                      Informe o e-mail usado para login.
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel>Senha provisória</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} className="rounded" />
                  </FormControl>

                  {errors.password ? (
                    <FormMessage className="text-red-500 text-xs">
                      {errors.password.message}
                    </FormMessage>
                  ) : (
                    <FormDescription className="text-muted-foreground text-xs">
                      Senha padrão provisória definida: <b>@102030@</b>
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
                  <FormLabel>Perfil de acesso</FormLabel>
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
              <div className="space-y-3 rounded border border-slate-700 p-3">
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

            <SheetFooter className="flex items-center justify-end mt-8 flex-row gap-2 p-0">
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-sky-700 hover:bg-sky-600 text-white cursor-pointer rounded"
              >
                {isCreating ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Criando e enviando e-mail...
                  </>
                ) : (
                  <>
                    <UserRoundPlus className="size-4" />
                    Criar Novo
                  </>
                )}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  )
}
