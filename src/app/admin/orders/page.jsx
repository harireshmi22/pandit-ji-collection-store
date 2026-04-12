'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    Search, Eye, RefreshCw, X,
    Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle
} from 'lucide-react'

export default function AdminOrdersPage() {
    const { data: session, status } = useSession()
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/orders')
            if (res.ok) {
                const data = await res.json()
                setOrders(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchOrders()
        }
    }, [status, session, fetchOrders])

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const res = await fetch(`/api/orders/${orderId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            })
            if (!res.ok) throw new Error('Failed to update status')
            const updatedOrder = await res.json()
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, ...updatedOrder } : o))
            showToast(`Order #${orderId.slice(-6)} updated to ${newStatus}`)
        } catch (err) {
            showToast(err.message, 'error')
        }
    }

    const isAutoPaidOnDelivery = (order) => {
        return order?.status === 'Delivered' && order?.paymentMethod === 'Cash on Delivery' && order?.isPaid
    }

    const filtered = orders.filter(order => {
        const matchSearch =
            order._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.shippingAddress?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchStatus = statusFilter === 'all' || order.status === statusFilter
        return matchSearch && matchStatus
    })

    const statusConfig = {
        Pending: { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Clock },
        Processing: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: AlertCircle },
        Shipped: { color: 'bg-cyan-50 text-cyan-700 border-cyan-200', icon: Truck },
        Delivered: { color: 'bg-blue-50 text-blue-700 border-blue-200', icon: CheckCircle2 },
        Cancelled: { color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
    }

    const statusCounts = {
        all: orders.length,
        Pending: orders.filter(o => o.status === 'Pending').length,
        Processing: orders.filter(o => o.status === 'Processing').length,
        Shipped: orders.filter(o => o.status === 'Shipped').length,
        Delivered: orders.filter(o => o.status === 'Delivered').length,
        Cancelled: orders.filter(o => o.status === 'Cancelled').length,
    }

    return (
        <div className='space-y-5'>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
            )}

            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold tracking-tight leading-tight text-neutral-900'>Orders</h1>
                    <p className='text-sm text-neutral-500 mt-1'>{orders.length} total orders</p>
                </div>
                <button
                    onClick={fetchOrders}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Refresh
                </button>
            </div>

            {/* Status Tabs */}
            <div className='flex gap-2 overflow-x-auto pb-1 no-scrollbar'>
                {['all', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(s => (
                    <button
                        key={s}
                        onClick={() => setStatusFilter(s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${statusFilter === s
                            ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white'
                            : 'bg-white text-neutral-600 border border-blue-200/70 hover:bg-blue-50'
                            }`}
                    >
                        {s === 'all' ? 'All' : s}
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${statusFilter === s ? 'bg-white/20' : 'bg-neutral-100'
                            }`}>
                            {statusCounts[s] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                <input
                    type="text"
                    placeholder="Search by order ID, customer name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                />
            </div>

            {/* Orders Table */}
            <div className='bg-white rounded-2xl border border-blue-200/60 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-225'>
                        <thead>
                            <tr className='border-b border-neutral-100'>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Order</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Customer</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Items</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Total</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Status</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Date</th>
                                <th className='px-5 py-3'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <tr key={i} className='border-b border-neutral-50'>
                                        <td colSpan={7} className='px-5 py-4'>
                                            <div className='h-6 rounded-lg bg-blue-100/60 animate-pulse' />
                                        </td>
                                    </tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className='px-5 py-12 text-center'>
                                        <Package className='w-10 h-10 text-neutral-300 mx-auto mb-2' />
                                        <p className='text-sm text-neutral-400'>No orders found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(order => {
                                    const cfg = statusConfig[order.status] || statusConfig.Pending
                                    const StatusIcon = cfg.icon
                                    return (
                                        <tr key={order._id} className='border-b border-neutral-50 hover:bg-blue-50/40 transition-colors'>
                                            <td className='px-5 py-3.5'>
                                                <span className='text-sm font-medium text-neutral-900'>#{order._id.slice(-6)}</span>
                                            </td>
                                            <td className='px-5 py-3.5'>
                                                <p className='text-sm font-medium text-neutral-800'>{order.shippingAddress?.fullName || 'N/A'}</p>
                                                <p className='text-xs text-neutral-400'>{order.shippingAddress?.email || ''}</p>
                                            </td>
                                            <td className='px-5 py-3.5 text-sm text-neutral-600'>
                                                {order.orderItems?.length || 0} items
                                            </td>
                                            <td className='px-5 py-3.5 text-sm font-semibold text-neutral-900'>
                                                <div>
                                                    <p>₹{order.totalPrice?.toFixed(2)}</p>
                                                    {isAutoPaidOnDelivery(order) && (
                                                        <span className='inline-flex mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200'>
                                                            Auto-paid on delivery
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className='px-5 py-3.5'>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                                    className={`px-2.5 py-1 text-xs font-medium rounded-lg border outline-none cursor-pointer ${cfg.color}`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Shipped">Shipped</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </td>
                                            <td className='px-5 py-3.5 text-sm text-neutral-500'>
                                                {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </td>
                                            <td className='px-5 py-3.5'>
                                                <Link
                                                    href={`/order/${order._id}`}
                                                    className='p-1.5 hover:bg-blue-50 rounded-lg transition-colors inline-flex'
                                                >
                                                    <Eye className='w-4 h-4 text-blue-500' />
                                                </Link>
                                            </td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}