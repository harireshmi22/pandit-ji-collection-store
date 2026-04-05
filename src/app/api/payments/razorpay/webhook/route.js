import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/dbConnect';
import Order from '@/models/Order';
import { verifyWebhookSignature } from '@/lib/razorpay';
import { markOrderPaidByGateway } from '@/lib/payment-order';

export async function POST(req) {
  try {
    const signature = req.headers.get('x-razorpay-signature');
    if (!signature) {
      return NextResponse.json({ message: 'Missing signature header.' }, { status: 400 });
    }

    const rawBody = await req.text();
    const isValid = verifyWebhookSignature({ rawBody, signature });

    if (!isValid) {
      return NextResponse.json({ message: 'Invalid webhook signature.' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event?.event;

    await dbConnect();

    if (eventName === 'payment.captured') {
      const payment = event?.payload?.payment?.entity;
      const gatewayOrderId = payment?.order_id;
      const gatewayPaymentId = payment?.id;

      if (gatewayOrderId && gatewayPaymentId) {
        const order = await Order.findOne({ paymentGatewayOrderId: gatewayOrderId });

        if (order) {
          await markOrderPaidByGateway({
            orderId: order._id,
            gatewayOrderId,
            gatewayPaymentId,
            gatewayStatus: payment.status || 'captured',
            gatewayPayload: event,
          });
        }
      }
    }

    if (eventName === 'payment.failed') {
      const payment = event?.payload?.payment?.entity;
      const gatewayOrderId = payment?.order_id;

      if (gatewayOrderId) {
        await Order.findOneAndUpdate(
          { paymentGatewayOrderId: gatewayOrderId },
          {
            $set: {
              paymentStatus: 'failed',
              paymentResult: {
                id: payment?.id || '',
                status: payment?.status || 'failed',
                update_time: new Date().toISOString(),
                raw: event,
              },
            },
          }
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    return NextResponse.json(
      { message: 'Webhook processing failed.', error: error.message },
      { status: 500 }
    );
  }
}
