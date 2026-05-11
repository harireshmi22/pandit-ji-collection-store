import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { auth } from '@/auth';

// GET a single order by ID
export async function GET(req, { params }) {
    try {
        const session = await auth();
        console.log('DEBUG: API Orders GET session:', session?.user?.id || 'No Session');

        if (!session || !session.user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const { id } = await params;
        console.log('DEBUG: Fetching order ID:', id);

        // Validate ObjectId before querying
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return NextResponse.json({ message: 'Invalid order ID' }, { status: 400 });
        }

        await dbConnect();

        const order = await Order.findById(id).populate('user', 'name email').lean();

        if (!order) {
            console.log('DEBUG: Order not found in DB for ID:', id);
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Enrich order items with current product images
        const productIds = (order.orderItems || [])
            .map(item => item.product)
            .filter(pid => mongoose.Types.ObjectId.isValid(pid));

        if (productIds.length > 0) {
            const products = await Product.find(
                { _id: { $in: productIds } },
                { _id: 1, image: 1, images: 1 }
            ).lean();

            const productMap = {};
            for (const p of products) {
                const img = (Array.isArray(p.images) && p.images.length > 0)
                    ? p.images[0]
                    : p.image || null;
                productMap[p._id ? String(p._id) : 'unknown'] = img;
            }

            for (const item of (order.orderItems || [])) {
                const pid = item.product ? String(item.product) : null;
                if (pid && productMap[pid]) {
                    item.image = productMap[pid];
                }
            }
        }

        console.log('DEBUG: Order found:', {
            orderId: order._id ? String(order._id) : 'unknown',
            orderUserId: order.user?._id ? String(order.user._id) : (order.user ? String(order.user) : 'unknown'),
            sessionUserId: session.user.id
        });

        // Check if user is authorized to view this order
        const orderUserId = order.user?._id ? String(order.user._id) : (order.user ? String(order.user) : '');
        if (session.user.role !== 'admin' && orderUserId !== session.user.id) {
            console.log('DEBUG: Unauthorized view attempt', { orderUserId, sessionUserId: session.user.id });
            return NextResponse.json({ message: 'Not authorized to view this order' }, { status: 403 });
        }

        return NextResponse.json(order);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { message: 'Error fetching order', error: error.message },
            { status: 500 }
        );
    }
}

// PATCH update order status (Admin) or Payment (User/System)
export async function PATCH(req, { params }) {
    try {
        const session = await auth();
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        const { status, isPaid, isDelivered, trackingNumber, paymentResult } = body;

        await dbConnect();

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ message: 'Order not found' }, { status: 404 });
        }

        // Admin-only updates
        if (status || isDelivered || trackingNumber) {
            if (session.user.role !== 'admin') {
                return NextResponse.json({ message: 'Admin access required' }, { status: 403 });
            }

            if (status) {
                order.status = status;
                if (status === 'Delivered') {
                    order.isDelivered = true;
                    order.deliveredAt = order.deliveredAt || Date.now();
                }
            }
            if (trackingNumber) order.trackingNumber = trackingNumber;

            if (isDelivered !== undefined) {
                order.isDelivered = isDelivered;
                order.deliveredAt = isDelivered ? Date.now() : undefined;
                if (isDelivered && order.status !== 'Delivered') {
                    order.status = 'Delivered';
                }
            }

            const deliveredNow = order.status === 'Delivered' || order.isDelivered;
            const isCashOnDelivery = order.paymentMethod === 'Cash on Delivery';

            // COD payment is collected at delivery time.
            if (deliveredNow && isCashOnDelivery && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = order.paidAt || Date.now();
                if (order.paymentStatus === 'pending') {
                    order.paymentStatus = 'captured';
                }
            }
        }

        // Payment update (can be called by user system after successful payment)
        if (isPaid !== undefined || paymentResult) {
            // Authorization for payment update: either admin or the order owner
            if (session.user.role !== 'admin' && String(order.user || '') !== session.user.id) {
                return NextResponse.json({ message: 'Not authorized' }, { status: 403 });
            }

            if (isPaid !== undefined) {
                order.isPaid = isPaid;
                order.paidAt = isPaid ? Date.now() : undefined;
            }
            if (paymentResult) order.paymentResult = paymentResult;
        }

        const updatedOrder = await order.save();
        return NextResponse.json(updatedOrder);
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { message: 'Error updating order', error: error.message },
            { status: 500 }
        );
    }
}
