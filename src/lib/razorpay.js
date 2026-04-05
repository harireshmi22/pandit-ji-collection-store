import crypto from 'crypto';
import Razorpay from 'razorpay';

let razorpayClient = null;

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }

  if (!razorpayClient) {
    razorpayClient = new Razorpay({ key_id: keyId, key_secret: keySecret });
  }

  return razorpayClient;
}

export function getRazorpayPublicConfig() {
  if (!process.env.RAZORPAY_KEY_ID) {
    throw new Error('RAZORPAY_KEY_ID is missing.');
  }

  return {
    keyId: process.env.RAZORPAY_KEY_ID,
    currency: process.env.RAZORPAY_CURRENCY || 'INR',
  };
}

export function toPaise(amount) {
  const parsedAmount = Number(amount || 0);
  if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
    throw new Error('Invalid amount.');
  }
  return Math.round(parsedAmount * 100);
}

export function verifyCheckoutSignature({ orderId, paymentId, signature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    throw new Error('RAZORPAY_KEY_SECRET is missing.');
  }

  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');

  return expected === signature;
}

export function verifyWebhookSignature({ rawBody, signature }) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is missing.');
  }

  const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
  return expected === signature;
}
