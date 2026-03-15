import React from 'react'
import Link from 'next/link'
import { Menu, User, Bell, Search } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'

const pageTitles = {
    '/admin': 'Dashboard',
    '/admin/orders': 'Orders',
    '/admin/products': 'Products',
    '/admin/users': 'Customers',
    '/admin/admins': 'Team',
    '/admin/analytics': 'Analytics',
    '/admin/settings': 'Settings',
}

const NavBar = ({ onMenuClick }) => {
    const { data: session } = useSession()
    const pathname = usePathname()
    const pageTitle = pageTitles[pathname] || 'Dashboard'

    return (
        <div className="bg-white/80 backdrop-blur-md border-b border-neutral-200/60 px-4 sm:px-6 py-3 flex justify-between items-center sticky top-0 z-30">
            <div className="flex items-center gap-3">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                    aria-label="Toggle Sidebar"
                >
                    <Menu className="w-5 h-5 text-neutral-500" />
                </button>
                <div>
                    <h2 className="text-lg font-semibold text-neutral-900">{pageTitle}</h2>
                    <p className="text-xs text-neutral-400 hidden sm:block">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-neutral-100 rounded-xl transition-colors relative">
                    <Bell className="w-[18px] h-[18px] text-neutral-400" />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="h-7 w-px bg-neutral-200 mx-1 hidden sm:block"></div>

                <div className="flex items-center gap-2.5 pl-1">
                    <div className="text-right hidden sm:block">
                        <p className="text-[13px] font-medium text-neutral-900 leading-tight">{session?.user?.name || 'Admin'}</p>
                        <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium">{session?.user?.role || 'admin'}</p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 flex items-center justify-center text-white ring-2 ring-neutral-100">
                        {session?.user?.name ? (
                            <span className="font-semibold text-sm">{session.user.name.charAt(0).toUpperCase()}</span>
                        ) : (
                            <User className="w-4 h-4" />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NavBar