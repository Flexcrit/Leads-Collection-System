import { requireRole } from '@/lib/auth'
import AgentLeadDetailPage from '@/components/agent/AgentLeadDetailPage'

interface PageProps {
  params: {
    id: string
  }
}

export default async function LeadDetailPage({ params }: PageProps) {
  const user = await requireRole('agent')

  return <AgentLeadDetailPage user={user} leadId={params.id} />
}

