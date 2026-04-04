import React from 'react'
import Navbar from '../components/home/Navbar'
import Footer from '../components/home/Footer'
import { Mail, MapPin, Phone, Clock } from 'lucide-react'

export default function ContactPage() {
    return (
        <div className='min-h-screen bg-white'>
            <Navbar />
            <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20'>
                <div className='text-center mb-12'>
                    <h1 className='text-3xl md:text-4xl font-bold text-neutral-900 mb-3'>Get in Touch</h1>
                    <p className='text-sm text-neutral-500 max-w-md mx-auto'>Have a question or feedback? We&apos;d love to hear from you.</p>
                </div>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                    {/* Contact Form */}
                    <div>
                        <form className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-xs text-neutral-400 mb-1.5'>First Name</label>
                                    <input type='text' className='w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all' placeholder='John' />
                                </div>
                                <div>
                                    <label className='block text-xs text-neutral-400 mb-1.5'>Last Name</label>
                                    <input type='text' className='w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all' placeholder='Doe' />
                                </div>
                            </div>
                            <div>
                                <label className='block text-xs text-neutral-400 mb-1.5'>Email</label>
                                <input type='email' className='w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all' placeholder='you@example.com' />
                            </div>
                            <div>
                                <label className='block text-xs text-neutral-400 mb-1.5'>Subject</label>
                                <input type='text' className='w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all' placeholder='How can we help?' />
                            </div>
                            <div>
                                <label className='block text-xs text-neutral-400 mb-1.5'>Message</label>
                                <textarea rows={5} className='w-full px-4 py-3 border border-neutral-200 rounded-xl text-sm focus:ring-2 focus:ring-neutral-900 focus:border-transparent outline-none transition-all resize-none' placeholder='Tell us more...' />
                            </div>
                            <button type='submit' className='bg-neutral-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-neutral-800 transition-colors'>Send Message</button>
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className='space-y-6'>
                        <div className='border border-neutral-100 rounded-2xl p-6'>
                            <div className='flex items-start gap-4'>
                                <div className='w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0'>
                                    <Mail className='w-4 h-4 text-neutral-600' />
                                </div>
                                <div>
                                    <h3 className='text-sm font-medium text-neutral-900 mb-1'>Email</h3>
                                    <p className='text-sm text-neutral-500'>support@panditjicollection.com</p>
                                    <p className='text-sm text-neutral-500'>hello@panditjicollection.com</p>
                                </div>
                            </div>
                        </div>
                        <div className='border border-neutral-100 rounded-2xl p-6'>
                            <div className='flex items-start gap-4'>
                                <div className='w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0'>
                                    <Phone className='w-4 h-4 text-neutral-600' />
                                </div>
                                <div>
                                    <h3 className='text-sm font-medium text-neutral-900 mb-1'>Phone</h3>
                                    <p className='text-sm text-neutral-500'>+91 98765 43210</p>
                                    <p className='text-sm text-neutral-500'>Mon - Sat, 10am - 7pm</p>
                                </div>
                            </div>
                        </div>
                        <div className='border border-neutral-100 rounded-2xl p-6'>
                            <div className='flex items-start gap-4'>
                                <div className='w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0'>
                                    <MapPin className='w-4 h-4 text-neutral-600' />
                                </div>
                                <div>
                                    <h3 className='text-sm font-medium text-neutral-900 mb-1'>Address</h3>
                                    <p className='text-sm text-neutral-500'>123 Fashion Street</p>
                                    <p className='text-sm text-neutral-500'>New Delhi, India 110001</p>
                                </div>
                            </div>
                        </div>
                        <div className='border border-neutral-100 rounded-2xl p-6'>
                            <div className='flex items-start gap-4'>
                                <div className='w-10 h-10 bg-neutral-50 rounded-xl flex items-center justify-center shrink-0'>
                                    <Clock className='w-4 h-4 text-neutral-600' />
                                </div>
                                <div>
                                    <h3 className='text-sm font-medium text-neutral-900 mb-1'>Business Hours</h3>
                                    <p className='text-sm text-neutral-500'>Mon - Sat: 10:00 AM - 7:00 PM</p>
                                    <p className='text-sm text-neutral-500'>Sunday: Closed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    )
}