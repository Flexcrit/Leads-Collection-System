'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Performance</h1>
        <p className="text-sm text-slate-500 mt-1">View detailed performance metrics and analytics</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
        <p className="text-sm text-slate-500">Performance analytics coming soon.</p>
        <p className="text-xs text-slate-400 mt-2">This section will display detailed performance metrics and reports.</p>
      </div>
    </DashboardLayout>
  )
}

