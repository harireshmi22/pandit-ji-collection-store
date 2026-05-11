'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Search, Heart, ShoppingBag, X, Menu, LogOut, User, Package } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useSession, signOut } from 'next-auth/react'

function useDebouncedValue(value, delay = 300) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}

export default function Navbar() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [searchQuery, setSearchQuery] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [suggestionsLoading, setSuggestionsLoading] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { cartItemCount, setIsCartOpen } = useCart()
    const { wishlistCount } = useWishlist()
    const desktopSearchRef = useRef(null)
    const mobileSearchRef = useRef(null)
    const debouncedSearchQuery = useDebouncedValue(searchQuery, 320)

    const handleSearch = (e) => {
        e.preventDefault()
        if (!searchQuery.trim()) return router.push('/shop')
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
        setSearchQuery('')
    }

    useEffect(() => {
        const q = debouncedSearchQuery.trim()
        if (q.length < 2) {
            setSuggestions([])
            setSuggestionsLoading(false)
            setActiveSuggestionIndex(-1)
            return
        }

        const controller = new AbortController()
        const fetchSuggestions = async () => {
            try {
                setSuggestionsLoading(true)
                const params = new URLSearchParams({ q, suggest: 'true' })
                const res = await fetch(`/api/search?${String(params)}`, { signal: controller.signal })
                const data = await res.json()
                if (data.success) {
                    setSuggestions(data.data || [])
                    setShowSuggestions(true)
                    setActiveSuggestionIndex(-1)
                }
            } catch {
                setSuggestions([])
            } finally {
                setSuggestionsLoading(false)
            }
        }

        fetchSuggestions()
        return () => controller.abort()
    }, [debouncedSearchQuery])

    useEffect(() => {
        const closeSuggestionsOnOutsideClick = (event) => {
            const inDesktop = desktopSearchRef.current?.contains(event.target)
            const inMobile = mobileSearchRef.current?.contains(event.target)
            if (
                !inDesktop &&
                !inMobile
            ) {
                setShowSuggestions(false)
                setActiveSuggestionIndex(-1)
            }
        }

        document.addEventListener('mousedown', closeSuggestionsOnOutsideClick)
        return () => document.removeEventListener('mousedown', closeSuggestionsOnOutsideClick)
    }, [])

    const onSuggestionClick = (item) => {
        const q = item?.name?.trim()
        if (!q) return
        setSearchQuery(q)
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
        router.push(`/search?q=${encodeURIComponent(q)}`)
    }

    const onSuggestionKeyDown = (e) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'ArrowDown' && suggestions.length > 0) {
                setShowSuggestions(true)
                setActiveSuggestionIndex(0)
                e.preventDefault()
            }
            return
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveSuggestionIndex((prev) => (prev + 1) % suggestions.length)
            return
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveSuggestionIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1))
            return
        }

        if (e.key === 'Escape') {
            e.preventDefault()
            setShowSuggestions(false)
            setActiveSuggestionIndex(-1)
            return
        }

        if (e.key === 'Enter' && activeSuggestionIndex >= 0) {
            e.preventDefault()
            onSuggestionClick(suggestions[activeSuggestionIndex])
        }
    }

    useEffect(() => {
        if (activeSuggestionIndex < 0) return
        const activeItem = document.getElementById(`navbar-suggestion-${activeSuggestionIndex}`)
        if (activeItem) {
            activeItem.scrollIntoView({ block: 'nearest' })
        }
    }, [activeSuggestionIndex])

    const renderSuggestions = () => {
        if (!showSuggestions || (!suggestionsLoading && suggestions.length === 0)) return null

        return (
            <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-blue-100 rounded-2xl shadow-xl overflow-hidden max-h-96 overflow-y-auto no-scrollbar z-50'>
                {suggestionsLoading && (
                    <div className='px-4 py-3 text-sm text-neutral-500'>Searching...</div>
                )}
                {!suggestionsLoading && suggestions.map((item, index) => (
                    <button
                        key={item._id || item.name}
                        id={`navbar-suggestion-${index}`}
                        type='button'
                        onClick={() => onSuggestionClick(item)}
                        className={`w-full px-4 py-3 text-left transition-colors ${activeSuggestionIndex === index ? 'bg-blue-50' : 'hover:bg-blue-50/60'}`}
                    >
                        <div className='flex items-center gap-3.5'>
                            <div className='relative w-12 h-12 rounded-xl bg-neutral-100 overflow-hidden shrink-0 ring-1 ring-neutral-100'>
                                {item.image ? (
                                    <Image src={item.image} fill alt={item.name} className='object-cover' sizes='48px' />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center text-[10px] text-neutral-400'>No image</div>
                                )}
                            </div>
                            <div className='min-w-0'>
                                <p className='text-sm font-medium text-neutral-900 truncate'>{item.name}</p>
                                <p className='text-xs text-neutral-600 truncate'>{item.brand || 'Product'}{item.price ? ` · ₹${item.price}` : ''}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        )
    }

    return (
        <header className='sticky top-0 z-50 bg-white/78 backdrop-blur-xl border-b border-blue-100/80'>
            <nav className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex items-center justify-between h-16'>
                    <Link href='/' className='text-lg font-semibold tracking-tight text-neutral-900 hover:text-blue-700 transition-colors'>
                        Pandit Ji Collection
                    </Link>

                    <div className='hidden md:flex items-center gap-8'>
                        <Link href='/shop' className='text-[13px] font-medium text-neutral-500 hover:text-blue-700 transition-colors tracking-wide uppercase'>Shop</Link>
                        <Link href='/shop?category=New%20in' className='text-[13px] font-medium text-neutral-500 hover:text-blue-700 transition-colors tracking-wide uppercase'>New In</Link>
                        <Link href='/about' className='text-[13px] font-medium text-neutral-500 hover:text-blue-700 transition-colors tracking-wide uppercase'>About</Link>
                    </div>

                    <div className='flex items-center gap-1'>
                        <div ref={desktopSearchRef} className='hidden md:block relative'>
                            <form onSubmit={handleSearch} className='flex items-center bg-white border border-neutral-200 rounded-full px-3.5 py-2 w-44 lg:w-72 xl:w-80 focus-within:bg-white focus-within:border-blue-300 transition-all shadow-sm'>
                                <Search className='w-3.5 h-3.5 text-neutral-400' />
                                <input
                                    type='text'
                                    placeholder='Search...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={onSuggestionKeyDown}
                                    className='w-full pl-2 text-sm bg-transparent border-0 border-transparent focus:border-transparent focus:ring-0 outline-none focus:outline-none placeholder-neutral-400 no-global-focus'
                                />
                            </form>
                            {renderSuggestions()}
                        </div>

                        <Link href='/wishlist' className='relative p-2.5 hover:bg-blue-50 rounded-full transition-colors'>
                            <Heart className='w-4.5 h-4.5 text-neutral-600' />
                            {wishlistCount > 0 && <span className='absolute top-1 right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center'>{wishlistCount}</span>}
                        </Link>

                        <button onClick={() => setIsCartOpen(true)} className='relative p-2.5 hover:bg-blue-50 rounded-full transition-colors'>
                            <ShoppingBag className='w-4.5 h-4.5 text-neutral-600' />
                            {cartItemCount > 0 && <span className='absolute top-1 right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-medium rounded-full flex items-center justify-center'>{cartItemCount}</span>}
                        </button>

                        <div className='hidden sm:flex items-center ml-1 pl-3 border-l border-neutral-100'>
                            {status === 'loading' ? (
                                <div className='w-8 h-8 rounded-full bg-neutral-100 animate-pulse' />
                            ) : session ? (
                                <div className='flex items-center gap-1'>
                                    <Link href='/orders' className='p-2.5 hover:bg-neutral-50 rounded-full transition-colors' title='Orders'>
                                        <Package className='w-4.5 h-4.5 text-neutral-600' />
                                    </Link>
                                    <Link href='/profile' className='flex items-center gap-2 px-2.5 py-1.5 hover:bg-blue-50 rounded-full transition-colors'>
                                        <div className='w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-medium'>{session.user?.name?.[0]?.toUpperCase() || 'U'}</div>
                                        <span className='text-sm font-medium text-neutral-700 hidden lg:block'>{session.user?.name?.split(' ')[0]}</span>
                                    </Link>
                                    <button onClick={() => signOut({ redirect: false }).then(() => router.push('/'))} className='p-2.5 hover:bg-red-50 rounded-full transition-colors text-neutral-400 hover:text-red-500' title='Logout'>
                                        <LogOut className='w-4 h-4' />
                                    </button>
                                </div>
                            ) : (
                                <Link href='/login' className='text-sm font-medium bg-blue-600 text-white px-5 py-2 rounded-full hover:bg-blue-700 transition-colors'>Sign In</Link>
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

                        <div ref={mobileSearchRef} className='mx-3 mb-2 mt-2 relative' style={{ width: 'calc(100% - 24px)', maxWidth: '100%' }}>
                            <form onSubmit={handleSearch} className='flex items-center bg-neutral-50 border border-neutral-300 rounded-full px-3.5 py-2 w-full focus-within:bg-white focus-within:border-neutral-300 transition-all'>
                                <Search className='w-4 h-4 text-neutral-400' />
                                <input
                                    type='text'
                                    placeholder='Search...'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={onSuggestionKeyDown}
                                    className='w-full pl-2 text-sm bg-transparent focus:ring-0 outline-none focus:outline-none placeholder-neutral-400 no-global-focus'
                                />
                            </form>
                            {renderSuggestions()}
                        </div>
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