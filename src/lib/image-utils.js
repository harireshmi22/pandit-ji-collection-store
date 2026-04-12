export function isCloudinaryUrl(url = '') {
    return typeof url === 'string' && url.includes('res.cloudinary.com')
}

export function getPrimaryProductImage(product) {
    if (!product) return ''
    if (typeof product.image === 'string' && product.image.trim()) return product.image.trim()
    if (Array.isArray(product.image) && product.image.length > 0 && typeof product.image[0] === 'string') return product.image[0]
    if (Array.isArray(product.images) && product.images.length > 0 && typeof product.images[0] === 'string') return product.images[0]
    return ''
}

export function optimizeCloudinaryImage(url, { width = 900 } = {}) {
    if (!isCloudinaryUrl(url)) return url || ''
    if (url.includes('/upload/f_auto,q_auto')) return url
    return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

export function getOptimizedProductImage(product, width = 900) {
    const src = getPrimaryProductImage(product)
    return optimizeCloudinaryImage(src, { width })
}
