import { createClient } from './supabase-server'
import { redirect } from 'next/navigation'

export interface UserProfile {
    id: string
    role: 'admin' | 'agent'
    name: string
    email?: string
}

export async function getCurrentUser(): Promise<UserProfile | null> {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return null
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, name')
        .eq('id', user.id)
        .single()

    if (profileError || !profile) {
        return null
    }

    return {
        id: profile.id,
        role: profile.role as 'admin' | 'agent',
        name: profile.name,
        email: user.email,
    }
}

export async function requireAuth(): Promise<UserProfile> {
    const user = await getCurrentUser()
    if (!user) {
        redirect('/login')
    }
    return user
}

export async function requireRole(role: 'admin' | 'agent'): Promise<UserProfile> {
    const user = await requireAuth()
    if (user.role !== role) {
        redirect(`/${user.role}/dashboard`)
    }
    return user
}

