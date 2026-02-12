'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { UserProfile } from '@/lib/auth'
import { Lead } from '@/types/lead'

interface AdminLeadsPageProps {
  user: UserProfile
}

export default function AdminLeadsPage({ user }: AdminLeadsPageProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      const response = await fetch('/api/leads')
      if (response.ok) {
        const data = await response.json()
        const leadsWithDefaults = data.map((lead: any) => ({
          ...lead,
          status: lead.status || 'new',
          assignedAgent: lead.assignedAgent || 'Unassigned',
        }))
        setLeads(leadsWithDefaults)
      }
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lead?')) {
      return
    }

    try {
      const response = await fetch(`/api/leads?id=${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setLeads(leads.filter(lead => lead.id !== id))
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to delete lead')
      }
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert('Failed to delete lead')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const filteredLeads = filterStatus === 'all'
    ? leads
    : leads.filter(lead => lead.status === filterStatus)

  const statusOptions = [
    { value: 'all', label: 'All Leads' },
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'interested', label: 'Interested' },
    { value: 'non-interested', label: 'Non-Interested' },
    { value: 'closed', label: 'Closed' },
  ]

  return (
    <DashboardLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">All Leads</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and view all leads in the system</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center space-x-2 overflow-x-auto pb-2">
        {statusOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilterStatus(option.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${filterStatus === option.value
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
          >
            {option.label}
          </button>
        ))}
        <div className="flex-1" />
        <span className="text-sm text-slate-500">
          {filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}
        </span>
      </div>

      {/* Leads Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
          <p className="text-sm text-slate-500">Loading leads...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
          <p className="text-sm text-slate-500">
            {filterStatus === 'all'
              ? 'No leads yet.'
              : `No ${statusOptions.find(o => o.value === filterStatus)?.label.toLowerCase()} leads.`}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Company
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Contact Email
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Phone
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Assigned Agent
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Created By
                  </th>
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Date Added
                  </th>
                  <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider bg-slate-50/50">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-slate-50/50 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-900">
                        {lead.companyName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{lead.emailAddress}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{lead.phoneNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={(lead.status || 'new') as 'new' | 'contacted' | 'interested' | 'non-interested' | 'closed'} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{lead.assignedAgent || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{lead.createdBy || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-600">{formatDate(lead.dateAdded)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <a
                          href={`/admin/leads/${lead.id}`}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </a>
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors duration-150 p-1.5 rounded-md hover:bg-red-50 focus-ring"
                          aria-label={`Delete ${lead.companyName}`}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

