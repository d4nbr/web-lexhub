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
  Sheet,
  SheetClose,
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

const NewAgentFormSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
  email: z.string().email('Insira um endereço de e-mail válido.'),
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.'),
})

type NewAgentFormType = z.infer<typeof NewAgentFormSchema>

export function NewAgent() {
  // FIXME: Guardará o estado do Sheet se ele estiver aberto ou fechado
  const [sheetIsOpen, setSheetIsOpen] = useState(false)

  const form = useForm<NewAgentFormType>({
    shouldUnregister: true, // Desregistrar o campo do formulário
    resolver: zodResolver(NewAgentFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '@102030@',
    },
  })

  // FIXME: Mutation para criar um novo funcionário
  const queryClient = useQueryClient()
  const { mutateAsync: createAgentFn, isPending: isCreating } = useMutation({
    mutationFn: createAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agents'] })
    },
  })

  async function handleNewAgent(data: NewAgentFormType) {
    try {
      await createAgentFn({
        name: data.name,
        email: data.email,
        password: data.password,
      })

      // Fechar o Sheet quando o funcionário for registrado
      setSheetIsOpen(false)

      toast.success('Funcionário registrado com sucesso!', {
        description:
          'Confira as informações do colaborador na lista de funcionários.',
      })
    } catch (err) {
      // FIXME: Tratar erros vindo da API
      form.reset()

      if (isAxiosError(err)) {
        toast.error('Houve um erro ao registrar o funcionário!', {
          description: err.response?.data.message,
        })

        return
      }

      toast.error('Houve um erro ao registrar o funcionário!', {
        description: 'Por favor, tente novamente.',
      })

      console.log(err)
    }
  }

  return (
    <Sheet open={sheetIsOpen} onOpenChange={setSheetIsOpen}>
      <SheetTrigger asChild>
        <Button className="bg-sky-700 flex items-center cursor-pointer rounded text-white hover:bg-sky-600">
          <CirclePlus className="size-5" />
          Novo Funcionário
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto px-4 w-full">
        <SheetHeader className="mt-2">
          <SheetTitle className="font-calsans text-2xl">
            Novo Funcionário
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Preencha as informações para registrar um novo funcionário
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
                      Por favor, insira o nome completo do funcionário
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
                      Por favor, insira o e-mail do funcionário validado
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
