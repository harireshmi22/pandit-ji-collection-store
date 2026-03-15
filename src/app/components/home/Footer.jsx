'use client';
import Link from 'next/link';
import { Mail, Phone, Instagram } from 'lucide-react';

export default function Footer() {
    return (
        <footer className='border-t border-neutral-200 mt-10'>
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-16'>
                    <div className='space-y-4'>
                        <h2 className='text-lg font-bold text-neutral-900'>Pandit Ji Collection</h2>
                        <p className='text-sm text-neutral-500 leading-relaxed'>Minimal essentials crafted for the modern individual.</p>
                        <div className='space-y-2 text-sm text-neutral-500'>
                            <p className='flex items-center gap-2'><Phone size={14} className='text-neutral-300' /> +1 (212) 555-0123</p>
                            <p className='flex items-center gap-2'><Mail size={14} className='text-neutral-300' /> hello@panditjicollection.com</p>
                        </div>
                    </div>
                    <div>
                        <h3 className='text-xs font-semibold text-neutral-900 mb-4 uppercase tracking-widest'>Shop</h3>
                        <ul className='space-y-2.5 text-sm text-neutral-500'>
                            <li><Link href='/shop?category=New%20in' className='hover:text-neutral-900 transition-colors'>New In</Link></li>
                            <li><Link href='/shop?category=T-shirt' className='hover:text-neutral-900 transition-colors'>T-Shirts</Link></li>
                            <li><Link href='/shop?category=Formal' className='hover:text-neutral-900 transition-colors'>Formal</Link></li>
                            <li><Link href='/shop?category=Bottom%20Wear' className='hover:text-neutral-900 transition-colors'>Bottoms</Link></li>
                            <li><Link href='/shop?category=Top%20Wear' className='hover:text-neutral-900 transition-colors'>Tops</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-xs font-semibold text-neutral-900 mb-4 uppercase tracking-widest'>Support</h3>
                        <ul className='space-y-2.5 text-sm text-neutral-500'>
                            <li><Link href='/contact' className='hover:text-neutral-900 transition-colors'>Contact</Link></li>
                            <li><Link href='/about' className='hover:text-neutral-900 transition-colors'>About Us</Link></li>
                            <li><Link href='/shop' className='hover:text-neutral-900 transition-colors'>All Products</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className='text-xs font-semibold text-neutral-900 mb-4 uppercase tracking-widest'>Connect</h3>
                        <ul className='space-y-2.5 text-sm text-neutral-500'>
                            <li><a href='#' className='hover:text-neutral-900 transition-colors flex items-center gap-2'><Instagram size={15} className='text-neutral-300' /> Instagram</a></li>
                        </ul>
                    </div>
                </div>
                <div className='border-t border-neutral-100 pt-8 mt-12 flex flex-col md:flex-row justify-between items-center text-neutral-400 text-xs'>
                    <p>&copy; {new Date().getFullYear()} Pandit Ji Collection. All rights reserved.</p>
                    <div className='flex gap-6 mt-4 md:mt-0'>
                        <Link href='/about' className='hover:text-neutral-900 transition-colors'>Privacy</Link>
                        <Link href='/about' className='hover:text-neutral-900 transition-colors'>Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}