// Redis key generation utilities for consistent cache keys

// Generate cache keys for different data types
export const RedisKeys = {
    // Product-related keys
    PRODUCT_ALL: (params = {}) => {
        const paramString = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return paramString ? `products:${paramString}` : 'products:all';
    },

    PRODUCT_DETAIL: (productId) => `product:${productId}`,

    PRODUCT_SEARCH: (query) => `search:${query}`,

    // User-related keys
    USER_PROFILE: (userId) => `user:${userId}:profile`,
    USER_CART: (userId) => `user:${userId}:cart`,
    USER_WISHLIST: (userId) => `user:${userId}:wishlist`,

    // Session-related keys
    USER_SESSION: (sessionId) => `session:${sessionId}`,

    // Category-related keys
    CATEGORY_ALL: 'categories:all',
    CATEGORY_DETAIL: (categoryId) => `category:${categoryId}`,

    // Brand-related keys
    BRAND_ALL: 'brands:all',
    BRAND_DETAIL: (brandId) => `brand:${brandId}`,

    // Stock-related keys
    STOCK: (productId) => `stock:${productId}`,

    // General cache keys
    STATS: 'stats:general',
    CONFIG: 'config:app'
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
    // Short-term cache (5 minutes)
    SHORT: 5 * 60,

    // Medium-term cache (30 minutes)
    MEDIUM: 30 * 60,

    // Long-term cache (2 hours)
    LONG: 2 * 60 * 60,

    // Very long-term cache (24 hours)
    VERY_LONG: 24 * 60 * 60,

    // Specific cache durations
    PRODUCT_ALL: 30 * 60,        // 30 minutes for product lists
    PRODUCT_DETAIL: 2 * 60 * 60,  // 2 hours for individual products
    PRODUCT_SEARCH: 15 * 60,     // 15 minutes for search results
    USER_PROFILE: 10 * 60,       // 10 minutes for user profiles
    USER_CART: 5 * 60,           // 5 minutes for cart data
    USER_WISHLIST: 15 * 60,     // 15 minutes for wishlist
    USER_SESSION: 24 * 60 * 60,  // 24 hours for sessions
    CATEGORY_ALL: 2 * 60 * 60,    // 2 hours for categories
    BRAND_ALL: 2 * 60 * 60,      // 2 hours for brands
    STATS: 5 * 60,               // 5 minutes for stats
    CONFIG: 24 * 60 * 60         // 24 hours for config
};

// Helper function to generate cache keys with namespace
export const generateCacheKey = (namespace, identifier, params = {}) => {
    const paramString = Object.keys(params)
        .sort()
        .map(key => `${key}:${params[key]}`)
        .join('|');

    const keyParts = [namespace];
    if (identifier) keyParts.push(identifier);
    if (paramString) keyParts.push(paramString);

    return keyParts.join(':');
};

// Helper function to invalidate related cache keys
export const invalidateRelatedCache = async (redisHelpers, pattern) => {
    try {
        // This would require implementing KEYS or SCAN command
        // For now, we'll use a simple approach with known patterns
        const patterns = {
            'product': ['products:*', 'product:*'],
            'user': ['user:*', 'session:*'],
            'category': ['categories:*', 'category:*'],
            'brand': ['brands:*', 'brand:*']
        };

        const keysToInvalidate = patterns[pattern] || [pattern];

        for (const keyPattern of keysToInvalidate) {
            // Note: This would need to be implemented based on your Redis client
            // For now, this is a placeholder for the logic
            console.log(`Would invalidate cache keys matching: ${keyPattern}`);
        }
    } catch (error) {
        console.warn('Failed to invalidate cache:', error);
    }
};

// Default export
const redisCacheUtils = {
    RedisKeys,
    CACHE_TTL,
    generateCacheKey,
    invalidateRelatedCache
};

export default redisCacheUtils;
