'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NewArrival() {
    return (
        <section className='py-16 md:py-20'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='relative overflow-hidden rounded-3xl bg-neutral-900 text-white'>
                    <div className='absolute inset-0 opacity-10'>
                        <div className='absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2' />
                        <div className='absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2' />
                    </div>
                    <div className='relative px-8 py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8'>
                        <div className='max-w-lg'>
                            <p className='text-sm font-medium text-neutral-400 tracking-widest uppercase mb-3'>Just Dropped</p>
                            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold leading-tight'>
                                New Arrival<br />Collection
                            </h2>
                            <p className='mt-4 text-neutral-400 max-w-sm'>
                                Discover our latest pieces. Fresh styles added weekly, crafted with premium materials.
                            </p>
                            <Link href='/shop?category=New%20in' className='inline-flex items-center gap-2 mt-8 bg-white text-neutral-900 px-8 py-3.5 rounded-full text-sm font-medium hover:bg-neutral-100 transition-colors'>
                                Shop New Arrivals <ArrowRight className='w-4 h-4' />
                            </Link>
                        </div>
                        <div className='text-8xl md:text-9xl font-bold text-white/5 select-none'>NEW</div>
                    </div>
                </div>
            </div>
        </section>
    );
}