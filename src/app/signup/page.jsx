'use client'
export const dynamic = 'force-dynamic'
import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react'

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

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='px-4 py-16 md:py-24'>
                <div className='max-w-sm mx-auto'>
                    <div className='text-center mb-8'>
                        <h1 className='text-2xl font-bold text-neutral-900 mb-2'>Create account</h1>
                        <p className='text-sm text-neutral-500'>Join us and start shopping</p>
                    </div>

                    {error && <div className='bg-red-50 text-red-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2'><AlertCircle className='w-4 h-4 shrink-0' /> {error}</div>}
                    {success && <div className='bg-emerald-50 text-emerald-700 px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2'><CheckCircle className='w-4 h-4 shrink-0' /> Account created! Redirecting...</div>}

                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label className='block text-xs text-neutral-400 mb-1.5'>Full Name</label>
                            <input type='text' name='name' value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className={inputClass} placeholder='John Doe' />
                        </div>
                        <div>
                            <label className='block text-xs text-neutral-400 mb-1.5'>Email</label>
                            <input type='email' name='email' value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required className={inputClass} placeholder='you@example.com' />
                        </div>
                        <div>
                            <label className='block text-xs text-neutral-400 mb-1.5'>Password</label>
                            <div className='relative'>
                                <input type={showPassword ? 'text' : 'password'} name='password' value={formData.password} onChange={e => { setFormData({ ...formData, password: e.target.value }); setError('') }} required className={`${inputClass} pr-10`} placeholder='At least 6 characters' />
                                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer'>{showPassword ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}</button>
                            </div>
                        </div>
                        <div>
                            <label className='block text-xs text-neutral-400 mb-1.5'>Confirm Password</label>
                            <div className='relative'>
                                <input type={showConfirm ? 'text' : 'password'} name='confirmPassword' value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required className={`${inputClass} pr-10`} placeholder='Confirm your password' />
                                <button type='button' onClick={() => setShowConfirm(!showConfirm)} className='absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer'>{showConfirm ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}</button>
                            </div>
                        </div>

                        <button type='submit' disabled={isLoading || success} className='w-full bg-neutral-900 text-white py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-50 cursor-pointer'>
                            {isLoading ? 'Creating account...' : success ? 'Success!' : 'Create Account'}
                        </button>
                    </form>

                    <p className='mt-6 text-center text-sm text-neutral-500'>
                        Already have an account?{' '}
                        <Link href='/login' className='text-neutral-900 font-medium hover:underline'>Sign in</Link>
                    </p>
                </div>
            </div>
            <Footer />
        </div>
    )
}