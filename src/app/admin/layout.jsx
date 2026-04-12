'use client'
import React from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
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
            <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(248,251,255,0.9),rgba(238,246,255,0.92),rgba(239,252,255,0.82))]">
                <aside className="hidden lg:block w-65 border-r border-blue-200/60 bg-white/70" />
                <main className="flex-1 overflow-y-auto w-full relative">
                    <div className="h-16 border-b border-blue-200/70 bg-white/88" />
                    <div className="p-4 sm:p-6 space-y-4">
                        <div className="h-8 w-48 rounded-xl bg-blue-100/70 animate-pulse" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-36 rounded-2xl border border-blue-200/60 bg-white animate-pulse" />
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (status === 'authenticated' && session?.user?.role === 'admin') {
        return (
            <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,rgba(248,251,255,0.9),rgba(238,246,255,0.92),rgba(239,252,255,0.82))]">
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 bg-blue-900/20 backdrop-blur-sm z-40 lg:hidden"
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