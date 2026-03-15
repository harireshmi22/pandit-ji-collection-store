'use client'
export const dynamic = 'force-dynamic'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { useCart } from '@/context/CartContext'
import { useWishlist } from '@/context/WishlistContext'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Package, Heart, Settings, MapPin, LogOut, Edit2, Loader, ArrowRight } from 'lucide-react'

export default function ProfilePage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const { savedShippingDetails } = useCart()
    const { wishlistItems } = useWishlist()
    const [orders, setOrders] = useState([])
    const [loadingOrders, setLoadingOrders] = useState(true)
    const [activeTab, setActiveTab] = useState('overview')
    const [isEditing, setIsEditing] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })
    const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', phone: '' })

    useEffect(() => { if (status === 'unauthenticated') router.push('/login?callbackUrl=/profile') }, [status, router])
    useEffect(() => {
        if (!session) return
        fetch('/api/orders').then(r => r.ok ? r.json() : []).then(setOrders).catch(() => { }).finally(() => setLoadingOrders(false))
        fetch('/api/users/profile').then(r => r.json()).then(d => { if (d.success) setProfileData(p => ({ ...p, ...d.user })) }).catch(() => { })
    }, [session])

    const handleSaveProfile = async () => {
        try {
            setMessage({ type: '', text: '' })
            const res = await fetch('/api/users/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profileData) })
            const data = await res.json()
            if (res.ok && data.success) { setMessage({ type: 'success', text: 'Profile updated' }); setIsEditing(false); setProfileData(p => ({ ...p, ...data.user })) }
            else setMessage({ type: 'error', text: data.message || 'Failed to update' })
        } catch { setMessage({ type: 'error', text: 'Error updating profile' }) }
    }

    if (status === 'loading') return (<div className='min-h-screen bg-white'><Navbar /><div className='flex items-center justify-center py-32'><Loader className='w-6 h-6 text-neutral-300 animate-spin' /></div><Footer /></div>)
    if (!session) return null

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'wishlist', label: 'Wishlist', icon: Heart },
        { id: 'addresses', label: 'Addresses', icon: MapPin },
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all'

    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12'>
                <h1 className='text-2xl md:text-3xl font-bold text-neutral-900 mb-8'>My Account</h1>

                <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                    {/* Sidebar */}
                    <div className='lg:col-span-1'>
                        <div className='space-y-1'>
                            {tabs.map(tab => {
                                const Icon = tab.icon
                                return (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id ? 'bg-neutral-900 text-white' : 'text-neutral-600 hover:bg-neutral-50'}`}>
                                        <Icon className='w-4 h-4' /> {tab.label}
                                    </button>
                                )
                            })}
                            <button onClick={() => signOut({ callbackUrl: '/' })} className='w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-3 cursor-pointer'>
                                <LogOut className='w-4 h-4' /> Logout
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className='lg:col-span-3'>
                        {activeTab === 'overview' && (
                            <div className='space-y-6'>
                                {/* Profile */}
                                <div className='border border-neutral-100 rounded-2xl p-5'>
                                    <div className='flex items-center justify-between mb-5'>
                                        <h2 className='text-sm font-semibold text-neutral-900'>Profile</h2>
                                        <button onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                            className='inline-flex items-center gap-1.5 text-xs font-medium text-neutral-500 hover:text-neutral-900 transition-colors cursor-pointer'>
                                            <Edit2 className='w-3.5 h-3.5' /> {isEditing ? 'Save' : 'Edit'}
                                        </button>
                                    </div>
                                    {message.text && <div className={`p-3 mb-4 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message.text}</div>}
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                        {['firstName', 'lastName', 'email', 'phone'].map(field => (
                                            <div key={field}>
                                                <label className='block text-xs text-neutral-400 mb-1 capitalize'>{field.replace(/([A-Z])/g, ' $1')}</label>
                                                {isEditing ? (
                                                    <input type={field === 'email' ? 'email' : 'text'} name={field} value={profileData[field] || ''} onChange={e => setProfileData({ ...profileData, [field]: e.target.value })} className={inputClass} />
                                                ) : (
                                                    <p className='text-sm text-neutral-900'>{profileData[field] || 'Not set'}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Stats */}
                                <div className='grid grid-cols-3 gap-4'>
                                    <div className='border border-neutral-100 rounded-2xl p-5 text-center'>
                                        <p className='text-2xl font-bold text-neutral-900'>{orders.length}</p>
                                        <p className='text-xs text-neutral-400 mt-1'>Orders</p>
                                    </div>
                                    <div className='border border-neutral-100 rounded-2xl p-5 text-center'>
                                        <p className='text-2xl font-bold text-neutral-900'>{wishlistItems.length}</p>
                                        <p className='text-xs text-neutral-400 mt-1'>Wishlist</p>
                                    </div>
                                    <div className='border border-neutral-100 rounded-2xl p-5 text-center'>
                                        <p className='text-2xl font-bold text-neutral-900'>${orders.reduce((a, o) => a + (o.totalPrice || 0), 0).toFixed(0)}</p>
                                        <p className='text-xs text-neutral-400 mt-1'>Total Spent</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5'>Order History</h2>
                                {loadingOrders ? <div className='flex justify-center py-16'><Loader className='w-6 h-6 text-neutral-300 animate-spin' /></div> :
                                    orders.length === 0 ? (
                                        <div className='text-center py-16'>
                                            <Package className='w-10 h-10 text-neutral-200 mx-auto mb-3' />
                                            <p className='text-sm text-neutral-500 mb-4'>No orders yet</p>
                                            <Link href='/shop' className='inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-medium'>Shop Now <ArrowRight className='w-4 h-4' /></Link>
                                        </div>
                                    ) : (
                                        <div className='space-y-3'>
                                            {orders.map(order => (
                                                <Link key={order._id} href={`/order/${order._id}`} className='block border border-neutral-100 rounded-2xl p-4 hover:border-neutral-300 transition-all'>
                                                    <div className='flex justify-between items-start mb-2'>
                                                        <div>
                                                            <p className='text-xs text-neutral-400'>#{order._id.slice(-8).toUpperCase()}</p>
                                                            <p className='text-sm text-neutral-600'>{new Date(order.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <p className='text-sm font-semibold text-neutral-900'>${order.totalPrice?.toFixed(2)}</p>
                                                    </div>
                                                    <div className='flex gap-2'>
                                                        {order.orderItems?.slice(0, 3).map((item, i) => (
                                                            <div key={i} className='relative w-10 h-10 rounded-lg bg-neutral-100 overflow-hidden'><Image src={item.image} alt={item.name} fill className='object-cover' sizes='40px' /></div>
                                                        ))}
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                            </div>
                        )}

                        {activeTab === 'wishlist' && (
                            <div>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5'>Wishlist</h2>
                                {wishlistItems.length === 0 ? (
                                    <div className='text-center py-16'>
                                        <Heart className='w-10 h-10 text-neutral-200 mx-auto mb-3' />
                                        <p className='text-sm text-neutral-500 mb-4'>No saved items</p>
                                        <Link href='/shop' className='inline-flex items-center gap-2 bg-neutral-900 text-white px-5 py-2 rounded-full text-sm font-medium'>Browse <ArrowRight className='w-4 h-4' /></Link>
                                    </div>
                                ) : (
                                    <div className='grid grid-cols-2 sm:grid-cols-3 gap-4'>
                                        {wishlistItems.map(p => (
                                            <Link key={p.id} href={`/shop/${p.id}`} className='group block'>
                                                <div className='relative aspect-3/4 bg-neutral-100 rounded-2xl overflow-hidden mb-2'>
                                                    <Image src={p.image} alt={p.name} fill className='object-cover group-hover:scale-105 transition-transform duration-500' sizes='(max-width:640px) 50vw, 33vw' />
                                                </div>
                                                <h3 className='text-xs font-medium text-neutral-900 truncate'>{p.name}</h3>
                                                <p className='text-xs font-semibold text-neutral-900 mt-0.5'>${p.price}</p>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'addresses' && (
                            <div>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5'>Saved Addresses</h2>
                                {savedShippingDetails ? (
                                    <div className='border border-neutral-100 rounded-2xl p-5'>
                                        <p className='text-sm font-medium text-neutral-900'>{savedShippingDetails.firstName} {savedShippingDetails.lastName}</p>
                                        <p className='text-sm text-neutral-600 mt-0.5'>{savedShippingDetails.address}</p>
                                        <p className='text-sm text-neutral-600'>{savedShippingDetails.city}, {savedShippingDetails.zipCode}</p>
                                        <p className='text-sm text-neutral-600'>{savedShippingDetails.country}</p>
                                    </div>
                                ) : (
                                    <div className='text-center py-16'>
                                        <MapPin className='w-10 h-10 text-neutral-200 mx-auto mb-3' />
                                        <p className='text-sm text-neutral-500'>No saved addresses. Complete a checkout to save one.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className='space-y-4'>
                                <h2 className='text-sm font-semibold text-neutral-900 mb-5'>Settings</h2>
                                <div className='border border-neutral-100 rounded-2xl p-5'>
                                    <h3 className='text-xs font-medium text-neutral-900 mb-4 uppercase tracking-wider'>Notifications</h3>
                                    {['Email notifications', 'Order updates', 'Promotions'].map((label, i) => (
                                        <label key={label} className='flex items-center justify-between py-2.5 cursor-pointer'>
                                            <span className='text-sm text-neutral-600'>{label}</span>
                                            <input type='checkbox' defaultChecked={i < 2} className='w-4 h-4 accent-neutral-900' />
                                        </label>
                                    ))}
                                </div>
                                <div className='border border-neutral-100 rounded-2xl p-5'>
                                    <h3 className='text-xs font-medium text-neutral-900 mb-4 uppercase tracking-wider'>Account</h3>
                                    <button className='w-full text-left px-4 py-3 border border-neutral-200 rounded-xl text-sm text-neutral-600 hover:border-neutral-400 transition-colors mb-2 cursor-pointer'>Change Password</button>
                                    <button className='w-full text-left px-4 py-3 border border-red-200 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors cursor-pointer'>Delete Account</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}