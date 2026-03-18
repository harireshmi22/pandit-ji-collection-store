import { dbConnect } from "@/lib/dbConnect"
import { NextResponse } from "next/server"
import User from "@/models/User"
import crypto from "crypto"
import { sendResetPasswordEmail } from "@/lib/resend-email"

export const POST = async (req) => {
    try {
        await dbConnect();

        // Extract email from request body
        const { email } = await req.json();

        // Validate email
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // Proper email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // if email is valid, check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "No account found with this email address" }, { status: 404 });
        }

        // Generate reset token 
        const resetToken = crypto.randomBytes(32).toString("hex");
        // hash the reset token for security 
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = Date.now() + 3600000; // 1 hour

        await user.save();

        // Send password reset email
        try {
            // sendResetPasswordEmail is a function that sends an email using the Resend service. 
            // It takes the user's email and the reset token as parameters.
            await sendResetPasswordEmail(email, resetToken);
            console.log("Password reset email sent to:", email);
        } catch (emailError) {
            console.error("Failed to send email:", emailError);
            const emailMessage = emailError?.message || "Unknown email error";

            // If it's a configuration error, we should let the user know
            if (emailMessage.includes('Missing API key') ||
                emailMessage.includes('RESEND_API_KEY')) {
                // For development, show the configuration issue
                if (process.env.NODE_ENV === 'development') {
                    return NextResponse.json({
                        error: "Email service not configured. Please set RESEND_API_KEY in .env.local"
                    }, { status: 500 });
                }
                // In production, don't expose configuration details
                return NextResponse.json({
                    error: "Email service temporarily unavailable. Please try again later."
                }, { status: 500 });
            }

            if (process.env.NODE_ENV === 'development') {
                return NextResponse.json({
                    error: `Failed to send reset email: ${emailMessage}`
                }, { status: 500 });
            }

            return NextResponse.json({
                error: "Unable to send reset email right now. Please try again later."
            }, { status: 500 });
        }

        return NextResponse.json({ message: "Password reset link sent successfully" }, { status: 200 });
    } catch (error) {
        console.error("Forgot password API error:", error);

        // Handle specific error cases
        if (error.message.includes('Missing API key')) {
            return NextResponse.json({
                error: "Email service not configured. Please contact administrator."
            }, { status: 500 });
        }

        if (error.name === 'ValidationError') {
            return NextResponse.json({
                error: "Validation error: " + error.message
            }, { status: 400 });
        }

        if (error.name === 'MongoError' || error.name === 'MongooseError') {
            return NextResponse.json({
                error: "Database error. Please try again later."
            }, { status: 500 });
        }

        return NextResponse.json({
            error: "Internal server error. Please try again."
        }, { status: 500 });
    }
}

