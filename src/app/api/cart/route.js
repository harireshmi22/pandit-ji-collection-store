import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import redis, { memCache } from '@/lib/redis';

const CACHE_TTL = {
    CART: 60 * 60 * 24 * 7, // 7 days
};

// Simple UUID generator
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return String(v).toString(16);
    });
}

export async function GET(req) {
    try {
        const cookieStore = await cookies();
        let sessionId = cookieStore.get('sessionId')?.value;
        let newSession = false;

        if (!sessionId) {
            sessionId = generateUUID();
            newSession = true;
        }

        const cacheKey = `cart:${sessionId}`;
        let cartData = null;

        // Try Redis first, then in-memory fallback
        if (redis) {
            try { cartData = await redis.get(cacheKey); } catch (err) {
                console.warn('Cart Redis GET failed:', err.message);
            }
        }
        if (!cartData) cartData = memCache.get(cacheKey);

        // Parse if string
        if (typeof cartData === 'string') {
            try { cartData = JSON.parse(cartData); } catch { cartData = null; }
        }

        const response = NextResponse.json({
            success: true,
            data: cartData || [],
            sessionId: sessionId
        });

        if (newSession) {
            response.cookies.set('sessionId', sessionId, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: CACHE_TTL.CART
            });
        }

        return response;
    } catch (error) {
        console.error('GET /api/cart error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        const cookieStore = await cookies();
        let sessionId = cookieStore.get('sessionId')?.value;

        if (!sessionId) {
            return NextResponse.json(
                { success: false, message: 'Session ID missing' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const { cartItems } = body;

        const cacheKey = `cart:${sessionId}`;
        const json = JSON.stringify(cartItems);

        // Always store in memory (works on Netlify serverless)
        memCache.set(cacheKey, json, CACHE_TTL.CART);

        // Also store in Redis if available
        if (redis) {
            try { await redis.set(cacheKey, json, { ex: CACHE_TTL.CART }); } catch (err) {
                console.warn('Cart Redis SET failed:', err.message);
            }
        }

        return NextResponse.json({ success: true, message: 'Cart updated' });
    } catch (error) {
        console.error('POST /api/cart error:', error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
