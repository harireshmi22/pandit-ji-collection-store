<<<<<<< HEAD
import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

/**
 * Wrap the NextAuth middleware so that URL-construction errors
 * (e.g. NEXTAUTH_URL missing / invalid during build or prerender)
 * don't crash the process — instead fall through with no auth.
 */
export default async function middleware(req) {
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
        // Swallow URL / auth init errors (common during build / prerender)
        console.warn("[middleware] Auth error (skipped):", err.message)
        return NextResponse.next()
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
=======
import NextAuth from "next-auth"
import { NextResponse } from "next/server"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

/**
 * Wrap the NextAuth middleware so that URL-construction errors
 * (e.g. NEXTAUTH_URL missing / invalid during build or prerender)
 * don't crash the process — instead fall through with no auth.
 */
export default async function middleware(req) {
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
        // Swallow URL / auth init errors (common during build / prerender)
        console.warn("[middleware] Auth error (skipped):", err.message)
        return NextResponse.next()
    }
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
>>>>>>> 01ca697 (files added with fixed bugs)
