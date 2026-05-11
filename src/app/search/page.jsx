'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Image from 'next/image'
import Footer from '../components/home/Footer'
import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import { Heart, Loader, Search, ArrowRight, SlidersHorizontal } from 'lucide-react'
import { getOptimizedProductImage, isCloudinaryUrl } from '@/lib/image-utils'

function useDebouncedValue(value, delay = 350) {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])

    return debounced
}

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'newest', label: 'Newest' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
]

function SearchContent() {
    const router = useRouter()
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [products, setProducts] = useState([])
    const [facets, setFacets] = useState({ categories: [], brands: [] })
    const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 })
    const [suggestions, setSuggestions] = useState([])
    const [draftQuery, setDraftQuery] = useState('')
    const [showFilters, setShowFilters] = useState(false)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const searchParams = useSearchParams()
    const searchQuery = searchParams?.get('q') || searchParams?.get('search') || ''
    const category = searchParams?.get('category') || ''
    const brand = searchParams?.get('brand') || ''
    const sort = searchParams?.get('sort') || 'relevance'
    const minPrice = searchParams?.get('minPrice') || ''
    const maxPrice = searchParams?.get('maxPrice') || ''
    const minRating = searchParams?.get('minRating') || ''
    const debouncedDraftQuery = useDebouncedValue(draftQuery, 350)

    useEffect(() => {
        setDraftQuery(searchQuery)
    }, [searchQuery])

    const fetchProducts = useCallback(async () => {
        if (!searchQuery.trim()) { setProducts([]); setLoading(false); return }
        try {
            setLoading(true); setError(null)
            const params = new URLSearchParams({
                q: searchQuery.trim(),
                sort,
                limit: '24'
            })
            if (category) params.set('category', category)
            if (brand) params.set('brand', brand)
            if (minPrice) params.set('minPrice', minPrice)
            if (maxPrice) params.set('maxPrice', maxPrice)
            if (minRating) params.set('minRating', minRating)

            const res = await fetch(`/api/search?${String(params)}`)
            const data = await res.json()
            if (data.success) {
                setProducts(data.data || [])
                setFacets(data.facets || { categories: [], brands: [] })
                setPagination(data.pagination || { total: data.data?.length || 0, page: 1, pages: 1 })
            }
            else setError('Failed to load products')
        } catch { setError('Error fetching products') }
        finally { setLoading(false) }
    }, [searchQuery, category, brand, sort, minPrice, maxPrice, minRating])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    useEffect(() => {
        const query = debouncedDraftQuery.trim()
        if (query.length < 2 || query === searchQuery) {
            setSuggestions([])
            return
        }

        const controller = new AbortController()

        const fetchSuggestions = async () => {
            try {
                const params = new URLSearchParams({ q: query, suggest: 'true' })
                if (category) params.set('category', category)
                if (brand) params.set('brand', brand)
                const res = await fetch(`/api/search?${params.toString()}`, { signal: controller.signal })
                const data = await res.json()
                if (data.success) setSuggestions(data.data || [])
            } catch {
                setSuggestions([])
            }
        }

        fetchSuggestions()

        return () => controller.abort()
    }, [debouncedDraftQuery, searchQuery, category, brand])

    const updateSearchParams = (updates = {}, resetPage = true) => {
        const params = new URLSearchParams(searchParams ? String(searchParams) : '')

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === undefined || value === '') params.delete(key)
            else params.set(key, value)
        })

        if (resetPage) params.delete('page')
        router.push(`/search${params ? `?${String(params)}` : ''}`)
    }

    const handleSearchSubmit = (e) => {
        e.preventDefault()
        const q = draftQuery.trim()
        updateSearchParams({ q: q || null })
        setSuggestions([])
    }

    const applySuggestion = (item) => {
        const value = item?.name || ''
        setDraftQuery(value)
        updateSearchParams({ q: value || null })
        setSuggestions([])
    }

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className='flex gap-3 max-w-3xl mb-6'>
                    <div className='flex-1 relative'>
                        <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                        <input type='text' name='search' value={draftQuery} onChange={(e) => setDraftQuery(e.target.value)} placeholder='Search by name, brand, category...' className='w-full pl-11 pr-4 py-3 border border-neutral-200 rounded-full text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none' />
                        {suggestions.length > 0 && (
                            <div className='absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-lg z-30 overflow-hidden'>
                                {suggestions.map((item) => (
                                    <button key={item._id || item.name} type='button' onClick={() => applySuggestion(item)} className='w-full text-left px-3 py-2.5 hover:bg-neutral-50 transition-colors'>
                                        <div className='flex items-center gap-3'>
                                            <div className='relative w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden shrink-0'>
                                                {item.image ? (
                                                    <Image src={item.image} fill alt={item.name} className='object-cover' unoptimized={isCloudinaryUrl(item.image)} sizes='40px' quality={85} />
                                                ) : (
                                                    <div className='w-full h-full flex items-center justify-center text-[10px] text-neutral-400'>No image</div>
                                                )}
                                            </div>
                                            <div className='min-w-0'>
                                                <p className='text-sm text-neutral-800 truncate'>{item.name}</p>
                                                <p className='text-xs text-neutral-500 truncate'>{item.brand || 'Product'}{item.price ? ` · ₹${item.price}` : ''}</p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button type='submit' className='px-6 py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer'>Search</button>
                    <button type='button' onClick={() => setShowFilters(prev => !prev)} className='px-5 py-3 border border-neutral-200 text-neutral-700 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer inline-flex items-center gap-2'>
                        <SlidersHorizontal className='w-4 h-4' /> Filters
                    </button>
                </form>

                {showFilters && (
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 bg-neutral-50 border border-neutral-100 rounded-2xl p-4 mb-8'>
                        <select value={category} onChange={(e) => updateSearchParams({ category: e.target.value || null })} className='w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none'>
                            <option value=''>All Categories</option>
                            {facets.categories.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>

                        <select value={brand} onChange={(e) => updateSearchParams({ brand: e.target.value || null })} className='w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none'>
                            <option value=''>All Brands</option>
                            {facets.brands.map((item) => (
                                <option key={item} value={item}>{item}</option>
                            ))}
                        </select>

                        <input type='number' min='0' value={minPrice} onChange={(e) => updateSearchParams({ minPrice: e.target.value || null })} placeholder='Min price' className='w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none' />
                        <input type='number' min='0' value={maxPrice} onChange={(e) => updateSearchParams({ maxPrice: e.target.value || null })} placeholder='Max price' className='w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none' />

                        <select value={minRating} onChange={(e) => updateSearchParams({ minRating: e.target.value || null })} className='w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none'>
                            <option value=''>Any Rating</option>
                            <option value='4.5'>4.5+</option>
                            <option value='4'>4+</option>
                            <option value='3'>3+</option>
                        </select>

                        <select value={sort} onChange={(e) => updateSearchParams({ sort: e.target.value })} className='w-full px-3 py-2.5 rounded-xl border border-neutral-200 bg-white text-sm outline-none'>
                            {SORT_OPTIONS.map((item) => (
                                <option key={item.value} value={item.value}>{item.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Header */}
                {searchQuery && <p className='text-sm text-neutral-500 mb-6'>{loading ? 'Searching...' : `${pagination.total} result${pagination.total !== 1 ? 's' : ''} for "${searchQuery}"`}</p>}

                {loading ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='space-y-2'>
                                <div className='aspect-3/4 bg-neutral-100 rounded-2xl animate-pulse' />
                                <div className='h-3 w-3/4 bg-neutral-100 rounded animate-pulse' />
                                <div className='h-3 w-1/2 bg-neutral-100 rounded animate-pulse' />
                            </div>
                        ))}
                    </div>
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
                        {products.map((p, index) => {
                            const listingImage = getOptimizedProductImage(p, 640)
                            return (
                                <div key={p._id} className='group relative'>
                                    <Link href={`/shop/${p._id}`} className='block'>
                                        <div className='relative aspect-3/4 bg-neutral-100 rounded-2xl overflow-hidden mb-2'>
                                            {listingImage ? <Image src={listingImage} fill alt={p.name} className='object-cover group-hover:scale-105 transition-transform duration-500' priority={index < 2} unoptimized={isCloudinaryUrl(listingImage)} sizes='(max-width:640px) 50vw, 25vw' /> : <div className='absolute inset-0 flex items-center justify-center text-neutral-300 text-xs'>No image</div>}
                                        </div>
                                        <h3 className='text-xs font-medium text-neutral-900 truncate'>{p.name}</h3>
                                        <p className='text-xs font-semibold text-neutral-900 mt-0.5'>₹{p.price}</p>
                                    </Link>
                                    <button onClick={() => toggleWishlist({ id: p._id, name: p.name, price: p.price, image: listingImage })} className='absolute top-2 right-2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-10 cursor-pointer'>
                                        <Heart className={`w-4 h-4 ${isInWishlist(p._id) ? 'fill-red-500 text-red-500' : 'text-neutral-400'}`} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className='min-h-screen bg-white'><div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'><div className='h-12 rounded-full bg-neutral-100 animate-pulse mb-6' /><div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>{Array.from({ length: 8 }).map((_, i) => <div key={i} className='aspect-3/4 rounded-2xl bg-neutral-100 animate-pulse' />)}</div></div></div>}>
            <SearchContent />
        </Suspense>
    )
}