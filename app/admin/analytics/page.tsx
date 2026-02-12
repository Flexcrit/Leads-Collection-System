import { requireRole } from '@/lib/auth'
import AdminAnalyticsPage from '@/components/admin/AdminAnalyticsPage'

export default async function AnalyticsPage() {
  const user = await requireRole('admin')

  return <AdminAnalyticsPage user={user} />
}

