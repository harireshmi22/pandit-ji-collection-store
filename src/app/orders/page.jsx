'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { Package, Clock, CheckCircle, Truck, XCircle, Loader, ArrowRight } from 'lucide-react'

const statusStyles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Processing: 'bg-blue-50 text-blue-700 border-blue-200',
    Shipped: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    Delivered: 'bg-blue-50 text-blue-700 border-blue-200',
    Cancelled: 'bg-red-50 text-red-700 border-red-200',
}

const statusIcons = {
    Pending: Clock, Processing: Package, Shipped: Truck, Delivered: CheckCircle, Cancelled: XCircle,
}

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        ; (async () => {
            try {
                const res = await fetch('/api/orders')
                if (!res.ok) throw new Error(res.status === 401 ? 'Please login to view orders' : 'Failed to load orders')
                const data = await res.json()
                setOrders(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <h1 className='text-2xl md:text-3xl font-bold text-neutral-900 mb-1'>Your Orders</h1>
                <p className='text-sm text-neutral-500 mb-8'>Track and manage your recent orders</p>

                {loading ? (
                    <div className='flex items-center justify-center py-32'>
                        <Loader className='w-6 h-6 text-neutral-300 animate-spin' />
                    </div>
                ) : error ? (
                    <div className='text-center py-20'>
                        <XCircle className='w-10 h-10 text-neutral-200 mx-auto mb-4' />
                        <p className='text-neutral-600 mb-4'>{error}</p>
                        {error.includes('login') ? (
                            <Link href='/login' className='inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold'>Login</Link>
                        ) : (
                            <button onClick={() => window.location.reload()} className='bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer'>Retry</button>
                        )}
                    </div>
                ) : orders.length === 0 ? (
                    <div className='text-center py-20'>
                        <Package className='w-10 h-10 text-neutral-200 mx-auto mb-4' />
                        <p className='text-neutral-900 font-medium mb-1'>No orders yet</p>
                        <p className='text-sm text-neutral-500 mb-6'>Start shopping to see your orders here</p>
                        <Link href='/shop' className='inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold'>
                            Browse Shop <ArrowRight className='w-4 h-4' />
                        </Link>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {orders.map(order => {
                            const StatusIcon = statusIcons[order.status] || Clock
                            return (
                                <Link key={order._id} href={`/order/${order._id}`} className='block group'>
                                    <div className='border border-neutral-200 bg-white/95 rounded-2xl p-5 hover:border-blue-200 hover:shadow-[0_14px_28px_-20px_rgba(37,99,235,0.45)] transition-all'>
                                        <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
                                            <div>
                                                <p className='text-xs text-neutral-400 mb-0.5'>Order #{order._id.slice(-8).toUpperCase()}</p>
                                                <p className='text-sm text-neutral-600'>{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[order.status] || statusStyles.Pending}`}>
                                                    <StatusIcon className='w-3 h-3' /> {order.status}
                                                </span>
                                                {order.isPaid && <span className='text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full'>Paid</span>}
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-3 mb-4'>
                                            {order.orderItems?.slice(0, 3).map((item, idx) => (
                                                <div key={idx} className='relative w-14 h-14 rounded-xl bg-neutral-100 overflow-hidden shrink-0'>
                                                    {item.image && !item.image.includes('placehold.co') ? (
                                                        <Image src={item.image} alt={item.name} fill className='object-cover' />
                                                    ) : null}
                                                    <div className={`w-full h-full items-center justify-center ${item.image && !item.image.includes('placehold.co') ? 'hidden' : 'flex'}`}>
                                                        <Package className='w-4 h-4 text-neutral-300' />
                                                    </div>
                                                </div>
                                            ))}
                                            {order.orderItems?.length > 3 && (
                                                <div className='w-14 h-14 rounded-xl bg-neutral-100 flex items-center justify-center text-xs text-neutral-500 font-medium'>
                                                    +{order.orderItems.length - 3}
                                                </div>
                                            )}
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <p className='text-lg font-semibold text-neutral-900'>₹{order.totalPrice?.toFixed(2)}</p>
                                            <span className='text-xs text-neutral-500 group-hover:text-blue-700 transition-colors flex items-center gap-1'>
                                                View details <ArrowRight className='w-3 h-3' />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    )
}