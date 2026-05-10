import Navbar from './components/home/Navbar';
import HeroBanner from './components/home/HeroBanner';
import ProductSwiper from './components/home/ProductSwiper';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const NewArrival = dynamic(() => import('./components/NewArrival'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
    ssr: true
});

const FeaturedDeals = dynamic(() => import('./components/home/FeaturedDeals'), {
    loading: () => <div className="h-96 bg-gray-100 animate-pulse" />,
    ssr: true
});

const Footer = dynamic(() => import('./components/home/Footer'), {
    loading: () => <div className="h-64 bg-gray-100 animate-pulse" />,
    ssr: true
});

export default function Home() {
    return (
        <div className='min-h-screen bg-white no-scrollbar'>
            <Navbar />
            <HeroBanner />
            <ProductSwiper title='Trending Now' />
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
                <FeaturedDeals />
            </Suspense>
            <Suspense fallback={<div className="h-96 bg-gray-100 animate-pulse" />}>
                <NewArrival />
            </Suspense>
            <ProductSwiper title='Best Sellers' sort='popular' />
            <Suspense fallback={<div className="h-64 bg-gray-100 animate-pulse" />}>
                <Footer />
            </Suspense>
        </div>
    );
}