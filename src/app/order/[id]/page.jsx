'use client'
export const dynamic = 'force-dynamic'
import React, { useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../../components/home/Navbar'
import Footer from '../../components/home/Footer'
import {
    CheckCircle, Package, Truck, CreditCard, Loader, ArrowLeft,
    Volume2, VolumeX, Sparkles, CircleDot, ShieldCheck, CalendarClock, XCircle
} from 'lucide-react'

export default function OrderDetailPage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const [order, setOrder] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(false)
    const soundPlayedRef = useRef(false)

    const isSuccessVisit = searchParams.get('success') === '1'
    const paymentSource = searchParams.get('payment')

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

    useEffect(() => {
        if (!params.id || !order?._id) return
        if (order.status === 'Delivered' || order.status === 'Cancelled') return

        const intervalId = setInterval(async () => {
            try {
                const res = await fetch(`/api/orders/${params.id}`, { cache: 'no-store' })
                if (!res.ok) return
                const latest = await res.json()
                setOrder((prev) => {
                    if (!prev) return latest
                    if (prev.status === latest.status && prev.updatedAt === latest.updatedAt) return prev
                    return latest
                })
            } catch {
                // Silent polling failure; next interval will retry.
            }
        }, 15000)

        return () => clearInterval(intervalId)
    }, [params.id, order?._id, order?.status])

    useEffect(() => {
        if (!order?._id || !isSuccessVisit) return

        const storageKey = `order-celebration-${order._id}`
        const alreadyCelebrated = typeof window !== 'undefined' && sessionStorage.getItem(storageKey)
        if (alreadyCelebrated) return

        setShowCelebration(true)
        sessionStorage.setItem(storageKey, '1')
    }, [order?._id, isSuccessVisit])

    useEffect(() => {
        if (typeof window === 'undefined') return
        setSoundEnabled(localStorage.getItem('celebration-sound-enabled') === '1')
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        localStorage.setItem('celebration-sound-enabled', soundEnabled ? '1' : '0')
    }, [soundEnabled])

    const playSuccessChime = () => {
        if (typeof window === 'undefined') return

        const AudioContextClass = window.AudioContext || window.webkitAudioContext
        if (!AudioContextClass) return

        const audioContext = new AudioContextClass()
        const now = audioContext.currentTime
        const notes = [523.25, 659.25, 783.99]

        notes.forEach((frequency, index) => {
            const oscillator = audioContext.createOscillator()
            const gainNode = audioContext.createGain()

            oscillator.type = 'sine'
            oscillator.frequency.setValueAtTime(frequency, now)

            const startAt = now + index * 0.12
            const stopAt = startAt + 0.24

            gainNode.gain.setValueAtTime(0.0001, startAt)
            gainNode.gain.exponentialRampToValueAtTime(0.07, startAt + 0.03)
            gainNode.gain.exponentialRampToValueAtTime(0.0001, stopAt)

            oscillator.connect(gainNode)
            gainNode.connect(audioContext.destination)

            oscillator.start(startAt)
            oscillator.stop(stopAt)
        })

        setTimeout(() => {
            audioContext.close().catch(() => { })
        }, 900)
    }

    useEffect(() => {
        if (!showCelebration) {
            soundPlayedRef.current = false
            return
        }

        if (!soundEnabled || soundPlayedRef.current) return

        playSuccessChime()
        soundPlayedRef.current = true
    }, [showCelebration, soundEnabled])

    const handleSoundToggle = () => {
        const nextValue = !soundEnabled
        setSoundEnabled(nextValue)

        if (nextValue && showCelebration) {
            playSuccessChime()
            soundPlayedRef.current = true
        }
    }

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

    const statusSequence = ['Pending', 'Processing', 'Shipped', 'Delivered']

    const normalizedStatus = order.status === 'Cancelled' ? 'Pending' : (order.status || 'Pending')
    const statusIndex = Math.max(statusSequence.indexOf(normalizedStatus), 0)
    const progressPercent = order.status === 'Cancelled' ? 0 : Math.max(((statusIndex + 1) / statusSequence.length) * 100, 15)

    const isCancelled = order.status === 'Cancelled'
    const isDelivered = order.status === 'Delivered'
    const isCod = order.paymentMethod === 'Cash on Delivery'
    const isPrepaid = !isCod
    const isRefunded = order.paymentStatus === 'refunded'
    const isOnlinePaid = isPrepaid && Boolean(order.isPaid || ['authorized', 'captured', 'refunded'].includes(order.paymentStatus || ''))
    const isRefundFlow = isCancelled && isOnlinePaid
    const isPaymentPaid = Boolean(order.isPaid || isDelivered)
    const isCodPending = isCod && !isPaymentPaid && !isCancelled
    const isCodCancelled = isCancelled && isCod
    const paymentStatusText = isRefundFlow
        ? (isRefunded ? 'Refunded' : 'Refund Initiated')
        : (isCodPending
            ? 'Pay on Delivery'
            : (isCodCancelled
                ? 'No payment required'
                : (isPaymentPaid
                    ? (order.paymentMethod === 'Cash on Delivery' && !order.isPaid ? 'Paid on delivery' : 'Paid')
                    : 'Pending')))
    const paymentBadgeLabel = isRefundFlow
        ? paymentStatusText
        : (isCodPending
            ? 'Pay on Delivery'
            : (isCodCancelled
                ? 'COD Cancelled'
                : (isPaymentPaid ? 'Paid' : 'Pending')))
    const paymentBadgeToneClass = isRefundFlow
        ? (isRefunded ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')
        : (isCodPending
            ? 'bg-sky-50 text-sky-700'
            : (isCodCancelled
                ? 'bg-red-50 text-red-700'
                : (isPaymentPaid ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700')))
    const paymentStatusTextClass = isRefundFlow
        ? (isRefunded ? 'text-emerald-700' : 'text-rose-700')
        : (isCodPending
            ? 'text-sky-700'
            : (isCodCancelled
                ? 'text-red-700'
                : 'text-neutral-900'))
    const paymentHelperText = isRefundFlow
        ? (isRefunded
            ? 'Refund has been processed to your original payment method.'
            : 'Refund is being processed and will reflect shortly.')
        : (isCodPending
            ? 'Amount will be collected at delivery.'
            : (isCodCancelled
                ? 'Order was cancelled before COD collection.'
                : 'Secure transaction recorded'))
    const itemStatusLabel = isCancelled ? 'Cancelled' : order.status
    const itemStatusToneClass = isCancelled
        ? 'bg-red-50 text-red-700 border-red-100'
        : (isDelivered ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100')
    const itemPaymentInfo = isCancelled
        ? (isRefundFlow
            ? (isRefunded ? 'Refund completed for this item' : 'Refund in progress for this item')
            : (isCod ? 'COD was not charged for this item' : 'Payment not captured for this item'))
        : (isCodPending
            ? 'Pay on delivery'
            : (isPaymentPaid ? 'Payment received' : 'Awaiting payment'))
    const heroTitle = isCancelled ? 'Your order is cancelled' : (isDelivered ? 'Your order is delivered' : 'Your order is on the way')
    const heroSubtitle = isCancelled
        ? 'This order has been cancelled. If money was deducted, it will be refunded as per payment method.'
        : (isDelivered
            ? 'Delivered successfully. Payment received and order completed.'
            : 'We are preparing your package and will notify you at each step.')
    const cancelQuickMessage = 'Yeah, your order is cancelled.'

    return (
        <div className='min-h-screen bg-white page-shell'>
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <Link href='/orders' className='inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors'>
                    <ArrowLeft className='w-4 h-4' /> All Orders
                </Link>

                <div className={`relative overflow-hidden rounded-3xl px-5 sm:px-7 py-7 sm:py-8 mb-6 animate-fade-up hero-card-entrance ${isCancelled
                    ? 'border border-red-100/90 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(254,242,242,0.93),rgba(255,228,230,0.84))]'
                    : 'border border-blue-100/80 bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(239,246,255,0.92),rgba(224,242,254,0.8))]'
                    }`}>
                    <div className={`absolute -top-10 -right-10 w-44 h-44 rounded-full blur-2xl pointer-events-none hero-orb-drift ${isCancelled ? 'bg-red-300/20' : 'bg-blue-300/20'}`} />
                    <div className={`absolute -bottom-12 -left-10 w-48 h-48 rounded-full blur-2xl pointer-events-none hero-orb-drift-soft ${isCancelled ? 'bg-rose-300/20' : 'bg-cyan-300/20'}`} />

                    <div className='relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6'>
                        <div>
                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/85 text-[11px] font-semibold uppercase tracking-[0.14em] mb-3 ${isCancelled ? 'border border-red-100 text-red-700' : 'border border-blue-100 text-blue-700'
                                }`}>
                                {isCancelled ? <XCircle className='w-3.5 h-3.5' /> : <Sparkles className='w-3.5 h-3.5' />} {isCancelled ? 'Order Cancelled' : 'Order Confirmed'}
                            </div>
                            <h1 className='text-3xl sm:text-4xl font-bold text-neutral-900 leading-tight'>{heroTitle}</h1>
                            <p className='text-sm text-neutral-600 mt-2'>
                                Order #{order._id.slice(-8).toUpperCase()} &middot; {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                            {isCancelled && (
                                <p className='text-sm font-semibold text-red-600 mt-1.5 inline-flex items-center gap-1.5'>
                                    <XCircle className='w-4 h-4' /> {cancelQuickMessage}
                                </p>
                            )}
                            <p className='text-xs text-neutral-500 mt-1'>{heroSubtitle}</p>
                        </div>

                        <div className='relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 mx-auto sm:mx-0 hero-icon-float'>
                            <div className={`absolute inset-0 rounded-full ${isCancelled ? 'bg-red-200/60 cancel-pulse' : 'bg-blue-200/50 animate-ping'}`} />
                            <div className={`absolute inset-2 rounded-full ${isCancelled ? 'bg-rose-200/45 cancel-pulse-soft' : 'bg-cyan-200/40 animate-pulse'}`} />
                            <div className={`relative w-full h-full rounded-full text-white flex items-center justify-center ${isCancelled
                                ? 'bg-red-600 shadow-[0_18px_34px_-16px_rgba(220,38,38,0.75)]'
                                : 'bg-blue-600 shadow-[0_18px_34px_-16px_rgba(37,99,235,0.75)]'
                                }`}>
                                {isCancelled ? <XCircle className='w-10 h-10' /> : <CheckCircle className='w-10 h-10' />}
                            </div>
                        </div>
                    </div>

                    <div className='grid grid-cols-2 md:grid-cols-4 gap-2.5 mt-6'>
                        <div className='rounded-xl border border-blue-100 bg-white/80 px-3 py-2.5'>
                            <p className='text-[10px] uppercase tracking-wider text-neutral-500'>Total</p>
                            <p className='text-sm font-semibold text-neutral-900 mt-0.5'>₹{order.totalPrice?.toFixed(2)}</p>
                        </div>
                        <div className='rounded-xl border border-blue-100 bg-white/80 px-3 py-2.5'>
                            <p className='text-[10px] uppercase tracking-wider text-neutral-500'>Payment</p>
                            <p className={`text-sm font-semibold mt-0.5 ${paymentStatusTextClass}`}>{paymentStatusText}</p>
                        </div>
                        <div className='rounded-xl border border-blue-100 bg-white/80 px-3 py-2.5'>
                            <p className='text-[10px] uppercase tracking-wider text-neutral-500'>Method</p>
                            <p className='text-sm font-semibold text-neutral-900 mt-0.5 truncate'>{order.paymentMethod}</p>
                        </div>
                        <div className='rounded-xl border border-blue-100 bg-white/80 px-3 py-2.5'>
                            <p className='text-[10px] uppercase tracking-wider text-neutral-500'>Status</p>
                            <p className={`text-sm font-semibold mt-0.5 ${isCancelled ? 'text-red-600' : 'text-neutral-900'}`}>{order.status}</p>
                        </div>
                    </div>
                </div>

                <div className='rounded-2xl border border-neutral-200/90 bg-white p-4 sm:p-5 mb-6 animate-fade-up delay-100'>
                    <div className='flex items-center justify-between mb-3'>
                        <h2 className='text-sm font-semibold text-neutral-900 inline-flex items-center gap-2'>
                            <CalendarClock className='w-4 h-4 text-blue-600' /> Delivery Timeline
                        </h2>
                        <span className={`text-xs ${isCancelled ? 'text-red-600 font-medium' : 'text-neutral-500'}`}>
                            {isCancelled ? 'Order cancelled' : 'Live progress'}
                        </span>
                    </div>

                    {!isCancelled ? (
                        <div className='relative h-2 rounded-full bg-neutral-100 overflow-hidden mb-3'>
                            <div className='h-full rounded-full bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500 transition-all duration-700' style={{ width: `${progressPercent}%` }} />
                            <div className='absolute inset-0 timeline-sheen' />
                        </div>
                    ) : (
                        <div className='relative h-2 rounded-full bg-red-100 overflow-hidden mb-3'>
                            <div className='h-full w-full rounded-full bg-linear-to-r from-red-500 via-rose-500 to-red-500 cancel-bar-glow' />
                            <div className='absolute inset-0 cancel-stripes' />
                        </div>
                    )}

                    <div className='grid grid-cols-4 gap-2'>
                        {(isCancelled ? ['Pending', 'Processing', 'Shipped', 'Cancelled'] : statusSequence).map((step, idx) => {
                            const reached = idx <= statusIndex && !isCancelled
                            const isCancelledStep = isCancelled && step === 'Cancelled'
                            return (
                                <div key={step} className='flex items-center gap-1.5'>
                                    <CircleDot className={`w-3.5 h-3.5 ${isCancelledStep ? 'text-red-600 cancel-step-dot' : (reached ? 'text-blue-600' : 'text-neutral-300')}`} />
                                    <span className={`text-[11px] ${isCancelledStep ? 'text-red-600 font-semibold' : (reached ? 'text-neutral-700 font-medium' : 'text-neutral-400')}`}>{step}</span>
                                </div>
                            )
                        })}
                    </div>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 border border-gray-200 rounded-2xl'>
                    <div className='lg:col-span-2 space-y-6'>
                        {/* Items */}
                        <div className='border border-neutral-100 rounded-2xl overflow-hidden bg-white animate-fade-up delay-200'>
                            <div className='px-5 py-4 border-b border-neutral-100 flex items-center gap-2'>
                                <Package className='w-4 h-4 text-neutral-400' />
                                <h2 className='text-sm font-semibold text-neutral-900'>Items ({order.orderItems?.length})</h2>
                            </div>
                            {isCancelled && (
                                <div className='mx-5 mt-4 rounded-xl border border-red-100 bg-red-50/80 px-3 py-2.5'>
                                    <p className='text-sm font-semibold text-red-700 inline-flex items-center gap-1.5'>
                                        <XCircle className='w-4 h-4' /> Order is cancelled
                                    </p>
                                    <p className='text-xs text-red-600 mt-1'>
                                        {isRefundFlow
                                            ? (isRefunded ? 'Payment refunded for cancelled items.' : 'Refund is in progress for cancelled items.')
                                            : 'No charge was applied to cancelled items.'}
                                    </p>
                                </div>
                            )}
                            <div className='divide-y divide-neutral-50'>
                                {order.orderItems?.map((item, i) => (
                                    <div key={i} className='p-5 flex gap-4 group hover:bg-blue-50/25 transition-colors item-row-enter' style={{ animationDelay: `${0.06 * (i + 1)}s` }}>
                                        <div className='relative w-16 h-20 rounded-xl bg-neutral-100 overflow-hidden shrink-0'>
                                            {item.image && !item.image.includes('placehold.co') ? (
                                                <Image src={item.image} alt={item.name} fill className='object-cover group-hover:scale-105 transition-transform duration-500' />
                                            ) : null}
                                            <div className={`w-full h-full items-center justify-center ${item.image && !item.image.includes('placehold.co') ? 'hidden' : 'flex'}`}>
                                                <Package className='w-5 h-5 text-neutral-300' />
                                            </div>
                                        </div>
                                        <div className='flex-1 min-w-0'>
                                            <div className='flex items-start justify-between gap-2'>
                                                <h3 className='text-sm font-medium text-neutral-900 truncate'>{item.name}</h3>
                                                <span className={`shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${itemStatusToneClass}`}>
                                                    {itemStatusLabel}
                                                </span>
                                            </div>
                                            <p className='text-xs text-neutral-400 mt-0.5'>Size: {item.size || 'M'} &middot; Qty: {item.quantity}</p>
                                            <p className='text-sm font-semibold text-neutral-900 mt-1'>₹{item.price?.toFixed(2)}</p>
                                            <p className={`text-[11px] mt-1 ${isCancelled ? 'text-red-600' : 'text-neutral-500'}`}>{itemPaymentInfo}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Shipping & Payment */}
                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <div className='border border-neutral-100 rounded-2xl p-5 bg-white animate-fade-up delay-300'>
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
                            <div className='border border-neutral-100 rounded-2xl p-5 bg-white animate-fade-up delay-300'>
                                <div className='flex items-center gap-2 mb-3'>
                                    <CreditCard className='w-4 h-4 text-neutral-400' />
                                    <h3 className='text-sm font-semibold text-neutral-900'>Payment</h3>
                                </div>
                                <div className='text-sm text-neutral-600 space-y-1'>
                                    <p>{order.paymentMethod}</p>
                                    <span className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${paymentBadgeToneClass}`}>
                                        {paymentBadgeLabel}
                                    </span>
                                    <div className='pt-3 mt-3 border-t border-neutral-100 text-xs inline-flex items-center gap-1.5 text-neutral-500'>
                                        <ShieldCheck className={`w-3.5 h-3.5 ${isCancelled ? 'text-red-600' : 'text-emerald-600'}`} /> {paymentHelperText}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div>
                        <div className='border border-neutral-100 rounded-2xl p-5 sticky top-24 bg-white animate-fade-up delay-200'>
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

            {showCelebration && (
                <>
                    <div className='fixed inset-0 bg-black/45 backdrop-blur-sm z-200 modal-overlay-enter' onClick={() => setShowCelebration(false)} />
                    <div className='fixed inset-0 z-201 flex items-center justify-center p-4'>
                        <div className='relative bg-[linear-gradient(145deg,#ffffff,#f8fbff,#eef8ff)] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden celebration-enter celebration-card-float'>
                            <div className='absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-blue-500 via-indigo-500 to-cyan-500' />
                            <div className='absolute inset-0 pointer-events-none'>
                                {Array.from({ length: 16 }).map((_, index) => (
                                    <span
                                        key={`burst-${index}`}
                                        className='absolute celebration-burst'
                                        style={{
                                            left: '50%',
                                            top: '54%',
                                            width: `${6 + (index % 4) * 2}px`,
                                            height: `${6 + (index % 4) * 2}px`,
                                            borderRadius: '9999px',
                                            backgroundColor: index % 3 === 0 ? '#10b981' : index % 3 === 1 ? '#0ea5e9' : '#f59e0b',
                                            '--burst-x': `${Math.cos((index / 16) * Math.PI * 2) * (90 + (index % 4) * 14)}px`,
                                            '--burst-y': `${Math.sin((index / 16) * Math.PI * 2) * (70 + (index % 5) * 12)}px`,
                                            animationDelay: `${index * 0.02}s`,
                                        }}
                                    />
                                ))}

                                {Array.from({ length: 18 }).map((_, index) => (
                                    <span
                                        key={index}
                                        className='absolute rounded-full opacity-70 celebration-bubble'
                                        style={{
                                            left: `${10 + ((index * 11) % 80)}%`,
                                            top: `${70 + (index % 4) * 8}%`,
                                            width: `${11 + (index % 5) * 3}px`,
                                            height: `${11 + (index % 5) * 3}px`,
                                            backgroundColor: index % 3 === 0 ? '#10b981' : index % 3 === 1 ? '#0ea5e9' : '#f59e0b',
                                            animationDelay: `${0.45 + index * 0.11}s`,
                                            animationDuration: `${2.8 + (index % 5) * 0.3}s`,
                                            '--bubble-drift-x': `${((index % 2 === 0 ? 1 : -1) * (30 + (index % 5) * 8))}px`,
                                            '--bubble-rise': `${150 + (index % 6) * 28}px`,
                                            '--bubble-scale': `${0.95 + (index % 4) * 0.18}`,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className='relative p-7 text-center'>
                                <div className='mx-auto mb-4 relative w-20 h-20 flex items-center justify-center'>
                                    <div className='absolute inset-0 rounded-full bg-blue-100 animate-ping' />
                                    <div className='absolute inset-2 rounded-full bg-cyan-100 animate-pulse' />
                                    <div className='relative w-20 h-20 rounded-full bg-blue-500 text-white flex items-center justify-center shadow-[0_18px_30px_-14px_rgba(37,99,235,0.65)]'>
                                        <CheckCircle className='w-10 h-10' />
                                    </div>
                                </div>

                                <h3 className='text-2xl font-bold text-neutral-900 mb-2'>Order Placed Successfully</h3>
                                <p className='text-sm text-neutral-600 mb-1'>Your order is confirmed and being prepared.</p>
                                <p className='text-xs text-neutral-500 mb-5'>
                                    {paymentSource === 'cod' ? 'Payment Method: Cash on Delivery' : 'Payment Method: Online Payment'}
                                </p>

                                <div className='mb-5'>
                                    <button
                                        type='button'
                                        onClick={handleSoundToggle}
                                        className='mx-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 text-xs font-medium text-neutral-600 hover:bg-neutral-50 transition-colors cursor-pointer'
                                    >
                                        {soundEnabled ? <Volume2 className='w-3.5 h-3.5' /> : <VolumeX className='w-3.5 h-3.5' />}
                                        {soundEnabled ? 'Success sound: On' : 'Success sound: Off'}
                                    </button>
                                </div>

                                <div className='grid grid-cols-2 gap-2 mb-5 text-xs'>
                                    <div className='rounded-xl bg-neutral-50 p-3'>
                                        <p className='text-neutral-400'>Order ID</p>
                                        <p className='text-neutral-900 font-semibold mt-1'>#{order._id.slice(-8).toUpperCase()}</p>
                                    </div>
                                    <div className='rounded-xl bg-neutral-50 p-3'>
                                        <p className='text-neutral-400'>Total</p>
                                        <p className='text-neutral-900 font-semibold mt-1'>₹{order.totalPrice?.toFixed(2)}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setShowCelebration(false)}
                                    className='w-full py-3 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors cursor-pointer'
                                >
                                    Awesome, Continue
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
                .page-shell {
                    animation: pageSettle 0.5s ease-out;
                }

                .hero-card-entrance {
                    animation: heroRise 0.6s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .hero-orb-drift {
                    animation: orbDrift 6.5s ease-in-out infinite;
                }

                .hero-orb-drift-soft {
                    animation: orbDriftSoft 7.2s ease-in-out infinite;
                }

                .hero-icon-float {
                    animation: heroIconFloat 3.2s ease-in-out infinite;
                }

                .timeline-sheen {
                    background: linear-gradient(90deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0) 100%);
                    transform: translateX(-120%);
                    animation: timelineSweep 2.4s ease-in-out infinite;
                    pointer-events: none;
                }

                .item-row-enter {
                    opacity: 0;
                    transform: translate3d(0, 10px, 0);
                    animation: itemFadeIn 0.46s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }

                .modal-overlay-enter {
                    animation: overlayFade 0.32s ease-out;
                }

                .celebration-card-float {
                    animation: modalRise 0.45s cubic-bezier(0.16, 1, 0.3, 1), cardFloat 4.8s ease-in-out infinite 0.52s;
                }

                .celebration-enter {
                    animation: modalRise 0.45s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .celebration-bubble {
                    animation-name: bubbleTravel;
                    animation-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
                    animation-iteration-count: infinite;
                    will-change: transform, opacity;
                    filter: blur(0.2px);
                }

                .celebration-burst {
                    opacity: 0;
                    transform: translate3d(0, 0, 0) scale(0.3);
                    animation: bubbleBurst 0.95s cubic-bezier(0.19, 1, 0.22, 1) forwards;
                    will-change: transform, opacity;
                }

                @keyframes modalRise {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 18px, 0) scale(0.96);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                }

                @keyframes bubbleTravel {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 16px, 0) scale(0.25);
                    }
                    12% {
                        opacity: 0.95;
                    }
                    45% {
                        transform: translate3d(calc(var(--bubble-drift-x) * 0.45), calc(var(--bubble-rise) * -0.45), 0) scale(var(--bubble-scale));
                    }
                    78% {
                        opacity: 0.6;
                        transform: translate3d(var(--bubble-drift-x), calc(var(--bubble-rise) * -0.82), 0) scale(calc(var(--bubble-scale) * 0.9));
                    }
                    100% {
                        opacity: 0;
                        transform: translate3d(calc(var(--bubble-drift-x) * 1.35), calc(var(--bubble-rise) * -1), 0) scale(0.18);
                    }
                }

                @keyframes bubbleBurst {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 0, 0) scale(0.3);
                    }
                    15% {
                        opacity: 0.95;
                    }
                    100% {
                        opacity: 0;
                        transform: translate3d(var(--burst-x), var(--burst-y), 0) scale(1.25);
                    }
                }

                .cancel-bar-glow {
                    animation: cancelGlow 1.6s ease-in-out infinite;
                }

                .cancel-stripes {
                    background-image: repeating-linear-gradient(
                        -45deg,
                        rgba(255, 255, 255, 0.2) 0,
                        rgba(255, 255, 255, 0.2) 10px,
                        rgba(255, 255, 255, 0) 10px,
                        rgba(255, 255, 255, 0) 20px
                    );
                    animation: cancelStripeSlide 1s linear infinite;
                }

                .cancel-step-dot {
                    animation: cancelDotPulse 1.2s ease-in-out infinite;
                }

                .cancel-pulse {
                    animation: cancelPulse 1.4s ease-in-out infinite;
                }

                .cancel-pulse-soft {
                    animation: cancelPulse 1.4s ease-in-out infinite 0.12s;
                }

                @media (prefers-reduced-motion: reduce) {
                    .page-shell,
                    .hero-card-entrance,
                    .hero-orb-drift,
                    .hero-orb-drift-soft,
                    .hero-icon-float,
                    .timeline-sheen,
                    .item-row-enter,
                    .modal-overlay-enter,
                    .celebration-card-float,
                    .celebration-enter,
                    .celebration-bubble,
                    .celebration-burst,
                    .cancel-bar-glow,
                    .cancel-stripes,
                    .cancel-step-dot,
                    .cancel-pulse,
                    .cancel-pulse-soft {
                        animation: none !important;
                        transform: none !important;
                    }
                }

                @keyframes pageSettle {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes heroRise {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 14px, 0) scale(0.992);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0) scale(1);
                    }
                }

                @keyframes orbDrift {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(-7px, 8px, 0);
                    }
                }

                @keyframes orbDriftSoft {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(6px, -8px, 0);
                    }
                }

                @keyframes heroIconFloat {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(0, -4px, 0);
                    }
                }

                @keyframes timelineSweep {
                    0% {
                        transform: translateX(-120%);
                    }
                    100% {
                        transform: translateX(120%);
                    }
                }

                @keyframes itemFadeIn {
                    0% {
                        opacity: 0;
                        transform: translate3d(0, 10px, 0);
                    }
                    100% {
                        opacity: 1;
                        transform: translate3d(0, 0, 0);
                    }
                }

                @keyframes overlayFade {
                    0% {
                        opacity: 0;
                    }
                    100% {
                        opacity: 1;
                    }
                }

                @keyframes cardFloat {
                    0%,
                    100% {
                        transform: translate3d(0, 0, 0);
                    }
                    50% {
                        transform: translate3d(0, -4px, 0);
                    }
                }

                @keyframes cancelGlow {
                    0%,
                    100% {
                        filter: brightness(1);
                    }
                    50% {
                        filter: brightness(1.15);
                    }
                }

                @keyframes cancelStripeSlide {
                    0% {
                        background-position: 0 0;
                    }
                    100% {
                        background-position: 40px 0;
                    }
                }

                @keyframes cancelDotPulse {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 1;
                    }
                    50% {
                        transform: scale(1.18);
                        opacity: 0.72;
                    }
                }

                @keyframes cancelPulse {
                    0%,
                    100% {
                        transform: scale(1);
                        opacity: 0.95;
                    }
                    50% {
                        transform: scale(1.12);
                        opacity: 0.72;
                    }
                }
            `}</style>
        </div>
    )
}