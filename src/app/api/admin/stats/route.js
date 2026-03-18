<<<<<<< HEAD
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Total Revenue & Total Orders
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $count: {} }
                }
            }
        ]);

        // 2. Total Users (excluding admins optionally, but usually all users)
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // 3. Total Products
        const totalProducts = await Product.countDocuments({});

        // 4. Recent Orders (Last 5)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();

        // 5. Monthly Revenue (Optional - for chart)
        // Calculating strict "Change" requires comparing with previous month, 
        // which adds complexity. For now, we'll return the base stats.

        const stats = {
            totalRevenue: orderStats[0]?.totalRevenue || 0,
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalUsers,
            totalProducts,
            // Mocking trend data for now until we have enough historical data
            revenueChange: 12.5,
            ordersChange: 8.3,
            recentOrders
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Admin Stats API Error:', error);
        return NextResponse.json(
            { message: 'Error fetching stats', error: error.message },
            { status: 500 }
        );
    }
}
=======
import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { auth } from '@/auth';

export async function GET(req) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        await dbConnect();

        // 1. Total Revenue & Total Orders
        const orderStats = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$totalPrice" },
                    totalOrders: { $count: {} }
                }
            }
        ]);

        // 2. Total Users (excluding admins optionally, but usually all users)
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // 3. Total Products
        const totalProducts = await Product.countDocuments({});

        // 4. Recent Orders (Last 5)
        const recentOrders = await Order.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email')
            .lean();

        // 5. Monthly Revenue (Optional - for chart)
        // Calculating strict "Change" requires comparing with previous month, 
        // which adds complexity. For now, we'll return the base stats.

        const stats = {
            totalRevenue: orderStats[0]?.totalRevenue || 0,
            totalOrders: orderStats[0]?.totalOrders || 0,
            totalUsers,
            totalProducts,
            // Mocking trend data for now until we have enough historical data
            revenueChange: 12.5,
            ordersChange: 8.3,
            recentOrders
        };

        return NextResponse.json(stats);
    } catch (error) {
        console.error('Admin Stats API Error:', error);
        return NextResponse.json(
            { message: 'Error fetching stats', error: error.message },
            { status: 500 }
        );
    }
}
>>>>>>> 01ca697 (files added with fixed bugs)
