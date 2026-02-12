'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MetricCard from '@/components/dashboard/MetricCard'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { UserProfile } from '@/lib/auth'
import { Lead, Metric } from '@/types/lead'

interface AdminDashboardProps {
    user: UserProfile
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
    const [allLeads, setAllLeads] = useState<Lead[]>([])
    const [recentLeads, setRecentLeads] = useState<Lead[]>([])
    const [metrics, setMetrics] = useState<Metric[]>([])
    const [statusBreakdown, setStatusBreakdown] = useState<Array<{ status: 'new' | 'contacted' | 'interested' | 'non-interested' | 'closed', count: number, label: string }>>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        try {
            const response = await fetch('/api/leads')
            if (response.ok) {
                const data = await response.json()
                const leadsWithDefaults = data.map((lead: any) => ({
                    ...lead,
                    status: lead.status || 'new',
                    assignedAgent: lead.assignedAgent || 'Unassigned',
                }))
                setAllLeads(leadsWithDefaults)
                setRecentLeads(leadsWithDefaults.slice(0, 10))
                calculateMetrics(leadsWithDefaults)
                calculateStatusBreakdown(leadsWithDefaults)
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const calculateMetrics = (leads: Lead[]) => {
        const now = new Date()
        const today = new Date(now.setHours(0, 0, 0, 0))
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

        const totalLeads = leads.length
        const newToday = leads.filter(lead => {
            const leadDate = new Date(lead.dateAdded)
            return leadDate >= today
        }).length
        const newThisWeek = leads.filter(lead => {
            const leadDate = new Date(lead.dateAdded)
            return leadDate >= weekAgo
        }).length
        const newThisMonth = leads.filter(lead => {
            const leadDate = new Date(lead.dateAdded)
            return leadDate >= monthAgo
        }).length

        const closedLeads = leads.filter(lead => lead.status === 'closed').length
        const conversionRate = totalLeads > 0 ? ((closedLeads / totalLeads) * 100).toFixed(1) : '0.0'

        const calculatedMetrics: Metric[] = [
            { label: 'Total Leads', value: totalLeads.toLocaleString(), secondary: 'All time' },
            { label: 'New Leads Today', value: newToday.toString(), secondary: 'Added today' },
            { label: 'Leads This Week', value: newThisWeek.toString(), secondary: 'Last 7 days' },
            { label: 'Leads This Month', value: newThisMonth.toString(), secondary: 'Last 30 days' },
            { label: 'Conversion Rate', value: `${conversionRate}%`, secondary: 'Closed leads' },
            { label: 'Avg Response Time', value: '—', secondary: 'Not tracked' },
            { label: 'Follow-ups Pending', value: '—', secondary: 'Not tracked' },
            { label: 'Active Agents', value: '—', secondary: 'Not tracked' },
            { label: 'Top Performing Agent', value: '—', secondary: 'Not tracked' },
        ]
        setMetrics(calculatedMetrics)
    }

    const calculateStatusBreakdown = (leads: Lead[]) => {
        const statusCounts = {
            'new': 0,
            'contacted': 0,
            'interested': 0,
            'non-interested': 0,
            'closed': 0,
        }

        leads.forEach(lead => {
            const status = lead.status || 'new'
            if (status in statusCounts) {
                statusCounts[status as keyof typeof statusCounts]++
            }
        })

        const breakdown = [
            { status: 'new' as const, count: statusCounts.new, label: 'New' },
            { status: 'contacted' as const, count: statusCounts.contacted, label: 'Contacted' },
            { status: 'interested' as const, count: statusCounts.interested, label: 'Interested' },
            { status: 'non-interested' as const, count: statusCounts['non-interested'], label: 'Non-Interested' },
            { status: 'closed' as const, count: statusCounts.closed, label: 'Closed' },
        ]
        setStatusBreakdown(breakdown)
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

    return (
        <DashboardLayout user={user}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-slate-500 mt-1">Welcome back, {user.name}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="text-sm text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                    Logout
                </button>
            </div>

            {/* Key Metrics Section */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h2>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(9)].map((_, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-32"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {metrics.map((metric, index) => (
                            <MetricCard key={index} metric={metric} />
                        ))}
                    </div>
                )}
            </section>

            {/* Leads Activity Summary */}
            <section className="mb-10">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Leads Activity Summary</h2>
                {isLoading ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[...Array(5)].map((_, index) => (
                            <div key={index} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                                <div className="h-6 bg-slate-200 rounded w-16 mb-2"></div>
                                <div className="h-8 bg-slate-200 rounded w-12 mb-2"></div>
                                <div className="h-3 bg-slate-200 rounded w-20"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {statusBreakdown.map((item) => (
                            <div key={item.status} className="bg-white border border-slate-200 rounded-lg p-5">
                                <div className="flex items-center justify-between mb-2">
                                    <StatusBadge status={item.status} />
                                </div>
                                <p className="text-2xl font-semibold text-slate-900">{item.count}</p>
                                <p className="text-xs text-slate-500 mt-1">{item.label} Leads</p>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Leads Table */}
            <section className="mb-10">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-slate-900">Recent Leads</h2>
                    <a
                        href="/admin/leads"
                        className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                    >
                        View all →
                    </a>
                </div>
                {isLoading ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                        <p className="text-sm text-slate-500">Loading leads...</p>
                    </div>
                ) : recentLeads.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
                        <p className="text-sm text-slate-500">No leads yet.</p>
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
                                            Date Added
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-200">
                                    {recentLeads.map((lead) => (
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
                                                <div className="text-sm text-slate-600">{formatDate(lead.dateAdded)}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a
                                                    href={`/admin/leads/${lead.id}`}
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
            </section>
        </DashboardLayout>
    )
}

