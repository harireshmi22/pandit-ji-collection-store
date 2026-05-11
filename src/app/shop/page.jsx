'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import Image from 'next/image'
import Link from 'next/link'
import { useWishlist } from '@/context/WishlistContext'
import { Heart, Loader, Search, SlidersHorizontal, X, Package } from 'lucide-react'
import { getOptimizedProductImage, isCloudinaryUrl } from '@/lib/image-utils'

const categories = ['All', 'New in', 'Top Wear', 'Bottom Wear', 'T-shirt', 'Formal']

const ShopPageContent = () => {
    const { isInWishlist, toggleWishlist } = useWishlist()
    const [products, setProducts] = useState([])
    const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, pages: 0 })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showFilters, setShowFilters] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    const searchQuery = searchParams?.get('search') || ''
    const activeCategory = searchParams?.get('category') || 'All'
    const currentPage = Math.max(1, Number(searchParams?.get('page')) || 1)
    const pageLimit = 20

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const params = new URLSearchParams()
            if (searchQuery) params.append('search', searchQuery)
            if (activeCategory && activeCategory !== 'All') params.append('category', activeCategory)
            params.append('page', String(currentPage))
            params.append('limit', String(pageLimit))
            params.append('fields', 'card')
            const res = await fetch(`/api/products${params ? '?' + String(params) : ''}`)
            const data = await res.json()
            if (data.success) {
                setProducts(data.data)
                setPagination(data.pagination || { total: data.data.length, page: currentPage, limit: pageLimit, pages: 1 })
            }
            else setError('Failed to load products')
        } catch (err) {
            setError('Error fetching products')
        } finally {
            setLoading(false)
        }
    }, [searchQuery, activeCategory, currentPage])

    useEffect(() => { fetchProducts() }, [fetchProducts])

    const setCategory = (cat) => {
        const params = new URLSearchParams(searchParams ? String(searchParams) : '')
        if (cat === 'All') params.delete('category')
        else params.set('category', cat)
        params.delete('page')
        router.push(`/shop${params ? '?' + String(params) : ''}`)
    }

    const setPage = (page) => {
        const params = new URLSearchParams(searchParams ? String(searchParams) : '')
        if (page <= 1) params.delete('page')
        else params.set('page', String(page))
        router.push(`/shop${params ? '?' + String(params) : ''}`)
    }

    const pageNumbers = Array.from({ length: pagination.pages || 0 }, (_, index) => index + 1)

    return (
        <div className='min-h-screen'>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20'>
                {/* Header */}
                <div className='mb-8'>
                    {searchQuery ? (
                        <>
                            <h1 className='text-2xl md:text-3xl font-bold text-neutral-900'>Search Results</h1>
                            <p className='text-sm text-neutral-500 mt-1'>{pagination.total} results for &ldquo;{searchQuery}&rdquo;</p>
                        </>
                    ) : (
                        <>
                            <h1 className='text-2xl md:text-3xl font-bold text-neutral-900'>Shop</h1>
                            <p className='text-sm text-neutral-500 mt-1'>{pagination.total} products</p>
                        </>
                    )}
                </div>

                {/* Category Tabs */}
                <div className='flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-1'>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat ? 'bg-blue-600 text-white shadow-[0_8px_18px_-10px_rgba(37,99,235,0.5)]' : 'bg-white border border-neutral-200 text-neutral-600 hover:border-blue-200 hover:text-blue-700'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className='rounded-2xl p-2 bg-white/80 border border-neutral-200/80'>
                                <div className='aspect-3-4 rounded-2xl bg-neutral-100 animate-pulse' />
                                <div className='mt-3 px-0.5 space-y-2'>
                                    <div className='h-4 w-3/4 bg-neutral-100 rounded animate-pulse' />
                                    <div className='h-3 w-1/2 bg-neutral-100 rounded animate-pulse' />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : error ? (
                    <div className='bg-red-50 border border-red-100 rounded-2xl p-6 text-center'>
                        <p className='text-red-600 font-medium'>{error}</p>
                        <button onClick={fetchProducts} className='mt-3 px-5 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors'>Retry</button>
                    </div>
                ) : products.length === 0 ? (
                    <div className='text-center py-32'>
                        <Search className='w-10 h-10 text-neutral-200 mx-auto mb-4' />
                        <p className='text-neutral-500 mb-2'>No products found</p>
                        <Link href='/shop' className='text-sm text-neutral-900 underline underline-offset-4 hover:text-neutral-600'>Browse all products</Link>
                    </div>
                ) : (
                    <div>
                        <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>
                            {products.map((product, index) => {
                                const productId = product._id || product.id
                                const cardImage = getOptimizedProductImage(product, 640)
                                return (
                                    <div key={productId} className='group relative rounded-2xl p-2 bg-white/80 border border-neutral-200/80 shadow-sm hover:shadow-[0_14px_30px_-18px_rgba(15,118,110,0.35)] transition-all'>
                                        <Link href={`/shop/${productId}`} className='block'>
                                            <div className='relative aspect-3-4 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-100'>
                                                {cardImage ? (
                                                    <Image
                                                        src={cardImage}
                                                        fill
                                                        alt={product.name}
                                                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                                                        priority={index < 2}
                                                        unoptimized={isCloudinaryUrl(cardImage)}
                                                        sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                                                        quality={85}
                                                    />
                                                ) : (
                                                    <div className='w-full h-full flex items-center justify-center'>
                                                        <Package className='w-8 h-8 text-neutral-300' />
                                                    </div>
                                                )}
                                                {product.isNewArrival && (
                                                    <span className='absolute top-3 left-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider'>New</span>
                                                )}
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => toggleWishlist({ id: productId, name: product.name, price: product.price, image: product.image, brand: product.brand })}
                                            className={`absolute top-5 right-5 p-2 rounded-full transition-all z-10 ${isInWishlist(productId) ? 'bg-red-500 text-white' : 'bg-white/90 border border-neutral-200 text-neutral-500 hover:border-blue-200 hover:text-blue-700'}`}
                                        >
                                            <Heart className={`w-4 h-4 ${isInWishlist(productId) ? 'fill-current' : ''}`} />
                                        </button>
                                        <div className='mt-3 px-0.5'>
                                            <h3 className='text-sm font-medium text-neutral-900 truncate'>{product.name}</h3>
                                            <div className='flex justify-between items-center mt-1'>
                                                <p className='text-xs text-neutral-400'>{product.brand || product.category}</p>
                                                <p className='text-sm font-semibold text-neutral-900'>₹{product.price?.toFixed(2)}</p>
                                            </div>
                                            {product.stock !== undefined && (
                                                <p className={`text-[11px] mt-1 ${product.stock > 5 ? 'text-blue-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                                    {product.stock > 0 ? `${product.stock} left` : 'Sold out'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {pagination.pages > 1 && (
                            <div className='mt-10 flex items-center justify-center gap-2 flex-wrap'>
                                <button
                                    onClick={() => setPage(currentPage - 1)}
                                    disabled={currentPage <= 1}
                                    className='px-3 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
                                >
                                    Prev
                                </button>
                                {pageNumbers.map((num) => (
                                    <button
                                        key={num}
                                        onClick={() => setPage(num)}
                                        className={`min-w-10 px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${num === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'border-neutral-200 text-neutral-700 hover:bg-blue-50 hover:border-blue-200'}`}
                                    >
                                        {num}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setPage(currentPage + 1)}
                                    disabled={currentPage >= pagination.pages}
                                    className='px-3 py-2 text-sm rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer'
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className='min-h-screen bg-white'><div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20'><div className='h-8 w-32 rounded bg-neutral-100 animate-pulse mb-8' /><div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6'>{Array.from({ length: 8 }).map((_, i) => <div key={i} className='aspect-3-4 rounded-2xl bg-neutral-100 animate-pulse' />)}</div></div></div>}>
            <ShopPageContent />
        </Suspense>
    )
}