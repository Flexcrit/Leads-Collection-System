import { requireRole } from '@/lib/auth'
import AdminLeadDetailPage from '@/components/admin/AdminLeadDetailPage'

interface PageProps {
    params: {
        id: string
    }
}

export default async function LeadDetailPage({ params }: PageProps) {
    const user = await requireRole('admin')

    return <AdminLeadDetailPage user={user} leadId={params.id} />
}

