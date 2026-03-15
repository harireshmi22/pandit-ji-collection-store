'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Shield, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AdminLoginPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showPassword, setShowPassword] = useState(false)

    React.useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            router.push('/admin')
        }
    }, [status, session, router])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false
            })

            if (result?.error) {
                if (result.status === 429 || result.error.includes('Too many')) {
                    setError('Too many login attempts. Please try again later.')
                } else {
                    setError('Invalid credentials. Please try again.')
                }
            } else {
                router.push('/admin')
                router.refresh()
            }
        } catch (err) {
            setError('Login failed. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    if (status === 'loading') {
        return (
            <div className='min-h-screen bg-neutral-50 flex items-center justify-center'>
                <Loader2 className='w-8 h-8 text-neutral-900 animate-spin' />
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-neutral-50 flex items-center justify-center p-4'>
            <div className='w-full max-w-sm'>
                {/* Brand */}
                <div className='text-center mb-8'>
                    <div className='inline-flex items-center justify-center w-14 h-14 bg-neutral-900 rounded-2xl mb-4'>
                        <Shield className='w-7 h-7 text-white' />
                    </div>
                    <h1 className='text-2xl font-semibold text-neutral-900'>Welcome back</h1>
                    <p className='text-sm text-neutral-500 mt-1'>Sign in to your admin account</p>
                </div>

                {/* Form Card */}
                <div className='bg-white rounded-2xl border border-neutral-200/60 p-6'>
                    {error && (
                        <div className='flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-100 text-red-700 rounded-xl mb-5'>
                            <AlertCircle className='w-4 h-4 shrink-0' />
                            <span className='text-sm'>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                className='w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div>
                            <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>
                                Password
                            </label>
                            <div className='relative'>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                    className='w-full px-3 py-2.5 pr-10 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'
                                    placeholder="Enter password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600'
                                >
                                    {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className='w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2'
                        >
                            {isLoading ? (
                                <Loader2 className='w-4 h-4 animate-spin' />
                            ) : (
                                <Lock className='w-4 h-4' />
                            )}
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <div className='text-center mt-5'>
                    <Link href="/" className='text-xs text-neutral-400 hover:text-neutral-600 transition-colors'>
                        Back to Store
                    </Link>
                </div>
            </div>
        </div>
    )
}