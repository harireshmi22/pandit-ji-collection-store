import crypto from "crypto";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

export const GET = async (req) => {
    try {
        await dbConnect();

        const token = (req.nextUrl.searchParams.get("token") || "").trim();

        if (!token) {
            return NextResponse.json({ error: "Token is required" }, { status: 400 });
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        }).select("_id");

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { message: "Token is valid", valid: true },
            { status: 200 }
        );
    } catch (error) {
        console.error("Verify token API error:", error);
        return NextResponse.json(
            { error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
};
