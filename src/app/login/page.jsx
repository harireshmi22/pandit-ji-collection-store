'use client'
export const dynamic = 'force-dynamic'
import React, { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { signIn } from 'next-auth/react'
import SignInPage from '@/components/ui/signin-page'

function LoginForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get('callbackUrl') || '/'
    const authError = searchParams.get('error')
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [rememberMe, setRememberMe] = useState(false)
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

    return (
        <div className='max-w-7xl mx-auto w-full'>
            <SignInPage
                email={formData.email}
                password={formData.password}
                rememberMe={rememberMe}
                showPassword={showPassword}
                isLoading={isLoading}
                error={error}
                onEmailChange={e => setFormData({ ...formData, email: e.target.value })}
                onPasswordChange={e => { setFormData({ ...formData, password: e.target.value }); setError('') }}
                onRememberMeChange={e => setRememberMe(e.target.checked)}
                onTogglePassword={() => setShowPassword(!showPassword)}
                onSubmit={handleSubmit}
                onGoogleSignIn={() => signIn('google', { callbackUrl })}
                forgotPasswordHref='/forgot-password'
                signUpHref='/signup'
            />
            <div className='py-6 text-center'>
                <a href='/admin/login' className='text-xs text-muted-foreground hover:text-foreground transition-colors'>Admin Login &rarr;</a>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='px-4 py-8 md:py-12'>
                <React.Suspense fallback={<div className='flex justify-center py-20 text-sm text-neutral-400'>Loading...</div>}>
                    <LoginForm />
                </React.Suspense>
            </div>
            <Footer />
        </div>
    )
}