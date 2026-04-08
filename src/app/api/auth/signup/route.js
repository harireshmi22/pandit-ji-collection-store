import { dbConnect } from '@/lib/dbConnect'
import User from '@/models/User'
import { NextResponse } from 'next/server'

export async function POST(req) {
    try {
        const { name, email, password, role = 'user' } = await req.json()

        const normalizedName = name?.toString().trim()
        const normalizedEmail = email?.toString().trim().toLowerCase()

        if (!normalizedName || !normalizedEmail || !password) {
            return NextResponse.json(
                { message: "Please provide all required fields" },
                { status: 400 }
            )
        }

        // Validate password length
        if (password.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters long" },
                { status: 400 }
            )
        }

        // Try to connect to MongoDB
        try {
            await dbConnect()

            const userExists = await User.findOne({ email: normalizedEmail })

            if (userExists) {
                return NextResponse.json(
                    { message: "User already exists" },
                    { status: 400 }
                )
            }

            const user = await User.create({
                name: normalizedName,
                email: normalizedEmail,
                password, // Hashing happens in User model pre-save hook
                role // Allow role to be set (for admin creation)
            })

            return NextResponse.json(
                {
                    success: true,
                    message: "User registered successfully",
                    user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                },
                { status: 201 }
            )
        } catch (dbError) {
            // MongoDB not available
            console.log('MongoDB not available for signup:', dbError.message)

            return NextResponse.json(
                {
                    message: "Database connection unavailable. Please install MongoDB or use MongoDB Atlas to enable user registration.",
                    error: "MONGODB_UNAVAILABLE",
                    suggestion: "The application is running in demo mode. To enable full functionality, please set up MongoDB."
                },
                { status: 503 }
            )
        }

    } catch (error) {
        console.error("Signup error:", error)
        return NextResponse.json(
            { message: "Server error during registration", error: error.message },
            { status: 500 }
        )
    }
}
