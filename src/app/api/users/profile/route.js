import { auth } from "@/auth";
import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email: session.user.email }).select("-password");

        if (!user) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                firstName: user.name.split(' ')[0] || '',
                lastName: user.name.split(' ').slice(1).join(' ') || '',
                email: user.email,
                phone: user.phone || '',
                address: user.address || '',
                city: user.city || '',
                state: user.state || '',
                zipcode: user.zipcode || '',
            }
        });

    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json(
            { success: false, message: "Server error" },
            { status: 500 }
        );
    }
}

export async function PUT(req) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { success: false, message: "Not authenticated" },
                { status: 401 }
            );
        }

        await dbConnect();

        const data = await req.json();
        const { firstName, lastName, phone, address, city, state, zipcode } = data;

        // Construct full name from first and last name
        const name = `${firstName || ''} ${lastName || ''}`.trim();

        const updatedUser = await User.findOneAndUpdate(
            { email: session.user.email },
            {
                name,
                phone,
                address,
                city,
                state,
                zipcode
            },
            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                firstName: updatedUser.name.split(' ')[0] || '',
                lastName: updatedUser.name.split(' ').slice(1).join(' ') || '',
                email: updatedUser.email,
                phone: updatedUser.phone || '',
                address: updatedUser.address || '',
                city: updatedUser.city || '',
                state: updatedUser.state || '',
                zipcode: updatedUser.zipcode || '',
            }
        });

    } catch (error) {
        console.error("Profile PUT error:", error);
        return NextResponse.json(
            { success: false, message: "Server error: " + error.message },
            { status: 500 }
        );
    }
}
