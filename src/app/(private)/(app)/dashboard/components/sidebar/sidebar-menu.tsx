'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import LogoOAB from '@/assets/logo-oabma.png'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Bolt,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Monitor,
  Users,
  Wallet,
} from 'lucide-react'
import { NavItem } from './nav-item'
import { Profile } from './profile'

interface SidebarMenuProps {
  permissions: {
    canAccessDashboard: boolean
    canAccessServices: boolean
    canAccessFinancial: boolean
    role: 'ADMIN' | 'MEMBER' | 'SUBSECTION' | null
  }
}

export function SidebarMenu({ permissions }: SidebarMenuProps) {
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const storedValue = window.localStorage.getItem('oab-sidebar-collapsed')

    if (storedValue !== null) {
      setCollapsed(storedValue === 'true')
      return
    }

    setCollapsed(window.innerWidth < 1024)
  }, [])

  function handleToggleSidebar() {
    setCollapsed(prev => {
      const next = !prev
      window.localStorage.setItem('oab-sidebar-collapsed', String(next))
      return next
    })
  }

  const isAdmin = permissions.role === 'ADMIN'

  return (
    <aside
      className={`bg-muted-foreground/5 flex flex-col gap-6 border-r py-6 transition-all duration-200 ${
        collapsed ? 'w-20 px-3' : 'w-[280px] px-5'
      }`}
    >
      <div className="flex items-center justify-between">
        {collapsed ? (
          <Image src={LogoOAB} alt="OAB" width={36} height={36} priority />
        ) : (
          <Image src={LogoOAB} alt="OAB Atende" width={170} height={28} priority />
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 p-0 rounded-md text-slate-300 hover:text-slate-100 hover:bg-slate-700/35"
          onClick={handleToggleSidebar}
          title={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? (
            <ChevronRight className="size-4" />
          ) : (
            <ChevronLeft className="size-4" />
          )}
        </Button>
      </div>

      <Separator orientation="horizontal" />

      <nav className="space-y-0.5 w-full">
        {permissions.canAccessDashboard && (
          <NavItem title="Dashboard" icon={Monitor} route="/dashboard" collapsed={collapsed} />
        )}

        {permissions.canAccessServices && (
          <NavItem title="Atendimentos" icon={ClipboardList} route="/services" collapsed={collapsed} />
        )}

        {permissions.canAccessFinancial && (
          <NavItem title="Financeiro" icon={Wallet} route="/financial" collapsed={collapsed} />
        )}

        {isAdmin && (
          <>
            <NavItem
              title="Controle de Serviços"
              icon={Bolt}
              route="/services-types"
              collapsed={collapsed}
            />
            <NavItem title="Gestão de Usuários" icon={Users} route="/agents" collapsed={collapsed} />
          </>
        )}
      </nav>

      <div className="mt-auto flex flex-col gap-6 w-full">
        <Separator orientation="horizontal" />
        <Profile collapsed={collapsed} />
      </div>
    </aside>
  )
}
