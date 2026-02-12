'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function TasksPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tasks</h1>
        <p className="text-sm text-slate-500 mt-1">Manage follow-up tasks and reminders</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
        <p className="text-sm text-slate-500">Task management coming soon.</p>
        <p className="text-xs text-slate-400 mt-2">This section will help you track follow-ups and manage tasks.</p>
      </div>
    </DashboardLayout>
  )
}

