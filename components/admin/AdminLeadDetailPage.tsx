'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import StatusBadge from '@/components/dashboard/StatusBadge'
import FeedbackThread from '@/components/feedback/FeedbackThread'
import { UserProfile } from '@/lib/auth'
import { Lead } from '@/types/lead'

interface AdminLeadDetailPageProps {
    user: UserProfile
    leadId: string
}

export default function AdminLeadDetailPage({ user, leadId }: AdminLeadDetailPageProps) {
    const router = useRouter()
    const [lead, setLead] = useState<Lead | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchLead()
    }, [leadId])

    const fetchLead = async () => {
        try {
            const response = await fetch('/api/leads')
            if (response.ok) {
                const data = await response.json()
                const foundLead = data.find((l: Lead) => l.id === leadId)
                if (foundLead) {
                    setLead({
                        ...foundLead,
                        status: foundLead.status || 'new',
                    })
                }
            }
        } catch (error) {
            console.error('Error fetching lead:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (isLoading) {
        return (
            <DashboardLayout user={user}>
                <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
                    <p className="text-sm text-slate-500">Loading lead details...</p>
                </div>
            </DashboardLayout>
        )
    }

    if (!lead) {
        return (
            <DashboardLayout user={user}>
                <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
                    <p className="text-sm text-slate-500 mb-4">Lead not found</p>
                    <button
                        onClick={() => router.push('/admin/leads')}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        ← Back to All Leads
                    </button>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout user={user}>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.push('/admin/leads')}
                        className="text-sm text-slate-600 hover:text-slate-900 mb-2 inline-flex items-center"
                    >
                        ← Back to All Leads
                    </button>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Lead Details</h1>
                    <p className="text-sm text-slate-500 mt-1">{lead.companyName}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Company Information</h2>
                        <dl className="space-y-4">
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Company Name</dt>
                                <dd className="mt-1 text-sm text-slate-900">{lead.companyName}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Email Address</dt>
                                <dd className="mt-1 text-sm text-slate-900">{lead.emailAddress}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Phone Number</dt>
                                <dd className="mt-1 text-sm text-slate-900">{lead.phoneNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-slate-500">Has Website</dt>
                                <dd className="mt-1 text-sm text-slate-900">{lead.hasWebsite ? 'Yes' : 'No'}</dd>
                            </div>
                        </dl>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200 rounded-lg p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Status</h2>
                        <div className="mb-4">
                            <StatusBadge status={(lead.status || 'new') as 'new' | 'contacted' | 'interested' | 'non-interested' | 'closed'} />
                        </div>
                        <div className="space-y-3 text-sm">
                            <div>
                                <dt className="text-slate-500">Date Added</dt>
                                <dd className="mt-1 text-slate-900">{formatDate(lead.dateAdded)}</dd>
                            </div>
                            {lead.assignedAgent && (
                                <div>
                                    <dt className="text-slate-500">Assigned Agent</dt>
                                    <dd className="mt-1 text-slate-900">{lead.assignedAgent}</dd>
                                </div>
                            )}
                            {lead.createdBy && (
                                <div>
                                    <dt className="text-slate-500">Created By</dt>
                                    <dd className="mt-1 text-slate-900">{lead.createdBy}</dd>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Agent Feedback & Communication</h2>
                <FeedbackThread leadId={leadId} userRole={user.role} />
            </div>
        </DashboardLayout>
    )
}

