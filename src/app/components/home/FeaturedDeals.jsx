'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop';

const getProductImage = (product) => {
    if (product.image && typeof product.image === 'string' && product.image.startsWith('http')) return product.image;
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].startsWith('http')) return product.images[0];
    if (product.image && typeof product.image === 'string') return product.image;
    return FALLBACK_IMAGE;
};

export default function FeaturedDeals() {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);

    useEffect(() => {
        async function fetchFeaturedProducts() {
            try {
                const res = await fetch('/api/products?limit=2&featured=true');
                const data = await res.json();
                if (data.success && data.data?.length > 0) {
                    setProducts(data.data.slice(0, 2));
                }
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchFeaturedProducts();
    }, []);

    if (loading) {
        return (
            <section className='py-16 md:py-20 bg-neutral-50'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <h2 className='text-2xl md:text-3xl font-bold text-neutral-900 mb-10'>Featured</h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {[1, 2].map(i => (
                            <div key={i} className='animate-pulse'>
                                <div className='aspect-4/3 bg-neutral-200 rounded-2xl' />
                                <div className='h-4 bg-neutral-200 rounded w-3/4 mt-4' />
                                <div className='h-3 bg-neutral-200 rounded w-1/2 mt-2' />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className='py-16 md:py-20 bg-neutral-50'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-end mb-10'>
                    <h2 className='text-2xl md:text-3xl font-bold text-neutral-900'>Featured</h2>
                    <Link href='/shop?featured=true' className='text-sm font-medium text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 transition-colors'>
                        View All <ArrowRight className='w-3.5 h-3.5' />
                    </Link>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    {products.map(product => {
                        const productId = product._id || product.id;
                        const productImage = getProductImage(product);
                        return (
                            <Link key={productId} href={`/shop/${productId}`} className='group block'>
                                <div className='relative aspect-4/3 overflow-hidden rounded-2xl bg-neutral-100'>
                                    <Image
                                        src={productImage}
                                        alt={product.name}
                                        fill
                                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                                        sizes='(max-width: 768px) 100vw, 50vw'
                                    />
                                    <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300' />
                                </div>
                                <div className='mt-4'>
                                    <div className='flex justify-between items-start'>
                                        <div>
                                            <h3 className='text-lg font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors'>{product.name}</h3>
                                            <p className='text-sm text-neutral-400 mt-0.5 line-clamp-1'>{product.description}</p>
                                        </div>
                                        <p className='text-lg font-semibold text-neutral-900'>₹{product.price}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}