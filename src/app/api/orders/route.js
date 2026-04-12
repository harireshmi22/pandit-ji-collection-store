import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';
import redis, { memCache } from '@/lib/redis';
import { RedisKeys } from '@/lib/redis-keys';

function normalizeShippingAddress(shippingAddress = {}) {
    return {
        fullName: shippingAddress.fullName || '',
        email: shippingAddress.email || '',
        address: shippingAddress.address || '',
        city: shippingAddress.city || '',
        postalCode: shippingAddress.postalCode || shippingAddress.zipCode || '',
        country: shippingAddress.country || '',
        phone: shippingAddress.phone || '',
    };
}

function validateShippingAddress(shippingAddress) {
    const requiredFields = ['fullName', 'email', 'address', 'city', 'postalCode', 'country'];
    for (const field of requiredFields) {
        if (!shippingAddress[field] || String(shippingAddress[field]).trim() === '') {
            return `Missing shipping field: ${field}`;
        }
    }
    return null;
}

// Force rebuild - fix import path
// GET all orders (Admin only) or User's orders
export async function GET(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await dbConnect();

        // If user is admin, they can see all orders or filtered by user
        // For now, let's assume session.user.role === 'admin' check
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        const summaryOnly = searchParams.get('summary') === 'true';
        const hydrateImages = searchParams.get('hydrateImages') !== 'false';
        const limitRaw = Number(searchParams.get('limit') || 0);
        const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 500) : 0;

        let query = {};
        if (session.user.role !== 'admin') {
            // Regular users only see their own orders
            query.user = session.user.id;
        } else if (userId) {
            // Admin filtering by user
            query.user = userId;
        }

        let ordersQuery = Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        if (summaryOnly) {
            ordersQuery = ordersQuery.select('_id totalPrice status createdAt user shippingAddress');
        }

        if (limit > 0) {
            ordersQuery = ordersQuery.limit(limit);
        }

        const orders = await ordersQuery.lean();

        // Enrich order items with current product images from DB
        const productIds = orders
            .flatMap(o => o.orderItems || [])
            .map(item => item.product)
            .filter(id => mongoose.Types.ObjectId.isValid(id));

        if (hydrateImages && productIds.length > 0) {
            const products = await Product.find(
                { _id: { $in: productIds } },
                { _id: 1, image: 1, images: 1 }
            ).lean();

            const productMap = {};
            for (const p of products) {
                const img = (Array.isArray(p.images) && p.images.length > 0)
                    ? p.images[0]
                    : p.image || null;
                productMap[p._id.toString()] = img;
            }

            for (const order of orders) {
                for (const item of (order.orderItems || [])) {
                    const pid = item.product?.toString();
                    if (pid && productMap[pid]) {
                        item.image = productMap[pid];
                    }
                }
            }
        }

        return NextResponse.json(orders);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { message: 'Error fetching orders', error: error.message },
            { status: 500 }
        );
    }
}

