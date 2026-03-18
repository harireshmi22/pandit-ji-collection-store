'use client'
export const dynamic = 'force-dynamic'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import { signIn } from 'next-auth/react'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const authError = searchParams.get('error')
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState(() => {
        // Map NextAuth error codes to user-friendly messages
        if (authError === 'Configuration') return 'Server configuration error. Please try again.'
        if (authError === 'CredentialsSignin') return 'Invalid email or password.'
        if (authError) return 'Authentication error. Please try again.'
        return ''
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')
        try {
            const result = await signIn('credentials', { email: formData.email, password: formData.password, redirect: false })
            if (result?.error) {
                setError(result.status === 429 || result.error.includes('Too many') ? 'Too many login attempts. Please try again later.' : 'Please check your email or password.')
            } else { router.push(callbackUrl); router.refresh() }
        } catch { setError('Too many login attempts. Please try again later.') }
        finally { setIsLoading(false) }
    }

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'

    return (
        <div className='max-w-sm mx-auto'>
            <div className='text-center mb-8'>
                <h1 className='text-2xl font-bold text-neutral-900 mb-2'>Welcome back</h1>
                <p className='text-sm text-neutral-500'>Sign in to your account</p>
            </div>

            {error && (
                <div className='bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2'>
                    <AlertCircle className='w-4 h-4 shrink-0' /> <span>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label className='block text-xs text-neutral-400 mb-1.5'>Email</label>
                    <input type='email' name='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className={inputClass} placeholder='you@example.com' />
                </div>
                <div>
                    <label className='block text-xs text-neutral-400 mb-1.5'>Password</label>
                    <div className='relative'>
                        <input type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={e => { setFormData({ ...formData, password: e.target.value }); setError('') }} required className={`${inputClass} pr-10`} placeholder='Enter your password' />
                        <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer'>
                            {showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
                        </button>
                    </div>
                </div>

                <button type='submit' disabled={isLoading} className='w-full bg-neutral-900 text-white py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer'>
                    {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

<<<<<<< HEAD
            <p className='mt-6 text-center text-sm text-neutral-500'>
                Don&apos;t have an account?{' '}
                <Link href='/signup' className='text-neutral-900 font-medium hover:underline'>Sign up</Link>
            </p>

=======
            <div className='flex justify-between items-center'>
                <p className='mt-6 text-center text-sm text-neutral-500'>
                    Don&apos;t have an account?{' '}
                    <Link href='/signup' className='text-neutral-900 font-medium hover:underline'>Sign up</Link>
                </p>


                <p className='mt-6 text-center text-sm text-neutral-500'>
                    <Link href='/forgot-password' className='text-neutral-900 font-medium hover:underline'>forgot password?</Link>
                </p>
            </div>
>>>>>>> 01ca697 (files added with fixed bugs)
            <div className='mt-6 pt-6 border-t border-neutral-100 text-center'>
                <Link href='/admin/login' className='text-xs text-neutral-400 hover:text-neutral-600 transition-colors'>Admin Login &rarr;</Link>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='px-4 py-16 md:py-24'>
                <React.Suspense fallback={<div className='flex justify-center py-20 text-sm text-neutral-400'>Loading...</div>}>
                    <LoginForm />
                </React.Suspense>
            </div>
            <Footer />
        </div>
    )
}