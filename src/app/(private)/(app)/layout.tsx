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

      <main className="flex-1 px-3 pb-8 pt-4 sm:px-5 sm:pt-6 lg:px-8 lg:pb-12 lg:pt-8">
        <div className="animate-slide-up">{children}</div>
      </main>
    </div>
  )
}
