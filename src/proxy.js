import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

/**
 * Wrap NextAuth proxy logic so URL-construction/auth init failures
 * don't crash the request pipeline during build or prerender.
 */
export default async function proxy(req) {
    try {
        return await auth((authReq) => {
            const { nextUrl } = authReq
            const isLoggedIn = !!authReq.auth
            const role = authReq.auth?.user?.role

            const isAdminRoute = nextUrl.pathname.startsWith("/admin")
            const isAdminLoginRoute = nextUrl.pathname === "/admin/login"
            const isProtectedRoute =
                nextUrl.pathname.startsWith("/profile") ||
                nextUrl.pathname.startsWith("/checkout")

            if (isProtectedRoute && !isLoggedIn) {
                return Response.redirect(
                    new URL(`/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
                )
            }

            if (isAdminRoute && !isAdminLoginRoute) {
                if (!isLoggedIn) {
                    return Response.redirect(
                        new URL(`/admin/login?callbackUrl=${nextUrl.pathname}`, nextUrl)
                    )
                }
                if (role !== "admin") {
                    return Response.redirect(new URL("/", nextUrl))
                }
            }

            return NextResponse.next()
        })(req, {})
    } catch (err) {
        console.warn("[proxy] Auth error (skipped):", err.message)
        return NextResponse.next()
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
