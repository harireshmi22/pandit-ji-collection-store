'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ArrowRight, Package } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop';

const getProductImage = (product) => {
    if (product.image && typeof product.image === 'string' && product.image.startsWith('http')) return product.image;
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string' && product.images[0].startsWith('http')) return product.images[0];
    if (product.image && typeof product.image === 'string') return product.image;
    return FALLBACK_IMAGE;
};

const ProductCard = ({ product }) => {
    const [imageSrc, setImageSrc] = useState(() => getProductImage(product));
    const productId = product._id || product.id;

    return (
        <Link href={`/shop/${productId}`} className='group block'>
            <div className='relative aspect-3/4 overflow-hidden rounded-2xl bg-neutral-100 ring-1 ring-neutral-100'>
                <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className='object-cover transition-transform duration-500 group-hover:scale-105'
                    sizes='(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw'
                    onError={() => setImageSrc(FALLBACK_IMAGE)}
                />
                {product.category && (
                    <span className='absolute top-3 left-3 bg-amber-50/95 border border-amber-200/70 backdrop-blur-sm px-3 py-1 text-[11px] font-medium uppercase tracking-wider rounded-full text-amber-700'>
                        {product.category}
                    </span>
                )}
            </div>
            <div className='mt-3 px-1'>
                <h3 className='text-sm font-medium text-neutral-900 truncate group-hover:text-neutral-600 transition-colors'>{product.name}</h3>
                <div className='flex justify-between items-center mt-1'>
                    <p className='text-xs text-neutral-400'>{product.brand || 'Brand'}</p>
                    <p className='text-sm font-semibold text-neutral-900'>₹{product.price}</p>
                </div>
            </div>
        </Link>
    );
};

export default function ProductSwiper({ title = 'Trending Now', category, sort, excludeId, limit = 8 }) {
    const [prevEl, setPrevEl] = useState(null);
    const [nextEl, setNextEl] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProducts() {
            try {
                const params = new URLSearchParams();
                params.append('limit', limit.toString());
                if (category) params.append('category', category);
                if (sort) params.append('sort', sort);
                const res = await fetch(`/api/products?${params.toString()}`);
                const data = await res.json();
                if (data.success && data.data?.length > 0) {
                    // Exclude current product for "You May Also Like"
                    const items = excludeId
                        ? data.data.filter(p => (p._id || p.id) !== excludeId)
                        : data.data;
                    setProducts(items);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, [category, sort, excludeId, limit]);

    if (loading) {
        return (
            <section className='py-16 md:py-20'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-end mb-10'>
                        <h2 className='text-2xl md:text-3xl font-bold text-neutral-900'>{title}</h2>
                    </div>
                    <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className='animate-pulse'>
                                <div className='aspect-3/4 bg-neutral-100 rounded-2xl mb-3' />
                                <div className='h-3 bg-neutral-100 rounded w-3/4 mb-2' />
                                <div className='h-3 bg-neutral-100 rounded w-1/2' />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (products.length === 0) return null;

    return (
        <section className='py-16 md:py-20'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                <div className='flex justify-between items-end mb-10'>
                    <h2 className='text-2xl md:text-3xl font-bold text-neutral-900'>{title}</h2>
                    <div className='hidden sm:flex gap-2'>
                        <button ref={node => setPrevEl(node)} className='p-2.5 rounded-full border border-neutral-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-neutral-600'>
                            <ArrowRight className='w-4 h-4 rotate-180' />
                        </button>
                        <button ref={node => setNextEl(node)} className='p-2.5 rounded-full border border-neutral-200 hover:border-blue-600 hover:bg-blue-600 hover:text-white transition-all cursor-pointer text-neutral-600'>
                            <ArrowRight className='w-4 h-4' />
                        </button>
                    </div>
                </div>

                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={2}
                    navigation={{ prevEl, nextEl }}
                    autoplay={{ delay: 4000, disableOnInteraction: false }}
                    breakpoints={{
                        768: { slidesPerView: 3, spaceBetween: 24 },
                        1024: { slidesPerView: 4, spaceBetween: 28 },
                    }}
                >
                    {products.map(product => (
                        <SwiperSlide key={product._id || product.id}>
                            <ProductCard product={product} />
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </section>
    );
}