import React from 'react'
import Link from 'next/link'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { Award, Users, Heart, Target, ShoppingBag, Shield } from 'lucide-react'

export default function AboutPage() {
    return (
        <div className='min-h-screen bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(239,246,255,0.72),rgba(236,253,255,0.58))]'>
            <Navbar />

            {/* Hero */}
            <div className='relative overflow-hidden bg-[linear-gradient(135deg,#1d4ed8,#2563eb,#0ea5e9)] text-white py-20 md:py-28'>
                <div className='absolute -top-20 -right-16 w-72 h-72 rounded-full bg-cyan-300/25 blur-3xl' />
                <div className='absolute -bottom-20 -left-16 w-80 h-80 rounded-full bg-blue-200/20 blur-3xl' />
                <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
                    <p className='text-xs uppercase tracking-widest text-blue-100 mb-4'>About Us</p>
                    <h1 className='text-3xl md:text-5xl font-bold mb-5'>Pandit Ji Collection</h1>
                    <p className='text-blue-100/90 text-base md:text-lg max-w-2xl mx-auto leading-relaxed'>
                        Where tradition meets contemporary elegance. Crafting timeless fashion for the modern individual.
                    </p>
                </div>
            </div>

            {/* Our Story */}
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-12 items-center'>
                    <div>
                        <p className='text-xs uppercase tracking-widest text-blue-600 mb-3'>Our Story</p>
                        <h2 className='text-2xl md:text-3xl font-bold text-neutral-900 mb-5'>Built on Quality &amp; Passion</h2>
                        <p className='text-sm text-neutral-600 leading-relaxed mb-4'>
                            Founded with a vision to redefine fashion, Pandit Ji Collection has been at the forefront of creating elegant, sophisticated, and contemporary clothing.
                        </p>
                        <p className='text-sm text-neutral-600 leading-relaxed'>
                            We carefully curate each piece, ensuring every garment meets our high standards for quality, comfort, and style. Our commitment is to make you look and feel your best.
                        </p>
                    </div>
                    <div className='grid grid-cols-2 gap-4'>
                        {[
                            { value: '10K+', label: 'Happy Customers' },
                            { value: '500+', label: 'Products' },
                            { value: '98%', label: 'Satisfaction' },
                            { value: '24/7', label: 'Support' },
                        ].map(stat => (
                            <div key={stat.label} className='border border-blue-100 bg-white/90 rounded-2xl p-5 text-center shadow-sm'>
                                <p className='text-2xl font-bold text-blue-700'>{stat.value}</p>
                                <p className='text-xs text-neutral-400 mt-1'>{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Values */}
            <div className='bg-[linear-gradient(180deg,rgba(239,246,255,0.75),rgba(236,253,255,0.7),rgba(236,253,245,0.55))] py-16 md:py-24'>
                <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='text-center mb-12'>
                        <p className='text-xs uppercase tracking-widest text-blue-600 mb-3'>What We Stand For</p>
                        <h2 className='text-2xl md:text-3xl font-bold text-neutral-900'>Our Values</h2>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        {[
                            { icon: Award, title: 'Quality First', desc: 'Every product is crafted with premium materials and meticulous attention to detail.' },
                            { icon: Heart, title: 'Customer Love', desc: 'Your satisfaction is our priority. We go above and beyond for every customer.' },
                            { icon: Target, title: 'Innovation', desc: 'Constantly evolving our designs to stay ahead of trends while keeping classics alive.' },
                            { icon: Shield, title: 'Trust', desc: 'Transparent practices, honest pricing, and genuine products you can count on.' },
                            { icon: Users, title: 'Community', desc: 'Building a community of fashion enthusiasts who share our passion for style.' },
                            { icon: ShoppingBag, title: 'Accessibility', desc: 'Premium fashion should be available to everyone, at fair and accessible prices.' },
                        ].map(v => (
                            <div key={v.title} className='bg-white/95 border border-blue-100 rounded-2xl p-6 shadow-sm'>
                                <div className='w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4'>
                                    <v.icon className='w-5 h-5 text-blue-700' />
                                </div>
                                <h3 className='text-sm font-semibold text-neutral-900 mb-2'>{v.title}</h3>
                                <p className='text-xs text-neutral-500 leading-relaxed'>{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center'>
                <h2 className='text-2xl md:text-3xl font-bold text-neutral-900 mb-4'>Ready to Explore?</h2>
                <p className='text-sm text-neutral-500 mb-8 max-w-md mx-auto'>Discover our curated collection of premium fashion essentials.</p>
                <Link href='/shop' className='inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors shadow-[0_14px_26px_-16px_rgba(37,99,235,0.75)]'>
                    Shop Now
                </Link>
            </div>

            <Footer />
        </div>
    )
}