import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { dbConnect } from '@/lib/dbConnect'
import Wishlist from '@/models/Wishlist'
import mongoose from 'mongoose'
import User from '@/models/User'

const PRODUCT_FIELDS = 'name price image images brand'

// Helper function to convert UUID to ObjectId for Google OAuth users
async function getMongoUserId(sessionUserId, userEmail, userName, userImage) {
    if (mongoose.Types.ObjectId.isValid(sessionUserId)) {
        return sessionUserId;
    }
    // Try to find user by email first (most reliable)
    const dbUser = await User.findOne({ email: userEmail });
    if (dbUser) {
        // Update user with googleId if missing
        if (!dbUser.googleId) {
            await User.findByIdAndUpdate(dbUser._id, { googleId: sessionUserId });
        }
        return dbUser._id;
    }
    // Create user if not found (fallback for Google OAuth users)
    console.log('Creating new user for:', userEmail);
    try {
        const newUser = await User.create({
            name: userName,
            email: userEmail,
            googleId: sessionUserId,
            avatar: userImage,
        });
        return newUser._id;
    } catch (createError) {
        console.error('Failed to create user:', createError);
        return null;
    }
}

const mapProductToWishlistItem = (product) => ({
    id: product._id.toString(),
    name: product.name,
    price: product.price,
    image: (Array.isArray(product.images) && product.images.length > 0)
        ? product.images[0]
        : product.image,
    brand: product.brand,
})

export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 })
        }

        await dbConnect()

        const mongoUserId = await getMongoUserId(session.user.id, session.user.email, session.user.name, session.user.image)
        if (!mongoUserId) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        const wishlist = await Wishlist.findOne({ user: mongoUserId })
            .populate('products', PRODUCT_FIELDS)
            .lean()

        const items = (wishlist?.products || [])
            .filter(Boolean)
            .map(mapProductToWishlistItem)

        return NextResponse.json({ success: true, data: items })
    } catch (error) {
        console.error('GET /api/wishlist error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to load wishlist' },
            { status: 500 }
        )
    }
}

export async function POST(req) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 })
        }

        const body = await req.json()
        const ids = [body?.productId, ...(body?.productIds || [])]
            .filter(Boolean)
            .map((id) => id.toString())
            .filter((id) => mongoose.Types.ObjectId.isValid(id))

        if (ids.length === 0) {
            return NextResponse.json(
                { success: false, message: 'At least one productId is required' },
                { status: 400 }
            )
        }

        await dbConnect()

        const mongoUserId = await getMongoUserId(session.user.id, session.user.email, session.user.name, session.user.image)
        if (!mongoUserId) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        await Wishlist.findOneAndUpdate(
            { user: mongoUserId },
            { $addToSet: { products: { $each: ids } } },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        )

        const wishlist = await Wishlist.findOne({ user: mongoUserId })
            .populate('products', PRODUCT_FIELDS)
            .lean()

        const items = (wishlist?.products || [])
            .filter(Boolean)
            .map(mapProductToWishlistItem)
        return NextResponse.json({ success: true, data: items })
    } catch (error) {
        console.error('POST /api/wishlist error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update wishlist' },
            { status: 500 }
        )
    }
}

export async function DELETE(req) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 })
        }

        const body = await req.json().catch(() => ({}))
        const productId = body?.productId?.toString()

        await dbConnect()

        const mongoUserId = await getMongoUserId(session.user.id, session.user.email, session.user.name, session.user.image)
        if (!mongoUserId) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 })
        }

        if (productId && mongoose.Types.ObjectId.isValid(productId)) {
            await Wishlist.findOneAndUpdate(
                { user: mongoUserId },
                { $pull: { products: productId } },
                { new: true }
            )
        } else {
            await Wishlist.findOneAndUpdate(
                { user: mongoUserId },
                { $set: { products: [] } },
                { new: true }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('DELETE /api/wishlist error:', error)
        return NextResponse.json(
            { success: false, message: 'Failed to update wishlist' },
            { status: 500 }
        )
    }
}