'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../../components/home/Navbar'
import Footer from '../../components/home/Footer'
import { CheckCircle, Package, Truck, CreditCard, Loader, ArrowLeft } from 'lucide-react'

export default function OrderDetailPage() {
    const params = useParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!params.id) return
            ; (async () => {
                try {
                    const res = await fetch(`/api/orders/${params.id}`)
                    if (!res.ok) throw new Error('Order not found')
                    setOrder(await res.json())
                } catch (err) {
                    setError(err.message)
                } finally {
                    setLoading(false)
                }
            })()
    }, [params.id])

    if (loading) return (
        <div className='min-h-screen bg-white'><Navbar /><div className='flex items-center justify-center py-32'><Loader className='w-6 h-6 text-neutral-300 animate-spin' /></div><Footer /></div>
    )

    if (error || !order) return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-2xl mx-auto px-4 py-20 text-center'>
                <p className='text-neutral-600 mb-4'>{error || 'Order not found'}</p>
                <Link href='/orders' className='text-sm text-neutral-900 underline underline-offset-4'>View all orders</Link>
            </div>
            <Footer />
        </div>
    )

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <Link href='/orders' className='inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors'>
                    <ArrowLeft className='w-4 h-4' /> All Orders
                </Link>

                {/* Success Banner */}
                <div className='text-center mb-10'>
                    <div className='inline-flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-full mb-4'>
                        <CheckCircle className='w-7 h-7 text-emerald-600' />
                    </div>
                    <h1 className='text-2xl font-bold text-neutral-900 mb-1'>Order Confirmed</h1>
                    <p className='text-sm text-neutral-500'>Order #{order._id.slice(-8).toUpperCase()} &middot; {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Items */}
                        <div className='border border-neutral-100 rounded-2xl overflow-hidden'>
                            <div className='px-5 py-4 border-b border-neutral-100 flex items-center gap-2'>
                                <Package className='w-4 h-4 text-neutral-400' />
                                <h2 className='text-sm font-semibold text-neutral-900'>Items ({order.orderItems?.length})</h2>
                            </div>
                            <div className='divide-y divide-neutral-50'>
                                {order.orderItems?.map((item, i) => (
                                    <div key={i} className='p-5 flex gap-4'>
                                        <div className='relative w-16 h-20 rounded-xl bg-neutral-100 overflow-hidden shrink-0'>
                                            {item.image && !item.image.includes('placehold.co') ? (
                                                <Image src={item.image} alt={item.name} fill className='object-cover' />
                                            ) : null}
                                            <div className={`w-full h-full items-center justify-center ${item.image && !item.image.includes('placehold.co') ? 'hidden' : 'flex'}`}>
                                                <Package className='w-5 h-5 text-neutral-300' />
                                            </div>
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <h3 className='text-sm font-medium text-neutral-900 truncate'>{item.name}</h3>
                                            <p className='text-xs text-neutral-400 mt-0.5'>Size: {item.size || 'M'} &middot; Qty: {item.quantity}</p>
                                            <p className='text-sm font-semibold text-neutral-900 mt-1'>₹{item.price?.toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='border border-neutral-100 rounded-2xl p-5'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <Truck className='w-4 h-4 text-neutral-400' />
                                    <h3 className='text-sm font-semibold text-neutral-900'>Shipping</h3>
                                </div>
                                <div className='text-sm text-neutral-600 space-y-0.5'>
                                    <p className='font-medium text-neutral-900'>{order.shippingAddress?.fullName}</p>
                                    <p>{order.shippingAddress?.address}</p>
                                    <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                    <p>{order.shippingAddress?.country}</p>
                                </div>
                            </div>
                            <div className='border border-neutral-100 rounded-2xl p-5'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <CreditCard className='w-4 h-4 text-neutral-400' />
                                    <h3 className='text-sm font-semibold text-neutral-900'>Payment</h3>
                                </div>
                                <div className='text-sm text-neutral-600 space-y-1'>
                                    <p>{order.paymentMethod}</p>
                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${order.isPaid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                                        {order.isPaid ? 'Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className='border border-neutral-100 rounded-2xl p-5 sticky top-24'>
                            <h2 className='text-sm font-semibold text-neutral-900 mb-5 pb-4 border-b border-neutral-100'>Order Summary</h2>
                            <div className='space-y-3 text-sm mb-5'>
                                <div className='flex justify-between text-neutral-600'><span>Subtotal</span><span>₹{order.itemsPrice?.toFixed(2)}</span></div>
                                <div className='flex justify-between text-neutral-600'><span>Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice?.toFixed(2)}`}</span></div>
                                <div className='flex justify-between text-neutral-600'><span>Tax</span><span>₹{order.taxPrice?.toFixed(2)}</span></div>
                            </div>
                            <div className='flex justify-between text-lg font-bold text-neutral-900 pt-4 border-t border-neutral-100'>
                                <span>Total</span><span>₹{order.totalPrice?.toFixed(2)}</span>
                            </div>
                            <div className='mt-6 space-y-2'>
                                <Link href='/orders' className='block w-full text-center py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors'>All Orders</Link>
                                <Link href='/shop' className='block w-full text-center py-3 text-neutral-600 text-sm font-medium hover:text-neutral-900 transition-colors'>Continue Shopping</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}