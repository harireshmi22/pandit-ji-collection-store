import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/models/Product";
import { NextResponse } from "next/server";
import redis, { memCache } from "@/lib/redis";

// GET /api/products - Fetch products with search and filtering
const PRODUCTS_CACHE_TTL_SECONDS = 300;

const isDataUri = (value) =>
    typeof value === "string" && value.trim().toLowerCase().startsWith("data:");

const isAllowedProductImage = (value) => {
    if (!value || typeof value !== "string") return true;
    const trimmed = value.trim();

    // Allow local placeholders and Cloudinary-hosted URLs only.
    if (trimmed.startsWith("/")) return true;
    return trimmed.startsWith("https://res.cloudinary.com/");
};

/* 
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        // 1. Extract and Clean Parameters
        const search = searchParams.get('search')?.trim() || '';
        const category = searchParams.get('category') || '';
        const brand = searchParams.get('brand') || '';
        const colors = searchParams.get('colors') || '';
        const sizes = searchParams.get('sizes') || '';
        const materials = searchParams.get('materials') || '';
        const featured = searchParams.get('featured') || '';
        const isNewArrival = searchParams.get('isNewArrival') || '';
        const sortBy = searchParams.get('sort') || '';
        const fields = searchParams.get('fields') || '';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const page = Math.max(1, parseInt(searchParams.get('page')) || 1);
        const limit = Math.max(1, parseInt(searchParams.get('limit')) || 20);

        // Create a unique cache key
        const cacheKey = `products:query:${JSON.stringify({ search, category, brand, colors, sizes, materials, featured, isNewArrival, sortBy, minPrice, maxPrice, page, limit })}`;

        // 2. Try cache (Redis -> in-memory fallback)
        try {
            let cachedData = null;
            let cacheLayer = 'none';
            let redisTtl = null;

            if (redis) {
                try {
                    cachedData = await redis.get(cacheKey);
                    if (cachedData) {
                        cacheLayer = 'redis';
                        redisTtl = await redis.ttl(cacheKey);
                    }
                } catch (err) {
                    console.warn('Redis GET failed:', err.message);
                }
            }

            if (!cachedData) {
                cachedData = memCache.get(cacheKey);
                if (cachedData) cacheLayer = 'memory';
            }

            if (cachedData) {
                const parsed = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;
                const payload = {
                    ...parsed,
                    source: 'cache',
                    cache: {
                        hit: true,
                        layer: cacheLayer,
                        ttlSeconds: cacheLayer === 'redis' ? redisTtl : PRODUCTS_CACHE_TTL_SECONDS,
                    },
                };

                return NextResponse.json(payload, {
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                        'X-Cache': 'HIT',
                        'X-Cache-Layer': cacheLayer,
                        'X-Redis-Enabled': String(Boolean(redis)),
                    },
                });
            }
        } catch (err) {
            console.warn('Cache read error:', err.message);
        }

        let products = [];
        let total = 0;
        let source = 'mock';

        // 3. Try MongoDB
        try {
            await dbConnect();

            const filter = {};

            if (search) {
                filter.$or = [
                    { name: { $regex: search, $options: 'i' } },
                    { brand: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } }
                ];
            }

            if (category && category !== 'all') filter.category = category;
            if (brand && brand !== 'all') filter.brand = brand;
            if (featured === 'true') filter.featured = true;
            if (isNewArrival === 'true') filter.isNewArrival = true;

            // Add price range filtering
            if (minPrice || maxPrice) {
                filter.price = {};
                if (minPrice) filter.price.$gte = Number(minPrice);
                if (maxPrice) filter.price.$lte = Number(maxPrice);
            }

            // Arrays ($in) filters
            if (colors) filter.colors = { $in: colors.split(',') };
            if (sizes) filter.sizes = { $in: sizes.split(',') };
            if (materials) filter.materials = { $in: materials.split(',') };

            const skip = (page - 1) * limit;
            const projection = fields === 'card'
                ? 'name price image brand category stock'
                : '';

            // Determine sort order
            let sortOption = { createdAt: -1 }; // default: newest first
            if (sortBy === 'price_asc') sortOption = { price: 1 };
            else if (sortBy === 'price_desc') sortOption = { price: -1 };
            else if (sortBy === 'rating') sortOption = { rating: -1, reviews: -1 };
            else if (sortBy === 'popular') sortOption = { reviews: -1, rating: -1 };
            else if (sortBy === 'name') sortOption = { name: 1 };

            // Execute Count and Data in parallel for speed
            const [dbProducts, dbTotal] = await Promise.all([
                Product.find(filter).select(projection).sort(sortOption).skip(skip).limit(limit).lean(),
                Product.countDocuments(filter)
            ]);

            if (dbProducts.length > 0 || search === '') {
                products = dbProducts;
                total = dbTotal;
                source = 'database';
            }

        } catch (dbError) {
            console.error('MongoDB Error, falling back to Mock:', dbError.message);
            // ... (Your existing Mock Filtering Logic here) ...
            source = 'mock';
        }

        // 4. Prepare Response
        const responseData = {
            success: true,
            data: products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            },
            source,
            cache: {
                hit: false,
                layer: 'none',
                ttlSeconds: PRODUCTS_CACHE_TTL_SECONDS,
            },
        };

        // 5. Store in cache (Redis + in-memory fallback)
        if (source === 'database') {
            const json = JSON.stringify(responseData);
            memCache.set(cacheKey, json, PRODUCTS_CACHE_TTL_SECONDS);
            if (redis) {
                try { await redis.set(cacheKey, json, { ex: PRODUCTS_CACHE_TTL_SECONDS }); } catch (err) {
                    console.warn('Redis SET failed:', err.message);
                }
            }
        }

        return NextResponse.json(responseData, {
            status: 200,
            headers: {
                'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
                'X-Cache': 'MISS',
                'X-Cache-Layer': 'none',
                'X-Redis-Enabled': String(Boolean(redis)),
            },
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

*/


