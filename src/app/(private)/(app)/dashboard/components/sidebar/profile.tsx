'use client'

import { getProfile } from '@/api/agents/get-profile'
import { logout } from '@/api/agents/logout'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useMutation, useQuery } from '@tanstack/react-query'
import { LoaderCircle, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ProfileProps {
  collapsed?: boolean
}

export function Profile({ collapsed = false }: ProfileProps) {
  const router = useRouter()

  // FIXME: Query para pegar o perfil do usuário logado
  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
    staleTime: Number.POSITIVE_INFINITY,
  })

  // FIXME: Mutation para se deslogar
  const { mutateAsync: logoutFn, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // replace => força o administrador a não voltar para o página anterior
      router.replace('/?logout=true')
    },
  })

  async function handleLogout() {
    try {
      await logoutFn()

      toast.success('Sessão encerrada com sucesso!', {
        description: 'Volte para plataforma quando quiser.',
      })

      // replace => força o administrador a não voltar para o página anterior
      router.replace('/?logout=true')
    } catch (err) {
      toast.error('Houve um erro ao se deslogar!', {
        description: 'Por favor, tente novamente.',
      })
    }
  }

  function getRoleLabel(role: 'ADMIN' | 'MEMBER' | 'SUBSECTION' | undefined) {
    if (role === 'ADMIN') return 'Perfil: Administrador'
    if (role === 'MEMBER') return 'Perfil: Membro'
    if (role === 'SUBSECTION') return 'Perfil: Subseção'
  }

  return (
    <div className={`flex items-center overflow-hidden ${collapsed ? 'justify-center' : 'max-w-[280px]'}`}>
      {!collapsed && (
        <div className="flex flex-col space-y-1 overflow-hidden">
          <span className="font-medium truncate text-ellipsis whitespace-nowrap">
            {isProfileLoading ? (
              <Skeleton className="h-4 w-40" />
            ) : (
              profile?.agent.name
            )}
          </span>
          <span className="font-medium text-xs">
            {isProfileLoading ? (
              <Skeleton className="h-3 w-32" />
            ) : (
              getRoleLabel(profile?.agent.role)
            )}
          </span>
          <span className="text-xs text-muted-foreground truncate text-ellipsis whitespace-nowrap">
            {isProfileLoading ? (
              <Skeleton className="h-3 w-34" />
            ) : (
              profile?.agent.email
            )}
          </span>
        </div>
      )}

      <Dialog>
        <DialogTrigger asChild>
          {isProfileLoading ? (
            <Skeleton className={`size-8 rounded ${collapsed ? '' : 'ml-auto'}`} />
          ) : (
            <Button
              type="button"
              variant="outline"
              className={`rounded cursor-pointer text-xs text-muted-foreground hover:border-sky-600 transition-colors flex-shrink-0 ${collapsed ? '' : 'ml-auto'}`}
              title="Sair"
            >
              <LogOut className="size-4" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Você realmente quer sair?</DialogTitle>
            <DialogDescription>
              Ao fazer logout, você será desconectado da sua conta.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              className="rounded cursor-pointer"
              disabled={isLoggingOut}
              onClick={handleLogout}
            >
              {!isLoggingOut ? (
                <>
                  <LogOut className="size-4" />
                  Sair da conta
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <LoaderCircle className="size-4 animate-spin" />
                  Saindo...
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
