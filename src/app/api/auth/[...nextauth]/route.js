
import { handlers } from "@/auth"
import { checkRateLimit } from "@/lib/rateLimit"
import { NextResponse } from "next/server"

export const { GET } = handlers

export async function POST(req) {
    const rateLimitResult = await checkRateLimit(req)

    if (!rateLimitResult.success) {
        return NextResponse.json(
            { error: "Too many login attempts. Please try again later.", retryAfter: rateLimitResult.retryAfter },
            { status: 429 }
        )
    }

    return handlers.POST(req)
}
