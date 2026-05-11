import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';
import { getRazorpayClient, getRazorpayPublicConfig, toPaise } from '@/lib/razorpay';

function normalizeShippingAddress(shippingAddress = {}) {
  return {
    fullName: shippingAddress.fullName || '',
    email: shippingAddress.email || '',
    address: shippingAddress.address || '',
    city: shippingAddress.city || '',
    postalCode: shippingAddress.postalCode || '',
    country: shippingAddress.country || '',
    phone: shippingAddress.phone || '',
  };
}

function validateShippingAddress(shippingAddress) {
  const requiredFields = ['fullName', 'email', 'address', 'city', 'postalCode', 'country'];
  for (const field of requiredFields) {
    if (!shippingAddress[field] || String(shippingAddress[field]).trim() === '') {
      return `Missing shipping field: ${field}`;
    }
  }
  return null;
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const body = await req.json();
    const orderItems = Array.isArray(body.orderItems) ? body.orderItems : [];
    const shippingAddress = normalizeShippingAddress(body.shippingAddress);

    if (orderItems.length === 0) {
      return NextResponse.json({ message: 'No order items provided.' }, { status: 400 });
    }

    const shippingError = validateShippingAddress(shippingAddress);
    if (shippingError) {
      return NextResponse.json({ message: shippingError }, { status: 400 });
    }

    const invalidProduct = orderItems.find((item) => !mongoose.Types.ObjectId.isValid(item.product));
    if (invalidProduct) {
      return NextResponse.json({ message: 'One or more products are invalid.' }, { status: 400 });
    }

    await dbConnect();

    const productIds = [...new Set(orderItems.map((item) => item.product.toString()))];
    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
    const productMap = new Map(dbProducts.map((p) => [p._id.toString(), p]));

    const normalizedOrderItems = [];

    for (const item of orderItems) {
      const dbProduct = productMap.get(item.product.toString());
      if (!dbProduct) {
        return NextResponse.json({ message: `Product not found: ${item.product}` }, { status: 404 });
      }

      const quantity = Number(item.quantity || 0);
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json({ message: `Invalid quantity for ${dbProduct.name}` }, { status: 400 });
      }

      if (dbProduct.stock < quantity) {
        return NextResponse.json({ message: `${dbProduct.name} is out of stock.` }, { status: 400 });
      }

      normalizedOrderItems.push({
        product: dbProduct._id,
        name: dbProduct.name,
        quantity,
        price: Number(dbProduct.price),
        image: (Array.isArray(dbProduct.images) && dbProduct.images[0]) || dbProduct.image || '/images/placeholder-product.svg',
        size: item.size || item.selectedSize || 'M',
      });
    }

    const itemsPrice = normalizedOrderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shippingPrice = itemsPrice >= 100 ? 0 : 10;
    const taxPrice = Number((itemsPrice * 0.1).toFixed(2));
    const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

    const { keyId, currency } = getRazorpayPublicConfig();
    const razorpay = getRazorpayClient();

    const razorpayOrder = await razorpay.orders.create({
      amount: toPaise(totalPrice),
      currency,
      receipt: `order_${Date.now()}`,
      notes: {
        userId: session.user.id,
      },
    });

    // Convert UUID to MongoDB ObjectId for Google OAuth users
    let mongoUserId;
    if (mongoose.Types.ObjectId.isValid(session.user.id)) {
      mongoUserId = session.user.id;
    } else {
      const dbUser = await User.findOne({
        $or: [
          { email: session.user.email },
          { googleId: session.user.id },
          { authId: session.user.id },
        ],
      });
      if (!dbUser) {
        return NextResponse.json({ message: 'User not found in database' }, { status: 404 });
      }
      mongoUserId = dbUser._id;
    }

    const internalOrder = await Order.create({
      user: mongoUserId,
      orderItems: normalizedOrderItems,
      shippingAddress,
      paymentMethod: 'Razorpay',
      paymentGateway: 'razorpay',
      paymentStatus: 'created',
      paymentGatewayOrderId: razorpayOrder.id,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      status: 'Pending',
      isPaid: false,
    });

    return NextResponse.json({
      key: keyId,
      currency,
      amount: razorpayOrder.amount,
      razorpayOrderId: razorpayOrder.id,
      internalOrderId: internalOrder._id,
      prefill: {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        contact: shippingAddress.phone,
      },
    });
  } catch (error) {
    console.error('Razorpay create-order error:', error);
    return NextResponse.json(
      { message: 'Failed to create Razorpay order.', error: error.message },
      { status: 500 }
    );
  }
}
