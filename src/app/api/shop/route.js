import { NextResponse } from "next/server";
import { dbConnect, cloudinary } from "@/lib/dbConnect";
import Product from "@/models/Product";
import redis, { memCache } from "@/lib/redis";

const SHOP_CACHE_TTL_SECONDS = 300;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const page = Math.max(1, parseInt(searchParams.get("page")) || 1);
    const limit = Math.max(1, parseInt(searchParams.get("limit")) || 20);

    const cacheKey = `shop:query:${JSON.stringify({ search, category, page, limit })}`;

    // Cache lookup (Redis -> in-memory fallback)
    let cached = null;
    let cacheLayer = "none";
    let redisTtl = null;

    if (redis) {
      try {
        cached = await redis.get(cacheKey);
        if (cached) {
          cacheLayer = "redis";
          redisTtl = await redis.ttl(cacheKey);
        }
      } catch (err) {
        console.warn("[SHOP] Redis GET failed:", err.message);
      }
    }

    if (!cached) {
      cached = memCache.get(cacheKey);
      if (cached) cacheLayer = "memory";
    }

    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json(
        {
          ...parsed,
          source: "cache",
          cache: {
            hit: true,
            layer: cacheLayer,
            ttlSeconds:
              cacheLayer === "redis" ? redisTtl : SHOP_CACHE_TTL_SECONDS,
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

    await dbConnect();

    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (category && category !== "all" && category !== "All") {
      filter.category = category;
    }

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(filter),
    ]);

    const responseData = {
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      source: "database",
      cache: {
        hit: false,
        layer: "none",
        ttlSeconds: SHOP_CACHE_TTL_SECONDS,
      },
    };

    const json = JSON.stringify(responseData);
    memCache.set(cacheKey, json, SHOP_CACHE_TTL_SECONDS);
    if (redis) {
      try {
        await redis.set(cacheKey, json, { ex: SHOP_CACHE_TTL_SECONDS });
      } catch (err) {
        console.warn("[SHOP] Redis SET failed:", err.message);
      }
    }

    return NextResponse.json(responseData, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Cache": "MISS",
        "X-Cache-Layer": "none",
        "X-Redis-Enabled": String(Boolean(redis)),
      },
    });
  } catch (error) {
    console.error("[SHOP] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
export async function GET(request) {
  try {
    await dbConnect();

    const product = await Product.find({});
    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error("[SHOP] GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();

    // 1. Form data extract karein
    const formData = await request.formData();
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const imageFile = formData.get("image"); // File object

    if (!imageFile || imageFile.size === 0) {
      return NextResponse.json(
        { error: "Image file is required" },
        { status: 400 },
      );
    }

    // 2. Image ko Buffer mein convert karein Cloudinary upload ke liye
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Cloudinary mein upload karein
    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "shop",
            resource_type: "auto",
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    // 4. Naya product create karein database mein
    const newProduct = await Product.create({
      name,
      description: formData.get("description"),
      price: parseFloat(price),
      size: formData.get("size"),
      color: formData.get("color"),
      category: formData.get("category"),
      brand: formData.get("brand"),
      gender: formData.get("gender"),
      material: formData.get("material"),
      image: [uploadResult.secure_url],
    });

    // Invalidate relevant caches so new product appears immediately
    memCache.delByPrefix("products:");
    memCache.delByPrefix("product:");
    memCache.delByPrefix("shop:");
    if (redis) {
      try {
        const productListKeys = await redis.keys("products:*");
        const productDetailKeys = await redis.keys("product:*");
        const shopKeys = await redis.keys("shop:*");
        const allKeys = [...productListKeys, ...productDetailKeys, ...shopKeys];
        if (allKeys.length > 0) await redis.del(...allKeys);
      } catch (err) {
        console.warn("[SHOP] Redis cache invalidation failed:", err.message);
      }
    }

    return NextResponse.json(
      { message: "Product uploaded successfully", product: newProduct },
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.error("Error uploading product:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
