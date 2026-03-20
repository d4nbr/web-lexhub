import { checkAdminStatus } from '@/auth'
import type { Metadata } from 'next'
import { SidebarMenu } from './dashboard/components/sidebar/sidebar-menu'

export const metadata: Metadata = {
  title: 'Home | OAB Atende',
}

export default async function DashLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const hasPrivilegedAccess = await checkAdminStatus()

  return (
    <div className="flex min-h-screen text-sm">
      <SidebarMenu hasPrivilegedAccess={hasPrivilegedAccess} />

      <main className="flex-1 px-8 pb-12 pt-8">
        <div className="animate-slide-up">{children}</div>
      </main>
    </div>
  )
}
