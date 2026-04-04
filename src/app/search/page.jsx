'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Image from 'next/image'
import Footer from '../components/home/Footer'
import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import { Heart, Loader, Search, ArrowRight } from 'lucide-react'

function SearchContent() {
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const searchParams = useSearchParams()
    const searchQuery = searchParams?.get('q') || ''

    const fetchProducts = useCallback(async () => {
        if (!searchQuery.trim()) { setProducts([]); setLoading(false); return }
        try {
            setLoading(true); setError(null)
            const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}`)
            const data = await res.json()
            if (data.success) setProducts(data.data)
            else setError('Failed to load products')
        } catch { setError('Error fetching products') }
        finally { setLoading(false) }
    }, [searchQuery])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                {/* Search Bar */}
                <form onSubmit={e => { e.preventDefault(); const q = new FormData(e.currentTarget).get('search'); if (q) window.location.href = `/search?q=${encodeURIComponent(q.trim())}` }} className='flex gap-3 max-w-xl mb-8'>
                    <div className='flex-1 relative'>
                        <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                        <input type='text' name='search' defaultValue={searchQuery} placeholder='Search products...' className='w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-full text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none' />
                    </div>
                    <button type='submit' className='px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer'>Search</button>
                </form>

                {/* Header */}
                {searchQuery && <p className='text-sm text-neutral-500 mb-6'>{loading ? 'Searching...' : `${products.length} result${products.length !== 1 ? 's' : ''} for "${searchQuery}"`}</p>}

                {loading ? (
                    <div className='flex justify-center py-20'><Loader className='w-6 h-6 text-neutral-300 animate-spin' /></div>
                ) : error ? (
                    <div className='text-center py-20'>
                        <p className='text-sm text-red-600 mb-4'>{error}</p>
                        <button onClick={fetchProducts} className='text-sm text-neutral-900 font-medium hover:underline cursor-pointer'>Retry</button>
                    </div>
                ) : !searchQuery ? (
                    <div className='text-center py-20'>
                        <Search className='w-10 h-10 text-neutral-200 mx-auto mb-3' />
                        <p className='text-sm text-neutral-500'>Enter a search term to find products</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className='text-center py-20'>
                        <Search className='w-10 h-10 text-neutral-200 mx-auto mb-3' />
                        <p className='text-sm text-neutral-500 mb-4'>No products found for &ldquo;{searchQuery}&rdquo;</p>
                        <Link href='/shop' className='inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-medium'>Browse Shop <ArrowRight className='w-4 h-4' /></Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {products.map(p => (
                            <div key={p._id} className='group relative'>
                                <Link href={`/shop/${p._id}`} className='block'>
                                    <div className='relative aspect-3/4 bg-neutral-100 rounded-2xl overflow-hidden mb-2'>
                                        {p.image ? <Image src={p.image} fill alt={p.name} className='object-cover group-hover:scale-105 transition-transform duration-500' sizes='(max-width:640px) 50vw, 25vw' /> : <div className='absolute inset-0 flex items-center justify-center text-neutral-300 text-xs'>No image</div>}
                                    </div>
                                    <h3 className='text-xs font-medium text-neutral-900 truncate'>{p.name}</h3>
                                    <p className='text-xs font-semibold text-neutral-900 mt-0.5'>${p.price}</p>
                                </Link>
                                <button onClick={() => toggleWishlist({ id: p._id, name: p.name, price: p.price, image: p.image })} className='absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-10 cursor-pointer'>
                                    <Heart className={`w-4 h-4 ${isInWishlist(p._id) ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className='min-h-screen bg-white flex items-center justify-center'><Loader className='w-6 h-6 text-neutral-300 animate-spin' /></div>}>
            <SearchContent />
        </Suspense>
    )
}