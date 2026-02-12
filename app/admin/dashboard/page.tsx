import { redirect } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default async function AdminDashboardPage() {
    const user = await requireRole('admin')

    return <AdminDashboard user={user} />
}

