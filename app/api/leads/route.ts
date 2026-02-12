import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const supabase = await createClient()
    
    // RLS will automatically filter based on user role
    const { data, error } = await supabase
      .from('leads')
      .select('*, assigned_agent:profiles!leads_assigned_agent_fkey(name), created_by_profile:profiles!leads_created_by_fkey(name)')
      .order('date_added', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      )
    }

    // Transform Supabase response to match frontend format
    const transformedLeads = (data || []).map((lead: any) => ({
      id: lead.id,
      companyName: lead.company_name,
      phoneNumber: lead.phone_number,
      emailAddress: lead.email_address,
      hasWebsite: lead.has_website,
      status: lead.status,
      dateAdded: lead.date_added,
      assignedAgent: lead.assigned_agent?.name || 'Unassigned',
      createdBy: lead.created_by_profile?.name || 'Unknown',
    }))

    return NextResponse.json(transformedLeads)
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

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
    const { companyName, phoneNumber, emailAddress, hasWebsite } = body

    // Validate required fields
    if (!companyName || !phoneNumber || !emailAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // RLS will ensure only agents can insert and created_by is set correctly
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          company_name: companyName,
          phone_number: phoneNumber,
          email_address: emailAddress,
          has_website: hasWebsite || false,
          created_by: user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error adding lead:', error)
      return NextResponse.json(
        { error: 'Failed to add lead' },
        { status: 500 }
      )
    }

    // Transform Supabase response to match frontend format
    const newLead = {
      id: data.id,
      companyName: data.company_name,
      phoneNumber: data.phone_number,
      emailAddress: data.email_address,
      hasWebsite: data.has_website,
      status: data.status,
      dateAdded: data.date_added,
    }

    return NextResponse.json(newLead, { status: 201 })
  } catch (error) {
    console.error('Error adding lead:', error)
    return NextResponse.json(
      { error: 'Failed to add lead' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Only admins can delete leads
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // RLS will ensure only admins can delete
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting lead:', error)
      return NextResponse.json(
        { error: 'Failed to delete lead' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting lead:', error)
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    )
  }
}

