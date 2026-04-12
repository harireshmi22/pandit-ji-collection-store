'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Shield, Mail, Search, X, UserPlus } from 'lucide-react'

export default function AdminAdminsPage() {
    const { data: session, status } = useSession()
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Manager', password: '' })
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/admin/admins')
            if (res.ok) {
                const data = await res.json()
                setAdmins(data.admins || [])
            } else {
                console.error('Failed to fetch admins')
                setAdmins([])
            }
        } catch (error) {
            console.error("Failed to fetch admins:", error)
            setAdmins([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'admin') {
            fetchAdmins()
        }
    }, [status, session, fetchAdmins])

    const handleAddAdmin = async (e) => {
        e.preventDefault()
        try {
            const res = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newAdmin.name,
                    email: newAdmin.email,
                    password: newAdmin.password
                })
            })
            if (res.ok) {
                showToast('Admin added successfully')
                setShowAddModal(false)
                setNewAdmin({ name: '', email: '', role: 'Manager', password: '' })
                fetchAdmins()
            } else {
                const data = await res.json()
                showToast(data.message || 'Failed to add admin', 'error')
            }
        } catch (err) {
            showToast('Failed to add admin', 'error')
        }
    }

    const filtered = admins.filter(admin =>
        admin.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                    <h1 className='text-2xl font-semibold tracking-tight leading-tight text-neutral-900'>Team</h1>
                    <p className='text-sm text-neutral-500 mt-1'>{admins.length} admin members</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className='flex items-center gap-2 px-4 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-[0_12px_22px_-14px_rgba(37,99,235,0.8)]'
                >
                    <Plus className='w-4 h-4' />
                    Add Member
                </button>
            </div>

            {/* Search */}
            <div className='relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                <input
                    type="text"
                    placeholder="Search team members..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className='w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                />
            </div>

            {/* Team Grid */}
            {loading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='bg-white rounded-2xl border border-blue-200/60 p-5 animate-pulse'>
                            <div className='h-10 w-10 rounded-xl bg-blue-100/60 mb-4' />
                            <div className='h-4 w-1/2 rounded bg-blue-100/60 mb-2' />
                            <div className='h-3 w-2/3 rounded bg-blue-100/60' />
                        </div>
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className='bg-white rounded-2xl border border-blue-200/60 p-12 text-center'>
                    <UserPlus className='w-10 h-10 text-neutral-300 mx-auto mb-2' />
                    <p className='text-sm text-neutral-400'>No team members found</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filtered.map(admin => (
                        <div key={admin._id} className='bg-white rounded-2xl border border-blue-200/60 p-5 hover:shadow-[0_14px_26px_-18px_rgba(37,99,235,0.42)] transition-shadow'>
                            <div className='flex items-start justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-11 h-11 rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center'>
                                        <span className='text-white font-semibold text-sm'>
                                            {admin.name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className='text-sm font-semibold text-neutral-900'>{admin.name}</h3>
                                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-semibold rounded-md mt-1'>
                                            <Shield className='w-2.5 h-2.5' />
                                            Admin
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className='space-y-2'>
                                <p className='text-xs text-neutral-500 flex items-center gap-2'>
                                    <Mail className='w-3.5 h-3.5 text-neutral-400' />
                                    {admin.email}
                                </p>
                                <p className='text-xs text-neutral-400'>
                                    Joined {new Date(admin.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddModal && (
                <>
                    <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50' onClick={() => setShowAddModal(false)} />
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                        <div className='bg-white rounded-2xl shadow-xl max-w-md w-full p-6'>
                            <div className='flex items-center justify-between mb-6'>
                                <div>
                                    <h2 className='text-lg font-semibold text-neutral-900'>Add Team Member</h2>
                                    <p className='text-xs text-neutral-400 mt-0.5'>Create a new admin account</p>
                                </div>
                                <button onClick={() => setShowAddModal(false)} className='p-1.5 hover:bg-neutral-100 rounded-lg'>
                                    <X className='w-4 h-4 text-neutral-400' />
                                </button>
                            </div>
                            <form onSubmit={handleAddAdmin} className='space-y-4'>
                                <div>
                                    <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Name</label>
                                    <input
                                        type="text"
                                        value={newAdmin.name}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                                        required
                                        className='w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                        placeholder="Full name"
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Email</label>
                                    <input
                                        type="email"
                                        value={newAdmin.email}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                                        required
                                        className='w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                        placeholder="email@example.com"
                                    />
                                </div>
                                <div>
                                    <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Password</label>
                                    <input
                                        type="password"
                                        value={newAdmin.password}
                                        onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                                        required
                                        className='w-full px-3 py-2.5 text-sm border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none'
                                        placeholder="Minimum 6 characters"
                                    />
                                </div>
                                <div className='flex gap-3 pt-2'>
                                    <button
                                        type="button"
                                        onClick={() => setShowAddModal(false)}
                                        className='flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors'
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-linear-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors'
                                    >
                                        Add Member
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}