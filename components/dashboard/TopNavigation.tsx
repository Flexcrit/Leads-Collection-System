'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'

interface TopNavigationProps {
  userName?: string
  userRole?: 'admin' | 'agent'
}

export default function TopNavigation({ userName, userRole }: TopNavigationProps) {
  const [name, setName] = useState(userName || '')
  const [role, setRole] = useState(userRole)

  useEffect(() => {
    if (!name || !role) {
      // Fetch user info from client
      const supabase = createClient()
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase
            .from('profiles')
            .select('name, role')
            .eq('id', user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setName(data.name)
                setRole(data.role as 'admin' | 'agent')
              }
            })
        }
      })
    }
  }, [name, role])

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' })
    if (response.ok) {
      window.location.href = '/login'
    }
  }

  return (
    <header className="bg-white border-b border-slate-200">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
                Leads Management Dashboard
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">Xcelron sols</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="flex items-center space-x-2 px-3 py-1.5">
              <span className="text-sm text-slate-600 capitalize">{role || 'User'}</span>
              {name && <span className="text-sm text-slate-500">• {name}</span>}
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors focus-ring"
              aria-label="Logout"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

