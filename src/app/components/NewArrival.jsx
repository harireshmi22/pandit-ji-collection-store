'use client';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NewArrival() {
    return (
        <section className='py-16 md:py-20'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='relative overflow-hidden rounded-3xl bg-[linear-gradient(140deg,rgba(255,255,255,0.99),rgba(239,246,255,0.95),rgba(224,242,254,0.9))] border border-neutral-200 shadow-[0_24px_52px_-30px_rgba(37,99,235,0.48)]'>
                    <div className='absolute inset-0 opacity-40'>
                        <div className='absolute top-0 right-0 w-96 h-96 bg-blue-200/55 rounded-full -translate-y-1/2 translate-x-1/2' />
                        <div className='absolute bottom-0 left-0 w-64 h-64 bg-cyan-200/55 rounded-full translate-y-1/2 -translate-x-1/2' />
                    </div>
                    <div className='relative px-6 py-12 sm:px-8 sm:py-16 md:px-16 md:py-20 flex flex-col md:flex-row items-center justify-between gap-8'>
                        <div className='max-w-lg'>
                            <p className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-blue-800 bg-blue-100 tracking-widest uppercase mb-4'>Just Dropped</p>
                            <h2 className='text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-neutral-900'>
                                New Arrival<br />Collection
                            </h2>
                            <p className='mt-4 text-neutral-600 max-w-sm'>
                                Discover our latest pieces. Fresh styles added weekly, crafted with premium materials.
                            </p>
                            <Link href='/shop?category=New%20in' className='inline-flex items-center gap-2 mt-8 bg-blue-600 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors shadow-[0_12px_24px_-14px_rgba(37,99,235,0.65)]'>
                                Shop New Arrivals <ArrowRight className='w-4 h-4' />
                            </Link>
                        </div>
                        <div className='text-6xl sm:text-7xl md:text-9xl font-bold text-blue-700/20 select-none' style={{
                            contain: 'layout',
                            width: 'fit-content',
                            height: 'fit-content',
                            minWidth: '120px',
                            minHeight: '80px'
                        }}>NEW</div>
                    </div>
                </div>
            </div>
        </section>
    );
}