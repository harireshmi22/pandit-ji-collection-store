import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { getRazorpayClient, verifyCheckoutSignature } from '@/lib/razorpay';
import { markOrderPaidByGateway } from '@/lib/payment-order';

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Not authorized' }, { status: 401 });
    }

    const body = await req.json();
    const { internalOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!internalOrderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ message: 'Missing Razorpay verification payload.' }, { status: 400 });
    }

    const isValidSignature = verifyCheckoutSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValidSignature) {
      return NextResponse.json({ message: 'Invalid payment signature.' }, { status: 400 });
    }

    await dbConnect();

    const order = await Order.findOne({ _id: internalOrderId, user: session.user.id });
    if (!order) {
      return NextResponse.json({ message: 'Order not found.' }, { status: 404 });
    }

    if (order.paymentGatewayOrderId !== razorpay_order_id) {
      return NextResponse.json({ message: 'Order mismatch detected.' }, { status: 400 });
    }

    const razorpay = getRazorpayClient();
    const payment = await razorpay.payments.fetch(razorpay_payment_id);

    if (!payment || payment.order_id !== razorpay_order_id) {
      return NextResponse.json({ message: 'Payment verification failed with Razorpay.' }, { status: 400 });
    }

    const expectedAmount = Math.round(Number(order.totalPrice) * 100);
    if (payment.amount !== expectedAmount) {
      return NextResponse.json({ message: 'Payment amount mismatch.' }, { status: 400 });
    }

    if (payment.status === 'authorized') {
      order.paymentStatus = 'authorized';
      order.paymentResult = {
        id: payment.id,
        status: payment.status,
        update_time: new Date().toISOString(),
        email_address: order.shippingAddress?.email || '',
        raw: payment,
      };
      await order.save();

      return NextResponse.json({
        success: true,
        internalOrderId: order._id,
        pendingCapture: true,
      });
    }

    if (payment.status !== 'captured') {
      return NextResponse.json({ message: `Payment not successful. Current status: ${payment.status}` }, { status: 400 });
    }

    const result = await markOrderPaidByGateway({
      orderId: order._id,
      gatewayOrderId: razorpay_order_id,
      gatewayPaymentId: razorpay_payment_id,
      gatewaySignature: razorpay_signature,
      gatewayStatus: payment.status,
      gatewayPayload: payment,
    });

    return NextResponse.json({
      success: true,
      internalOrderId: result.order._id,
      alreadyPaid: result.alreadyPaid,
    });
  } catch (error) {
    console.error('Razorpay verify error:', error);
    return NextResponse.json(
      { message: 'Payment verification failed.', error: error.message },
      { status: 500 }
    );
  }
}
