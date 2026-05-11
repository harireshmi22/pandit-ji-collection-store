import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ShieldCheck, Truck, RotateCcw } from 'lucide-react'

const FALLBACK_HERO_IMAGE = 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1400&h=1800&fit=crop'
const FALLBACK_SIDE_IMAGE = 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop'
const FALLBACK_THIRD_IMAGE = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&h=1000&fit=crop'

const getProductImage = (product) => {
    if (!product) return null
    if (product.image && typeof product.image === 'string') return product.image
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') return product.images[0]
    return null
}

export default async function HeroBanner() {
    // Fetch data server-side with caching
    let heroProduct = null
    let sideProduct = null
    let thirdProduct = null

    try {
        const res = await fetch('/api/products?limit=6&sort=popular', {
            next: { revalidate: 300 } // Cache for 5 minutes
        })
        const data = await res.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            heroProduct = data.data[0]
            sideProduct = data.data[1] || data.data[0]
            thirdProduct = data.data[2] || data.data[1] || data.data[0]
        }
    } catch (error) {
        // Silent error handling - use fallback images
        heroProduct = null
        sideProduct = null
        thirdProduct = null
    }

    const heroImage = getProductImage(heroProduct) || FALLBACK_HERO_IMAGE
    const sideImage = getProductImage(sideProduct) || FALLBACK_SIDE_IMAGE
    const thirdImage = getProductImage(thirdProduct) || FALLBACK_THIRD_IMAGE

    return (
        <section className='relative overflow-hidden bg-white'>
            <div className='absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_18%,rgba(14,165,233,0.14),transparent_34%),radial-gradient(circle_at_88%_20%,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_54%_82%,rgba(37,99,235,0.08),transparent_34%)]' />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20 lg:py-24'>
                <div className='relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center'>
                    <div className='max-w-xl'>
                        <p className='text-sm font-medium text-blue-700 tracking-widest uppercase mb-4 animate-fade-up'>New Season 2026</p>
                        <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.05] animate-fade-up delay-100'>
                            Minimal<br />
                            <span className='text-blue-700'>Essentials</span>
                        </h1>
                        <p className='mt-6 text-lg text-neutral-600 max-w-lg animate-fade-up delay-200'>
                            Discover premium styles for everyday wear with fast delivery, easy returns, and secure checkout.
                        </p>

                        <div className='mt-10 flex flex-wrap gap-4 animate-fade-up delay-300'>
                            <Link href='/shop' className='inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-[0_10px_28px_-12px_rgba(37,99,235,0.55)]'>
                                Shop Collection <ArrowRight className='w-4 h-4' />
                            </Link>
                            <Link href='/shop?category=New%20in' className='inline-flex items-center gap-2 border border-amber-300 text-amber-700 bg-amber-50/70 px-8 py-3.5 rounded-full text-sm font-medium hover:border-amber-400 hover:bg-amber-100/60 transition-colors'>
                                New Arrivals
                            </Link>
                        </div>

                        <div className='mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-up delay-300'>
                            <div className='flex items-center gap-2.5 bg-white/90 border border-blue-100 rounded-xl px-3 py-2.5'>
                                <Truck className='w-4 h-4 text-blue-700 shrink-0' />
                                <span className='text-xs font-medium text-neutral-700'>Free Shipping Over ₹100</span>
                            </div>
                            <div className='flex items-center gap-2.5 bg-white/90 border border-blue-100 rounded-xl px-3 py-2.5'>
                                <RotateCcw className='w-4 h-4 text-blue-700 shrink-0' />
                                <span className='text-xs font-medium text-neutral-700'>7-Day Easy Return</span>
                            </div>
                            <div className='flex items-center gap-2.5 bg-white/90 border border-blue-100 rounded-xl px-3 py-2.5'>
                                <ShieldCheck className='w-4 h-4 text-blue-700 shrink-0' />
                                <span className='text-xs font-medium text-neutral-700'>Secure Payments</span>
                            </div>
                        </div>
                    </div>

                    <div className='relative rounded-3xl border border-blue-100 bg-white/85 backdrop-blur-sm p-4 md:p-5 shadow-[0_24px_44px_-26px_rgba(37,99,235,0.4)] animate-fade-up delay-200'>
                        <div className='grid grid-cols-5 gap-3'>
                            <div className='col-span-3 relative rounded-2xl overflow-hidden min-h-72 md:min-h-96 ring-1 ring-blue-100/70 group'>
                                <Image
                                    src={heroImage}
                                    alt={heroProduct?.name || 'Featured fashion product'}
                                    fill
                                    priority
                                    sizes='(max-width: 1024px) 100vw, 60vw'
                                    className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                                />
                                <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-blue-500/10' />
                                <div className='absolute inset-0 bg-linear-to-t from-black/35 via-transparent to-transparent' />
                                <div className='absolute bottom-3 left-3 right-3'>
                                    <p className='text-white/85 text-[11px] uppercase tracking-[0.18em]'>Top Pick</p>
                                    <p className='text-white text-sm md:text-base font-semibold truncate'>
                                        {heroProduct?.name || 'Premium Urban Collection'}
                                    </p>
                                </div>
                            </div>

                            <div className='col-span-2 flex flex-col gap-3'>
                                <div className='relative rounded-2xl overflow-hidden min-h-36 md:min-h-48 ring-1 ring-blue-100/70 group animate-fade-up' style={{ animationDelay: '0.24s' }}>
                                    <Image
                                        src={sideImage}
                                        alt={sideProduct?.name || 'New arrival fashion product'}
                                        fill
                                        loading='lazy'
                                        sizes='(max-width: 1024px) 40vw, 24vw'
                                        className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                                    />
                                    <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-blue-500/10' />
                                    <div className='absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent' />
                                    <div className='absolute bottom-2 left-2 right-2'>
                                        <p className='text-white text-xs font-medium truncate'>
                                            {sideProduct?.name || 'Fresh New Arrivals'}
                                        </p>
                                    </div>
                                </div>

                                <div className='relative rounded-2xl overflow-hidden min-h-36 md:min-h-45 ring-1 ring-blue-100/70 group animate-fade-up' style={{ animationDelay: '0.34s' }}>
                                    <Image
                                        src={thirdImage}
                                        alt={thirdProduct?.name || 'Modern fashion style'}
                                        fill
                                        loading='lazy'
                                        sizes='(max-width: 1024px) 40vw, 24vw'
                                        className='w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105'
                                    />
                                    <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-blue-500/10' />
                                    <div className='absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent' />
                                    <div className='absolute bottom-2 left-2 right-2'>
                                        <p className='text-white text-xs font-medium truncate'>
                                            {thirdProduct?.name || 'Modern Everyday Style'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}