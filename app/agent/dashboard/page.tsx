import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import AgentDashboard from '@/components/agent/AgentDashboard'

export default async function AgentDashboardPage() {
    const user = await requireRole('agent')

    return <AgentDashboard user={user} />
}

