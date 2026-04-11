'use client'
import React, { useState } from 'react'
import { Save, Store, Truck, CreditCard, X, CheckCircle } from 'lucide-react'

function InputField({ label, type = 'text', value, onChange, prefix, suffix }) {
    return (
        <div>
            <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>{label}</label>
            <div className='relative'>
                {prefix && <span className='absolute left-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400'>{prefix}</span>}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    className={`w-full ${prefix ? 'pl-8' : 'px-3'} ${suffix ? 'pr-10' : 'pr-3'} py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all`}
                />
                {suffix && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-sm text-neutral-400'>{suffix}</span>}
            </div>
        </div>
    )
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState({
        storeName: 'Pandit Ji Collection',
        storeEmail: 'admin@panditjicollection.com',
        storePhone: '+91 98765 43210',
        storeAddress: '123 Madison Avenue, New York, NY 10016',
        currency: 'INR',
        taxRate: 18,
        shippingCost: 50,
        freeShippingThreshold: 999,
    })
    const [toast, setToast] = useState(null)

    const handleChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    const handleSave = () => {
        setToast('Settings saved successfully')
        setTimeout(() => setToast(null), 3000)
    }

    return (
        <div className='space-y-6 max-w-3xl'>
            {/* Toast */}
            {toast && (
                <div className='fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-blue-600 text-white shadow-lg'>
                    <CheckCircle className='w-4 h-4' />
                    {toast}
                    <button onClick={() => setToast(null)}><X className='w-3.5 h-3.5' /></button>
                </div>
            )}

            <div>
                <h1 className='text-2xl font-semibold tracking-tight leading-tight text-neutral-900'>Settings</h1>
                <p className='text-sm text-neutral-500 mt-1'>Manage your store configuration</p>
            </div>

            {/* Store Info */}
            <div className='bg-white rounded-2xl border border-blue-200/60 p-5'>
                <div className='flex items-center gap-2.5 mb-5'>
                    <div className='w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center'>
                        <Store className='w-4 h-4 text-white' />
                    </div>
                    <div>
                        <h2 className='text-[15px] font-semibold text-neutral-900'>Store Information</h2>
                        <p className='text-xs text-neutral-400'>Basic store details</p>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <InputField
                        label="Store Name"
                        value={settings.storeName}
                        onChange={(e) => handleChange('storeName', e.target.value)}
                    />
                    <InputField
                        label="Email"
                        type="email"
                        value={settings.storeEmail}
                        onChange={(e) => handleChange('storeEmail', e.target.value)}
                    />
                    <InputField
                        label="Phone"
                        type="tel"
                        value={settings.storePhone}
                        onChange={(e) => handleChange('storePhone', e.target.value)}
                    />
                    <div>
                        <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Currency</label>
                        <select
                            value={settings.currency}
                            onChange={(e) => handleChange('currency', e.target.value)}
                            className='w-full px-3 py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer appearance-none'
                        >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD (US Dollar)</option>
                            <option value="EUR">EUR (Euro)</option>
                            <option value="GBP">GBP (Pound)</option>
                        </select>
                    </div>
                    <div className='md:col-span-2'>
                        <label className='block text-xs font-medium text-neutral-500 mb-1.5 uppercase tracking-wide'>Address</label>
                        <textarea
                            value={settings.storeAddress}
                            onChange={(e) => handleChange('storeAddress', e.target.value)}
                            rows={2}
                            className='w-full px-3 py-2.5 text-sm bg-white border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none'
                        />
                    </div>
                </div>
            </div>

            {/* Shipping & Tax */}
            <div className='bg-white rounded-2xl border border-blue-200/60 p-5'>
                <div className='flex items-center gap-2.5 mb-5'>
                    <div className='w-8 h-8 rounded-lg bg-linear-to-br from-blue-600 to-indigo-600 flex items-center justify-center'>
                        <Truck className='w-4 h-4 text-white' />
                    </div>
                    <div>
                        <h2 className='text-[15px] font-semibold text-neutral-900'>Shipping & Tax</h2>
                        <p className='text-xs text-neutral-400'>Configure shipping costs and tax rates</p>
                    </div>
                </div>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                    <InputField
                        label="Tax Rate"
                        type="number"
                        value={settings.taxRate}
                        onChange={(e) => handleChange('taxRate', e.target.value)}
                        suffix="%"
                    />
                    <InputField
                        label="Shipping Cost"
                        type="number"
                        value={settings.shippingCost}
                        onChange={(e) => handleChange('shippingCost', e.target.value)}
                        prefix={settings.currency === 'INR' ? '₹' : '₹'}
                    />
                    <InputField
                        label="Free Shipping Above"
                        type="number"
                        value={settings.freeShippingThreshold}
                        onChange={(e) => handleChange('freeShippingThreshold', e.target.value)}
                        prefix={settings.currency === 'INR' ? '₹' : '₹'}
                    />
                </div>
            </div>

            {/* Save */}
            <div className='flex justify-end'>
                <button
                    onClick={handleSave}
                    className='flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors shadow-[0_12px_22px_-14px_rgba(37,99,235,0.75)]'
                >
                    <Save className='w-4 h-4' />
                    Save Changes
                </button>
            </div>
        </div>
    )
}