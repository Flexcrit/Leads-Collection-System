'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-client'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const supabase = createClient()

            // Debug: Log the attempt
            console.log('Attempting login for:', email.trim().toLowerCase())

            const { data, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim().toLowerCase(), // Normalize email
                password,
            })

            if (signInError) {
                // Log the full error for debugging
                console.error('Login error:', signInError)

                // Provide more helpful error messages
                let errorMessage = signInError.message

                // Check for specific error types
                if (signInError.message?.includes('Invalid login credentials') ||
                    signInError.message?.includes('invalid_grant') ||
                    signInError.status === 400) {
                    errorMessage = 'Invalid email or password. Please check: 1) User exists in Supabase (Authentication → Users), 2) Password is correct (Admin@2024!), 3) "Auto Confirm" was checked when creating user. Run database/verify-and-fix-admin.sql in Supabase SQL Editor to diagnose.'
                } else if (signInError.message?.includes('Email not confirmed') ||
                    signInError.message?.includes('email_not_confirmed')) {
                    errorMessage = 'Email not confirmed. Run: UPDATE auth.users SET email_confirmed_at = NOW() WHERE email = \'admin@leadmanagement.com\'; in Supabase SQL Editor.'
                } else if (signInError.message?.includes('User not found') ||
                    signInError.message?.includes('user_not_found')) {
                    errorMessage = 'User does not exist. Create it in Supabase Dashboard: Authentication → Users → Add user → Email: admin@leadmanagement.com, Password: Admin@2024!, ✅ Check "Auto Confirm"'
                } else {
                    errorMessage = `Login failed: ${signInError.message || 'Unknown error'}. Check browser console for details.`
                }

                setError(errorMessage)
                setIsLoading(false)
                return
            }

            if (data.user) {
                // Get user role
                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', data.user.id)
                    .single()

                if (profileError) {
                    console.error('Profile fetch error:', profileError)
                    setError('Profile not found. Please run the create-users.sql script in Supabase SQL Editor to create your profile.')
                    setIsLoading(false)
                    return
                }

                if (profile) {
                    router.push(`/${profile.role}/dashboard`)
                    router.refresh()
                } else {
                    setError('User profile not found. Please run the create-users.sql script in Supabase SQL Editor.')
                    setIsLoading(false)
                }
            }
        } catch (err) {
            setError('An error occurred. Please try again.')
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
                    <div className="mb-8 text-center">
                        <h1 className="text-2xl font-bold text-slate-900 mb-2">
                            Leads Management Dashboard
                        </h1>
                        <p className="text-sm text-slate-600">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        )}

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus-ring"
                                placeholder="you@example.com"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-slate-700 mb-2"
                            >
                                Password
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-blue-500 focus-ring"
                                placeholder="Enter your password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-slate-900 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 active:bg-slate-900 transition-colors focus-ring disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

