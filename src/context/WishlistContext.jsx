'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'

const WishlistContext = createContext()

const normalizeProductId = (productOrId) => {
    if (!productOrId) return null
    if (typeof productOrId === 'string') return productOrId
    return productOrId.id || productOrId._id || null
}

const toWishlistItem = (product) => {
    const id = normalizeProductId(product)
    if (!id) return null

    return {
        id,
        name: product.name,
        price: product.price,
        image: product.image,
        brand: product.brand,
    }
}

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
    const { data: session, status } = useSession()
    const isAuthenticated = Boolean(session?.user?.id)
    const [wishlistItems, setWishlistItems] = useState([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchWishlistFromServer = useCallback(async () => {
        const res = await fetch('/api/wishlist', { cache: 'no-store' })
        const data = await res.json()

        if (!res.ok || !data.success) {
            throw new Error(data.message || 'Failed to load wishlist')
        }

        return Array.isArray(data.data) ? data.data : []
    }, [])

    const syncGuestWishlistToServer = useCallback(async () => {
        const local = getWishlistFromStorage()
        const productIds = local
            .map((item) => normalizeProductId(item))
            .filter(Boolean)

        if (productIds.length === 0) return

        const res = await fetch('/api/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds })
        })

        if (!res.ok) {
            throw new Error('Failed to sync guest wishlist')
        }

        saveWishlistToStorage([])
    }, [])

    useEffect(() => {
        const initializeWishlist = async () => {
            if (status === 'loading') return

            if (!isAuthenticated) {
                setWishlistItems(getWishlistFromStorage())
                setIsLoading(false)
                return
            }

            try {
                await syncGuestWishlistToServer()
                const serverItems = await fetchWishlistFromServer()
                setWishlistItems(serverItems)
            } catch (error) {
                console.error('Failed to initialize wishlist from server:', error)
                setWishlistItems([])
            } finally {
                setIsLoading(false)
            }
        }

        initializeWishlist()
    }, [status, isAuthenticated, fetchWishlistFromServer, syncGuestWishlistToServer])

    // Keep guest wishlist in localStorage. Logged-in users use database persistence.
    useEffect(() => {
        if (status === 'loading' || isAuthenticated) return
        saveWishlistToStorage(wishlistItems)
    }, [wishlistItems, status, isAuthenticated])

    const addToWishlist = async (product) => {
        const item = toWishlistItem(product)
        if (!item) return

        setWishlistItems((prev) => {
            const exists = prev.some((wishlistItem) => wishlistItem.id === item.id)
            if (exists) {
                return prev
            }
            return [...prev, item]
        })

        if (!isAuthenticated) return

        try {
            await fetch('/api/wishlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: item.id })
            })
        } catch (error) {
            console.error('Failed to save wishlist item:', error)
        }
    }

    const removeFromWishlist = async (productId) => {
        const normalizedId = normalizeProductId(productId)
        if (!normalizedId) return

        setWishlistItems((prev) => prev.filter((item) => item.id !== normalizedId))

        if (!isAuthenticated) return

        try {
            await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId: normalizedId })
            })
        } catch (error) {
            console.error('Failed to remove wishlist item:', error)
        }
    }

    const isInWishlist = (productId) => {
        const normalizedId = normalizeProductId(productId)
        if (!normalizedId) return false
        return wishlistItems.some((item) => item.id === normalizedId)
    }

    const toggleWishlist = (product) => {
        const productId = normalizeProductId(product)
        if (!productId) return

        if (isInWishlist(productId)) {
            removeFromWishlist(productId)
        } else {
            addToWishlist(product)
        }
    }

    const clearWishlist = async () => {
        setWishlistItems([])

        if (!isAuthenticated) return

        try {
            await fetch('/api/wishlist', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            })
        } catch (error) {
            console.error('Failed to clear wishlist:', error)
        }
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
                isLoading,
                wishlistCount: wishlistItems.length,
            }}
        >
            {children}
        </WishlistContext.Provider>
    )
}

export const useWishlist = () => useContext(WishlistContext)

