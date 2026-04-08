import { dbConnect } from "@/lib/dbConnect.js";
import Product from "@/models/Product.js";
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import redis, { memCache } from "@/lib/redis";

// GET /api/products/[id] - Fetch a single product by ID with Redis caching
const PRODUCT_DETAIL_CACHE_TTL_SECONDS = 300;

export async function GET(request, { params }) {
	try {
		// Handle async params for Next.js 16
		if (params instanceof Promise) {
			params = await params;
		}

		if (!params || !params.id) {
			return NextResponse.json(
				{ success: false, message: "Product ID is required in URL path" },
				{ status: 400 },
			);
		}

		let { id } = params;

		// Handle URL-encoded IDs
		try {
			id = decodeURIComponent(id);
		} catch (e) {
			console.warn("Failed to decode URI component:", e);
		}

		const trimmedId = id.trim();

		if (!trimmedId) {
			return NextResponse.json(
				{ success: false, message: "Product ID is required" },
				{ status: 400 },
			);
		}

		console.log(`[API] Fetching product: ${trimmedId}`);

		// 1. Check cache (Redis → in-memory fallback)
		const cacheKey = `product:${trimmedId}`;
		try {
			let cachedProduct = null;
			let cacheLayer = "none";
			let redisTtl = null;

			if (redis) {
				try {
					cachedProduct = await redis.get(cacheKey);
					if (cachedProduct) {
						cacheLayer = "redis";
						redisTtl = await redis.ttl(cacheKey);
					}
				} catch (err) {
					console.warn("[API] Redis cache error:", err.message);
				}
			}

			if (!cachedProduct) {
				cachedProduct = memCache.get(cacheKey);
				if (cachedProduct) cacheLayer = "memory";
			}

			if (cachedProduct) {
				const productData =
					typeof cachedProduct === "string"
						? JSON.parse(cachedProduct)
						: cachedProduct;
				return NextResponse.json(
					{
						success: true,
						data: productData,
						source: "cache",
						cache: {
							hit: true,
							layer: cacheLayer,
							ttlSeconds:
								cacheLayer === "redis"
									? redisTtl
									: PRODUCT_DETAIL_CACHE_TTL_SECONDS,
						},
					},
					{
						status: 200,
						headers: {
							"Cache-Control": "no-store",
							"X-Cache": "HIT",
							"X-Cache-Layer": cacheLayer,
							"X-Redis-Enabled": String(Boolean(redis)),
						},
					},
				);
			}
		} catch (cacheError) {
			console.warn("[API] Cache read error:", cacheError.message);
		}

		// 2. Try MongoDB
		try {
			await dbConnect();

			// Validate MongoDB ObjectId format
			if (!mongoose.Types.ObjectId.isValid(trimmedId)) {
				return NextResponse.json(
					{ success: false, message: "Invalid product ID format" },
					{ status: 400 },
				);
			}

			const product = await Product.findById(trimmedId).lean();

			if (!product) {
				return NextResponse.json(
					{ success: false, message: "Product not found" },
					{ status: 404 },
				);
			}

			// 3. Store in cache (Redis + in-memory fallback)
			const productJson = JSON.stringify(product);
			memCache.set(cacheKey, productJson, PRODUCT_DETAIL_CACHE_TTL_SECONDS);
			if (redis) {
				try {
					await redis.set(cacheKey, productJson, {
						ex: PRODUCT_DETAIL_CACHE_TTL_SECONDS,
					});
				} catch (err) {
					console.warn("[API] Redis SET failed:", err.message);
				}
			}

			return NextResponse.json(
				{
					success: true,
					data: product,
					source: "database",
					cache: {
						hit: false,
						layer: "none",
						ttlSeconds: PRODUCT_DETAIL_CACHE_TTL_SECONDS,
					},
				},
				{
					status: 200,
					headers: {
						"Cache-Control": "no-store",
						"X-Cache": "MISS",
						"X-Cache-Layer": "none",
						"X-Redis-Enabled": String(Boolean(redis)),
					},
				},
			);
		} catch (dbError) {
			console.error("[API] Database error:", dbError.message);
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 },
			);
		}
	} catch (error) {
		console.error("[API] GET /api/products/[id] error:", error);
		return NextResponse.json(
			{ success: false, message: "Server error: " + error.message },
			{ status: 500 },
		);
	}
}

// Update a product by ID
export async function PUT(request, { params }) {
	try {
		// Handle async params for Next.js 16
		if (params instanceof Promise) {
			params = await params;
		}

		const { id } = params;
		const body = await request.json();

		const normalizeList = (value) => {
			if (!value) return [];
			if (Array.isArray(value)) {
				return [...new Set(value.map((item) => String(item).trim()).filter(Boolean))];
			}
			return [...new Set(String(value).split(',').map((item) => item.trim()).filter(Boolean))];
		};

		const normalizedSizes = normalizeList(body.sizes ?? body.size);
		const normalizedColors = normalizeList(body.colors ?? body.color);
		const normalizedMaterials = normalizeList(body.materials ?? body.material);

		const payload = {
			...body,
			updatedAt: new Date(),
			size: normalizedSizes[0] || body.size || 'M',
			sizes: normalizedSizes.length > 0 ? normalizedSizes : ['M'],
			color: normalizedColors[0] || body.color || 'Black',
			colors: normalizedColors.length > 0 ? normalizedColors : ['Black'],
			material: normalizedMaterials[0] || body.material || '',
			materials: normalizedMaterials,
		};

		await dbConnect();

		const updatedProduct = await Product.findByIdAndUpdate(
			id,
			payload,
			{ new: true, runValidators: true },
		).lean();

		if (!updatedProduct) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 },
			);
		}

		// Invalidate caches so the change reflects immediately
		memCache.delByPrefix("product:");
		memCache.delByPrefix("products:");
		if (redis) {
			try {
				const keys = await redis.keys("products:*");
				const detailKeys = await redis.keys("product:*");
				const allKeys = [...keys, ...detailKeys];
				if (allKeys.length > 0) await redis.del(...allKeys);
			} catch (err) {
				console.warn("Redis cache invalidation failed:", err.message);
			}
		}

		return NextResponse.json(
			{
				success: true,
				data: updatedProduct,
				message: "Product updated successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("PUT /api/products/[id] error:", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 },
		);
	}
}

// Delete a product by ID
export async function DELETE(request, { params }) {
	try {
		// Handle async params for Next.js 16
		if (params instanceof Promise) {
			params = await params;
		}

		const { id } = params;

		await dbConnect();

		const deletedProduct = await Product.findByIdAndDelete(id).lean();

		if (!deletedProduct) {
			return NextResponse.json(
				{ success: false, message: "Product not found" },
				{ status: 404 },
			);
		}

		// Invalidate caches
		memCache.delByPrefix("product:");
		memCache.delByPrefix("products:");
		if (redis) {
			try {
				const keys = await redis.keys("products:*");
				const detailKeys = await redis.keys("product:*");
				const allKeys = [...keys, ...detailKeys];
				if (allKeys.length > 0) await redis.del(...allKeys);
			} catch (err) {
				console.warn("Redis cache invalidation failed:", err.message);
			}
		}

		return NextResponse.json(
			{
				success: true,
				data: deletedProduct,
				message: "Product deleted successfully",
			},
			{ status: 200 },
		);
	} catch (error) {
		console.error("DELETE /api/products/[id] error:", error);
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: 500 },
		);
	}
}