// POST create a new order
export async function POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const body = await req.json();

        const {
            orderItems,
            shippingAddress,
            paymentMethod,
        } = body;

        if (!orderItems || orderItems.length === 0) {
            return NextResponse.json({ message: 'No order items' }, { status: 400 });
        }

        await dbConnect();

        const normalizedShippingAddress = normalizeShippingAddress(shippingAddress);
        const shippingError = validateShippingAddress(normalizedShippingAddress);
        if (shippingError) {
            return NextResponse.json({ message: shippingError }, { status: 400 });
        }

        // Helper to check if string is valid MongoDB ObjectId
        const isValidObjectId = (id) => {
            try {
                return mongoose.Types.ObjectId.isValid(id) &&
                    new mongoose.Types.ObjectId(id).toString() === id;
            } catch {
                return false;
            }
        };

        const productIds = [...new Set(orderItems.map((item) => item.product?.toString()))];
        const invalidProductId = productIds.find((id) => !isValidObjectId(id));
        if (invalidProductId) {
            return NextResponse.json({ message: 'One or more products are invalid.' }, { status: 400 });
        }

        const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
        const productMap = new Map(dbProducts.map((product) => [product._id.toString(), product]));

        const normalizedOrderItems = [];
        for (const item of orderItems) {
            const dbProduct = productMap.get(item.product.toString());
            if (!dbProduct) {
                return NextResponse.json({ message: `Product not found: ${item.product}` }, { status: 404 });
            }

            const quantity = Number(item.quantity || 0);
            if (!Number.isInteger(quantity) || quantity <= 0) {
                return NextResponse.json({ message: `Invalid quantity for ${dbProduct.name}` }, { status: 400 });
            }

            if (dbProduct.stock < quantity) {
                return NextResponse.json({ message: `${dbProduct.name} is out of stock.` }, { status: 400 });
            }

            normalizedOrderItems.push({
                product: dbProduct._id,
                name: dbProduct.name,
                quantity,
                price: Number(dbProduct.price),
                image: (Array.isArray(dbProduct.images) && dbProduct.images[0]) || dbProduct.image || '/images/placeholder-product.svg',
                size: item.size || item.selectedSize || 'M',
            });
        }

        const itemsPrice = normalizedOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shippingPrice = itemsPrice >= 100 ? 0 : 10;
        const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
        const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

        // 1. Inventory Check & Reservation (Redis) — graceful if Redis is unavailable
        const reservedItems = [];
        if (redis) {
            try {
                // 1a. Pre-check and Initialize Stock in Redis (Parallel)
                const stockCheckPromises = normalizedOrderItems.map(async (item) => {
                    if (!isValidObjectId(item.product)) return;
                    const stockKey = RedisKeys.STOCK(item.product);
                    const exists = await redis.exists(stockKey);
                    if (!exists) {
                        const product = await Product.findById(item.product);
                        if (!product) {
                            throw new Error(`Product not found: ${item.name}`);
                        }
                        await redis.set(stockKey, product.stock);
                    }
                });

                await Promise.all(stockCheckPromises);

                // 1b. Reserve Stock (Sequential Atomic Decrements)
                for (const item of normalizedOrderItems) {
                    if (!isValidObjectId(item.product)) continue;
                    const stockKey = RedisKeys.STOCK(item.product);
                    const newStock = await redis.decrby(stockKey, item.quantity);
                    reservedItems.push({ key: stockKey, quantity: item.quantity });

                    if (newStock < 0) {
                        throw new Error(`Out of stock: ${item.name}`);
                    }
                }
            } catch (stockError) {
                // Rollback reserved items
                for (const reserved of reservedItems) {
                    await redis.incrby(reserved.key, reserved.quantity);
                }
                return NextResponse.json(
                    { message: stockError.message },
                    { status: 400 }
                );
            }
        }

        // 2. Create Order in DB
        const order = new Order({
            user: session.user.id,
            orderItems: normalizedOrderItems,
            shippingAddress: normalizedShippingAddress,
            paymentMethod: paymentMethod || 'Cash on Delivery',
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
            paymentStatus: 'pending',
            isPaid: false,
        });

        const createdOrder = await order.save();

        // 3. Sync DB Stock (Decrement in MongoDB)
        // We do this asynchronously or blocking. Blocking is safer for consistency.
        for (const item of normalizedOrderItems) {
            await Product.findByIdAndUpdate(item.product, {
                $inc: { stock: -item.quantity }
            });
        }

        // Also invalidate product cache since stock changed?
        // Maybe too expensive to do on every order. We can let TTL expire or use ISR revalidate.
        // For now, let's just clear the specific product detail key if we had one (we only have ALL list cached).
        // Clearing the ALL list cache might be good.
        // await redis.del(RedisKeys.PRODUCT_ALL({})); // This is tricky as we don't know the exact query params of cached lists.
        // A smarter strategy would be to use tags or just let TTL expire (5 mins is okay for lists).

        return NextResponse.json(createdOrder, { status: 201 });
    } catch (error) {
        console.error('API Error in POST /api/orders:', error);
        console.error('Error stack:', error.stack);

        // Check if it's a Redis error
        if (error.message && error.message.includes('Redis')) {
            return NextResponse.json(
                { message: 'Redis connection failed', error: error.message },
                { status: 500 }
            );
        }

        // Check if it's a MongoDB connection error
        if (error.name === 'MongooseServerSelectionError' || error.message.includes('ECONNREFUSED')) {
            return NextResponse.json(
                {
                    message: 'Database connection failed. Please ensure MongoDB is running.',
                    error: error.message,
                    isDemoMode: true
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                message: 'Error creating order',
                error: error.message || 'Unknown error',
                details: error.errors ? Object.keys(error.errors).map(key => ({
                    field: key,
                    message: error.errors[key].message
                })) : null
            },
            { status: 500 }
        );
    }
}


export async function ORDER_POST(req) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }
    } catch (error) {
        console.error('API Error in POST /api/orders:', error);
        return NextResponse.json(
            { message: 'Error creating order', error: error.message },
            { status: 500 }
        );
    }
}
