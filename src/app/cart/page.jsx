'use client'
export const dynamic = 'force-dynamic'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { useCart } from '@/context/CartContext'
import { Plus, Minus, Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react'

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart()
    const shipping = cartTotal >= 100 ? 0 : 10
    const tax = cartTotal * 0.1
    const finalTotal = cartTotal + shipping + tax

    if (cartItems.length === 0) {
        return (
            <div className='min-h-screen bg-white'>
                <Navbar />
                <div className='flex flex-col items-center justify-center py-32 px-4'>
                    <ShoppingBag className='w-12 h-12 text-neutral-200 mb-4' strokeWidth={1.5} />
                    <h2 className='text-xl font-bold text-neutral-900 mb-1'>Your cart is empty</h2>
                    <p className='text-sm text-neutral-500 mb-6'>Add items to get started</p>
                    <Link href='/shop' className='inline-flex items-center gap-2 bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-medium'>
                        Browse Shop <ArrowRight className='w-4 h-4' />
                    </Link>
                </div>
                <Footer />
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <div className='flex items-center justify-between mb-8'>
                    <div>
                        <h1 className='text-2xl md:text-3xl font-bold text-neutral-900'>Cart</h1>
                        <p className='text-sm text-neutral-500 mt-1'>{cartItems.length} items</p>
                    </div>
                    <Link href='/shop' className='inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors'>
                        <ArrowLeft className='w-4 h-4' /> Continue Shopping
                    </Link>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    <div className='lg:col-span-2 space-y-4'>
                        {cartItems.map(item => (
                            <div key={`${item.id}-${item.selectedSize}`} className='flex gap-4 p-4 border border-neutral-100 rounded-2xl'>
                                <div className='relative w-20 h-24 bg-neutral-100 rounded-xl shrink-0 overflow-hidden'>
                                    <Image src={item.image} alt={item.name} fill className='object-cover' sizes='80px' />
                                </div>
                                <div className='flex-1 flex flex-col justify-between'>
                                    <div>
                                        <h3 className='text-sm font-medium text-neutral-900'>{item.name}</h3>
                                        <p className='text-xs text-neutral-400 mt-0.5'>{item.brand || 'Pandit Ji Collection'} &middot; Size {item.selectedSize || 'M'}</p>
                                    </div>
                                    <div className='flex items-center justify-between mt-3'>
                                        <div className='flex items-center gap-1 bg-neutral-50 rounded-full px-1 py-0.5'>
                                            <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity - 1)} className='p-1.5 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer'><Minus className='w-3 h-3' /></button>
                                            <span className='text-sm font-medium w-7 text-center'>{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.id, item.selectedSize, item.quantity + 1)} className='p-1.5 hover:bg-neutral-200 rounded-full transition-colors cursor-pointer'><Plus className='w-3 h-3' /></button>
                                        </div>
                                        <div className='flex items-center gap-3'>
                                            <p className='text-sm font-semibold text-neutral-900'>₹{(item.price * item.quantity).toFixed(2)}</p>
                                            <button onClick={() => removeFromCart(item.id, item.selectedSize)} className='p-1.5 text-neutral-400 hover:text-red-500 transition-colors cursor-pointer'><Trash2 className='w-4 h-4' /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <button onClick={clearCart} className='text-xs text-neutral-400 hover:text-neutral-600 transition-colors cursor-pointer'>Clear cart</button>
                    </div>

                    <div>
                        <div className='sticky top-24 border border-neutral-100 rounded-2xl p-5'>
                            <h2 className='text-sm font-semibold text-neutral-900 mb-5 pb-4 border-b border-neutral-100'>Order Summary</h2>
                            <div className='space-y-3 text-sm mb-5'>
                                <div className='flex justify-between text-neutral-600'><span>Subtotal</span><span>₹{cartTotal.toFixed(2)}</span></div>
                                <div className='flex justify-between text-neutral-600'><span>Shipping</span><span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span></div>
                                <div className='flex justify-between text-neutral-600'><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
                            </div>
                            <div className='flex justify-between text-lg font-bold text-neutral-900 pt-4 border-t border-neutral-100 mb-6'>
                                <span>Total</span><span>₹{finalTotal.toFixed(2)}</span>
                            </div>
                            <Link href='/checkout' className='block w-full text-center py-3.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors'>
                                Proceed to Checkout
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}