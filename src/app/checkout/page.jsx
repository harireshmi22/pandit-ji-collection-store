'use client'
export const dynamic = 'force-dynamic'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { useCart } from '@/context/CartContext'
import { useSession } from 'next-auth/react'
import { ArrowLeft, Lock, Loader } from 'lucide-react'

export default function CheckoutPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const { cartItems, cartTotal, clearCart, saveShippingInfo, savedShippingDetails } = useCart()
    const [isSubmitting, setIsSubmitting] = useState(false)

    React.useEffect(() => {
        if (status === 'unauthenticated') router.push('/login?callbackUrl=/checkout')
    }, [status, router])

    const [formData, setFormData] = useState(() => ({
        email: savedShippingDetails?.email || '',
        firstName: savedShippingDetails?.firstName || '',
        lastName: savedShippingDetails?.lastName || '',
        address: savedShippingDetails?.address || '',
        city: savedShippingDetails?.city || '',
        zipCode: savedShippingDetails?.zipCode || '',
        country: savedShippingDetails?.country || '',
        cardNumber: '', expiryDate: '', cvv: '', nameOnCard: '',
    }))

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const shipping = cartTotal >= 100 ? 0 : 10
            const tax = cartTotal * 0.1
            const finalTotal = cartTotal + shipping + tax
            const shippingInfo = {
                fullName: `${formData.firstName} ${formData.lastName}`,
                email: formData.email, address: formData.address, city: formData.city,
                postalCode: formData.zipCode, country: formData.country, phone: formData.phone || 'Not provided',
            }
            saveShippingInfo({ ...shippingInfo, firstName: formData.firstName, lastName: formData.lastName, zipCode: formData.zipCode })
            const orderItems = cartItems.map(item => ({
                product: item.id, name: item.name, quantity: item.quantity, price: item.price,
                image: item.image && item.image.startsWith('data:') ? '/images/placeholder-product.svg' : item.image,
                size: item.selectedSize
            }))
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderItems, shippingAddress: shippingInfo, paymentMethod: 'Credit Card', itemsPrice: cartTotal, taxPrice: tax, shippingPrice: shipping, totalPrice: finalTotal }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.message || 'Error creating order')
            clearCart()
            router.push(`/order/${data._id}`)
        } catch (error) {
            setIsSubmitting(false)
            alert(error.message || 'Error processing order. Please try again.')
        }
    }

    if (status === 'loading') return (
        <div className='min-h-screen bg-white'><Navbar /><div className='flex items-center justify-center py-32'><Loader className='w-6 h-6 text-neutral-300 animate-spin' /></div><Footer /></div>
    )
    if (!session) return null
    if (cartItems.length === 0) return (
        <div className='min-h-screen bg-white'><Navbar /><div className='text-center py-32'><p className='text-neutral-600 mb-4'>Your cart is empty</p><Link href='/shop' className='text-sm text-neutral-900 underline underline-offset-4'>Return to Shop</Link></div><Footer /></div>
    )

    const shipping = cartTotal >= 100 ? 0 : 10
    const tax = cartTotal * 0.1
    const finalTotal = cartTotal + shipping + tax
    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <Link href='/cart' className='inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 mb-8 transition-colors'>
                    <ArrowLeft className='w-4 h-4' /> Back to Cart
                </Link>
                <h1 className='text-2xl md:text-3xl font-bold text-neutral-900 mb-8'>Checkout</h1>

                <form onSubmit={handleSubmit}>
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        <div className='lg:col-span-2 space-y-6'>
                            {/* Shipping */}
                            <div className='border border-neutral-100 rounded-2xl p-5'>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5'>Shipping Information</h2>
                                <div className='space-y-4'>
                                    <input type='email' name='email' value={formData.email} onChange={handleInputChange} required className={inputClass} placeholder='Email address' />
                                    <div className='grid grid-cols-2 gap-4'>
                                        <input type='text' name='firstName' value={formData.firstName} onChange={handleInputChange} required className={inputClass} placeholder='First name' />
                                        <input type='text' name='lastName' value={formData.lastName} onChange={handleInputChange} required className={inputClass} placeholder='Last name' />
                                    </div>
                                    <input type='text' name='address' value={formData.address} onChange={handleInputChange} required className={inputClass} placeholder='Street address' />
                                    <div className='grid grid-cols-2 gap-4'>
                                        <input type='text' name='city' value={formData.city} onChange={handleInputChange} required className={inputClass} placeholder='City' />
                                        <input type='text' name='zipCode' value={formData.zipCode} onChange={handleInputChange} required className={inputClass} placeholder='ZIP code' />
                                    </div>
                                    <input type='text' name='country' value={formData.country} onChange={handleInputChange} required className={inputClass} placeholder='Country' />
                                </div>
                            </div>
                            {/* Payment */}
                            <div className='border border-neutral-100 rounded-2xl p-5'>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5'>Payment</h2>
                                <div className='space-y-4'>
                                    <input type='text' name='cardNumber' value={formData.cardNumber} onChange={handleInputChange} required maxLength={19} className={inputClass} placeholder='Card number' />
                                    <input type='text' name='nameOnCard' value={formData.nameOnCard} onChange={handleInputChange} required className={inputClass} placeholder='Name on card' />
                                    <div className='grid grid-cols-2 gap-4'>
                                        <input type='text' name='expiryDate' value={formData.expiryDate} onChange={handleInputChange} required maxLength={5} className={inputClass} placeholder='MM/YY' />
                                        <input type='text' name='cvv' value={formData.cvv} onChange={handleInputChange} required maxLength={3} className={inputClass} placeholder='CVV' />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className='sticky top-24 border border-neutral-100 rounded-2xl p-5'>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5 pb-4 border-b border-neutral-100'>Summary</h2>
                                <div className='space-y-3 mb-4 max-h-48 overflow-y-auto no-scrollbar'>
                                    {cartItems.map(item => (
                                        <div key={`${item.id}-${item.selectedSize}`} className='flex gap-3'>
                                            <div className='relative w-12 h-14 bg-neutral-100 rounded-lg shrink-0 overflow-hidden'>
                                                <Image src={item.image} alt={item.name} fill className='object-cover' sizes='48px' />
                                            </div>
                                            <div className='min-w-0 flex-1'>
                                                <p className='text-xs font-medium text-neutral-900 truncate'>{item.name}</p>
                                                <p className='text-[11px] text-neutral-400'>Qty: {item.quantity}</p>
                                                <p className='text-xs font-semibold text-neutral-900'>${(item.price * item.quantity).toFixed(2)}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className='space-y-2 text-sm pt-4 border-t border-neutral-100 mb-4'>
                                    <div className='flex justify-between text-neutral-600'><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
                                    <div className='flex justify-between text-neutral-600'><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
                                    <div className='flex justify-between text-neutral-600'><span>Tax</span><span>${tax.toFixed(2)}</span></div>
                                </div>
                                <div className='flex justify-between text-lg font-bold text-neutral-900 pt-4 border-t border-neutral-100 mb-6'>
                                    <span>Total</span><span>${finalTotal.toFixed(2)}</span>
                                </div>
                                <button type='submit' disabled={isSubmitting}
                                    className='w-full flex items-center justify-center gap-2 py-3.5 bg-neutral-900 text-white rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors disabled:opacity-40 cursor-pointer'>
                                    <Lock className='w-3.5 h-3.5' />
                                    {isSubmitting ? 'Processing...' : 'Complete Order'}
                                </button>
                                <p className='text-[11px] text-neutral-400 text-center mt-3'>Secure & encrypted checkout</p>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Footer />
        </div>
    )
}