import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.Mixed, // Accepts ObjectId or String for mock data
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  size: {
    type: String,
    default: 'M'
  }
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['PayPal', 'Credit Card', 'Cash on Delivery', 'UPI', 'Razorpay'],
      default: 'Cash on Delivery'
    },
    paymentGateway: {
      type: String,
      enum: ['razorpay'],
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'created', 'authorized', 'captured', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentGatewayOrderId: {
      type: String,
      index: true,
      sparse: true
    },
    paymentGatewayPaymentId: {
      type: String,
      sparse: true
    },
    paymentGatewaySignature: {
      type: String,
      select: false
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
      raw: mongoose.Schema.Types.Mixed
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: 0
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false
    },
    paidAt: {
      type: Date
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false
    },
    deliveredAt: {
      type: Date
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    trackingNumber: {
      type: String
    },
    notes: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// Add indexes for better query performance
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentGatewayOrderId: 1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema);

