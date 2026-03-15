'use client'
import React, { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
    Plus, Search, Filter, Loader2, Package,
    Edit2, Trash2, Star, Eye, MoreHorizontal, X
} from 'lucide-react'
import ProductModal from '../components/ProductModal'
import Image from 'next/image'

export default function AdminProductsPage() {
    const { data: session, status } = useSession()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editProduct, setEditProduct] = useState(null)
    const [deleteId, setDeleteId] = useState(null)
    const [toast, setToast] = useState(null)

    const showToast = (message, type = 'success') => {
        setToast({ message, type })
        setTimeout(() => setToast(null), 3000)
    }

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/products?limit=100')
            if (res.ok) {
                const json = await res.json()
                setProducts(Array.isArray(json) ? json : json.data || json.products || [])
            }
        } catch (err) {
            console.error('Failed to fetch products:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (status === 'authenticated') fetchProducts()
    }, [status, fetchProducts])

    const handleSaveProduct = async (formData) => {
        const isEdit = !!editProduct
        const url = isEdit ? `/api/products/${editProduct._id}` : '/api/products'
        const method = isEdit ? 'PUT' : 'POST'
        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        if (res.ok) {
            const result = await res.json()
            const saved = result.data || formData

            // Optimistic UI update — no full re-fetch needed
            if (isEdit) {
                setProducts(prev => prev.map(p => p._id === editProduct._id ? { ...p, ...saved } : p))
            } else {
                setProducts(prev => [saved, ...prev])
            }

            showToast(isEdit ? 'Product updated successfully' : 'Product created successfully')
            setIsModalOpen(false)
            setEditProduct(null)
        } else {
            throw new Error('Failed to save product')
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return
        try {
            const res = await fetch(`/api/products/${deleteId}`, { method: 'DELETE' })
            if (res.ok) {
                showToast('Product deleted successfully')
                setProducts(prev => prev.filter(p => p._id !== deleteId))
            }
        } catch (err) {
            showToast('Failed to delete product', 'error')
        } finally {
            setDeleteId(null)
        }
    }

    const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))]

    const filtered = products.filter(p => {
        const matchSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchCat = categoryFilter === 'all' || p.category === categoryFilter
        return matchSearch && matchCat
    })

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
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-neutral-900 text-white'}`}>
                    {toast.message}
                    <button onClick={() => setToast(null)}><X className="w-3.5 h-3.5" /></button>
                </div>
            )}

            {/* Header */}
            <div className='flex items-center justify-between'>
                <div>
                    <h1 className='text-2xl font-semibold text-neutral-900'>Products</h1>
                    <p className='text-sm text-neutral-500 mt-0.5'>{products.length} total products</p>
                </div>
                <button
                    onClick={() => { setEditProduct(null); setIsModalOpen(true) }}
                    className='flex items-center gap-2 px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors'
                >
                    <Plus className='w-4 h-4' />
                    Add Product
                </button>
            </div>

            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-3'>
                <div className='relative flex-1'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className='w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'
                    />
                </div>
                <div className='relative'>
                    <Filter className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400' />
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className='pl-10 pr-8 py-2.5 text-sm bg-white border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent appearance-none outline-none cursor-pointer'
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat === 'all' ? 'All Categories' : cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Product Grid */}
            {filtered.length === 0 ? (
                <div className='bg-white rounded-2xl border border-neutral-200/60 p-12 text-center'>
                    <Package className='w-12 h-12 text-neutral-300 mx-auto mb-3' />
                    <p className='text-neutral-500 font-medium'>No products found</p>
                    <p className='text-sm text-neutral-400 mt-1'>Try adjusting your search or filters</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {filtered.map(product => (
                        <div key={product._id} className='bg-white rounded-2xl border border-neutral-200/60 overflow-hidden group hover:shadow-md transition-all'>
                            {/* Image */}
                            <div className='relative aspect-square bg-neutral-100 overflow-hidden'>
                                {product.image ? (
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className='object-cover group-hover:scale-105 transition-transform duration-500'
                                    />
                                ) : (
                                    <div className='w-full h-full flex items-center justify-center'>
                                        <Package className='w-10 h-10 text-neutral-300' />
                                    </div>
                                )}

                                {/* Badges */}
                                <div className='absolute top-2.5 left-2.5 flex flex-col gap-1.5'>
                                    {product.featured && (
                                        <span className='flex items-center gap-1 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold rounded-md'>
                                            <Star className='w-2.5 h-2.5' /> Featured
                                        </span>
                                    )}
                                    {product.isNewArrival && (
                                        <span className='px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-semibold rounded-md'>
                                            New
                                        </span>
                                    )}
                                </div>

                                {/* Actions overlay */}
                                <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100'>
                                    <button
                                        onClick={() => { setEditProduct(product); setIsModalOpen(true) }}
                                        className='p-2 bg-white rounded-xl shadow-md hover:bg-neutral-50 transition-colors'
                                    >
                                        <Edit2 className='w-4 h-4 text-neutral-700' />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(product._id)}
                                        className='p-2 bg-white rounded-xl shadow-md hover:bg-red-50 transition-colors'
                                    >
                                        <Trash2 className='w-4 h-4 text-red-500' />
                                    </button>
                                </div>
                            </div>

                            {/* Info */}
                            <div className='p-3.5'>
                                <div className='flex items-start justify-between gap-2'>
                                    <div className='min-w-0'>
                                        <h3 className='text-sm font-medium text-neutral-900 truncate'>{product.name}</h3>
                                        <p className='text-xs text-neutral-400 mt-0.5'>{product.category} {product.brand ? `/ ${product.brand}` : ''}</p>
                                    </div>
                                    <p className='text-sm font-bold text-neutral-900 shrink-0'>${product.price}</p>
                                </div>
                                <div className='flex items-center justify-between mt-3 pt-3 border-t border-neutral-100'>
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${product.stock > 10 ? 'bg-emerald-50 text-emerald-700' : product.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                    {product.rating > 0 && (
                                        <span className='flex items-center gap-1 text-xs text-neutral-500'>
                                            <Star className='w-3 h-3 fill-amber-400 text-amber-400' />
                                            {product.rating}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirm Modal */}
            {deleteId && (
                <>
                    <div className='fixed inset-0 bg-black/20 backdrop-blur-sm z-50' onClick={() => setDeleteId(null)} />
                    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
                        <div className='bg-white rounded-2xl shadow-xl max-w-sm w-full p-6'>
                            <div className='w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4'>
                                <Trash2 className='w-5 h-5 text-red-500' />
                            </div>
                            <h3 className='text-lg font-semibold text-neutral-900 text-center'>Delete Product</h3>
                            <p className='text-sm text-neutral-500 text-center mt-2'>This action cannot be undone. Are you sure?</p>
                            <div className='flex gap-3 mt-6'>
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className='flex-1 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors'
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className='flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors'
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Product Modal */}
            <ProductModal
                isOpen={isModalOpen}
                product={editProduct}
                onClose={() => { setIsModalOpen(false); setEditProduct(null) }}
                onSave={handleSaveProduct}
            />
        </div>
    )
}