import React from 'react'
import Image from 'next/image'

const FilterProducts = [
    { id: 1, name: "Velvet Blazer", price: 120, image: "https://images.unsplash.com/photo-1594938291221-94f18e0e1bdf?w=500&h=600&fit=crop", category: "Top Wear", brand: "Urban Threads", material: "Cotton", color: "Black", size: "M" },
    { id: 2, name: "Urban Jacket", price: 85, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop", category: "Top Wear", brand: "Modern Fit", material: "Denim", color: "Navy", size: "L" },
    { id: 3, name: "Linen Shirt", price: 45, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=600&fit=crop", category: "Top Wear", brand: "Street Style", material: "Linen", color: "Beige", size: "M" },
    { id: 4, name: "Classic Polo", price: 35, image: "https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?w=500&h=600&fit=crop", category: "Top Wear", brand: "Fashionista", material: "Cotton", color: "White", size: "S" },
    { id: 5, name: "Denim Jacket", price: 95, image: "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=500&h=600&fit=crop", category: "Top Wear", brand: "Zara", material: "Denim", color: "Blue", size: "L" },
    { id: 6, name: "Wool Coat", price: 150, image: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=500&h=600&fit=crop", category: "Top Wear", brand: "Gucci", material: "Wool", color: "Brown", size: "XL" },
    { id: 7, name: "Cotton T-Shirt", price: 25, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop", category: "Top Wear", brand: "Urban Threads", material: "Cotton", color: "Gray", size: "M" },
    { id: 8, name: "Suit Jacket", price: 200, image: "https://images.unsplash.com/photo-1591047139829-91f8ddc795e9?w=500&h=600&fit=crop", category: "Top Wear", brand: "Modern Fit", material: "Polyester", color: "Black", size: "L" },
    { id: 9, name: "Casual Pants", price: 65, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500&h=600&fit=crop", category: "Bottom Wear", brand: "Street Style", material: "Cotton", color: "Beige", size: "M" },
    { id: 10, name: "Formal Trousers", price: 80, image: "https://images.unsplash.com/photo-1594938291223-94f18e0e1bdf?w=500&h=600&fit=crop", category: "Bottom Wear", brand: "Fashionista", material: "Polyester", color: "Navy", size: "L" },
    { id: 11, name: "Jeans", price: 55, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop", category: "Bottom Wear", brand: "Zara", material: "Denim", color: "Blue", size: "M" },
    { id: 12, name: "Chinos", price: 50, image: "https://images.unsplash.com/photo-1506629082958-511b1aa562c8?w=500&h=600&fit=crop", category: "Bottom Wear", brand: "Urban Threads", material: "Cotton", color: "Khaki", size: "L" },
]

const ProductCard = () => {
    return (
        <div className='w-full h-full overflow-y-auto no-scrollbar'>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-6">
                {FilterProducts.map((product) => (
                    <div key={product.id} className="border border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
                        <div className="relative w-full" style={{ aspectRatio: '4/5' }}>
                            <Image
                                src={`${product.image}?w=400&h=500&fit=crop&q=85&auto=format`}
                                alt={product.name}
                                fill
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                quality={85}
                                priority={false}
                                loading="lazy"
                                className="object-cover"
                            />
                        </div>
                        <div className="p-4">
                            <h3 className="text-lg font-medium text-gray-800">{product.name}</h3>
                            <p className="text-gray-600 mt-1">₹{product.price}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default ProductCard