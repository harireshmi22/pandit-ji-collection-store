# Razorpay Integration Guide (Basic to Advanced + Security)

This guide is tailored for the current project architecture (Next.js App Router + NextAuth + MongoDB + Mongoose).

## 1) What is Implemented

The following is already integrated in code:

- Razorpay SDK dependency installed in package dependencies.
- Secure server-side Razorpay helper utilities.
- Payment order creation API: validates products and prices from DB before creating gateway order.
- Payment verification API: verifies checkout signature and Razorpay payment details server-side.
- Webhook API: verifies webhook signature and updates payment states.
- Order schema updated with payment gateway fields for traceability.
- Checkout page switched from mock card fields to Razorpay checkout popup flow.

## 2) New/Updated Files

### New Files

- `src/lib/razorpay.js`
- `src/lib/payment-order.js`
- `src/app/api/payments/razorpay/create-order/route.js`
- `src/app/api/payments/razorpay/verify/route.js`
- `src/app/api/payments/razorpay/webhook/route.js`

### Updated Files

- `src/app/checkout/page.jsx`
- `src/models/Order.js`
- `src/context/CartContext.jsx`
- `src/lib/env.js`

## 3) Environment Variables

Add these to `.env.local` for local development:

```env
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxx
RAZORPAY_CURRENCY=INR
```

For production, set the same variables in your deployment platform secrets.

## 4) Basic Integration Flow (Now)

### Checkout Flow

1. User fills shipping details on checkout page.
2. Frontend calls `POST /api/payments/razorpay/create-order` with cart item IDs, quantities, and shipping address.
3. Backend re-fetches products from DB and computes total itself.
4. Backend creates Razorpay order and an internal pending order.
5. Frontend opens Razorpay checkout using returned `key` and `razorpayOrderId`.
6. On payment success, frontend calls `POST /api/payments/razorpay/verify`.
7. Backend verifies:
   - Signature validity
   - Razorpay payment details
   - Amount consistency
8. Backend marks order paid and decrements stock safely.
9. Frontend redirects user to order detail page.

## 5) Advanced Hardening (Recommended Next)

## A) Captured-Only Fulfillment (Implemented)

Current verify flow marks an order paid only when Razorpay returns `captured`.

Behavior:

- If payment is `authorized`, order is updated as `paymentStatus: authorized` and waits for capture.
- If payment is `captured`, order is marked paid and stock is decremented.
- Webhook `payment.captured` remains a reliable reconciliation path.

## B) Add Idempotency for Create-Order

To prevent duplicate pending orders due to retries/network issues:

- Generate `checkoutAttemptId` in frontend.
- Send it to `create-order` API.
- Store and unique-index it on `Order`.
- Return existing order if same attempt reappears.

## C) Replay Protection Window for Webhooks

Keep a table/collection of processed webhook event IDs.

- If event already processed, return 200 quickly.
- If new, process and persist event ID atomically.

## D) Strict Rate Limiting

Apply rate limit on:

- `create-order`
- `verify`
- `webhook`

Use your existing rate limit utility (`src/lib/rateLimit.js`) keyed by user ID/IP.

## E) Database Transaction for Stock and Order State

For very high concurrency:

- Use MongoDB transactions with session.
- Update order payment status + stock within one transaction.

## 6) Security Checklist

- Never trust amount from frontend. Always recalculate from DB.
- Never mark paid only from frontend callback. Always verify server-side.
- Verify Razorpay checkout signature (`order_id|payment_id`).
- Verify webhook signature using `RAZORPAY_WEBHOOK_SECRET`.
- Keep `RAZORPAY_KEY_SECRET` and webhook secret server-only.
- Use HTTPS only in production.
- Do not log full secrets or card/payment sensitive data.
- Restrict CORS/origin if exposing APIs cross-origin.
- Monitor repeated failures and suspicious payment attempts.

## 7) Production Webhook Setup

In Razorpay dashboard:

1. Create webhook URL:
   - `https://your-domain.com/api/payments/razorpay/webhook`
2. Configure secret exactly as `RAZORPAY_WEBHOOK_SECRET`.
3. Enable at least these events:
   - `payment.captured`
   - `payment.failed`
4. Test webhook delivery and verify signature checks.

## 8) Testing Plan

### Local Development

- Use Razorpay test keys.
- Run checkout from logged-in user.
- Verify order transitions from pending to paid.
- Verify stock decrements exactly once.

### Negative Tests

- Tamper amount from browser request -> should fail.
- Tamper signature -> should fail.
- Re-submit same verify payload -> should stay idempotent.
- Trigger webhook with wrong signature -> should fail 401.

### Production Validation

- Test successful payment, failed payment, and dismissed checkout.
- Confirm webhook updates arrive and no duplicate stock decrement.
- Confirm order page shows Paid state.

## 9) Common Operational Notes

- If checkout opens but verify fails, payment may still be captured later; webhook should reconcile.
- If stock update fails after payment, alert operations and trigger compensation workflow.
- Keep logs around order IDs, razorpay order IDs, and payment IDs for support.

## 10) Optional Enhancements

- Save Razorpay customer ID for returning users.
- Add refunds API integration for admin panel.
- Add payment reconciliation cron for missed webhooks.
- Add queue-based order confirmation emails after payment captured.

---

If you want, next step can be:

1. Captured-only settlement mode
2. Idempotency key support
3. Payment retry UI + status polling
4. Admin refund + reconciliation module
