import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import AdminAgentsPage from '@/components/admin/AdminAgentsPage'

export default async function AgentsPage() {
  const user = await requireRole('admin')

  return <AdminAgentsPage user={user} />
}