export async function GET(req) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);

        // Params
        const search = searchParams.get('search')?.trim() || '';
        const category = searchParams.get('category') || '';
        const brand = searchParams.get('brand') || '';
        const colors = searchParams.get('colors') || '';
        const sizes = searchParams.get('sizes') || '';
        const materials = searchParams.get('materials') || '';
        const featured = searchParams.get('featured') || '';
        const isNewArrival = searchParams.get('isNewArrival') || '';
        const sortBy = searchParams.get('sort') || '';
        const fields = searchParams.get('fields') || '';
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');

        const page = Math.max(
            1,
            parseInt(searchParams.get('page')) || 1
        );

        const limit = Math.max(
            1,
            parseInt(searchParams.get('limit')) || 12
        );

        const skip = (page - 1) * limit;

        // Filter
        const filter = {};

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { brand: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (brand && brand !== 'all') {
            filter.brand = brand;
        }

        if (featured === 'true') {
            filter.featured = true;
        }

        if (isNewArrival === 'true') {
            filter.isNewArrival = true;
        }

        // Price Filter
        if (minPrice || maxPrice) {
            filter.price = {};

            if (minPrice) {
                filter.price.$gte = Number(minPrice);
            }

            if (maxPrice) {
                filter.price.$lte = Number(maxPrice);
            }
        }

        // Array Filters
        if (colors) {
            filter.colors = {
                $in: colors.split(',')
            };
        }

        if (sizes) {
            filter.sizes = {
                $in: sizes.split(',')
            };
        }

        if (materials) {
            filter.materials = {
                $in: materials.split(',')
            };
        }

        // Projection
        const projection =
            fields === 'card'
                ? 'name price image brand category stock rating'
                : '';

        // Sorting
        let sortOption = { createdAt: -1 };

        if (sortBy === 'price_asc') {
            sortOption = { price: 1 };
        } else if (sortBy === 'price_desc') {
            sortOption = { price: -1 };
        } else if (sortBy === 'rating') {
            sortOption = { rating: -1 };
        } else if (sortBy === 'popular') {
            sortOption = { reviews: -1 };
        } else if (sortBy === 'name') {
            sortOption = { name: 1 };
        }

        // Query
        const [products, total] = await Promise.all([
            Product.find(filter)
                .select(projection)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .lean(),

            Product.countDocuments(filter)
        ]);

        return NextResponse.json({
            success: true,
            data: products,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Products API Error:', error);

        return NextResponse.json(
            {
                success: false,
                message: 'Failed to fetch products'
            },
            { status: 500 }
        );
    }
}

// POST /api/products - Create a new product
export async function POST(req) {
    try {
        await dbConnect();

        const body = await req.json();

        const normalizeList = (value) => {
            if (!value) return [];
            if (Array.isArray(value)) {
                return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
            }
            return [...new Set(String(value).split(',').map((item) => item.trim()).filter(Boolean))];
        };

        const normalizedSizes = normalizeList(body.sizes || body.size);
        const normalizedColors = normalizeList(body.colors || body.color);
        const normalizedMaterials = normalizeList(body.materials || body.material);

        // Validate required fields
        const { name, description, price, category, brand } = body;
        if (!name || !description || !price || !category || !brand) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Missing required fields: name, description, price, category, brand",
                },
                { status: 400 },
            );
        }

        // Validate price
        if (isNaN(price) || price <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Price must be a positive number",
                },
                { status: 400 },
            );
        }

        if (isDataUri(body.image)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Base64 image data is not allowed. Upload image to Cloudinary first.",
                },
                { status: 400 },
            );
        }

        if (!isAllowedProductImage(body.image)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Image must be a Cloudinary URL (res.cloudinary.com) or a local placeholder path.",
                },
                { status: 400 },
            );
        }

        const incomingImages = Array.isArray(body.images) ? body.images : [];
        const hasInvalidImages = incomingImages.some((img) => !isAllowedProductImage(img) || isDataUri(img));
        if (hasInvalidImages) {
            return NextResponse.json(
                {
                    success: false,
                    message: "All images must be Cloudinary URLs (or local placeholder paths).",
                },
                { status: 400 },
            );
        }

        // Create new product
        const newProduct = new Product({
            name: name.trim(),
            description: description.trim(),
            price: parseFloat(price),
            category: category.trim(),
            brand: brand.trim(),
            image: body.image || "/images/placeholder.jpg",
            images: body.images || [body.image || "/images/placeholder.jpg"],
            stock: body.stock || 0,
            size: normalizedSizes[0] || body.size || 'M',
            sizes: normalizedSizes.length > 0 ? normalizedSizes : ["S", "M", "L", "XL"],
            color: normalizedColors[0] || body.color || 'Black',
            colors: normalizedColors.length > 0 ? normalizedColors : ["Black"],
            material: normalizedMaterials[0] || body.material || '',
            materials: normalizedMaterials,
            rating: 0,
            reviews: 0,
            isNewArrival: body.isNewArrival || false,
            featured: body.featured || false,
        });

        const savedProduct = await newProduct.save();

        // Invalidate caches so new product appears immediately
        memCache.delByPrefix("products:");
        memCache.delByPrefix("product:");
        memCache.delByPrefix("shop:");
        if (redis) {
            try {
                const listKeys = await redis.keys("products:*");
                const detailKeys = await redis.keys("product:*");
                const shopKeys = await redis.keys("shop:*");
                const allKeys = [...listKeys, ...detailKeys, ...shopKeys];
                if (allKeys.length > 0) await redis.del(...allKeys);
            } catch (err) {
                console.warn("Redis cache invalidation failed:", err.message);
            }
        }

        return NextResponse.json(
            {
                success: true,
                data: savedProduct,
                message: "Product created successfully",
            },
            { status: 201 },
        );
    } catch (error) {
        console.error("[API] POST /api/products error:", error);

        // Handle duplicate key errors
        if (error.code === 11000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Product with this name already exists",
                },
                { status: 409 },
            );
        }

        return NextResponse.json(
            {
                success: false,
                message: "Server error: " + error.message,
                error: process.env.NODE_ENV === "development" ? error.stack : undefined,
            },
            { status: 500 },
        );
    }
}

