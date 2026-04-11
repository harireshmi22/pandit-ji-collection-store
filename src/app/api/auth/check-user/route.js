import { dbConnect } from "@/lib/dbConnect"
import User from "@/models/User"
import { NextResponse } from "next/server"

export async function POST(req) {
    try {
        const { email } = await req.json()
        const normalizedEmail = email?.toString().trim().toLowerCase()

        if (!normalizedEmail) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            )
        }

        await dbConnect()

        const user = await User.findOne({ email: normalizedEmail }).select("_id")

        return NextResponse.json({ exists: !!user }, { status: 200 })
    } catch (error) {
        console.error("Check-user error:", error)
        return NextResponse.json(
            { message: "Unable to verify account right now" },
            { status: 503 }
        )
    }
}