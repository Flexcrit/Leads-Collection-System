import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/auth'

// Get all feedback for a lead
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const leadId = searchParams.get('leadId')

        if (!leadId) {
            return NextResponse.json(
                { error: 'Lead ID is required' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // RLS will filter based on user role
        const { data, error } = await supabase
            .from('lead_feedback')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching feedback:', error)
            return NextResponse.json(
                { error: `Failed to fetch feedback: ${error.message}. Please ensure the lead_feedback table exists.` },
                { status: 500 }
            )
        }

        // Fetch author names separately for each feedback
        const feedbackWithAuthors = await Promise.all(
            (data || []).map(async (feedback: any) => {
                const { data: authorData } = await supabase
                    .from('profiles')
                    .select('name')
                    .eq('id', feedback.author_id)
                    .single()

                return {
                    id: feedback.id,
                    leadId: feedback.lead_id,
                    authorId: feedback.author_id,
                    authorName: authorData?.name || 'Unknown',
                    authorRole: feedback.author_role,
                    message: feedback.message,
                    parentId: feedback.parent_id,
                    createdAt: feedback.created_at,
                    updatedAt: feedback.updated_at,
                }
            })
        )

        const transformedFeedback = feedbackWithAuthors

        return NextResponse.json(transformedFeedback)
    } catch (error) {
        console.error('Error fetching feedback:', error)
        return NextResponse.json(
            { error: 'Failed to fetch feedback' },
            { status: 500 }
        )
    }
}

// Create new feedback
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser()
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { leadId, message, parentId } = body

        if (!leadId || !message) {
            return NextResponse.json(
                { error: 'Lead ID and message are required' },
                { status: 400 }
            )
        }

        // Validate message length
        if (message.trim().length === 0) {
            return NextResponse.json(
                { error: 'Message cannot be empty' },
                { status: 400 }
            )
        }

        const supabase = await createClient()

        // First, verify the lead exists and user has access
        const { data: leadCheck, error: leadError } = await supabase
            .from('leads')
            .select('id')
            .eq('id', leadId)
            .single()

        if (leadError || !leadCheck) {
            console.error('Error verifying lead access:', leadError)
            return NextResponse.json(
                { error: 'Lead not found or access denied' },
                { status: 403 }
            )
        }

        // RLS will ensure proper access control
        const { data, error } = await supabase
            .from('lead_feedback')
            .insert([
                {
                    lead_id: leadId,
                    author_id: user.id,
                    author_role: user.role,
                    message: message.trim(),
                    parent_id: parentId || null,
                },
            ])
            .select()
            .single()

        if (error) {
            console.error('Error creating feedback:', error)
            console.error('Error details:', JSON.stringify(error, null, 2))
            return NextResponse.json(
                { error: `Failed to create feedback: ${error.message || 'Unknown error'}. Please ensure the lead_feedback table exists.` },
                { status: 500 }
            )
        }

        // Fetch author info separately if needed
        const { data: authorData } = await supabase
            .from('profiles')
            .select('id, name, role')
            .eq('id', user.id)
            .single()

        // Transform the response
        const transformedFeedback = {
            id: data.id,
            leadId: data.lead_id,
            authorId: data.author_id,
            authorName: authorData?.name || user.name || 'Unknown',
            authorRole: data.author_role,
            message: data.message,
            parentId: data.parent_id,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
        }

        return NextResponse.json(transformedFeedback, { status: 201 })
    } catch (error) {
        console.error('Error creating feedback:', error)
        return NextResponse.json(
            { error: 'Failed to create feedback' },
            { status: 500 }
        )
    }
}

