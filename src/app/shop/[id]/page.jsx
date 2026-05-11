export const dynamic = 'force-dynamic'

import mongoose from 'mongoose'
import { notFound } from 'next/navigation'
import { dbConnect } from '@/lib/dbConnect'
import Product from '@/models/Product.js'
import ProductDetailClient from './ProductDetailClient'

const storefrontProjection = 'name price image images brand stock description category sizes size colors color material'

export default async function ProductDetailPage({ params }) {
    const resolvedParams = params instanceof Promise ? await params : params
    const rawId = resolvedParams?.id ? String(resolvedParams.id) : ''

    let productId = rawId
    try {
        productId = decodeURIComponent(rawId)
    } catch {
        productId = rawId
    }

    productId = productId.trim()

    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
        notFound()
    }

    await dbConnect()

    const product = await Product.findById(productId).select(storefrontProjection).lean()

    if (!product) {
        notFound()
    }

    return <ProductDetailClient initialProduct={JSON.parse(JSON.stringify(product))} />
}