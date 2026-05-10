import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import AuthProvider from '@/context/AuthProvider';
import ErrorBoundary from '@/components/ErrorBoundary';
import CartSidebar from '@/components/cart/CartSidebar';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
    display: 'swap',
    preload: true
});

export const metadata = {
    title: 'Pandit Ji Collection',
    description: 'Curated fashion for the modern individual',
};

export default function RootLayout({ children }) {
    return (
        <html lang='en'>
            <body className={`${inter.variable} font-sans antialiased text-neutral-900`}>
                <ErrorBoundary>
                    <AuthProvider>
                        <CartProvider>
                            <WishlistProvider>
                                {children}
                                <CartSidebar />
                            </WishlistProvider>
                        </CartProvider>
                    </AuthProvider>
                </ErrorBoundary>
            </body>
        </html >
    );
}