import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-admin'

// Get all agents (admin only)
export async function GET() {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const supabase = await createClient()

        // Get all agent profiles
        const { data: agents, error } = await supabase
            .from('profiles')
            .select('id, name, role, created_at')
            .eq('role', 'agent')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching agents:', error)
            return NextResponse.json(
                { error: 'Failed to fetch agents' },
                { status: 500 }
            )
        }

        // Get emails from auth.users (requires admin client)
        try {
            const adminClient = createAdminClient()
            const agentsWithEmails = await Promise.all(
                (agents || []).map(async (agent: any) => {
                    try {
                        const { data: userData } = await adminClient.auth.admin.getUserById(agent.id)
                        return {
                            id: agent.id,
                            name: agent.name,
                            role: agent.role,
                            email: userData?.user?.email || 'N/A',
                            created_at: agent.created_at,
                        }
                    } catch (err) {
                        // If we can't get email, return without it
                        return {
                            id: agent.id,
                            name: agent.name,
                            role: agent.role,
                            email: 'N/A',
                            created_at: agent.created_at,
                        }
                    }
                })
            )
            return NextResponse.json(agentsWithEmails)
        } catch (err) {
            console.error('Error fetching emails:', err)
            // If admin client fails, return without emails
            const agentsWithoutEmails = (agents || []).map((agent: any) => ({
                ...agent,
                email: 'N/A',
            }))
            return NextResponse.json(agentsWithoutEmails)
        }
    } catch (error) {
        console.error('Error fetching agents:', error)
        return NextResponse.json(
            { error: 'Failed to fetch agents' },
            { status: 500 }
        )
    }
}

// Create new agent (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { email, password, name } = body

        // Validate required fields
        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Email, password, and name are required' },
                { status: 400 }
            )
        }

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email format' },
                { status: 400 }
            )
        }

        // Validate password strength
        if (password.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            )
        }

        // Use admin client to create user
        let adminClient
        try {
            adminClient = createAdminClient()
        } catch (error: any) {
            console.error('Failed to create admin client:', error)
            return NextResponse.json(
                { error: 'Server configuration error. Service role key not set. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local and restart the server.' },
                { status: 500 }
            )
        }

        const { data: userData, error: createError } = await adminClient.auth.admin.createUser({
            email: email.trim().toLowerCase(),
            password,
            email_confirm: true, // Auto confirm
            user_metadata: {
                name: name,
            },
        })

        if (createError) {
            console.error('Error creating user:', createError)
            if (createError.message?.includes('already registered') || createError.message?.includes('already exists')) {
                return NextResponse.json(
                    { error: 'User with this email already exists' },
                    { status: 400 }
                )
            }
            return NextResponse.json(
                { error: `Failed to create user: ${createError.message || 'Unknown error'}` },
                { status: 500 }
            )
        }

        if (!userData.user) {
            return NextResponse.json(
                { error: 'User creation failed' },
                { status: 500 }
            )
        }

        // Create profile with agent role
        const supabase = await createClient()
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert([
                {
                    id: userData.user.id,
                    role: 'agent',
                    name: name,
                },
            ])
            .select()
            .single()

        if (profileError) {
            console.error('Error creating profile:', profileError)
            // Try to delete the user if profile creation fails
            try {
                await adminClient.auth.admin.deleteUser(userData.user.id)
            } catch (deleteError) {
                console.error('Failed to delete user after profile creation error:', deleteError)
            }
            return NextResponse.json(
                { error: `Failed to create agent profile: ${profileError.message || 'Unknown error'}` },
                { status: 500 }
            )
        }

        return NextResponse.json(
            {
                id: profile.id,
                email: userData.user.email,
                name: profile.name,
                role: profile.role,
            },
            { status: 201 }
        )
    } catch (error: any) {
        console.error('Error creating agent:', error)
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
        })

        if (error.message?.includes('Service role key') || error.message?.includes('not configured')) {
            return NextResponse.json(
                { error: 'Server configuration error. Please set SUPABASE_SERVICE_ROLE_KEY in .env.local and restart the dev server.' },
                { status: 500 }
            )
        }

        return NextResponse.json(
            { error: `Failed to create agent: ${error.message || 'Unknown error'}` },
            { status: 500 }
        )
    }
}

