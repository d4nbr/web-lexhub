'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ElementType } from 'react'

interface NavItemProps {
  title: string
  icon: ElementType
  route: string
  collapsed?: boolean
}

export function NavItem({ title, icon: Icon, route, collapsed = false }: NavItemProps) {
  const pathname = usePathname()
  const isActive = pathname === route

  return (
    <Link
      href={route}
      title={collapsed ? title : undefined}
      className={`
        group flex items-center rounded px-4 py-2.5 
        transition-all duration-200 ease-in-out
        ${collapsed ? 'justify-center' : 'gap-3'}
        ${
          isActive
            ? 'bg-slate-800/90 text-slate-100 shadow-sm'
            : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-100'
        }
      `}
    >
      <Icon className="size-5" />

      {!collapsed && (
        <span
          className={`
          font-medium tracking-wide
          ${isActive ? 'text-slate-100' : ''}
        `}
        >
          {title}
        </span>
      )}

      {!collapsed && isActive && (
        <div className="ml-auto h-1.5 w-1.5 rounded-full bg-sky-500" />
      )}
    </Link>
  )
}
