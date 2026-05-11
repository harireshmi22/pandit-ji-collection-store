import Navbar from './components/home/Navbar';
import HeroBanner from './components/home/HeroBanner';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// ProductSwiper loading skeleton that matches actual component dimensions
const ProductSwiperSkeleton = () => (
    <section className='py-16 md:py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-end mb-10'>
                <div className='h-8 bg-gray-200 rounded w-48'></div>
                <div className='flex gap-2'>
                    <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                    <div className='w-10 h-10 bg-gray-200 rounded-full'></div>
                </div>
            </div>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className='animate-pulse'>
                        <div className='bg-gray-200 rounded-2xl mb-3' style={{ aspectRatio: '4/5' }}></div>
                        <div className='h-3 bg-gray-200 rounded w-3/4 mb-2'></div>
                        <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const ProductSwiper = dynamic(() => import('./components/home/ProductSwiper'), {
    loading: () => <ProductSwiperSkeleton />,
    ssr: true
});

// NewArrival loading skeleton that matches actual component dimensions
const NewArrivalSkeleton = () => (
    <section className='py-16 md:py-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='relative overflow-hidden rounded-3xl bg-gray-100 border border-gray-200 h-64 md:h-80'>
                <div className='absolute inset-0 flex items-center justify-center'>
                    <div className='text-center'>
                        <div className='h-12 bg-gray-200 rounded w-32 mx-auto mb-4'></div>
                        <div className='h-8 bg-gray-200 rounded w-48 mx-auto mb-3'></div>
                        <div className='h-4 bg-gray-200 rounded w-64 mx-auto mb-6'></div>
                        <div className='h-10 bg-gray-200 rounded w-40 mx-auto'></div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const NewArrival = dynamic(() => import('./components/NewArrival'), {
    loading: () => <NewArrivalSkeleton />,
    ssr: true
});

// FeaturedDeals loading skeleton that matches actual component dimensions
const FeaturedDealsSkeleton = () => (
    <section className='py-16 md:py-20 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex justify-between items-end mb-10'>
                <div className='h-8 bg-gray-200 rounded w-32'></div>
                <div className='h-6 bg-gray-200 rounded w-20'></div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {[1, 2].map(i => (
                    <div key={i} className='animate-pulse'>
                        <div className='bg-gray-200 rounded-2xl mb-4' style={{ aspectRatio: '4/5' }}></div>
                        <div className='h-5 bg-gray-200 rounded w-3/4 mb-2'></div>
                        <div className='h-4 bg-gray-200 rounded w-full mb-1'></div>
                        <div className='h-6 bg-gray-200 rounded w-20'></div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const FeaturedDeals = dynamic(() => import('./components/home/FeaturedDeals'), {
    loading: () => <FeaturedDealsSkeleton />,
    ssr: true
});

// Footer loading skeleton that matches actual component dimensions
const FooterSkeleton = () => (
    <footer className='bg-gray-900 text-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
            <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className='animate-pulse'>
                        <div className='h-6 bg-gray-700 rounded w-24 mb-4'></div>
                        <div className='space-y-2'>
                            <div className='h-4 bg-gray-700 rounded w-full'></div>
                            <div className='h-4 bg-gray-700 rounded w-3/4'></div>
                            <div className='h-4 bg-gray-700 rounded w-5/6'></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </footer>
);

const Footer = dynamic(() => import('./components/home/Footer'), {
    loading: () => <FooterSkeleton />,
    ssr: true
});

export const metadata = {
    title: 'Pandit Ji Collection Store - Premium Fashion',
    description: 'Discover premium styles for everyday wear with fast delivery, easy returns, and secure checkout.',
}

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#f7fafc',
}

export default function Home() {
    return (
        <main className="min-h-screen bg-white no-scrollbar">
            <Navbar />
            <HeroBanner />
            <ProductSwiper title='Trending Now' />
            <Suspense fallback={<FeaturedDealsSkeleton />}>
                <FeaturedDeals />
            </Suspense>
            <Suspense fallback={<NewArrivalSkeleton />}>
                <NewArrival />
            </Suspense>
            <ProductSwiper title='Best Sellers' sort='popular' />
            <Suspense fallback={<FooterSkeleton />}>
                <Footer />
            </Suspense>
        </main>
    );
}