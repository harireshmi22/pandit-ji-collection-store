'use client'
export const dynamic = 'force-dynamic'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { useWishlist } from '@/context/WishlistContext'
import { useCart } from '@/context/CartContext'
import { Heart, ShoppingBag, X, ArrowRight } from 'lucide-react'

export default function WishlistPage() {
    const { wishlistItems, removeFromWishlist, clearWishlist, isLoading } = useWishlist()
    const { addToCart } = useCart()

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-2xl md:text-3xl font-bold text-neutral-900'>Wishlist</h1>
                        <p className='text-sm text-neutral-500 mt-1'>
                            {isLoading ? 'Loading your wishlist...' : `${wishlistItems.length} ${wishlistItems.length === 1 ? 'item' : 'items'}`}
                        </p>
                    </div>
                    {!isLoading && wishlistItems.length > 0 && (
                        <button onClick={clearWishlist} className='text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer'>Clear All</button>
                    )}
                </div>

                {isLoading ? (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {[...Array(4)].map((_, index) => (
                            <div key={index} className='animate-pulse'>
                                <div className='aspect-3/4 bg-neutral-100 rounded-2xl mb-2' />
                                <div className='h-3 bg-neutral-100 rounded w-3/4 mb-1' />
                                <div className='h-3 bg-neutral-100 rounded w-1/2' />
                            </div>
                        ))}
                    </div>
                ) : wishlistItems.length === 0 ? (
                    <div className='text-center py-20'>
                        <Heart className='w-10 h-10 text-neutral-200 mx-auto mb-3' />
                        <p className='text-sm text-neutral-500 mb-4'>Your wishlist is empty</p>
                        <Link href='/shop' className='inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-medium'>
                            Browse Shop <ArrowRight className='w-4 h-4' />
                        </Link>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                        {wishlistItems.map(p => (
                            <div key={p.id} className='group relative'>
                                <Link href={`/shop/${p.id}`} className='block'>
                                    <div className='relative aspect-3-4 bg-neutral-100 rounded-2xl overflow-hidden mb-2'>
                                        <Image src={p.image} alt={p.name} fill className='object-cover group-hover:scale-105 transition-transform duration-500' sizes='(max-width:640px) 50vw, 25vw' quality={85} />
                                    </div>
                                    <h3 className='text-xs font-medium text-neutral-900 truncate'>{p.name}</h3>
                                    {p.brand && <p className='text-[10px] text-neutral-400'>{p.brand}</p>}
                                    <p className='text-xs font-semibold text-neutral-900 mt-0.5'>₹{p.price}</p>
                                </Link>

                                {/* Remove */}
                                <button onClick={() => removeFromWishlist(p.id)} className='absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all z-10 cursor-pointer'>
                                    <X className='w-3.5 h-3.5 text-neutral-500' />
                                </button>

                                {/* Add to Cart */}
                                <button onClick={() => addToCart(p, 'M', 1, true)} className='absolute bottom-14 right-2 w-8 h-8 bg-neutral-900 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer'>
                                    <ShoppingBag className='w-3.5 h-3.5 text-white' />
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