import crypto from "crypto";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";

export const POST = async (req) => {
    try {
        await dbConnect();

        // Extract token, password and confirm password from the request body
        const { token: rawToken, password, confirmPassword } = await req.json();
        const token = (rawToken || "").trim();

        // Validate required fields 
        if (!token || !password || !confirmPassword) {
            return NextResponse.json(
                { error: "Token, password and confirm password are required" },
                { status: 400 }
            );
        }

        // Validate password length 
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Check if password and confirm password match
        if (password !== confirmPassword) {
            return NextResponse.json(
                { error: "Password and confirm password do not match" },
                { status: 400 }
            );
        }

        // Hash the token to compare with the stored hashed token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");


        // Find the user with the matching reset token and check if it's still valid
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        // If no user is found, the token is invalid or expired
        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired reset token" },
                { status: 400 }
            );
        }

        // Store raw password so the User pre-save hook hashes it once.
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Save the updated user document to the database
        await user.save();

        // Return a success response indicating that the password has been reset
        return NextResponse.json(
            { message: "Password reset successful. You can now log in." },
            { status: 200 }
        );
    } catch (error) {
        console.error("Reset password API error:", error);
        return NextResponse.json(
            { error: "Internal server error. Please try again." },
            { status: 500 }
        );
    }
};
