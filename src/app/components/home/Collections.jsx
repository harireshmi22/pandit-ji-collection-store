'use client';
import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function Collections() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const scrollContainerRef = useRef(null);

    // Fetch products in the "Knitwear" category on component mount
    useEffect(() => {
        fetch('/api/products?category=Knitwear')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setProducts(data.data);
                }
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching products:', error);
                setLoading(false);
            });
    }, []);

    // function to side scroll the container  
    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollWidth = 320;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollWidth : scrollWidth,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className='px-4 md:px-10 py-12 bg-gray-50'>
                <div className='w-full mx-auto'>
                    <h2 className='text-3xl md:text-4xl font-bold mb-8'>Collections</h2>
                    <div className='flex gap-6 overflow-x-auto'>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="flex-shrink-0 w-80 animate-pulse">
                                <div className='h-80 bg-gray-200 rounded mb-4'></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className='px-4 md:px-10 py-12 bg-gray-50'>
            <div className='w-full mx-auto'>
                <div className='flex items-center justify-between mb-8'>
                    <h2 className='text-3xl md:text-4xl font-bold'>Collections</h2>
                    <div className='flex gap-2'>
                        <button
                            onClick={() => scroll('left')}
                            className='p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition'
                            aria-label="Scroll left"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className='p-2 border border-gray-300 rounded-md hover:bg-gray-100 transition'
                            aria-label="Scroll right"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div
                    ref={scrollContainerRef}
                    className='overflow-x-auto scrollbar-hide flex gap-6 pb-4'
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                >
                    <style jsx>{`
                        .scrollbar-hide::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                    {products.map((product) => {
                        const productId = product._id || product.id;
                        const productImage = product.images || product.image || 'https://via.placeholder.com/400';
                        return (
                            <Link
                                key={productId}
                                href={`/products/${productId}`}
                                className='flex-shrink-0 w-80 bg-white border border-gray-300 rounded-lg overflow-hidden hover:shadow-lg transition group'
                            >
                                <div className='p-4'>
                                    <p className='text-sm text-gray-600 mb-4'>{product.category || 'essential round knit'}</p>
                                    <div className='relative w-full h-80 bg-gray-100 rounded mb-4'>
                                        {productImage ? (
                                            <Image
                                                src={productImage}
                                                alt={product.name}
                                                fill
                                                className="object-cover rounded"
                                                sizes="320px"
                                            />
                                        ) : (
                                            <div className='absolute inset-0 flex items-center justify-center'>
                                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>

                                    <div className='text-left'>
                                        <p className='font-semibold'>₹{product.price} {product.type || 'T-shirt'}</p>
                                        <p className='text-sm text-gray-600'>{product.brand || product.name}</p>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
