'use client'

import TopNavigation from './TopNavigation'
import PrimaryNavigation from './PrimaryNavigation'
import { UserProfile } from '@/lib/auth'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: UserProfile
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNavigation userName={user?.name} userRole={user?.role} />
      <PrimaryNavigation userRole={user?.role} />
      <main className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}

