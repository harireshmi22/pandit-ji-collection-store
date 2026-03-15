'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader } from 'lucide-react'

export default function ProtectedRoute({ children, requireAdmin = false }) {
    const { data: session, status } = useSession()
    const router = useRouter()

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login')
            return
        }
        if (status === 'authenticated' && requireAdmin && session?.user?.role !== 'admin') {
            router.push('/')
        }
    }, [session, status, requireAdmin, router])

    if (status === 'loading') {
        return (
            <div className='min-h-screen flex items-center justify-center'>
                <Loader className='w-6 h-6 text-neutral-300 animate-spin' />
            </div>
        )
    }

    if (!session || (requireAdmin && session?.user?.role !== 'admin')) {
        return null
    }

    return <>{children}</>
}




