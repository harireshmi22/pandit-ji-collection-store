<<<<<<< HEAD
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";



// Get all users from the database 
export async function GET() {
    try {
        await dbConnect();

        const users = await User.find().select('-password').sort({ createdAt: -1 });

        if (!users) {
            return NextResponse.json(
                { success: false, message: 'Users   not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: users,
                message: 'Users fetched successfully',
            },
            { status: 200 }
        )
    }
    catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error: ' + error.message },
            { status: 500 }
        );
    }
=======
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";



// Get all users from the database 
export async function GET() {
    try {
        await dbConnect();

        const users = await User.find().select('-password').sort({ createdAt: -1 });

        if (!users) {
            return NextResponse.json(
                { success: false, message: 'Users   not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: users,
                message: 'Users fetched successfully',
            },
            { status: 200 }
        )
    }
    catch (error) {
        console.error('GET /api/users error:', error);
        return NextResponse.json(
            { success: false, message: 'Server error: ' + error.message },
            { status: 500 }
        );
    }
>>>>>>> 01ca697 (files added with fixed bugs)
}