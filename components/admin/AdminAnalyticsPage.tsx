'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import MetricCard from '@/components/dashboard/MetricCard'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { UserProfile } from '@/lib/auth'
import { Lead, Metric } from '@/types/lead'

interface AdminAnalyticsPageProps {
  user: UserProfile
}

export default function AdminAnalyticsPage({ user }: AdminAnalyticsPageProps) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<Array<{ status: 'new' | 'contacted' | 'interested' | 'non-interested' | 'closed', count: number, label: string }>>([])
  const [isLoading, setIsLoading] = useState(true)

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
        }))
        setLeads(leadsWithDefaults)
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

  return (
    <DashboardLayout user={user}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">View detailed analytics and insights</p>
      </div>

      {/* Key Metrics Section */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Key Metrics</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-lg p-5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                <div className="h-3 bg-slate-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {metrics.map((metric, index) => (
              <MetricCard key={index} metric={metric} />
            ))}
          </div>
        )}
      </section>

      {/* Status Breakdown */}
      <section className="mb-10">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Status Breakdown</h2>
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

      {/* Additional Analytics Placeholder */}
      <section>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Additional Analytics</h2>
        <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
          <p className="text-sm text-slate-500 mb-2">Advanced analytics coming soon</p>
          <p className="text-xs text-slate-400">This section will include charts, trends, and detailed reports</p>
        </div>
      </section>
    </DashboardLayout>
  )
}

