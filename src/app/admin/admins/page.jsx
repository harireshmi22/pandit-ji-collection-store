'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { Plus, Shield, Mail, Edit2, Trash2, Search, X, Loader2, UserPlus } from 'lucide-react'
import { userService } from '@/service/userService'

export default function AdminAdminsPage() {
    const { data: session, status } = useSession()
    const [admins, setAdmins] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [showAddModal, setShowAddModal] = useState(false)
    const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Manager', password: '' })
    const [toast, setToast] = useState(null)
    const [deleteId, setDeleteId] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchAdmins = useCallback(async () => {
        try {
            setLoading(true)
            const result = await userService.getAllData()
            const adminUsers = (result || []).filter(u => u.role === 'admin')
            setAdmins(adminUsers)
        } catch (error) {
            console.error("Failed to fetch admins:", error)
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
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newAdmin, role: 'admin' })
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

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
            </div>
        )
    }

    return (
        <div className='space-y-5'>
            {/* Toast */}
            {toast && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
            )}

            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold text-neutral-900'>Team</h1>
                    <p className='text-sm text-neutral-500 mt-0.5'>{admins.length} admin members</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className='flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors'
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
                    className='w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none'
                />
            </div>

            {/* Team Grid */}
            {filtered.length === 0 ? (
                <div className='bg-white rounded-2xl border border-neutral-200/60 p-12 text-center'>
                    <UserPlus className='w-10 h-10 text-neutral-300 mx-auto mb-2' />
                    <p className='text-sm text-neutral-400'>No team members found</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                    {filtered.map(admin => (
                        <div key={admin._id} className='bg-white rounded-2xl border border-neutral-200/60 p-5 hover:shadow-sm transition-shadow'>
                            <div className='flex items-start justify-between mb-4'>
                                <div className='flex items-center gap-3'>
                                    <div className='w-11 h-11 rounded-xl bg-neutral-900 flex items-center justify-center'>
                                        <span className='text-white font-semibold text-sm'>
                                            {admin.name?.charAt(0)?.toUpperCase() || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className='text-sm font-semibold text-neutral-900'>{admin.name}</h3>
                                        <span className='inline-flex items-center gap-1 px-2 py-0.5 bg-violet-50 text-violet-700 text-[10px] font-semibold rounded-md mt-1'>
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
                                        className='w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none'
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
                                        className='w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none'
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
                                        className='w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none'
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
                                        className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors'
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