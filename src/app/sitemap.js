<<<<<<< HEAD
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Product";

export default async function sitemap() {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://panditjicollection.com";

    // Static routes
    const routes = [
        "",
        "/about",
        "/shop",
        "/contact",
        "/login",
        "/signup",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 1,
    }));

    // Dynamic routes (Products) — skip if DB is unavailable at build time
    let productRoutes = [];
    try {
        await dbConnect();
        const products = await Product.find({}).select("_id updatedAt").lean();
        productRoutes = products.map((product) => ({
            url: `${baseUrl}/shop/${product._id}`,
            lastModified: product.updatedAt,
            changeFrequency: "weekly",
            priority: 0.8,
        }));
    } catch (err) {
        console.warn("sitemap: Could not fetch products (DB unavailable):", err.message);
    }

    return [...routes, ...productRoutes];
}
=======
import { dbConnect } from "@/lib/dbConnect";
import Product from "@/models/Product";

export default async function sitemap() {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://panditjicollection.com";

    // Static routes
    const routes = [
        "",
        "/about",
        "/shop",
        "/contact",
        "/login",
        "/signup",
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 1,
    }));

    // Dynamic routes (Products) — skip if DB is unavailable at build time
    let productRoutes = [];
    try {
        await dbConnect();
        const products = await Product.find({}).select("_id updatedAt").lean();
        productRoutes = products.map((product) => ({
            url: `${baseUrl}/shop/${product._id}`,
            lastModified: product.updatedAt,
            changeFrequency: "weekly",
            priority: 0.8,
        }));
    } catch (err) {
        console.warn("sitemap: Could not fetch products (DB unavailable):", err.message);
    }

    return [...routes, ...productRoutes];
}
>>>>>>> 01ca697 (files added with fixed bugs)
