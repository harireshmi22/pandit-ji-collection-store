'use client'
export const dynamic = 'force-dynamic'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { User, Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react'

export default function SignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return }
        if (formData.password.length < 6) { setError('Password must be at least 6 characters'); setIsLoading(false); return }
        try {
            const res = await fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: formData.name, email: formData.email, password: formData.password }) })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Sign up failed')
            setSuccess(true)
            setTimeout(() => router.push('/login'), 1500)
        } catch (err) { setError(err.message || 'Sign up failed') }
        finally { setIsLoading(false) }
    }

    const inputClass = 'w-full h-11 pl-10 pr-3 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-300'

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='px-4 py-8 md:py-12'>
                <div className='max-w-7xl mx-auto w-full min-h-[80vh] flex flex-col lg:flex-row border border-border rounded-2xl overflow-hidden bg-background'>
                    <div className='flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8'>
                        <div className='w-full max-w-md space-y-8'>
                            <div className='text-center space-y-2'>
                                <h1 className='text-3xl font-bold tracking-tight text-foreground'>Create account</h1>
                                <p className='text-muted-foreground'>Join us and start shopping with confidence</p>
                            </div>

                            <div className='bg-card border border-border rounded-lg p-6 sm:p-8 shadow-sm'>
                                {error && <div className='mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive'>{error}</div>}
                                {success && <div className='mb-4 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700'>Account created! Redirecting to login...</div>}

                                <form onSubmit={handleSubmit} className='space-y-6'>
                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor='name'>Full Name</label>
                                        <div className='relative'>
                                            <User className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                            <input id='name' type='text' name='name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className={inputClass} placeholder='John Doe' />
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor='email'>Email</label>
                                        <div className='relative'>
                                            <Mail className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                            <input id='email' type='email' name='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className={inputClass} placeholder='you@example.com' />
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor='password'>Password</label>
                                        <div className='relative'>
                                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                            <input id='password' type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={e => { setFormData({ ...formData, password: e.target.value }); setError('') }} required className={`${inputClass} pr-10`} placeholder='At least 6 characters' />
                                            <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300' aria-label={showPassword ? 'Hide password' : 'Show password'}>
                                                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                            </button>
                                        </div>
                                    </div>

                                    <div className='space-y-2'>
                                        <label className='text-sm font-medium text-foreground' htmlFor='confirmPassword'>Confirm Password</label>
                                        <div className='relative'>
                                            <Lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                                            <input id='confirmPassword' type={showConfirm ? 'text' : 'password'} name='confirmPassword' value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required className={`${inputClass} pr-10`} placeholder='Confirm your password' />
                                            <button type='button' onClick={() => setShowConfirm(!showConfirm)} className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-300' aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                                                {showConfirm ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
                                            </button>
                                        </div>
                                    </div>

                                    <button type='submit' disabled={isLoading || success} className='w-full h-11 rounded-md font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background flex items-center justify-center gap-2 bg-primary text-primary-foreground shadow-lg hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed'>
                                        {isLoading ? 'Creating account...' : success ? 'Success!' : 'Create Account'}
                                    </button>
                                </form>

                                <p className='mt-6 text-center text-sm text-muted-foreground'>
                                    Already have an account?{' '}
                                    <Link href='/login' className='text-primary hover:opacity-80 font-medium transition-opacity duration-300'>Sign in</Link>
                                </p>
                            </div>
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
                                    <ShieldCheck className='h-8 w-8' />
                                </div>
                                <h2 className='text-3xl lg:text-4xl font-bold text-white'>Your Account, Your Space</h2>
                                <p className='text-lg text-white/80'>Create your account to track orders, save favorites, and enjoy a personalized shopping experience.</p>
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
            <Footer />
        </div>
    )
}