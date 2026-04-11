'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
    DollarSign, ShoppingBag, Users, Package,
    TrendingUp, TrendingDown, ArrowRight, Eye,
    Loader2, RefreshCw, Clock, CheckCircle2
} from 'lucide-react'

export default function AdminDashboardPage() {
    const { data: session, status } = useSession()
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/admin/stats')
            if (response.ok) {
                const data = await response.json()
                setStats(data)
            }
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchStats()
        }
    }, [status, session, fetchStats])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
        )
    }

    const statCards = [
        {
            label: 'Total Revenue',
            value: `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
            change: stats?.revenueChange || 0,
            icon: DollarSign,
            color: 'bg-blue-50 text-blue-700',
        },
        {
            label: 'Total Orders',
            value: stats?.totalOrders || 0,
            change: stats?.ordersChange || 0,
            icon: ShoppingBag,
            color: 'bg-indigo-50 text-indigo-700',
        },
        {
            label: 'Customers',
            value: stats?.totalUsers || 0,
            change: null,
            icon: Users,
            color: 'bg-cyan-50 text-cyan-700',
        },
        {
            label: 'Products',
            value: stats?.totalProducts || 0,
            change: null,
            icon: Package,
            color: 'bg-amber-50 text-amber-600',
        },
    ]

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Delivered': return 'bg-blue-50 text-blue-700'
            case 'Shipped': return 'bg-cyan-50 text-cyan-700'
            case 'Processing': return 'bg-amber-50 text-amber-700'
            case 'Cancelled': return 'bg-red-50 text-red-700'
            default: return 'bg-neutral-100 text-neutral-700'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircle2 className="w-3.5 h-3.5" />
            case 'Shipped': return <Package className="w-3.5 h-3.5" />
            case 'Processing': return <Clock className="w-3.5 h-3.5" />
            default: return <Clock className="w-3.5 h-3.5" />
        }
    }

    return (
        <div className='space-y-6'>
            {/* Welcome */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className='text-2xl font-semibold tracking-tight leading-tight text-neutral-900'>
                        Welcome back, {session?.user?.name?.split(' ')[0] || 'Admin'}
                    </h1>
                    <p className='text-sm text-neutral-500 mt-1'>Here is what is happening with your store today.</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Refresh</span>
                </button>
            </div>

            {/* Stat Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
                {statCards.map((card, i) => {
                    const Icon = card.icon
                    return (
                        <div key={i} className='bg-white rounded-2xl border border-blue-200/60 p-5 hover:shadow-[0_14px_26px_-18px_rgba(37,99,235,0.4)] transition-shadow'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color}`}>
                                    <Icon className='w-5 h-5' />
                                </div>
                                {card.change !== null && (
                                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg ${card.change >= 0 ? 'text-blue-700 bg-blue-50' : 'text-red-700 bg-red-50'}`}>
                                        {card.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {Math.abs(card.change)}%
                                    </span>
                                )}
                            </div>
                            <h3 className='text-2xl font-bold text-neutral-900'>{card.value}</h3>
                            <p className='text-xs text-neutral-500 mt-1 font-medium'>{card.label}</p>
                        </div>
                    )
                })}
            </div>

            {/* Recent Orders */}
            <div className='bg-white rounded-2xl border border-blue-200/60 overflow-hidden'>
                <div className='flex items-center justify-between px-5 py-4 border-b border-neutral-100'>
                    <h2 className='text-[15px] font-semibold text-neutral-900'>Recent Orders</h2>
                    <Link
                        href='/admin/orders'
                        className='flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-800 transition-colors'
                    >
                        View all <ArrowRight className='w-3.5 h-3.5' />
                    </Link>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full min-w-175'>
                        <thead>
                            <tr className='border-b border-neutral-100'>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Order</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Customer</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Date</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Status</th>
                                <th className='px-5 py-3 text-right text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Total</th>
                                <th className='px-5 py-3'></th>
                            </tr>
                        </thead>
                        <tbody>
                            {(stats?.recentOrders?.length === 0) ? (
                                <tr>
                                    <td colSpan={6} className='px-5 py-12 text-center text-sm text-neutral-400'>
                                        No orders yet
                                    </td>
                                </tr>
                            ) : (
                                stats?.recentOrders?.map((order) => (
                                    <tr key={order._id} className='border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors'>
                                        <td className='px-5 py-3.5'>
                                            <span className='text-sm font-medium text-neutral-900'>#{order._id.slice(-6)}</span>
                                        </td>
                                        <td className='px-5 py-3.5'>
                                            <div>
                                                <p className='text-sm font-medium text-neutral-800'>{order.user?.name || order.shippingAddress?.fullName || 'Guest'}</p>
                                                <p className='text-xs text-neutral-400'>{order.user?.email || ''}</p>
                                            </div>
                                        </td>
                                        <td className='px-5 py-3.5 text-sm text-neutral-500'>
                                            {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className='px-5 py-3.5'>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg ${getStatusStyle(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status || 'Pending'}
                                            </span>
                                        </td>
                                        <td className='px-5 py-3.5 text-right'>
                                            <span className='text-sm font-semibold text-neutral-900'>₹{order.totalPrice?.toFixed(2)}</span>
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
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}