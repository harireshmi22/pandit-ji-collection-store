'use client'
import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react'

const CartContext = createContext()

// Helper functions for localStorage
const getSavedShippingDetails = () => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('savedShippingDetails')
        return saved ? JSON.parse(saved) : null
    }
    return null
}

const saveShippingDetails = (details) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('savedShippingDetails', JSON.stringify(details))
    }
}

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])
    const [isCartOpen, setIsCartOpen] = useState(false)
    const [savedShippingDetails, setSavedShippingDetails] = useState(() => getSavedShippingDetails())
    const [isLoading, setIsLoading] = useState(true)
    const initialLoadDone = useRef(false)

    // Fetch cart from Redis on mount
    useEffect(() => {
        const fetchCart = async () => {
            try {
                const res = await fetch('/api/cart')
                const data = await res.json()
                if (data.success && Array.isArray(data.data)) {
                    setCartItems(data.data)
                }
            } catch (error) {
                console.error('Failed to fetch cart:', error)
            } finally {
                setIsLoading(false)
                initialLoadDone.current = true
            }
        }
        fetchCart()
    }, [])

    // Debounced save to Redis
    useEffect(() => {
        if (!initialLoadDone.current) return

        const timeoutId = setTimeout(async () => {
            try {
                await fetch('/api/cart', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cartItems })
                })
            } catch (error) {
                console.error('Failed to save cart:', error)
            }
        }, 1000) // 1 second debounce

        return () => clearTimeout(timeoutId)
    }, [cartItems])

    const addToCart = useCallback((product, size = 'M', quantity = 1, openCart = false) => {
        setCartItems((prev) => {
            const existing = prev.find((item) => item.id === product.id && item.selectedSize === size)
            if (existing) {
                return prev.map((item) =>
                    item.id === product.id && item.selectedSize === size
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                )
            }
            return [...prev, { ...product, quantity, selectedSize: size }]
        })
        // Only open cart if explicitly requested
        if (openCart) {
            setIsCartOpen(true)
        }
    }, [])

    const removeFromCart = useCallback((itemId, size) => {
        setCartItems((prev) => prev.filter((item) => !(item.id === itemId && item.selectedSize === size)))
    }, [])

    const updateQuantity = useCallback((itemId, size, newQuantity) => {
        if (newQuantity <= 0) {
            removeFromCart(itemId, size)
            return
        }
        setCartItems((prev) =>
            prev.map((item) =>
                item.id === itemId && item.selectedSize === size
                    ? { ...item, quantity: newQuantity }
                    : item
            )
        )
    }, [removeFromCart])

    const clearCart = useCallback(() => {
        setCartItems([])
    }, [])

    const saveShippingInfo = useCallback((shippingInfo) => {
        const detailsToSave = {
            email: shippingInfo.email,
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName,
            address: shippingInfo.address,
            city: shippingInfo.city,
            zipCode: shippingInfo.zipCode || shippingInfo.postalCode,
            postalCode: shippingInfo.postalCode || shippingInfo.zipCode,
            country: shippingInfo.country,
            phone: shippingInfo.phone || '',
        }
        saveShippingDetails(detailsToSave)
        setSavedShippingDetails(detailsToSave)
    }, [])

    const canUseSavedDetails = useCallback(() => {
        return savedShippingDetails !== null &&
            savedShippingDetails.email &&
            savedShippingDetails.address
    }, [savedShippingDetails])

    // Calculate cartTotal first to avoid circular dependency
    const cartTotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems])
    const cartItemCount = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems])

    // Process order with saved details using the backend API
    const createOrderWithSavedDetails = useCallback(async () => {
        if (!canUseSavedDetails() || cartItems.length === 0) {
            return null
        }

        try {
            const shipping = cartTotal >= 100 ? 0 : 10
            const tax = cartTotal * 0.1
            const finalTotal = cartTotal + shipping + tax

            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    // Strip base64 images to avoid bloating the order payload
                    image: item.image && item.image.startsWith('data:')
                        ? '/images/placeholder-product.svg'
                        : item.image,
                    size: item.selectedSize
                })),
                shippingAddress: {
                    fullName: `${savedShippingDetails.firstName} ${savedShippingDetails.lastName}`,
                    email: savedShippingDetails.email,
                    address: savedShippingDetails.address,
                    city: savedShippingDetails.city,
                    postalCode: savedShippingDetails.postalCode,
                    country: savedShippingDetails.country,
                    phone: 'Not provided'
                },
                paymentMethod: 'Credit Card',
                itemsPrice: cartTotal,
                taxPrice: tax,
                shippingPrice: shipping,
                totalPrice: finalTotal,
            }

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error('Order creation failed:', data)
                throw new Error(data.message || 'Error creating order')
            }

            clearCart()
            return data
        } catch (error) {
            console.error('Create order error:', error)
            throw error
        }
    }, [canUseSavedDetails, cartItems, cartTotal, savedShippingDetails, clearCart])

    return (
        <CartContext.Provider
            value={{
                cartItems,
                isCartOpen,
                setIsCartOpen,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                savedShippingDetails,
                canUseSavedDetails,
                saveShippingInfo,
                createOrderWithSavedDetails,
                cartTotal,
                cartItemCount,
                isLoading
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}