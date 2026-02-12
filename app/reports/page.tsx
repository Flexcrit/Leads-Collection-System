'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
        <p className="text-sm text-slate-500 mt-1">Generate and view detailed lead reports</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
        <p className="text-sm text-slate-500">Reports feature coming soon.</p>
        <p className="text-xs text-slate-400 mt-2">This section will allow you to generate and export lead reports.</p>
      </div>
    </DashboardLayout>
  )
}

