'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Search, Mail, Phone, Loader2, Users } from 'lucide-react'
import { userService } from '@/service/userService'
import { formatINRCurrency } from '@/lib/currency'

export default function AdminUsersPage() {
    const { data: session, status } = useSession()
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [spentRange, setSpentRange] = useState('all')

    const getAllUsers = useCallback(async (rangeValue = spentRange) => {
        try {
            setLoading(true)
            const result = await userService.getAllData({ spentRange: rangeValue })
            setUsers(result || [])
        } catch (error) {
            console.error("Failed to fetch users:", error)
        } finally {
            setLoading(false)
        }
    }, [spentRange])



    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            getAllUsers(spentRange)
        }
    }, [status, session, spentRange, getAllUsers])

    const filtered = users.filter(user =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className='space-y-5'>
            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold tracking-tight leading-tight text-neutral-900'>Customers</h1>
                    <p className='text-sm text-neutral-500 mt-1'>{users.length} registered customers</p>
                </div>
            </div>

            {/* Search */}
            <div className='flex flex-col gap-3 md:flex-row'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                    />
                </div>
                <select
                    value={spentRange}
                    onChange={(e) => setSpentRange(e.target.value)}
                    className='w-full md:w-56 px-3 py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                >
                    <option value='all'>Total Spent (All Time)</option>
                    <option value='30d'>Total Spent (Last 30 Days)</option>
                    <option value='90d'>Total Spent (Last 90 Days)</option>
                </select>
            </div>

            {/* Users Table */}
            <div className='bg-white rounded-2xl border border-blue-200/60 overflow-hidden'>
                <div className='overflow-x-auto'>
                    <table className='w-full min-w-225'>
                        <thead>
                            <tr className='border-b border-neutral-100'>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Customer</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Contact</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Joined</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Orders</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Paid Orders</th>
                                <th className='px-5 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-[0.08em]'>Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className='px-5 py-12 text-center'>
                                        <Users className='w-10 h-10 text-neutral-300 mx-auto mb-2' />
                                        <p className='text-sm text-neutral-400'>No customers found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(user => (
                                    <tr key={user._id} className='border-b border-neutral-50 hover:bg-blue-50/40 transition-colors'>
                                        <td className='px-5 py-3.5'>
                                            <div className='flex items-center gap-3'>
                                                <div className='w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0'>
                                                    <span className='text-sm font-semibold text-blue-700'>
                                                        {user.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className='text-sm font-medium text-neutral-900'>{user.name}</p>
                                                    <p className='text-xs text-neutral-400'>{user.role || 'customer'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className='px-5 py-3.5'>
                                            <div className='space-y-1'>
                                                <p className='text-sm text-neutral-600 flex items-center gap-1.5'>
                                                    <Mail className='w-3.5 h-3.5 text-neutral-400' />
                                                    {user.email}
                                                </p>
                                                {user.phone && (
                                                    <p className='text-xs text-neutral-400 flex items-center gap-1.5'>
                                                        <Phone className='w-3 h-3' />
                                                        {user.phone}
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className='px-5 py-3.5 text-sm text-neutral-500'>
                                            {new Date(user.createdAt || user.joined).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                        <td className='px-5 py-3.5'>
                                            <span className='text-sm font-medium text-neutral-700'>{user.orders || 0}</span>
                                        </td>
                                        <td className='px-5 py-3.5'>
                                            <span className='text-sm font-medium text-neutral-700'>{user.paidOrders || 0}</span>
                                        </td>
                                        <td className='px-5 py-3.5'>
                                            <span className='text-sm font-semibold text-neutral-900'>{formatINRCurrency(user.totalSpent || 0)}</span>
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