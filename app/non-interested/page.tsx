'use client'

import DashboardLayout from '@/components/dashboard/DashboardLayout'

export default function NonInterestedLeadsPage() {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Non-Interested Leads</h1>
        <p className="text-sm text-slate-500 mt-1">View and manage leads marked as non-interested</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
        <p className="text-sm text-slate-500">This section will display non-interested leads.</p>
        <p className="text-xs text-slate-400 mt-2">Filter leads by "Non-Interested" status on the Leads page.</p>
      </div>
    </DashboardLayout>
  )
}

