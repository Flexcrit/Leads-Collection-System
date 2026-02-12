export interface Lead {
    id: string
    companyName: string
    phoneNumber: string
    emailAddress: string
    hasWebsite: boolean
    dateAdded: string
    status?: 'new' | 'contacted' | 'interested' | 'non-interested' | 'closed'
    assignedAgent?: string
    createdBy?: string
    responseTime?: number // in hours
}

export interface Agent {
    id: string
    name: string
    email: string
    leadsCount: number
    conversionRate: number
    avgResponseTime: number
}

export interface Metric {
    label: string
    value: string | number
    secondary?: string
    trend?: 'up' | 'down' | 'neutral'
}

