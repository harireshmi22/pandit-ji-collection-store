'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import {
    Package, Clock, CheckCircle2, Truck, XCircle, Loader, ArrowRight,
    Search, SlidersHorizontal, CircleDashed, ShoppingBag, CalendarDays
} from 'lucide-react'

const statusMeta = {
    Pending: {
        tone: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        progress: 25,
        icon: Clock,
        label: 'Pending',
    },
    Processing: {
        tone: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-500',
        progress: 50,
        icon: Package,
        label: 'Processing',
    },
    Shipped: {
        tone: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        dot: 'bg-cyan-500',
        progress: 75,
        icon: Truck,
        label: 'Shipped',
    },
    Delivered: {
        tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        progress: 100,
        icon: CheckCircle2,
        label: 'Delivered',
    },
    Cancelled: {
        tone: 'bg-red-50 text-red-700 border-red-200',
        dot: 'bg-red-500',
        progress: 0,
        icon: XCircle,
        label: 'Cancelled',
    },
}

const trackingSteps = ['Ordered', 'Packed', 'Shipped', 'Delivered']

export default function OrdersPage() {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [statusFilter, setStatusFilter] = useState('All')
    const [query, setQuery] = useState('')

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

    const normalizedQuery = query.trim().toLowerCase()

    const filteredOrders = orders.filter((order) => {
        const matchStatus = statusFilter === 'All' ? true : order.status === statusFilter
        if (!normalizedQuery) return matchStatus

        const shortId = order._id?.slice(-8)?.toLowerCase() || ''
        const nameMatch = (order.orderItems || []).some((item) => item?.name?.toLowerCase().includes(normalizedQuery))
        return matchStatus && (shortId.includes(normalizedQuery) || nameMatch)
    })

    const stats = {
        total: orders.length,
        delivered: orders.filter((o) => o.status === 'Delivered').length,
        active: orders.filter((o) => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Shipped').length,
        cancelled: orders.filter((o) => o.status === 'Cancelled').length,
    }

    const latestOrderDate = orders[0]?.createdAt
        ? new Date(orders[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : 'No orders yet'

    const formatCurrency = (amount) => `₹${Number(amount || 0).toFixed(2)}`

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-10'>
                <div className='rounded-3xl border border-blue-100/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(239,246,255,0.82),rgba(224,242,254,0.72))] p-5 sm:p-7 mb-6 animate-fade-up'>
                    <div className='flex flex-wrap items-start justify-between gap-4'>
                        <div>
                            <p className='text-[11px] uppercase tracking-[0.18em] text-blue-700 font-semibold mb-2'>Order Center</p>
                            <h1 className='text-2xl md:text-3xl font-bold text-neutral-900'>Your Orders</h1>
                            <p className='text-sm text-neutral-600 mt-1'>Track and manage your recent orders</p>
                        </div>
                        <div className='inline-flex items-center gap-2 text-xs text-neutral-600 bg-white/80 border border-blue-100 rounded-full px-3 py-1.5'>
                            <CalendarDays className='w-3.5 h-3.5 text-blue-600' />
                            Last activity: <span className='font-medium text-neutral-800'>{latestOrderDate}</span>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mt-5'>
                        <div className='rounded-2xl bg-white/90 border border-blue-100 px-4 py-3'>
                            <p className='text-[11px] text-neutral-500 uppercase tracking-wider'>Total</p>
                            <p className='text-lg font-bold text-neutral-900'>{stats.total}</p>
                        </div>
                        <div className='rounded-2xl bg-white/90 border border-blue-100 px-4 py-3'>
                            <p className='text-[11px] text-neutral-500 uppercase tracking-wider'>Active</p>
                            <p className='text-lg font-bold text-blue-700'>{stats.active}</p>
                        </div>
                        <div className='rounded-2xl bg-white/90 border border-blue-100 px-4 py-3'>
                            <p className='text-[11px] text-neutral-500 uppercase tracking-wider'>Delivered</p>
                            <p className='text-lg font-bold text-emerald-700'>{stats.delivered}</p>
                        </div>
                        <div className='rounded-2xl bg-white/90 border border-blue-100 px-4 py-3'>
                            <p className='text-[11px] text-neutral-500 uppercase tracking-wider'>Cancelled</p>
                            <p className='text-lg font-bold text-red-600'>{stats.cancelled}</p>
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_290px] gap-5'>
                    <div className='rounded-3xl border border-neutral-200/80 bg-white/95 shadow-[0_20px_45px_-32px_rgba(15,23,42,0.32)]'>
                        <div className='p-4 sm:p-5 border-b border-neutral-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between'>
                            <div className='relative w-full sm:max-w-sm'>
                                <Search className='w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2' />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder='Search by order ID or product'
                                    className='w-full h-10 rounded-xl border border-neutral-200 bg-neutral-50 pl-9 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white transition-colors'
                                />
                            </div>

                            <div className='flex items-center gap-2'>
                                <SlidersHorizontal className='w-4 h-4 text-neutral-400' />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className='h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm outline-none focus:border-blue-300'
                                >
                                    <option value='All'>All statuses</option>
                                    <option value='Pending'>Pending</option>
                                    <option value='Processing'>Processing</option>
                                    <option value='Shipped'>Shipped</option>
                                    <option value='Delivered'>Delivered</option>
                                    <option value='Cancelled'>Cancelled</option>
                                </select>
                            </div>
                        </div>

                        <div className='p-4 sm:p-5'>
                            {loading ? (
                                <div className='space-y-4'>
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className='rounded-2xl border border-neutral-200 p-4 animate-pulse'>
                                            <div className='h-4 w-36 bg-neutral-100 rounded mb-3' />
                                            <div className='h-2 w-full bg-neutral-100 rounded mb-4' />
                                            <div className='flex gap-2 mb-4'>
                                                <div className='w-12 h-12 bg-neutral-100 rounded-xl' />
                                                <div className='w-12 h-12 bg-neutral-100 rounded-xl' />
                                                <div className='w-12 h-12 bg-neutral-100 rounded-xl' />
                                            </div>
                                            <div className='h-4 w-24 bg-neutral-100 rounded' />
                                        </div>
                                    ))}
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
                            ) : filteredOrders.length === 0 ? (
                                <div className='text-center py-20'>
                                    <CircleDashed className='w-10 h-10 text-neutral-200 mx-auto mb-4' />
                                    <p className='text-neutral-900 font-medium mb-1'>No matching orders</p>
                                    <p className='text-sm text-neutral-500 mb-6'>Try another search or status filter</p>
                                    <Link href='/shop' className='inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full text-sm font-semibold'>
                                        Browse Shop <ArrowRight className='w-4 h-4' />
                                    </Link>
                                </div>
                            ) : (
                                <div className='max-h-[72vh] overflow-y-auto no-scrollbar pr-1 space-y-3'>
                                    {filteredOrders.map((order, index) => {
                                        const meta = statusMeta[order.status] || statusMeta.Pending
                                        const StatusIcon = meta.icon
                                        const isCancelled = order.status === 'Cancelled'

                                        return (
                                            <Link
                                                key={order._id}
                                                href={`/order/${order._id}`}
                                                className='block group animate-fade-up'
                                                style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
                                            >
                                                <article className='rounded-2xl border border-neutral-200 bg-white p-4 sm:p-5 hover:border-blue-200 hover:shadow-[0_14px_30px_-20px_rgba(37,99,235,0.4)] transition-all'>
                                                    <div className='flex flex-wrap items-start justify-between gap-3 mb-4'>
                                                        <div>
                                                            <p className='text-xs text-neutral-400 mb-0.5'>Order #{order._id.slice(-8).toUpperCase()}</p>
                                                            <p className='text-sm text-neutral-600'>
                                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                            </p>
                                                        </div>

                                                        <div className='flex items-center gap-2'>
                                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${meta.tone}`}>
                                                                <StatusIcon className='w-3 h-3' /> {meta.label}
                                                            </span>
                                                            {order.isPaid && <span className='text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full'>Paid</span>}
                                                        </div>
                                                    </div>

                                                    <div className='mb-4'>
                                                        {isCancelled ? (
                                                            <div className='rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700 font-medium inline-flex items-center gap-2'>
                                                                <XCircle className='w-3.5 h-3.5' /> This order was cancelled
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className='relative h-2 rounded-full bg-neutral-100 overflow-hidden mb-2'>
                                                                    <div
                                                                        className='h-full rounded-full bg-linear-to-r from-blue-500 to-cyan-500 transition-all duration-700'
                                                                        style={{ width: `${meta.progress}%` }}
                                                                    />
                                                                </div>
                                                                <div className='grid grid-cols-4 gap-2 text-[10px] text-neutral-500'>
                                                                    {trackingSteps.map((step, stepIndex) => {
                                                                        const reached = (meta.progress / 25) > stepIndex
                                                                        return (
                                                                            <div key={step} className='flex items-center gap-1.5'>
                                                                                <span className={`w-2 h-2 rounded-full ${reached ? 'bg-blue-500' : 'bg-neutral-300'}`} />
                                                                                <span className={`${reached ? 'text-neutral-700 font-medium' : ''}`}>{step}</span>
                                                                            </div>
                                                                        )
                                                                    })}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <div className='flex items-center gap-2.5 mb-4 overflow-x-auto no-scrollbar'>
                                                        {(order.orderItems || []).slice(0, 4).map((item, idx) => (
                                                            <div key={idx} className='relative w-13 h-13 rounded-xl bg-neutral-100 overflow-hidden shrink-0 border border-neutral-100'>
                                                                {item.image && !item.image.includes('placehold.co') ? (
                                                                    <Image src={item.image} alt={item.name} fill sizes='52px' className='object-cover' />
                                                                ) : null}
                                                                <div className={`w-full h-full items-center justify-center ${item.image && !item.image.includes('placehold.co') ? 'hidden' : 'flex'}`}>
                                                                    <Package className='w-4 h-4 text-neutral-300' />
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {order.orderItems?.length > 4 && (
                                                            <div className='w-13 h-13 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs text-neutral-500 font-medium shrink-0'>
                                                                +{order.orderItems.length - 4}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className='flex items-center justify-between'>
                                                        <div>
                                                            <p className='text-[11px] text-neutral-400 uppercase tracking-wider'>Total</p>
                                                            <p className='text-lg font-bold text-neutral-900'>{formatCurrency(order.totalPrice)}</p>
                                                        </div>
                                                        <div className='text-xs text-blue-700 font-medium inline-flex items-center gap-1'>
                                                            Track Order <ArrowRight className='w-3 h-3' />
                                                        </div>
                                                    </div>
                                                </article>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className='rounded-3xl border border-neutral-200/80 bg-white/95 p-5 h-fit lg:sticky lg:top-24'>
                        <h2 className='text-sm font-semibold text-neutral-900 mb-4'>Manage Orders</h2>

                        <div className='space-y-2 mb-5'>
                            <div className='rounded-xl border border-neutral-200 px-3 py-2.5 flex items-center justify-between'>
                                <span className='text-sm text-neutral-600'>Active orders</span>
                                <span className='text-sm font-semibold text-blue-700'>{stats.active}</span>
                            </div>
                            <div className='rounded-xl border border-neutral-200 px-3 py-2.5 flex items-center justify-between'>
                                <span className='text-sm text-neutral-600'>Delivered</span>
                                <span className='text-sm font-semibold text-emerald-700'>{stats.delivered}</span>
                            </div>
                            <div className='rounded-xl border border-neutral-200 px-3 py-2.5 flex items-center justify-between'>
                                <span className='text-sm text-neutral-600'>Cancelled</span>
                                <span className='text-sm font-semibold text-red-600'>{stats.cancelled}</span>
                            </div>
                        </div>

                        <div className='rounded-2xl border border-blue-100 bg-blue-50/70 p-4 mb-5'>
                            <p className='text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 mb-2'>Quick Actions</p>
                            <div className='space-y-2'>
                                <Link href='/shop' className='flex items-center justify-between text-sm text-neutral-700 hover:text-blue-700 transition-colors'>
                                    <span className='inline-flex items-center gap-2'><ShoppingBag className='w-4 h-4' /> Continue shopping</span>
                                    <ArrowRight className='w-3.5 h-3.5' />
                                </Link>
                                <Link href='/contact' className='flex items-center justify-between text-sm text-neutral-700 hover:text-blue-700 transition-colors'>
                                    <span className='inline-flex items-center gap-2'><Package className='w-4 h-4' /> Need order help?</span>
                                    <ArrowRight className='w-3.5 h-3.5' />
                                </Link>
                            </div>
                        </div>

                        <p className='text-xs text-neutral-500 leading-relaxed'>
                            Tip: use search to quickly find orders by product name or order ID, then open an order to view full shipment and payment details.
                        </p>
                    </aside>
                </div>
            </div>
            <Footer />
        </div>
    )
}