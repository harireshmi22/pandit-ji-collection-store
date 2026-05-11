'use client'
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { X, ShoppingBag } from 'lucide-react'
import { useCart } from '@/context/CartContext'

export default function CartSidebar() {
    const router = useRouter()
    const { cartItems, isCartOpen, setIsCartOpen, cartTotal } = useCart()

    const handleCheckout = () => {
        setIsCartOpen(false)
        router.push('/checkout')
    }

    return (
        <>
            <div className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-100 transition-opacity duration-300 ${isCartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsCartOpen(false)} />
            <div className={`fixed top-0 right-0 h-full w-full sm:max-w-[380px] bg-white z-101 shadow-2xl transition-transform duration-400 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className='flex flex-col h-full'>
                    <div className='px-5 py-4 border-b border-neutral-100 flex justify-between items-center'>
                        <h2 className='text-sm font-semibold text-neutral-900'>Cart ({cartItems.length})</h2>
                        <button onClick={() => setIsCartOpen(false)} className='p-2 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer'><X size={18} /></button>
                    </div>

                    <div className='flex-1 overflow-y-auto p-5 space-y-4 no-scrollbar'>
                        {cartItems.length === 0 ? (
                            <div className='h-full flex flex-col items-center justify-center'>
                                <ShoppingBag className='w-10 h-10 text-neutral-200 mb-3' strokeWidth={1.5} />
                                <p className='text-sm text-neutral-400'>Your cart is empty</p>
                            </div>
                        ) : (
                            cartItems.map(item => (
                                <div key={`${item.id}-${item.selectedSize}`} className='flex gap-3 pb-4 border-b border-neutral-50'>
                                    <div className='w-16 h-20 bg-neutral-100 shrink-0 relative rounded-xl overflow-hidden' style={{ aspectRatio: '4/5' }}>
                                        <Image src={`${item.image}?w=64&h=80&fit=crop&q=85&auto=format`} fill className='object-cover' alt={item.name} sizes='64px' quality={85} loading="lazy" />
                                    </div>
                                    <div className='flex-1 flex flex-col justify-between min-w-0'>
                                        <h3 className='text-xs font-medium text-neutral-900 truncate'>{item.name}</h3>
                                        <p className='text-[11px] text-neutral-400'>Size: {item.selectedSize || 'M'} &middot; Qty: {item.quantity}</p>
                                        <p className='text-sm font-semibold text-neutral-900'>₹{(item.price * item.quantity).toFixed(2)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {cartItems.length > 0 && (
                        <div className='p-5 border-t border-neutral-100'>
                            <div className='flex justify-between items-center mb-4'>
                                <span className='text-sm text-neutral-600'>Total</span>
                                <span className='text-lg font-bold text-neutral-900'>₹{cartTotal.toFixed(2)}</span>
                            </div>
                            <button onClick={handleCheckout} className='w-full bg-neutral-900 text-white py-3 text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors cursor-pointer'>
                                Checkout
                            </button>
                            <Link href='/cart' onClick={() => setIsCartOpen(false)} className='block w-full text-center text-xs text-neutral-400 hover:text-neutral-600 mt-3 transition-colors'>
                                View Cart
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}