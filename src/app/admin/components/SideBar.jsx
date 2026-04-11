import React from 'react'
import { LogOut, BarChart3, LayoutDashboard, ShoppingCart, Package, Users, UserPlus, Settings, X, Store } from 'lucide-react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin' },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, path: '/admin/orders' },
    { id: 'products', label: 'Products', icon: Package, path: '/admin/products' },
    { id: 'users', label: 'Customers', icon: Users, path: '/admin/users' },
    { id: 'admins', label: 'Team', icon: UserPlus, path: '/admin/admins' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/analytics' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
]

const SideBar = ({ isOpen, setIsOpen }) => {
    const pathname = usePathname()

    const handleLogout = async () => {
        await signOut({ redirect: true, callbackUrl: '/admin/login' })
    }

    return (
        <aside className={`
            fixed lg:static inset-y-0 left-0 z-50 w-65 bg-[linear-gradient(180deg,#ffffff,#f4f8ff,#f5fbff)] border-r border-blue-200/60 h-screen overflow-hidden transition-transform duration-300 ease-in-out
            ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
            <div className='flex flex-col h-full'>
                {/* Brand Header */}
                <div className='px-6 py-5 border-b border-blue-100 shrink-0 flex items-center justify-between'>
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 bg-linear-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:from-blue-700 group-hover:to-indigo-700 transition-colors">
                            <Store className="w-4.5 h-4.5 text-white" />
                        </div>
                        <div>
                            <h1 className='text-[15px] font-semibold text-neutral-900 leading-tight'>Pandit Ji</h1>
                            <p className='text-[11px] text-neutral-400 font-medium tracking-wide uppercase'>Admin Panel</p>
                        </div>
                    </Link>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-1.5 hover:bg-neutral-100 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4 text-neutral-400" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className='flex-1 overflow-y-auto no-scrollbar px-3 py-4 space-y-0.5'>
                    <p className="px-3 mb-2 text-[10px] font-semibold text-blue-500 uppercase tracking-widest">Menu</p>
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.path
                        return (
                            <Link
                                key={item.id}
                                href={item.path}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${isActive
                                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-[0_12px_22px_-14px_rgba(37,99,235,0.75)]'
                                    : 'text-neutral-600 hover:text-blue-700 hover:bg-blue-50/70'
                                    }`}
                            >
                                <Icon className='w-4.5 h-4.5 shrink-0' />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className='px-3 py-4 border-t border-blue-100 shrink-0 space-y-1'>
                    <Link
                        href="/"
                        target="_blank"
                        className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-neutral-500 hover:text-blue-700 hover:bg-blue-50 transition-all'
                    >
                        <Store className='w-4.5 h-4.5' />
                        <span>View Storefront</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-red-500 hover:text-red-600 hover:bg-red-50 transition-all'
                    >
                        <LogOut className='w-4.5 h-4.5' />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    )
}

export default SideBar