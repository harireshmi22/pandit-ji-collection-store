# Pandit Ji Collection Store

Pandit Ji Collection Store is a full-stack ecommerce project built with Next.js App Router, MongoDB, and NextAuth.
It includes a storefront, admin area, user accounts, cart, wishlist, order flow, and Razorpay integration.

## Current Project Highlights

- Next.js 16 + React 19 application using App Router
- User and admin authentication with NextAuth credentials flow
- Product catalog with search, filters, sort, and pagination
- Admin dashboard for product, order, analytics, and user management
- Cart persistence with Redis or in-memory fallback
- Wishlist persistence:
  - Guest users: local storage
  - Logged-in users: MongoDB-backed wishlist via API
  - Guest wishlist auto-syncs to account on login
- Order creation APIs with stock updates
- Razorpay order creation, verification, and webhook support
- Cloudinary-based image storage

## Tech Stack

- Frontend: Next.js, React, Tailwind CSS, Framer Motion, Lucide
- Backend: Next.js Route Handlers, Mongoose, NextAuth
- Data: MongoDB, optional Redis/Upstash
- Payments: Razorpay
- Email: Resend
- Tooling: ESLint, Docker

## Repository Structure

```text
src/
  app/
    admin/                Admin routes and dashboard pages
    api/                  Route handlers (auth, products, orders, cart, wishlist, payments)
    shop/                 Storefront listing and product details
    wishlist/             Wishlist page
    cart/ checkout/       Cart and checkout pages
  context/                Cart, wishlist, auth/session context providers
  lib/                    DB, redis, payment, env, utils
  models/                 Mongoose models
  scripts/                Project scripts
scripts/
  seed-database.js        Product seeding script
```

## Prerequisites

- Node.js 20.9.0 or later
- MongoDB (local or Atlas)
- Redis (optional, app falls back to in-memory cache)

## Setup

1. Clone and install dependencies.

```bash
git clone https://github.com/harireshmi22/pandit-ji-collection-store.git
cd pandit-ji-collection-store
npm install
```

1. Create .env.local in the project root.

```env
# Required
MONGODB_URI=mongodb://127.0.0.1:27017/panditji
NEXTAUTH_SECRET=replace-with-strong-secret
NEXTAUTH_URL=http://localhost:3000

# Optional: Redis / Upstash
REDIS_URL=redis://127.0.0.1:6379
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Optional: Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Optional: Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_CURRENCY=INR

# Optional: Email
RESEND_API_KEY=
```

1. Run development server.

```bash
npm run dev
```

1. Open the app.

- Storefront: <http://localhost:3000>
- Admin login: <http://localhost:3000/admin/login>

## NPM Scripts

- npm run dev: start local dev server
- npm run build: production build
- npm run start: run built app
- npm run lint: lint project
- npm run lint:fix: auto-fix lint issues
- npm run seed:products: seed 20 products (replace)
- npm run seed:products:append: seed 20 products (append)
- npm run db:indexes: create MongoDB indexes
- npm run setup:perf: setup performance helpers
- npm run test:redis: test redis connectivity
- npm run docker:build: build Docker image
- npm run docker:run: run Docker image

## Key API Routes

- Products
  - GET /api/products
  - POST /api/products
  - GET /api/products/:id
  - PUT /api/products/:id
  - DELETE /api/products/:id

- Cart
  - GET /api/cart
  - POST /api/cart

- Wishlist
  - GET /api/wishlist
  - POST /api/wishlist
  - DELETE /api/wishlist

- Orders
  - GET /api/orders
  - POST /api/orders
  - GET /api/orders/:id

- Payments
  - POST /api/payments/razorpay/create-order
  - POST /api/payments/razorpay/verify
  - POST /api/payments/razorpay/webhook

## Documentation Map

- Product seeding: PRODUCT_SEEDING_GUIDE.md
- Razorpay integration: RAZORPAY_PRODUCTION_INTEGRATION.md
- Search performance notes: SEARCH_PERFORMANCE_SUGGESTION_PATTERN.md
- Improvement plan: IMPROVEMENT_PLAN.md
- Change and engineering approach: CODE_IMPROVEMENT_PLAYBOOK.md

## Development Notes

- The repository may contain active in-progress local edits in some files.
- Keep commits scoped by concern (feature, fix, docs) for easier rollback and review.
- For data persistence features, always verify:
  - guest behavior
  - logged-in behavior
  - API persistence
  - UI loading and empty states

## License

No license file is currently included in this repository.
