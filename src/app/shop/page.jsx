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
            const res = await fetch(`/api/products${params.toString() ? '?' + params.toString() : ''}`)
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
        const params = new URLSearchParams(searchParams?.toString() || '')
        if (cat === 'All') params.delete('category')
        else params.set('category', cat)
        params.delete('page')
        router.push(`/shop${params.toString() ? '?' + params.toString() : ''}`)
    }

    const setPage = (page) => {
        const params = new URLSearchParams(searchParams?.toString() || '')
        if (page <= 1) params.delete('page')
        else params.set('page', String(page))
        router.push(`/shop${params.toString() ? '?' + params.toString() : ''}`)
    }

    const pageNumbers = Array.from({ length: pagination.pages || 0 }, (_, index) => index + 1)

    return (
        <div className='min-h-screen bg-white'>
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
                            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all cursor-pointer ${activeCategory === cat ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {loading ? (
                    <div className='flex flex-col items-center justify-center py-32'>
                        <Loader className='w-6 h-6 text-neutral-300 animate-spin mb-3' />
                        <p className='text-sm text-neutral-400'>Loading products...</p>
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
                            {products.map(product => {
                                const productId = product._id || product.id
                                return (
                                    <div key={productId} className='group relative'>
                                        <Link href={`/shop/${productId}`} className='block'>
                                            <div className='relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100'>
                                                {product.image ? (
                                                    <Image
                                                        src={product.image}
                                                        fill
                                                        alt={product.name}
                                                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                                                        sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                                                    />
                                                ) : (
                                                    <div className='w-full h-full flex items-center justify-center'>
                                                        <Package className='w-8 h-8 text-neutral-300' />
                                                    </div>
                                                )}
                                                {product.isNewArrival && (
                                                    <span className='absolute top-3 left-3 bg-neutral-900 text-white px-2.5 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider'>New</span>
                                                )}
                                            </div>
                                        </Link>
                                        <button
                                            onClick={() => toggleWishlist({ id: productId, name: product.name, price: product.price, image: product.image, brand: product.brand })}
                                            className={`absolute top-3 right-3 p-2 rounded-full transition-all z-10 ${isInWishlist(productId) ? 'bg-red-500 text-white' : 'bg-white/80 backdrop-blur-sm text-neutral-500 hover:bg-white'}`}
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
                                                <p className={`text-[11px] mt-1 ${product.stock > 5 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
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
                                        className={`min-w-10 px-3 py-2 text-sm rounded-lg border transition-colors cursor-pointer ${num === currentPage ? 'bg-neutral-900 text-white border-neutral-900' : 'border-neutral-200 text-neutral-700 hover:bg-neutral-100'}`}
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
        <Suspense fallback={<div className='min-h-screen flex items-center justify-center'><Loader className='w-6 h-6 animate-spin text-neutral-300' /></div>}>
            <ShopPageContent />
        </Suspense>
    )
}