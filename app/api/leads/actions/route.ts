import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/auth'

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
    const { leadId, actionType, notes } = body

    if (!leadId || !actionType) {
      return NextResponse.json(
        { error: 'Lead ID and action type are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // RLS will ensure agent can only add actions to their own leads
    const { data, error } = await supabase
      .from('lead_actions')
      .insert([
        {
          lead_id: leadId,
          agent_id: user.id,
          action_type: actionType,
          notes: notes || null,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error adding action:', error)
      return NextResponse.json(
        { error: 'Failed to add action' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding action:', error)
    return NextResponse.json(
      { error: 'Failed to add action' },
      { status: 500 }
    )
  }
}

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
      .from('lead_actions')
      .select('*, agent:profiles!lead_actions_agent_id_fkey(name)')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching actions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch actions' },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching actions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch actions' },
      { status: 500 }
    )
  }
}

