'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const WishlistContext = createContext()

// Helper functions for localStorage
const getWishlistFromStorage = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('wishlist')
        return saved ? JSON.parse(saved) : []
    }
    return []
}

const saveWishlistToStorage = (wishlist) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }
}

export function WishlistProvider({ children }) {
    const [wishlistItems, setWishlistItems] = useState(() => getWishlistFromStorage())

    // Sync with localStorage whenever wishlist changes
    useEffect(() => {
        saveWishlistToStorage(wishlistItems)
    }, [wishlistItems])

    const addToWishlist = (product) => {
        setWishlistItems((prev) => {
            const exists = prev.find((item) => item.id === product.id)
            if (exists) {
                return prev // Already in wishlist
            }
            return [...prev, product]
        })
    }

    const removeFromWishlist = (productId) => {
        setWishlistItems((prev) => prev.filter((item) => item.id !== productId))
    }

    const isInWishlist = (productId) => {
        return wishlistItems.some((item) => item.id === productId)
    }

    const toggleWishlist = (product) => {
        if (isInWishlist(product.id)) {
            removeFromWishlist(product.id)
        } else {
            addToWishlist(product)
        }
    }

    const clearWishlist = () => {
        setWishlistItems([])
    }

    return (
        <WishlistContext.Provider
            value={{
                wishlistItems,
                addToWishlist,
                removeFromWishlist,
                isInWishlist,
                toggleWishlist,
                clearWishlist,
                wishlistCount: wishlistItems.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => useContext(WishlistContext)

