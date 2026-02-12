'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatusBadge from '@/components/dashboard/StatusBadge'
import AddLeadModal from '@/components/AddLeadModal'
import { UserProfile } from '@/lib/auth'
import { Lead } from '@/types/lead'

interface AgentDashboardProps {
    user: UserProfile
}

export default function AgentDashboard({ user }: AgentDashboardProps) {
    const [leads, setLeads] = useState<Lead[]>([])
    const [isModalOpen, setIsModalOpen] = useState(false)
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

    const handleAddLead = async (lead: Omit<Lead, 'id' | 'dateAdded'>) => {
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lead),
            })

            if (response.ok) {
                await fetchLeads()
                setIsModalOpen(false)
            }
        } catch (error) {
            console.error('Error adding lead:', error)
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

    const handleLogout = async () => {
        const response = await fetch('/api/auth/logout', { method: 'POST' })
        if (response.ok) {
            window.location.href = '/login'
        }
    }

    const filteredLeads = filterStatus === 'all'
        ? leads
        : leads.filter(lead => lead.status === filterStatus)

    const statusOptions = [
        { value: 'all', label: 'All My Leads' },
        { value: 'new', label: 'New' },
        { value: 'contacted', label: 'Contacted' },
        { value: 'interested', label: 'Interested' },
        { value: 'non-interested', label: 'Non-Interested' },
        { value: 'closed', label: 'Closed' },
    ]

    return (
        <DashboardLayout user={user}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Leads</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, {user.name}</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 active:bg-slate-900 transition-colors duration-150 focus-ring"
                    >
                        Add Lead
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        Logout
                    </button>
                </div>
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
                            ? 'No leads yet. Click "Add Lead" to get started.'
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
                                            <div className="text-sm text-slate-600">{formatDate(lead.dateAdded)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <a
                                                href={`/agent/leads/${lead.id}`}
                                                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                            >
                                                View →
                                            </a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {isModalOpen && (
                <AddLeadModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleAddLead}
                />
            )}
        </DashboardLayout>
    )
}

