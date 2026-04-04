'use client'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HeroBanner() {
    return (
        <section className='relative overflow-hidden bg-neutral-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40'>
                <div className='max-w-2xl'>
                    <p className='text-sm font-medium text-neutral-400 tracking-widest uppercase mb-4 animate-fade-up'>New Season 2026</p>
                    <h1 className='text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.05] animate-fade-up delay-100'>
                        Minimal<br />
                        <span className='text-neutral-400'>Essentials</span>
                    </h1>
                    <p className='mt-6 text-lg text-neutral-500 max-w-md animate-fade-up delay-200'>
                        Timeless pieces designed with precision. Crafted for those who value simplicity and quality.
                    </p>
                    <div className='mt-10 flex flex-wrap gap-4 animate-fade-up delay-300'>
                        <Link href='/shop' className='inline-flex items-center gap-2 bg-neutral-900 text-white px-8 py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors'>
                            Shop Collection <ArrowRight className='w-4 h-4' />
                        </Link>
                        <Link href='/shop?category=New%20in' className='inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 px-8 py-3.5 rounded-full text-sm font-medium hover:border-neutral-900 hover:text-neutral-900 transition-colors'>
                            New Arrivals
                        </Link>
                    </div>
                </div>
            </div>
            <div className='absolute top-0 right-0 w-1/2 h-full hidden lg:block'>
                <div className='absolute inset-0 bg-gradient-to-l from-transparent to-neutral-50 z-10' />
                <div className='w-full h-full bg-neutral-200/50' />
            </div>
        </section>
    )
}