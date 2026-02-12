import { requireRole } from '@/lib/auth'
import AgentAddLeadPage from '@/components/agent/AgentAddLeadPage'

export default async function AddLeadPage() {
  const user = await requireRole('agent')

  return <AgentAddLeadPage user={user} />
}

