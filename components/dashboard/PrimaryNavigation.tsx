'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface PrimaryNavigationProps {
  userRole?: 'admin' | 'agent'
}

export default function PrimaryNavigation({ userRole }: PrimaryNavigationProps) {
  const pathname = usePathname()
  const [role, setRole] = useState(userRole)

  useEffect(() => {
    if (!role) {
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setRole(data.role as 'admin' | 'agent')
              }
            })
        }
      })
    }
  }, [role])

  const adminNavItems = [
    { href: '/admin/dashboard', label: 'Dashboard' },
    { href: '/admin/leads', label: 'All Leads' },
    { href: '/admin/agents', label: 'Agents' },
    { href: '/admin/analytics', label: 'Analytics' },
  ]

  const agentNavItems = [
    { href: '/agent/dashboard', label: 'My Leads' },
    { href: '/agent/add-lead', label: 'Add Lead' },
  ]

  const navItems = role === 'admin' ? adminNavItems : agentNavItems

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="flex space-x-1 overflow-x-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? 'text-slate-900 border-slate-900'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
