import { NextResponse } from "next/server";
import Product from "@/models/Product";
import { dbConnect } from "@/lib/dbConnect";
import redis, { memCache } from "@/lib/redis";

const MAX_LIMIT = 50;
const DEFAULT_LIMIT = 20;
const SEARCH_CACHE_TTL_SECONDS = 120;
const SUGGEST_CACHE_TTL_SECONDS = 90;
const ALLOWED_SORTS = new Set([
    "relevance",
    "price_asc",
    "price_desc",
    "rating",
    "newest",
    "popular",
    "name",
]);

function escapeRegex(value = "") {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePositiveNumber(value) {
    if (value === null || value === undefined || value === "") return null;
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return parsed;
}

function toBoolean(value) {
    return value === "1" || value === "true";
}

function parseSearchTokens(query) {
    return query
        .trim()
        .split(/\s+/)
        .map((token) => token.trim())
        .filter(Boolean)
        .slice(0, 8);
}

function buildSort(sortBy) {
    if (sortBy === "price_asc") return { price: 1, createdAt: -1 };
    if (sortBy === "price_desc") return { price: -1, createdAt: -1 };
    if (sortBy === "rating") return { rating: -1, reviews: -1 };
    if (sortBy === "newest") return { createdAt: -1 };
    if (sortBy === "popular") return { reviews: -1, rating: -1 };
    if (sortBy === "name") return { name: 1 };
    return { searchScore: -1, rating: -1, reviews: -1, createdAt: -1 };
}

function getPrimaryImage(product) {
    if (typeof product.image === "string") return product.image;
    if (Array.isArray(product.image) && product.image.length > 0) return product.image[0];
    if (Array.isArray(product.images) && product.images.length > 0) return product.images[0];
    return "";
}

async function getCachedValue(key) {
    let cached = null;
    if (redis) {
        try {
            cached = await redis.get(key);
        } catch {
            cached = null;
        }
    }

    if (!cached) cached = memCache.get(key);
    if (!cached) return null;
    return typeof cached === "string" ? JSON.parse(cached) : cached;
}

async function setCachedValue(key, value, ttlSeconds) {
    const json = JSON.stringify(value);
    memCache.set(key, json, ttlSeconds);
    if (redis) {
        try {
            await redis.set(key, json, { ex: ttlSeconds });
        } catch {
            // Ignore Redis write failures and keep memory cache as fallback.
        }
    }
}

export const GET = async (req) => {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);

        const query =
            searchParams.get("q")?.trim() ||
            searchParams.get("search")?.trim() ||
            "";
        const category = searchParams.get("category")?.trim() || "";
        const brand = searchParams.get("brand")?.trim() || "";
        const sortRaw = searchParams.get("sort")?.trim() || "relevance";
        const sort = ALLOWED_SORTS.has(sortRaw) ? sortRaw : "relevance";

        const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
        const limit = Math.min(
            MAX_LIMIT,
            Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10))
        );
        const skip = (page - 1) * limit;

        const minPrice = parsePositiveNumber(searchParams.get("minPrice"));
        const maxPrice = parsePositiveNumber(searchParams.get("maxPrice"));
        const minRating = parsePositiveNumber(searchParams.get("minRating"));
        const suggestionsOnly = toBoolean(searchParams.get("suggest"));

        const cacheKey = `search:query:${JSON.stringify({
            query,
            category,
            brand,
            sort,
            page,
            limit,
            minPrice,
            maxPrice,
            minRating,
            suggestionsOnly,
        })}`;

        const cachedPayload = await getCachedValue(cacheKey);
        if (cachedPayload) {
            return NextResponse.json(cachedPayload, {
                status: 200,
                headers: {
                    "Cache-Control": "no-store",
                    "X-Cache": "HIT",
                },
            });
        }

        const baseMatch = {};
        if (category && category.toLowerCase() !== "all") {
            baseMatch.category = category;
        }
        if (brand && brand.toLowerCase() !== "all") {
            baseMatch.brand = brand;
        }
        if (minRating !== null) {
            baseMatch.rating = { ...(baseMatch.rating || {}), $gte: minRating };
        }
        if (minPrice !== null || maxPrice !== null) {
            baseMatch.price = {};
            if (minPrice !== null) baseMatch.price.$gte = minPrice;
            if (maxPrice !== null) baseMatch.price.$lte = maxPrice;
        }

        if (suggestionsOnly) {
            if (!query) {
                return NextResponse.json({ success: true, data: [] });
            }

            const safeRegex = new RegExp(escapeRegex(query), "i");
            const suggestions = await Product.find({
                ...baseMatch,
                $or: [
                    { name: safeRegex },
                    { brand: safeRegex },
                    { category: safeRegex },
                ],
            })
                .select("name brand category image images price")
                .sort({ reviews: -1, rating: -1 })
                .limit(8)
                .lean();

            const dedupedByName = Array.from(
                new Map(
                    suggestions
                        .filter((item) => item?.name)
                        .map((item) => [item.name.toLowerCase(), item])
                ).values()
            ).slice(0, 8);

            const suggestionData = dedupedByName.map((item) => ({
                _id: item._id,
                name: item.name,
                brand: item.brand || item.category || "Product",
                image: getPrimaryImage(item),
                price: item.price,
            }));

            const payload = {
                success: true,
                data: suggestionData,
            };

            await setCachedValue(cacheKey, payload, SUGGEST_CACHE_TTL_SECONDS);

            return NextResponse.json(payload, {
                headers: {
                    "Cache-Control": "no-store",
                    "X-Cache": "MISS",
                },
            });
        }

        const tokens = parseSearchTokens(query);

        const pipeline = [];
        pipeline.push({ $match: baseMatch });

        if (tokens.length > 0) {
            pipeline.push({
                $match: {
                    $and: tokens.map((token) => {
                        const safeTokenRegex = new RegExp(escapeRegex(token), "i");
                        return {
                            $or: [
                                { name: safeTokenRegex },
                                { brand: safeTokenRegex },
                                { category: safeTokenRegex },
                                { description: safeTokenRegex },
                            ],
                        };
                    }),
                },
            });
        }

        if (query) {
            const escapedQuery = escapeRegex(query);
            pipeline.push({
                $addFields: {
                    searchScore: {
                        $add: [
                            {
                                $cond: [
                                    { $regexMatch: { input: "$name", regex: `^${escapedQuery}$`, options: "i" } },
                                    120,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    { $regexMatch: { input: "$name", regex: `^${escapedQuery}`, options: "i" } },
                                    80,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    { $regexMatch: { input: "$name", regex: escapedQuery, options: "i" } },
                                    60,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    { $regexMatch: { input: "$brand", regex: escapedQuery, options: "i" } },
                                    25,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    { $regexMatch: { input: "$category", regex: escapedQuery, options: "i" } },
                                    15,
                                    0,
                                ],
                            },
                            {
                                $cond: [
                                    { $regexMatch: { input: "$description", regex: escapedQuery, options: "i" } },
                                    10,
                                    0,
                                ],
                            },
                        ],
                    },
                },
            });
        } else {
            pipeline.push({ $addFields: { searchScore: 0 } });
        }

        const sortOrder = buildSort(sort);
        pipeline.push({
            $facet: {
                data: [
                    { $sort: sortOrder },
                    { $skip: skip },
                    { $limit: limit },
                ],
                totalCount: [{ $count: "total" }],
                categories: [
                    { $group: { _id: "$category", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 12 },
                ],
                brands: [
                    { $group: { _id: "$brand", count: { $sum: 1 } } },
                    { $sort: { count: -1 } },
                    { $limit: 12 },
                ],
            },
        });

        const [result] = await Product.aggregate(pipeline);

        const products = result?.data || [];
        const total = result?.totalCount?.[0]?.total || 0;

        const payload = {
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
            facets: {
                categories: (result?.categories || [])
                    .map((item) => item._id)
                    .filter(Boolean),
                brands: (result?.brands || [])
                    .map((item) => item._id)
                    .filter(Boolean),
            },
        };

        await setCachedValue(cacheKey, payload, SEARCH_CACHE_TTL_SECONDS);

        return NextResponse.json(payload, {
            headers: {
                "Cache-Control": "no-store",
                "X-Cache": "MISS",
            },
        });
    } catch (error) {
        console.error("Error searching products:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
};