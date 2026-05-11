import React from 'react';
import CollectionsClient from './CollectionsClient';

async function getCollections() {
    try {
        const res = await fetch('/api/products?category=Knitwear', {
            next: { revalidate: 300 } // Cache for 5 minutes
        });
        const data = await res.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error('Error fetching products:', error);
        return null;
    }
}

export default async function Collections() {
    const products = await getCollections();

    if (products.length === 0) {
        return null;
    }

    return <CollectionsClient products={products} />;
}
