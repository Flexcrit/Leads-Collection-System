'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import AddLeadModal from '@/components/AddLeadModal'
import { Lead } from '@/types/lead'

export default function AddLeadPage() {
    const router = useRouter()
    const [isModalOpen, setIsModalOpen] = useState(true)

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
                router.push('/leads')
            }
        } catch (error) {
            console.error('Error adding lead:', error)
        }
    }

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add Lead</h1>
                <p className="text-sm text-slate-500 mt-1">Create a new lead entry</p>
            </div>

            {isModalOpen && (
                <AddLeadModal
                    isOpen={isModalOpen}
                    onClose={() => router.push('/leads')}
                    onSubmit={handleAddLead}
                />
            )}
        </DashboardLayout>
    )
}

