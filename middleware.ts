import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        'https://nwqerhyexssquzgeudoy.supabase.co',
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cWVyaHlleHNzcXV6Z2V1ZG95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyODA1MDUsImV4cCI6MjA4Mjg1NjUwNX0.n6Z71lE_Vy_WHjnsJ_HhtyArS8Y8BRVX6jVvlRSgizc',
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const pathname = request.nextUrl.pathname

    // Public routes
    if (pathname === '/login') {
        if (user) {
            // Get user role and redirect to appropriate dashboard
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single()

            if (profile) {
                return NextResponse.redirect(new URL(`/${profile.role}/dashboard`, request.url))
            }
        }
        return response
    }

    // Protected routes - require authentication
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // Get user role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (!profile) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    const userRole = profile.role

    // Admin routes
    if (pathname.startsWith('/admin')) {
        if (userRole !== 'admin') {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
        }
        return response
    }

    // Agent routes
    if (pathname.startsWith('/agent')) {
        if (userRole !== 'agent') {
            return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
        }
        return response
    }

    // Root redirect based on role
    if (pathname === '/') {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
    }

    // Legacy routes redirect
    if (pathname.startsWith('/leads') || pathname.startsWith('/add-lead') ||
        pathname.startsWith('/overview') || pathname.startsWith('/performance') ||
        pathname.startsWith('/reports') || pathname.startsWith('/agents') ||
        pathname.startsWith('/tasks') || pathname.startsWith('/non-interested')) {
        return NextResponse.redirect(new URL(`/${userRole}/dashboard`, request.url))
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}

