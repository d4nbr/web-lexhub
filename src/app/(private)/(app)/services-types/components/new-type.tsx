'use client'

import { createServiceType } from '@/api/services-types/create-type'
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
import { CirclePlus, ListPlus, LoaderCircle, UserRoundPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const newServiceTypeFormSchema = z.object({
  name: z.string().min(1, 'O nome é obrigatório.'),
})

type NewServiceTypeFormType = z.infer<typeof newServiceTypeFormSchema>

export function NewServiceType() {
  // FIXME: Guardará o estado do Sheet se ele estiver aberto ou fechado
  const [sheetIsOpen, setSheetIsOpen] = useState(false)

  const form = useForm<NewServiceTypeFormType>({
    shouldUnregister: true, // Desregistrar o campo do formulário
    resolver: zodResolver(newServiceTypeFormSchema),
    defaultValues: {
      name: '',
    },
  })

  // FIXME: Mutation para criar um novo serviço
  const queryClient = useQueryClient()
  const { mutateAsync: createServiceTypeFn, isPending: isCreating } =
    useMutation({
      mutationFn: createServiceType,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['services-types'] })
      },
    })

  async function handleCreateServiceType(data: NewServiceTypeFormType) {
    try {
      await createServiceTypeFn({
        name: data.name,
      })

      // Fechar o Sheet quando o serviço for registrado
      setSheetIsOpen(false)

      toast.success('Novo serviço registrado com sucesso!', {
        description:
          'Confira as informações do novo serviço na lista de serviços.',
      })
    } catch (err) {
      form.reset()

      if (isAxiosError(err)) {
        toast.error('Houve um erro ao registrar o novo serviço!', {
          description: err.response?.data.message,
        })

        return
      }

      toast.error('Houve um erro ao registrar o novo serviço!', {
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
          Novo Serviço
        </Button>
      </SheetTrigger>

      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto px-4 w-full">
        <SheetHeader className="mt-2">
          <SheetTitle className="font-calsans text-2xl">
            Novo Serviço
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Preencha as informações para registrar um novo serviço
          </SheetDescription>
        </SheetHeader>

        <Separator orientation="horizontal" />

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleCreateServiceType)}
            className="space-y-6 pt-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field, formState: { errors } }) => (
                <FormItem>
                  <FormLabel>Nome do Serviço</FormLabel>
                  <FormControl>
                    <Input {...field} className="rounded" />
                  </FormControl>

                  {errors.name ? (
                    <FormMessage className="text-red-500 text-xs">
                      {errors.name.message}
                    </FormMessage>
                  ) : (
                    <FormDescription className="text-muted-foreground text-xs">
                      Por favor, insira o nome do novo serviço
                    </FormDescription>
                  )}
                </FormItem>
              )}
            />

            <SheetFooter className="flex items-center mt-8 justify-end flex-row gap-2 p-0">
              <Button
                type="submit"
                disabled={isCreating}
                className="bg-sky-700 hover:bg-sky-600 text-white cursor-pointer rounded"
              >
                {isCreating ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <ListPlus className="size-5" />
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
