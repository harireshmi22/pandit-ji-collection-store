'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
    TrendingUp, DollarSign, ShoppingBag, Users, Loader2,
    ArrowUpRight, ArrowDownRight, BarChart3, PieChart, Activity
} from 'lucide-react'

export default function AdminAnalyticsPage() {
    const { data: session, status } = useSession()
    const [stats, setStats] = useState(null)
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [statsRes, ordersRes] = await Promise.all([
                fetch('/api/admin/stats'),
                fetch('/api/orders')
            ])
            if (statsRes.ok) setStats(await statsRes.json())
            if (ordersRes.ok) {
                const data = await ordersRes.json()
                setOrders(Array.isArray(data) ? data : [])
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') fetchData()
    }, [status, session, fetchData])

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
        )
    }

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalPrice || 0), 0)
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
    const deliveredOrders = orders.filter(o => o.status === 'Delivered').length
    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length
    const cancelledOrders = orders.filter(o => o.status === 'Cancelled').length
    const deliveryRate = orders.length > 0 ? ((deliveredOrders / orders.length) * 100).toFixed(1) : 0

    // Monthly breakdown
    const monthlyData = orders.reduce((acc, order) => {
        const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short' })
        acc[month] = (acc[month] || 0) + (order.totalPrice || 0)
        return acc
    }, {})
    const monthEntries = Object.entries(monthlyData)
    const maxMonthly = Math.max(...monthEntries.map(([, v]) => v), 1)

    // Status breakdown
    const statusBreakdown = orders.reduce((acc, o) => {
        acc[o.status || 'Pending'] = (acc[o.status || 'Pending'] || 0) + 1
        return acc
    }, {})

    const statusColors = {
        Delivered: 'bg-emerald-500',
        Shipped: 'bg-blue-500',
        Processing: 'bg-amber-500',
        Pending: 'bg-neutral-400',
        Cancelled: 'bg-red-500',
    }

    const metrics = [
        {
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'bg-emerald-50 text-emerald-600',
            sub: `From ${orders.length} orders`,
        },
        {
            label: 'Avg Order Value',
            value: `$${avgOrderValue.toFixed(2)}`,
            icon: TrendingUp,
            color: 'bg-blue-50 text-blue-600',
            sub: 'Per order average',
        },
        {
            label: 'Delivery Rate',
            value: `${deliveryRate}%`,
            icon: Activity,
            color: 'bg-violet-50 text-violet-600',
            sub: `${deliveredOrders} delivered`,
        },
        {
            label: 'Active Orders',
            value: pendingOrders,
            icon: ShoppingBag,
            color: 'bg-amber-50 text-amber-600',
            sub: `${cancelledOrders} cancelled`,
        },
    ]

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-2xl font-semibold text-neutral-900'>Analytics</h1>
                <p className='text-sm text-neutral-500 mt-0.5'>Track store performance and insights</p>
            </div>

            {/* Metric Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4'>
                {metrics.map((m, i) => {
                    const Icon = m.icon
                    return (
                        <div key={i} className='bg-white rounded-2xl border border-neutral-200/60 p-5'>
                            <div className='flex items-center justify-between mb-4'>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color}`}>
                                    <Icon className='w-5 h-5' />
                                </div>
                            </div>
                            <h3 className='text-2xl font-bold text-neutral-900'>{m.value}</h3>
                            <p className='text-xs text-neutral-500 mt-1 font-medium'>{m.label}</p>
                            <p className='text-[10px] text-neutral-400 mt-0.5'>{m.sub}</p>
                        </div>
                    )
                })}
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                {/* Revenue by Month */}
                <div className='bg-white rounded-2xl border border-neutral-200/60 p-5'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-2'>
                            <BarChart3 className='w-4 h-4 text-neutral-400' />
                            <h2 className='text-[15px] font-semibold text-neutral-900'>Monthly Revenue</h2>
                        </div>
                    </div>
                    {monthEntries.length === 0 ? (
                        <div className='h-48 flex items-center justify-center text-sm text-neutral-400'>
                            No data available yet
                        </div>
                    ) : (
                        <div className='space-y-3'>
                            {monthEntries.slice(-6).map(([month, value]) => (
                                <div key={month} className='flex items-center gap-3'>
                                    <span className='text-xs font-medium text-neutral-500 w-8'>{month}</span>
                                    <div className='flex-1 h-8 bg-neutral-50 rounded-lg overflow-hidden'>
                                        <div
                                            className='h-full bg-neutral-900 rounded-lg flex items-center justify-end pr-2 transition-all duration-500'
                                            style={{ width: `${Math.max((value / maxMonthly) * 100, 8)}%` }}
                                        >
                                            <span className='text-[10px] font-semibold text-white'>${value.toFixed(0)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Order Status Breakdown */}
                <div className='bg-white rounded-2xl border border-neutral-200/60 p-5'>
                    <div className='flex items-center justify-between mb-6'>
                        <div className='flex items-center gap-2'>
                            <PieChart className='w-4 h-4 text-neutral-400' />
                            <h2 className='text-[15px] font-semibold text-neutral-900'>Order Status</h2>
                        </div>
                        <span className='text-xs text-neutral-400 font-medium'>{orders.length} total</span>
                    </div>
                    <div className='space-y-3'>
                        {Object.entries(statusBreakdown).map(([status, count]) => (
                            <div key={status} className='flex items-center justify-between'>
                                <div className='flex items-center gap-2.5'>
                                    <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status] || 'bg-neutral-400'}`} />
                                    <span className='text-sm text-neutral-700'>{status}</span>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <div className='w-24 h-2 bg-neutral-100 rounded-full overflow-hidden'>
                                        <div
                                            className={`h-full rounded-full ${statusColors[status] || 'bg-neutral-400'}`}
                                            style={{ width: `${(count / orders.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className='text-sm font-semibold text-neutral-900 w-8 text-right'>{count}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary Cards */}
                    <div className='grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-neutral-100'>
                        <div className='bg-emerald-50 rounded-xl p-3 text-center'>
                            <p className='text-lg font-bold text-emerald-700'>{deliveryRate}%</p>
                            <p className='text-[10px] text-emerald-600 font-medium'>Success Rate</p>
                        </div>
                        <div className='bg-neutral-50 rounded-xl p-3 text-center'>
                            <p className='text-lg font-bold text-neutral-700'>{stats?.totalUsers || 0}</p>
                            <p className='text-[10px] text-neutral-500 font-medium'>Total Customers</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}