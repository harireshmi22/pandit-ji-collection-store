'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Upload, Image as ImageIcon } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary'
import Image from 'next/image'

// InputField defined OUTSIDE component to prevent focus loss on re-render
const InputField = ({ label, name, value, onChange, error, type = 'text', required, placeholder, ...props }) => (
    <div>
        <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>
            {label} {required && <span className='text-red-400'>*</span>}
        </label>
        <input
            type={type} name={name} value={value || ''} onChange={onChange}
            placeholder={placeholder}
            className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all ${error ? 'border-red-300 bg-red-50/50' : 'border-neutral-200'}`}
            {...props}
        />
        {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
    </div>
)

export default function ProductModal({ isOpen, product, onClose, onSave }) {
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', originalPrice: '',
        category: '', brand: '', gender: '', size: '', color: '',
        material: '', image: '', images: [], stock: '',
        rating: 0, reviews: 0, featured: false, isNewArrival: true, discount: '',
    })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState('')
    const [imageFile, setImageFile] = useState(null)

    const parseCsv = (value) => {
        if (!value) return []
        return [...new Set(String(value).split(',').map(item => item.trim()).filter(Boolean))]
    }

    const stringifyList = (value, fallback = '') => {
        if (Array.isArray(value) && value.length > 0) return value.join(', ')
        return fallback
    }

    useEffect(() => {
        if (product) {
            setFormData({
                ...product,
                size: stringifyList(product.sizes, product.size || ''),
                color: stringifyList(product.colors, product.color || ''),
                material: stringifyList(product.materials, product.material || ''),
            })
            setImagePreview(product.image || '')
            setImageFile(null)
        } else {
            setFormData({
                name: '', description: '', price: '', originalPrice: '',
                category: '', brand: '', gender: '', size: '', color: '',
                material: '', image: '', images: [], stock: '',
                rating: 0, reviews: 0, featured: false, isNewArrival: true, discount: '',
            })
            setImagePreview('')
            setImageFile(null)
        }
        setErrors({})
    }, [product, isOpen])

    const categories = ['Top Wear', 'Bottom Wear', 'Footwear', 'Accessories', 'Outerwear']
    const genders = ['Men', 'Women', 'Unisex']

    const validate = () => {
        const e = {}
        if (!formData.name?.trim()) e.name = 'Name is required'
        if (!formData.description?.trim()) e.description = 'Description is required'
        if (!formData.price || formData.price <= 0) e.price = 'Price is required'
        if (!formData.category) e.category = 'Category is required'
        if (!formData.stock && formData.stock !== 0) e.stock = 'Stock is required'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }, [errors])

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleImageUrlChange = (e) => {
        const url = e.target.value
        setFormData(prev => ({ ...prev, image: url }))
        setImageFile(null)
        setImagePreview(url || '')
    }

    const clearImage = () => {
        setImageFile(null)
        setImagePreview('')
        setFormData(prev => ({ ...prev, image: '', images: [] }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return
        setLoading(true)
        try {
            let imageUrl = formData.image

            // Upload new image to Cloudinary instead of storing base64
            if (imageFile) {
                try {
                    imageUrl = await uploadToCloudinary(imageFile)
                } catch (uploadError) {
                    console.error('Image upload failed:', uploadError)
                    setErrors({ submit: 'Failed to upload image. Please try again.' })
                    setLoading(false)
                    return
                }
            }

            await onSave({
                ...formData,
                image: imageUrl,
                images: imageUrl ? [imageUrl] : [],
                sizes: parseCsv(formData.size),
                colors: parseCsv(formData.color),
                materials: parseCsv(formData.material),
            })
        } catch (err) {
            setErrors({ submit: 'Failed to save. Please try again.' })
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 shrink-0">
                    <div>
                        <h2 className="text-lg font-semibold text-neutral-900">
                            {product ? 'Edit Product' : 'New Product'}
                        </h2>
                        <p className='text-xs text-neutral-400 mt-0.5'>
                            {product ? 'Update product details' : 'Add a new product to your store'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1.5 hover:bg-neutral-100 rounded-lg transition-colors">
                        <X className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    {errors.submit && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-xl text-sm mb-5">
                            {errors.submit}
                        </div>
                    )}

                    <div className='space-y-6'>
                        {/* Image */}
                        <div>
                            <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Product Image</label>
                            <div className="border-2 border-dashed border-neutral-200 rounded-2xl p-4 text-center hover:border-neutral-300 transition-colors cursor-pointer relative">
                                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                {imagePreview ? (
                                    <div className='relative w-full h-40'>
                                        <Image src={imagePreview} alt="Preview" fill className='object-contain rounded-lg' />
                                    </div>
                                ) : (
                                    <div className='py-8'>
                                        <ImageIcon className='w-8 h-8 mx-auto text-neutral-300 mb-2' />
                                        <p className='text-sm text-neutral-400'>Click to upload image</p>
                                        <p className='text-xs text-neutral-300 mt-1'>PNG, JPG up to 5MB</p>
                                    </div>
                                )}
                            </div>
                            <div className='mt-3 space-y-2'>
                                <InputField
                                    label="Image URL"
                                    name="image"
                                    value={formData.image}
                                    onChange={handleImageUrlChange}
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <div className='flex items-center gap-2'>
                                    <button
                                        type='button'
                                        onClick={clearImage}
                                        className='px-3 py-2 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors'
                                    >
                                        Remove Image
                                    </button>
                                    <p className='text-xs text-neutral-400'>Upload a file or paste an image URL</p>
                                </div>
                            </div>
                        </div>

                        {/* Basic Info */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField label="Product Name" name="name" value={formData.name} onChange={handleChange} error={errors.name} required placeholder="e.g., Velvet Blazer" />
                            <div>
                                <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>
                                    Category <span className='text-red-400'>*</span>
                                </label>
                                <select name="category" value={formData.category} onChange={handleChange}
                                    className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none appearance-none cursor-pointer ${errors.category ? 'border-red-300' : 'border-neutral-200'}`}>
                                    <option value="">Select category</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                {errors.category && <p className='text-red-500 text-xs mt-1'>{errors.category}</p>}
                            </div>
                        </div>

                        {/* Pricing */}
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                            <InputField label="Price" name="price" type="number" value={formData.price} onChange={handleChange} error={errors.price} required placeholder="0.00" step="0.01" />
                            <InputField label="Original Price" name="originalPrice" type="number" value={formData.originalPrice} onChange={handleChange} error={errors.originalPrice} placeholder="0.00" step="0.01" />
                            <InputField label="Discount %" name="discount" type="number" value={formData.discount} onChange={handleChange} error={errors.discount} placeholder="0" min="0" max="100" />
                        </div>

                        {/* Stock & Brand */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                            <InputField label="Stock Quantity" name="stock" type="number" value={formData.stock} onChange={handleChange} error={errors.stock} required placeholder="0" min="0" />
                            <InputField label="Brand" name="brand" value={formData.brand} onChange={handleChange} error={errors.brand} placeholder="e.g., Urban Threads" />
                        </div>

                        {/* Attributes */}
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                            <div>
                                <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Gender</label>
                                <select name="gender" value={formData.gender} onChange={handleChange}
                                    className='w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none appearance-none cursor-pointer'>
                                    <option value="">Select</option>
                                    {genders.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>
                            <InputField label="Sizes" name="size" value={formData.size} onChange={handleChange} error={errors.size} placeholder="S, M, L" />
                            <InputField label="Colors" name="color" value={formData.color} onChange={handleChange} error={errors.color} placeholder="Black, Blue" />
                            <InputField label="Materials" name="material" value={formData.material} onChange={handleChange} error={errors.material} placeholder="Cotton, Linen" />
                        </div>

                        {/* Description */}
                        <div>
                            <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>
                                Description <span className='text-red-400'>*</span>
                            </label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="3"
                                placeholder="Product description..."
                                className={`w-full px-3 py-2.5 text-sm border rounded-xl focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none resize-none ${errors.description ? 'border-red-300' : 'border-neutral-200'}`}
                            />
                            {errors.description && <p className='text-red-500 text-xs mt-1'>{errors.description}</p>}
                        </div>

                        {/* Toggles */}
                        <div className='flex gap-6'>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange}
                                    className='w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900' />
                                <span className='text-sm font-medium text-neutral-700'>Featured</span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input type="checkbox" name="isNewArrival" checked={formData.isNewArrival} onChange={handleChange}
                                    className='w-4 h-4 rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900' />
                                <span className='text-sm font-medium text-neutral-700'>New Arrival</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-neutral-100 shrink-0 justify-end">
                    <button type="button" onClick={onClose}
                        className="px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-neutral-900 rounded-xl hover:bg-neutral-800 transition-colors disabled:opacity-50">
                        {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    )
}