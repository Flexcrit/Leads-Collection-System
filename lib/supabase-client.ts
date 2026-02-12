import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        'https://nwqerhyexssquzgeudoy.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cWVyaHlleHNzcXV6Z2V1ZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyODA1MDUsImV4cCI6MjA4Mjg1NjUwNX0.n6Z71lE_Vy_WHjnsJ_HhtyArS8Y8BRVX6jVvlRSgizc'
    )
}

