'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AddLeadModal from '@/components/AddLeadModal'
import { UserProfile } from '@/lib/auth'
import { Lead } from '@/types/lead'

interface AgentAddLeadPageProps {
    user: UserProfile
}

export default function AgentAddLeadPage({ user }: AgentAddLeadPageProps) {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleAddLead = async (lead: Omit<Lead, 'id' | 'dateAdded'>) => {
        setIsSubmitting(true)
        try {
            const response = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(lead),
            })

            if (response.ok) {
                router.push('/agent/dashboard')
            } else {
                const data = await response.json()
                alert(data.error || 'Failed to add lead')
                setIsSubmitting(false)
            }
        } catch (error) {
            console.error('Error adding lead:', error)
            alert('Failed to add lead')
            setIsSubmitting(false)
        }
    }

    return (
        <DashboardLayout user={user}>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Lead</h1>
                <p className="text-sm text-slate-500 mt-1">Create a new lead entry</p>
            </div>

            <div className="relative">
                {isSubmitting ? (
                    <div className="bg-white border border-slate-200 rounded-lg p-16 text-center">
                        <p className="text-sm text-slate-500">Adding lead...</p>
                    </div>
                ) : (
                    <AddLeadModal
                        isOpen={true}
                        onClose={() => router.push('/agent/dashboard')}
                        onSubmit={handleAddLead}
                    />
                )}
            </div>
        </DashboardLayout>
    )
}

