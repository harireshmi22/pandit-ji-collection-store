<<<<<<< HEAD
// Utility functions for product management

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Validate product data
 * @param {Object} product - Product object to validate
 * @returns {Object} - Validation errors object
 */
export const validateProduct = (product) => {
    const errors = {};

    if (!product.name?.trim()) {
        errors.name = 'Product name is required';
    }

    if (!product.description?.trim()) {
        errors.description = 'Description is required';
    }

    if (!product.price || Number(product.price) <= 0) {
        errors.price = 'Valid price is required';
    }

    if (!product.category) {
        errors.category = 'Category is required';
    }

    if (product.stock === '' || Number(product.stock) < 0) {
        errors.stock = 'Valid stock quantity is required';
    }

    return errors;
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {number} - Discount percentage
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 50) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Get category label from value
 * @param {string} value - Category value
 * @returns {string} - Category label
 */
export const getCategoryLabel = (value) => {
    const categories = {
        'Top Wear': 'Top Wear',
        'Bottom Wear': 'Bottom Wear',
        'Footwear': 'Footwear',
        'Accessories': 'Accessories',
        'Outerwear': 'Outerwear',
    };
    return categories[value] || value;
};

/**
 * Get gender label from value
 * @param {string} value - Gender value
 * @returns {string} - Gender label
 */
export const getGenderLabel = (value) => {
    const genders = {
        'Men': 'Men',
        'Women': 'Women',
        'Unisex': 'Unisex',
    };
    return genders[value] || value;
};

/**
 * Check if product is in stock
 * @param {number} stock - Stock quantity
 * @returns {boolean} - True if in stock
 */
export const isInStock = (stock) => {
    return stock && Number(stock) > 0;
};

/**
 * Get stock status color
 * @param {number} stock - Stock quantity
 * @returns {string} - Color class name
 */
export const getStockStatusColor = (stock) => {
    if (!stock) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
};
=======
// Utility functions for product management

/**
 * Convert file to base64 string
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Base64 string
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

/**
 * Validate product data
 * @param {Object} product - Product object to validate
 * @returns {Object} - Validation errors object
 */
export const validateProduct = (product) => {
    const errors = {};

    if (!product.name?.trim()) {
        errors.name = 'Product name is required';
    }

    if (!product.description?.trim()) {
        errors.description = 'Description is required';
    }

    if (!product.price || Number(product.price) <= 0) {
        errors.price = 'Valid price is required';
    }

    if (!product.category) {
        errors.category = 'Category is required';
    }

    if (product.stock === '' || Number(product.stock) < 0) {
        errors.stock = 'Valid stock quantity is required';
    }

    return errors;
};

/**
 * Format price for display
 * @param {number} price - Price to format
 * @returns {string} - Formatted price
 */
export const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(price);
};

/**
 * Calculate discount percentage
 * @param {number} originalPrice - Original price
 * @param {number} currentPrice - Current price
 * @returns {number} - Discount percentage
 */
export const calculateDiscount = (originalPrice, currentPrice) => {
    if (!originalPrice || originalPrice <= 0) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
};

/**
 * Truncate text to specified length
 * @param {string} text - Text to truncate
 * @param {number} length - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, length = 50) => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length) + '...';
};

/**
 * Get category label from value
 * @param {string} value - Category value
 * @returns {string} - Category label
 */
export const getCategoryLabel = (value) => {
    const categories = {
        'Top Wear': 'Top Wear',
        'Bottom Wear': 'Bottom Wear',
        'Footwear': 'Footwear',
        'Accessories': 'Accessories',
        'Outerwear': 'Outerwear',
    };
    return categories[value] || value;
};

/**
 * Get gender label from value
 * @param {string} value - Gender value
 * @returns {string} - Gender label
 */
export const getGenderLabel = (value) => {
    const genders = {
        'Men': 'Men',
        'Women': 'Women',
        'Unisex': 'Unisex',
    };
    return genders[value] || value;
};

/**
 * Check if product is in stock
 * @param {number} stock - Stock quantity
 * @returns {boolean} - True if in stock
 */
export const isInStock = (stock) => {
    return stock && Number(stock) > 0;
};

/**
 * Get stock status color
 * @param {number} stock - Stock quantity
 * @returns {string} - Color class name
 */
export const getStockStatusColor = (stock) => {
    if (!stock) return 'text-red-600';
    if (stock < 10) return 'text-yellow-600';
    return 'text-green-600';
};
>>>>>>> 01ca697 (files added with fixed bugs)
