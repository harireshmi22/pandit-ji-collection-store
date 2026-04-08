'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Shield, Loader2, Eye, EyeOff, Mail } from 'lucide-react'
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
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <Loader2 className='w-8 h-8 text-foreground animate-spin' />
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-background p-4 sm:p-6 lg:p-8'>
            <div className='w-full max-w-7xl mx-auto min-h-[88vh] rounded-2xl border border-border overflow-hidden flex flex-col lg:flex-row'>
                <div className='flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8'>
                    <div className='w-full max-w-md space-y-8'>
                        <div className='text-center space-y-2'>
                            <h1 className='text-3xl font-bold tracking-tight text-foreground'>Admin Access</h1>
                            <p className='text-muted-foreground'>Sign in to your admin account</p>
                        </div>

                        <div className='bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm'>
                            {error && (
                                <div className='mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className='space-y-6'>
                                <div className='space-y-2'>
                                    <label htmlFor='admin-email' className='text-sm font-medium text-foreground'>
                                        Email
                                    </label>
                                    <div className='relative'>
                                        <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                        <input
                                            id='admin-email'
                                            type='email'
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            required
                                            className='w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300'
                                            placeholder='admin@example.com'
                                        />
                                    </div>
                                </div>

                                <div className='space-y-2'>
                                    <label htmlFor='admin-password' className='text-sm font-medium text-foreground'>
                                        Password
                                    </label>
                                    <div className='relative'>
                                        <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                        <input
                                            id='admin-password'
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            required
                                            className='w-full h-11 pl-10 pr-10 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300'
                                            placeholder='Enter password'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => setShowPassword(!showPassword)}
                                            className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300'
                                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        >
                                            {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                        </button>
                                    </div>
                                </div>

                                <button
                                    type='submit'
                                    disabled={isLoading}
                                    className='w-full h-11 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'
                                >
                                    {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <Lock className='h-4 w-4' />}
                                    {isLoading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>

                            <p className='mt-6 text-center text-sm text-muted-foreground'>
                                Need customer login?{' '}
                                <Link href='/login' className='text-primary hover:opacity-80 font-medium transition-opacity duration-300'>
                                    Go to User Login
                                </Link>
                            </p>
                        </div>

                        <p className='text-center text-xs text-muted-foreground'>
                            <Link href='/' className='hover:text-foreground transition-colors'>
                                Back to Store
                            </Link>
                        </p>
                    </div>
                </div>

                <div className='hidden lg:flex flex-1 relative overflow-hidden'>
                    <div className='absolute inset-0 bg-cover bg-center' style={{ backgroundImage: "url('https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1600&q=80')" }} />
                    <div className='absolute inset-0 bg-linear-to-br from-slate-900/80 via-indigo-900/70 to-slate-900/85' />

                    <div className='absolute inset-0'>
                        <div className='absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob' />
                        <div className='absolute top-0 -right-4 w-72 h-72 bg-cyan-500/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-2000' />
                        <div className='absolute -bottom-8 left-20 w-72 h-72 bg-indigo-500/30 rounded-full mix-blend-screen filter blur-xl opacity-70 animate-blob animation-delay-4000' />
                    </div>

                    <div className='relative z-10 flex items-center justify-center p-8 lg:p-12 w-full'>
                        <div className='text-center space-y-6 max-w-md'>
                            <div className='inline-flex rounded-full p-3 bg-white/10 backdrop-blur-sm text-white mb-4'>
                                <Shield className='h-8 w-8' />
                            </div>
                            <h2 className='text-3xl lg:text-4xl font-bold text-white'>Admin Control Center</h2>
                            <p className='text-lg text-white/80'>Securely manage products, orders, and users from one trusted dashboard.</p>
                            <div className='flex justify-center gap-2 pt-2'>
                                <div className='w-2 h-2 rounded-full bg-white/60' />
                                <div className='w-2 h-2 rounded-full bg-white/80' />
                                <div className='w-2 h-2 rounded-full bg-white' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}