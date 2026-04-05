import Order from '@/models/Order';
import Product from '@/models/Product';

async function decrementStockWithRollback(orderItems) {
  const decrementedItems = [];

  try {
    for (const item of orderItems) {
      const result = await Product.updateOne(
        { _id: item.product, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } }
      );

      if (result.modifiedCount !== 1) {
        throw new Error(`Insufficient stock for ${item.name}.`);
      }

      decrementedItems.push({ product: item.product, quantity: item.quantity });
    }
  } catch (error) {
    await Promise.all(
      decrementedItems.map((item) =>
        Product.updateOne({ _id: item.product }, { $inc: { stock: item.quantity } })
      )
    );
    throw error;
  }
}

export async function markOrderPaidByGateway({
  orderId,
  gatewayOrderId,
  gatewayPaymentId,
  gatewaySignature,
  gatewayStatus,
  gatewayPayload,
}) {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found.');
  }

  if (order.isPaid) {
    return { order, alreadyPaid: true };
  }

  await decrementStockWithRollback(order.orderItems || []);

  order.isPaid = true;
  order.paidAt = new Date();
  order.paymentStatus = gatewayStatus || 'captured';
  order.paymentGateway = 'razorpay';
  if (gatewayOrderId) order.paymentGatewayOrderId = gatewayOrderId;
  if (gatewayPaymentId) order.paymentGatewayPaymentId = gatewayPaymentId;
  if (gatewaySignature) order.paymentGatewaySignature = gatewaySignature;

  order.paymentResult = {
    id: gatewayPaymentId || order.paymentResult?.id,
    status: gatewayStatus || 'captured',
    update_time: new Date().toISOString(),
    email_address: order.shippingAddress?.email || order.user?.email || '',
    raw: gatewayPayload || undefined,
  };

  const saved = await order.save();
  return { order: saved, alreadyPaid: false };
}
