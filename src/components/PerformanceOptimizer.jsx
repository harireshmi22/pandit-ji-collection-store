'use client'

import Head from 'next/head'

export default function PerformanceOptimizer() {
    return (
        <Head>
            {/* Preload critical images for LCP */}
            <link
                rel="preload"
                as="image"
                href="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1000&fit=crop&q=90&auto=format"
                type="image/webp"
            />
            
            {/* DNS prefetch for external domains */}
            <link rel="dns-prefetch" href="//images.unsplash.com" />
            <link rel="dns-prefetch" href="//res.cloudinary.com" />
            <link rel="dns-prefetch" href="//fonts.googleapis.com" />
            <link rel="dns-prefetch" href="//fonts.gstatic.com" />
            
            {/* Preconnect for critical resources */}
            <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Head>
    )
}
