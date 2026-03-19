'use client'
import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, Upload, Loader } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { uploadToCloudinary } from '@/lib/cloudinary'

export default function ProductFormPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const productId = searchParams.get('id')
    const isEditing = !!productId

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        category: '',
        brand: '',
        gender: '',
        size: '',
        color: '',
        material: '',
        image: '',
        images: [],
        stock: '',
        rating: 0,
        reviews: 0,
        featured: false,

        isNewArrival: true,
        discount: '',
    })

    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [imagePreview, setImagePreview] = useState('')
    const [fetchingProduct, setFetchingProduct] = useState(false)

    const categories = ['Top Wear', 'Bottom Wear', 'Footwear', 'Accessories', 'Outerwear']
    const genders = ['Men', 'Women', 'Unisex']

    const fetchProduct = useCallback(async () => {
        try {
            setFetchingProduct(true)
            const response = await fetch(`/api/products/${productId}`)
            const data = await response.json()

            if (data.success) {
                setFormData(data.data)
                setImagePreview(data.data.image || '')
            }
        } catch (error) {
            console.error('Error fetching product:', error)
        } finally {
            setFetchingProduct(false)
        }
    }, [productId])

    // Fetch product if editing
    useEffect(() => {
        if (productId) {
            fetchProduct()
        }
    }, [productId, fetchProduct])

    const validateForm = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = 'Product name is required'
        if (!formData.description.trim()) newErrors.description = 'Description is required'
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }))
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }))
        }
    }

    const [imageFile, setImageFile] = useState(null)

    const handleImageUpload = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            // Create local preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
                // We don't set formData.image yet, we'll do it on submit
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setLoading(true)
        try {
            let imageUrl = formData.image

            if (imageFile) {
                try {
                    imageUrl = await uploadToCloudinary(imageFile)
                } catch (uploadError) {
                    setErrors({ submit: 'Failed to upload image' })
                    setLoading(false)
                    return
                }
            }

            const url = isEditing ? `/api/products/${productId}` : '/api/products'
            const method = isEditing ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, image: imageUrl }),
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.message || 'Failed to save product')
            }

            router.push('/admin/products')
        } catch (error) {
            console.error('Error saving product:', error)
            setErrors({ submit: error.message || 'Failed to save product' })
        } finally {
            setLoading(false)
        }
    }

    if (fetchingProduct) {
        return (
            <div className='min-h-screen bg-white flex items-center justify-center'>
                <div className='text-center'>
                    <Loader className='w-8 h-8 text-gray-400 animate-spin mx-auto mb-3' />
                    <p className='text-gray-600'>Loading product...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='min-h-screen bg-white'>
            {/* Header */}
            <div className='bg-white border-b border-gray-200 sticky top-0 z-10'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <Link
                                href='/admin/products'
                                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
                            >
                                <ArrowLeft className='w-5 h-5' />
                            </Link>
                            <h1 className='text-2xl font-bold text-gray-900'>
                                {isEditing ? 'Edit Product' : 'Add New Product'}
                            </h1>
                        </div>
                        <div className='flex gap-3'>
                            <Link
                                href='/admin/products'
                                className='px-4 py-2 border border-gray-300 rounded-md text-gray-900 hover:bg-gray-50 transition-colors'
                            >
                                Cancel
                            </Link>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className='px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:bg-gray-400'
                            >
                                {loading ? 'Saving...' : isEditing ? 'Update Product' : 'Add Product'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Form */}
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {errors.submit && (
                    <div className='bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6'>
                        {errors.submit}
                    </div>
                )}

                <form onSubmit={handleSubmit} className='space-y-8'>
                    {/* Image Upload */}
                    <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Product Image</h2>
                        <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer relative'>
                            <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageUpload}
                                className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
                            />
                            {imagePreview ? (
                                <div className='relative w-full h-64'>
                                    <Image src={imagePreview} alt='Preview' fill className='object-contain' />
                                </div>
                            ) : (
                                <div className='py-12'>
                                    <Upload className='w-12 h-12 mx-auto text-gray-400 mb-3' />
                                    <p className='text-gray-600'>Click or drag image here</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Basic Information */}
                    <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Basic Information</h2>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div className='md:col-span-2'>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Product Name *</label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent ${errors.name ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder='e.g., Velvet Blazer'
                                />
                                {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Category *</label>
                                <select
                                    name='category'
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent ${errors.category ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value=''>Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                {errors.category && <p className='text-red-500 text-sm mt-1'>{errors.category}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Brand</label>
                                <input
                                    type='text'
                                    name='brand'
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent'
                                    placeholder='e.g., Urban Threads'
                                />
                            </div>

                            <div className='md:col-span-2'>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Description *</label>
                                <textarea
                                    name='description'
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows='4'
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent ${errors.description ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder='Product description...'
                                />
                                {errors.description && <p className='text-red-500 text-sm mt-1'>{errors.description}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Stock */}
                    <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Pricing & Stock</h2>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Price *</label>
                                <input
                                    type='number'
                                    name='price'
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent ${errors.price ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder='0.00'
                                    step='0.01'
                                />
                                {errors.price && <p className='text-red-500 text-sm mt-1'>{errors.price}</p>}
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Original Price</label>
                                <input
                                    type='number'
                                    name='originalPrice'
                                    value={formData.originalPrice}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent'
                                    placeholder='0.00'
                                    step='0.01'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Stock Quantity *</label>
                                <input
                                    type='number'
                                    name='stock'
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-black focus:border-transparent ${errors.stock ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder='0'
                                    min='0'
                                />
                                {errors.stock && <p className='text-red-500 text-sm mt-1'>{errors.stock}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Attributes */}
                    <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Product Attributes</h2>
                        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Gender</label>
                                <select
                                    name='gender'
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent'
                                >
                                    <option value=''>Select gender</option>
                                    {genders.map((gen) => (
                                        <option key={gen} value={gen}>{gen}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Size</label>
                                <input
                                    type='text'
                                    name='size'
                                    value={formData.size}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent'
                                    placeholder='e.g., S, M, L, XL'
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-semibold text-gray-900 mb-2'>Color</label>
                                <input
                                    type='text'
                                    name='color'
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-black focus:border-transparent'
                                    placeholder='e.g., Black, Blue'
                                />
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className='bg-white border border-gray-200 rounded-lg p-6'>
                        <h2 className='text-lg font-semibold text-gray-900 mb-4'>Options</h2>
                        <div className='flex gap-6'>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    name='featured'
                                    checked={formData.featured}
                                    onChange={handleInputChange}
                                    className='w-4 h-4 rounded border-gray-300'
                                />
                                <span className='text-sm font-medium text-gray-900'>Featured Product</span>
                            </label>
                            <label className='flex items-center gap-2 cursor-pointer'>
                                <input
                                    type='checkbox'
                                    name='isNewArrival'
                                    checked={formData.isNewArrival}
                                    onChange={handleInputChange}
                                    className='w-4 h-4 rounded border-gray-300'
                                />
                                <span className='text-sm font-medium text-gray-900'>New Product</span>
                            </label>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}
