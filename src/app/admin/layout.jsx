'use client'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import SideBar from './components/SideBar'
import NavBar from './components/NavBar'

export default function AdminLayout({ children }) {
    const pathname = usePathname()
    const router = useRouter()
    const { data: session, status } = useSession()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)
    const isLoginPage = pathname === '/admin/login'

    React.useEffect(() => {
        if (!isLoginPage && status === 'unauthenticated') {
            router.push('/admin/login')
        } else if (!isLoginPage && status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/')
        }
    }, [status, session, router, isLoginPage])

    React.useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    if (isLoginPage) return <>{children}</>

    if (status === 'loading') {
        return (
            <div className='min-h-screen bg-neutral-50 flex flex-col items-center justify-center gap-3'>
                <Loader2 className='w-8 h-8 text-neutral-900 animate-spin' />
                <p className='text-sm text-neutral-500 font-medium'>Loading admin panel...</p>
            </div>
        )
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
        return (
            <div className="flex h-screen overflow-hidden bg-neutral-50/80">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
                <SideBar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
                <main className="flex-1 overflow-y-auto w-full relative">
                    <NavBar onMenuClick={() => setSidebarOpen(true)} />
                    <div className="p-4 sm:p-6">
                        {children}
                    </div>
                </main>
            </div>
        )
    }

    return null
}