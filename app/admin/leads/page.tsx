import { requireRole } from '@/lib/auth'
import AdminLeadsPage from '@/components/admin/AdminLeadsPage'

export default async function LeadsPage() {
    const user = await requireRole('admin')

    return <AdminLeadsPage user={user} />
}

