export default function robots() {
    const baseUrl = process.env.NEXTAUTH_URL || "https://panditjicollection.com";

    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/admin/", "/profile/"],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
