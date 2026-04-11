import { dbConnect } from "@/lib/dbConnect";
import User from "@/models/User";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

function getSpentRangeStart(spentRange) {
    const now = new Date();

    if (spentRange === '30d') {
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    if (spentRange === '90d') {
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    }

    return null;
}



// Get all users from the database 
export async function GET(request) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const spentRange = searchParams.get('spentRange') || 'all';
        const rangeStartDate = getSpentRangeStart(spentRange);

        const users = await User.find().select('-password').sort({ createdAt: -1 }).lean();

        // Aggregate order data to get order counts and spending stats per user
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: '$user',
                    orders: { $sum: 1 },
                    paidOrders: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$isPaid', true] },
                                        { $ne: ['$status', 'Cancelled'] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    totalSpent: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $eq: ['$isPaid', true] },
                                        { $ne: ['$status', 'Cancelled'] },
                                        ...(rangeStartDate ? [{ $gte: ['$createdAt', rangeStartDate] }] : [])
                                    ]
                                },
                                '$totalPrice',
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        const statsMap = new Map(
            orderStats.map((item) => [item._id?.toString(), {
                orders: item.orders,
                paidOrders: item.paidOrders,
                totalSpent: item.totalSpent
            }])
        );

        const usersWithStats = users.map((user) => {
            const stats = statsMap.get(user._id.toString());
            return {
                ...user,
                orders: stats?.orders || 0,
                paidOrders: stats?.paidOrders || 0,
                totalSpent: stats?.totalSpent || 0
            };
        });

        if (!users) {
            return NextResponse.json(
                { success: false, message: 'Users   not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                data: usersWithStats,
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
}