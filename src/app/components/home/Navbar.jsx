'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, X, Menu, LogOut, User, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useSession, signOut } from 'next-auth/react'

export default function Navbar() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [searchQuery, setSearchQuery] = useState('')
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { cartItemCount, setIsCartOpen } = useCart()
    const { wishlistCount } = useWishlist()

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return router.push('/shop')
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setSearchQuery('')
    }

    return (
        <header className='sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100'>
            <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    <Link href='/' className='text-lg font-semibold tracking-tight'>
                        Pandit Ji Collection
                    </Link>

                    <div className='hidden md:flex items-center gap-8'>
                        <Link href='/shop' className='text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors tracking-wide uppercase'>Shop</Link>
                        <Link href='/shop?category=New%20in' className='text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors tracking-wide uppercase'>New In</Link>
                        <Link href='/about' className='text-[13px] font-medium text-neutral-500 hover:text-neutral-900 transition-colors tracking-wide uppercase'>About</Link>
                    </div>

                    <div className='flex items-center gap-1'>
                        <form onSubmit={handleSearch} className='hidden lg:flex items-center bg-neutral-50 border border-neutral-200 rounded-full px-3.5 py-2 w-52 focus-within:bg-white focus-within:border-neutral-300 transition-all'>
                            <Search className='w-3.5 h-3.5 text-neutral-400' />
                            <input type='text' placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-2 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder-neutral-400' />
                        </form>

                        <Link href='/wishlist' className='relative p-2.5 hover:bg-neutral-50 rounded-full transition-colors'>
                            <Heart className='w-[18px] h-[18px] text-neutral-600' />
                            {wishlistCount > 0 && <span className='absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center'>{wishlistCount}</span>}
                        </Link>

                        <button onClick={() => setIsCartOpen(true)} className='relative p-2.5 hover:bg-neutral-50 rounded-full transition-colors'>
                            <ShoppingBag className='w-[18px] h-[18px] text-neutral-600' />
                            {cartItemCount > 0 && <span className='absolute top-1 right-1 w-4 h-4 bg-neutral-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center'>{cartItemCount}</span>}
                        </button>

                        <div className='hidden sm:flex items-center ml-1 pl-3 border-l border-neutral-100'>
                            {status === 'loading' ? (
                                <div className='w-8 h-8 rounded-full bg-neutral-100 animate-pulse' />
                            ) : session ? (
                                <div className='flex items-center gap-1'>
                                    <Link href='/orders' className='p-2.5 hover:bg-neutral-50 rounded-full transition-colors' title='Orders'>
                                        <Package className='w-[18px] h-[18px] text-neutral-600' />
                                    </Link>
                                    <Link href='/profile' className='flex items-center gap-2 px-2.5 py-1.5 hover:bg-neutral-50 rounded-full transition-colors'>
                                        <div className='w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-medium'>{session.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                                        <span className='text-sm font-medium text-neutral-700 hidden lg:block'>{session.user?.name?.split(' ')[0]}</span>
                                    </Link>
                                    <button onClick={() => signOut({ redirect: false }).then(() => router.push('/'))} className='p-2.5 hover:bg-red-50 rounded-full transition-colors text-neutral-400 hover:text-red-500' title='Logout'>
                                        <LogOut className='w-4 h-4' />
                                    </button>
                                </div>
                            ) : (
                                <Link href='/login' className='text-sm font-medium bg-neutral-900 text-white px-5 py-2 rounded-full hover:bg-neutral-800 transition-colors'>Sign In</Link>
                            )}
                        </div>

                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className='md:hidden p-2.5 hover:bg-neutral-50 rounded-full transition-colors'>
                            {isMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className='md:hidden border-t border-neutral-100 py-4 space-y-1 animate-fade-in'>
                        <Link href='/shop' onClick={() => setIsMenuOpen(false)} className='block px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg'>Shop</Link>
                        <Link href='/shop?category=New%20in' onClick={() => setIsMenuOpen(false)} className='block px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg'>New In</Link>
                        <Link href='/about' onClick={() => setIsMenuOpen(false)} className='block px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg'>About</Link>
                        <Link href='/orders' onClick={() => setIsMenuOpen(false)} className='block px-3 py-2.5 text-sm font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg'>Orders</Link>
                        <form onSubmit={handleSearch} className='flex items-center bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-2.5 mt-2 focus-within:bg-white focus-within:border-neutral-300 transition-all'>
                            <Search className='w-4 h-4 text-neutral-400' />
                            <input type='text' placeholder='Search...' value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className='w-full pl-2 text-sm bg-transparent border-none outline-none focus:outline-none focus:ring-0 placeholder-neutral-400' />
                        </form>
                        <div className='pt-3 border-t border-neutral-100 mt-2'>
                            {session ? (
                                <div className='space-y-1'>
                                    <Link href='/profile' onClick={() => setIsMenuOpen(false)} className='flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 rounded-lg'><User className='w-4 h-4' /> Profile</Link>
                                    <button onClick={() => signOut({ redirect: false }).then(() => router.push('/'))} className='flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg'><LogOut className='w-4 h-4' /> Logout</button>
                                </div>
                            ) : (
                                <Link href='/login' onClick={() => setIsMenuOpen(false)} className='block text-center text-sm font-medium bg-neutral-900 text-white px-4 py-2.5 rounded-lg'>Sign In</Link>
                            )}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    )
}