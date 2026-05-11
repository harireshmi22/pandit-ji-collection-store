'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '../../components/home/Navbar'
import Footer from '../../components/home/Footer'
import { ArrowLeft, ShoppingBag, Heart, Minus, Plus, Check, X, Package } from 'lucide-react'
import ProductSwiper from '@/app/components/home/ProductSwiper'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { getOptimizedProductImage, isCloudinaryUrl } from '@/lib/image-utils'

export default function ProductDetailClient({ initialProduct }) {
    const product = initialProduct
    const router = useRouter()
    const { addToCart, canUseSavedDetails, createOrderWithSavedDetails, savedShippingDetails } = useCart()
    const { isInWishlist, toggleWishlist } = useWishlist()

    const availableSizes = (Array.isArray(product?.sizes) && product.sizes.length > 0)
        ? product.sizes
        : (product?.size ? [product.size] : ['M'])

    const availableColors = (Array.isArray(product?.colors) && product.colors.length > 0)
        ? product.colors
        : (product?.color ? [product.color] : [])

    const [selectedSize, setSelectedSize] = useState(() => availableSizes[0] || 'M')
    const [selectedColor, setSelectedColor] = useState(() => availableColors[0] || '')
    const [quantity, setQuantity] = useState(1)
    const [addedToCart, setAddedToCart] = useState(false)
    const [isProcessing, setIsProcessing] = useState(false)
    const [showPaymentDialog, setShowPaymentDialog] = useState(false)

    const productImage = getOptimizedProductImage(product, 900)

    const handleAddToCart = () => {
        addToCart({ id: product._id, name: product.name, price: product.price, image: product.image, brand: product.brand }, selectedSize, quantity, true)
        setAddedToCart(true)
        setTimeout(() => setAddedToCart(false), 2000)
    }

    const handleBuyNow = () => {
        addToCart({ id: product._id, name: product.name, price: product.price, image: product.image, brand: product.brand }, selectedSize, quantity)
        setShowPaymentDialog(true)
    }

    const handleBuyNowWithPayment = async (method) => {
        setIsProcessing(true)
        setShowPaymentDialog(false)

        if (method === 'online') {
            router.push('/checkout?payment=online')
            setIsProcessing(false)
            return
        }

        if (!canUseSavedDetails()) {
            router.push('/checkout?payment=cod')
            setIsProcessing(false)
            return
        }

        try {
            const order = await createOrderWithSavedDetails('Cash on Delivery')
            if (order?._id) router.push(`/order/${order._id}?success=1&payment=cod`)
            else router.push('/checkout?payment=cod')
        } catch {
            router.push('/checkout?payment=cod')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <Link href='/shop' className='inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors'>
                    <ArrowLeft className='w-4 h-4' /> Back to Shop
                </Link>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16'>
                    <div className='relative aspect-3-4 overflow-hidden rounded-2xl bg-neutral-100'>
                        {productImage ? (
                            <Image
                                src={productImage}
                                alt={product.name}
                                fill
                                className='object-cover'
                                priority
                                unoptimized={isCloudinaryUrl(productImage)}
                                sizes='(max-width: 1024px) 100vw, 50vw'
                                quality={90}
                            />
                        ) : (
                            <div className='w-full h-full flex items-center justify-center'><Package className='w-12 h-12 text-neutral-300' /></div>
                        )}
                    </div>

                    <div className='flex flex-col'>
                        {product.brand && <p className='text-xs font-medium text-neutral-400 uppercase tracking-widest mb-2'>{product.brand}</p>}
                        <h1 className='text-2xl lg:text-3xl font-bold text-neutral-900 mb-3'>{product.name}</h1>
                        <div className='flex items-baseline gap-3 mb-6'>
                            <p className='text-2xl font-bold text-neutral-900'>₹{product.price?.toFixed(2)}</p>
                            <p className={`text-xs font-medium ${product.stock > 5 ? 'text-blue-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                            </p>
                        </div>

                        {product.description && <p className='text-sm text-neutral-500 leading-relaxed mb-8'>{product.description}</p>}

                        {(product.material || product.color || availableColors.length > 0) && (
                            <div className='grid grid-cols-2 gap-4 mb-8 pb-8 border-b border-neutral-100'>
                                {product.material && <div><p className='text-xs text-neutral-400 mb-0.5'>Material</p><p className='text-sm font-medium text-neutral-900'>{product.material}</p></div>}
                                {(selectedColor || product.color) && <div><p className='text-xs text-neutral-400 mb-0.5'>Color</p><p className='text-sm font-medium text-neutral-900'>{selectedColor || product.color}</p></div>}
                            </div>
                        )}

                        <div className='mb-6'>
                            <p className='text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3'>Size</p>
                            <div className='flex flex-wrap gap-2'>
                                {availableSizes.map(size => (
                                    <button key={size} onClick={() => setSelectedSize(size)} className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedSize === size ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {availableColors.length > 0 && (
                            <div className='mb-6'>
                                <p className='text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3'>Color</p>
                                <div className='flex flex-wrap gap-2'>
                                    {availableColors.map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${selectedColor === color ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className='mb-8'>
                            <p className='text-xs font-medium text-neutral-900 uppercase tracking-wider mb-3'>Quantity</p>
                            <div className='flex items-center gap-3 bg-neutral-50 rounded-full w-fit px-2 py-1'>
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className='p-2 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer' disabled={quantity === 1}><Minus className='w-4 h-4' /></button>
                                <span className='text-sm font-semibold w-8 text-center'>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className='p-2 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer' disabled={product.stock && quantity >= product.stock}><Plus className='w-4 h-4' /></button>
                            </div>
                        </div>

                        <div className='flex gap-3 mb-8'>
                            <button onClick={handleAddToCart} disabled={product.stock === 0} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-full text-sm font-medium transition-all cursor-pointer ${addedToCart ? 'bg-blue-600 text-white' : 'bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40'}`}>
                                {addedToCart ? <><Check className='w-4 h-4' /> Added</> : <><ShoppingBag className='w-4 h-4' /> Add to Cart</>}
                            </button>
                            <button onClick={handleBuyNow} disabled={isProcessing || product.stock === 0} className='flex-1 py-3.5 border border-neutral-900 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-900 hover:text-white transition-all cursor-pointer disabled:opacity-40'>
                                {isProcessing ? 'Processing...' : 'Buy Now'}
                            </button>
                            <button onClick={() => toggleWishlist({ id: product._id, name: product.name, price: product.price, image: product.image, brand: product.brand })} className={`p-3.5 rounded-full border transition-all cursor-pointer ${isInWishlist(product._id) ? 'border-red-500 text-red-500 bg-red-50' : 'border-neutral-200 text-neutral-400 hover:border-neutral-900 hover:text-neutral-900'}`}>
                                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                            </button>
                        </div>

                        <div className='space-y-3 pt-6 border-t border-neutral-100'>
                            {['Free shipping over ₹100', '30-day easy returns', 'Secure checkout'].map(info => (
                                <div key={info} className='flex items-center gap-3'>
                                    <div className='w-1.5 h-1.5 rounded-full bg-neutral-300' />
                                    <p className='text-sm text-neutral-500'>{info}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <ProductSwiper title='You May Also Like' category={product.category} excludeId={product._id} limit={8} />
            <Footer />

            {showPaymentDialog && (
                <>
                    <div className='fixed inset-0 bg-black/40 backdrop-blur-sm z-200' onClick={() => setShowPaymentDialog(false)} />
                    <div className='fixed inset-0 z-201 flex items-center justify-center p-4'>
                        <div className='bg-white rounded-2xl shadow-2xl max-w-md w-full p-6'>
                            <div className='flex items-center justify-between mb-5'>
                                <h3 className='text-lg font-bold text-neutral-900'>Choose Payment Method</h3>
                                <button onClick={() => setShowPaymentDialog(false)} className='p-1.5 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer'><X className='w-4 h-4' /></button>
                            </div>
                            <p className='text-sm text-neutral-600 mb-4'>Select how you want to pay for this order.</p>
                            {savedShippingDetails && (
                                <div className='bg-neutral-50 rounded-xl p-4 mb-4 text-sm text-neutral-700'>
                                    <p className='font-medium'>{savedShippingDetails.firstName} {savedShippingDetails.lastName}</p>
                                    <p>{savedShippingDetails.address}</p>
                                    <p>{savedShippingDetails.city}, {savedShippingDetails.zipCode}</p>
                                </div>
                            )}
                            {!savedShippingDetails && (
                                <div className='bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-xs text-amber-800'>
                                    Shipping details are not saved yet. You will continue to checkout to fill address before placing the order.
                                </div>
                            )}
                            <div className='bg-neutral-50 rounded-xl p-4 mb-6 text-sm'>
                                <p className='text-neutral-600'>{product.name} &middot; {selectedSize} &middot; Qty {quantity}</p>
                                <p className='font-semibold text-neutral-900 mt-1'>₹{(product.price * quantity).toFixed(2)}</p>
                            </div>
                            <div className='space-y-3'>
                                <button onClick={() => handleBuyNowWithPayment('online')} disabled={isProcessing} className='w-full py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40'>
                                    {isProcessing ? 'Processing...' : 'Pay Online'}
                                </button>
                                <button onClick={() => handleBuyNowWithPayment('cod')} disabled={isProcessing} className='w-full py-3 border border-neutral-300 text-neutral-900 rounded-full text-sm font-medium hover:bg-neutral-50 transition-colors cursor-pointer disabled:opacity-40'>
                                    {isProcessing ? 'Processing...' : 'Cash on Delivery'}
                                </button>
                                <button onClick={() => setShowPaymentDialog(false)} className='w-full py-2 text-xs text-neutral-500 hover:text-neutral-700 transition-colors cursor-pointer'>
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}