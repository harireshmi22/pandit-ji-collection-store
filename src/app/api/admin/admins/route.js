import { dbConnect } from '@/lib/dbConnect'
import User from '@/models/User'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function POST(req) {
    try {
        // Verify the requester is an admin
        const session = await auth()
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { message: "Admin access required" },
                { status: 403 }
            )
        }

        const { name, email, password } = await req.json()

        if (!name || !email || !password) {
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

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { message: "Please provide a valid email address" },
                { status: 400 }
            )
        }

        await dbConnect()

        // Check if user already exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 400 }
            )
        }

        // Create admin user
        const admin = await User.create({
            name,
            email,
            password, // Hashing happens in User model pre-save hook
            role: 'admin',
            phone: '+91 00000 00000',
            address: 'Admin Office',
            city: 'Mumbai',
            state: 'Maharashtra',
            zipcode: '400001'
        })

        return NextResponse.json(
            {
                success: true,
                message: "Admin created successfully",
                admin: {
                    id: admin._id,
                    name: admin.name,
                    email: admin.email,
                    role: admin.role,
                    createdAt: admin.createdAt
                }
            },
            { status: 201 }
        )

    } catch (error) {
        console.error("Admin creation error:", error)
        return NextResponse.json(
            { message: "Server error during admin creation", error: error.message },
            { status: 500 }
        )
    }
}

export async function GET(req) {
    try {
        // Verify the requester is an admin
        const session = await auth()
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json(
                { message: "Admin access required" },
                { status: 403 }
            )
        }

        await dbConnect()

        // Get all admin users
        const admins = await User.find({ role: 'admin' })
            .select('name email role createdAt')
            .sort({ createdAt: -1 })

        return NextResponse.json({
            success: true,
            admins
        })

    } catch (error) {
        console.error("Get admins error:", error)
        return NextResponse.json(
            { message: "Server error while fetching admins", error: error.message },
            { status: 500 }
        )
    }
}
