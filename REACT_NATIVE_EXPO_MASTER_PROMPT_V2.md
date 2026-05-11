# React Native Expo Master Prompt V2

This V2 includes backend-choice variants so you can generate the same app with:

1. Existing Node/Mongo APIs (current project)
2. Firebase-first stack
3. Supabase-first stack

Use the section that matches your target stack.

---

## 0) Universal App Scope (Applies to All Variants)

Build a production-grade React Native ecommerce app (Android + iOS) named Pandit Ji Collection Mobile with:

- User app + Admin app (role-based)
- Smooth modern UI with meaningful animations
- Storefront, cart, wishlist, checkout, orders, profile
- Admin dashboard, products, orders, users, analytics
- Dynamic order status + payment consistency

Core user features:

- Auth: signup/login/forgot/reset
- Product browse/search/filter/sort/pagination
- Product detail with variants and quantity
- Cart + wishlist with persistence/sync
- Checkout with online payment + COD
- Orders list + order detail with animated tracking timeline
- Delivered state shows: Your order is delivered
- Non-delivered state shows: Your order is on the way

Admin features:

- Admin login and role guard
- Manage orders/products/users/admins
- Status updates and analytics
- COD delivered paid auto indication

Design direction:

- Premium, clean, rounded cards, blue-cyan accents
- Skeleton loaders, no spinner-only UX
- Reanimated transitions, list item stagger animations

---

## 1) Prompt Variant A: Existing API Backend (Node/Mongo)

Paste this to AI if you will reuse current APIs.

PROMPT A START

You are a senior React Native + Expo architect. Build a production-ready TypeScript Expo app for Pandit Ji Collection Mobile by integrating existing backend REST APIs.

Tech stack requirements:

- Expo + TypeScript
- React Navigation or Expo Router (single choice)
- TanStack Query
- Zustand
- React Hook Form + Zod
- Reanimated (+ Moti optional)
- Axios API layer with interceptors
- AsyncStorage + SecureStore
- react-native-razorpay

Use existing endpoints:

- /api/auth/signup
- /api/auth/check-user
- /api/auth/forgot-password
- /api/auth/reset-password
- /api/auth/verify-token
- /api/products
- /api/products/:id
- /api/search
- /api/shop
- /api/cart
- /api/wishlist
- /api/orders
- /api/orders/:id
- /api/users/profile
- /api/payments/razorpay/create-order
- /api/payments/razorpay/verify
- /api/admin/stats
- /api/admin/admins

Business rules:

- Status enum: Pending, Processing, Shipped, Delivered, Cancelled
- COD delivered order must behave as paid in UI
- Guest wishlist local + user wishlist server + sync on login
- Cart persistence and debounce sync
- Delivery timeline and polling in order detail
- Admin order table indicator for auto-paid on delivery

Deliverables:

- Complete app code
- API modules
- Role guards
- Loading/empty/error states everywhere
- Readme + env example

Build order:

1) Foundation and navigation
2) Auth/session
3) Storefront flow
4) Cart/wishlist
5) Checkout/payment
6) Orders dynamic pages
7) Admin modules
8) Final animation and QA pass

PROMPT A END

---

## 2) Prompt Variant B: Firebase Auth + Firestore + Cloud Functions

Paste this to AI if you want Firebase as primary backend.

PROMPT B START

You are a senior React Native + Expo architect. Build a production-ready TypeScript Expo ecommerce app for Pandit Ji Collection Mobile using Firebase-first backend.

Use:

- Firebase Auth (email/password)
- Firestore (products, users, carts, wishlists, orders)
- Cloud Functions (admin updates, payment verification hooks, stock updates)
- Cloud Storage (product images)
- FCM for order notifications

Mandatory architecture:

- Expo + TS
- TanStack Query
- Zustand
- React Hook Form + Zod
- Reanimated
- Firebase modular SDK wrappers in src/services/firebase

Data models:

- users/{uid}
- products/{id}
- carts/{uid}
- wishlists/{uid}
- orders/{id}
- adminStats/{doc}

Order/payment rules:

- Support COD + online
- For online payments, keep payment state machine: pending/authorized/captured/failed/refunded
- If COD and order moves to Delivered, auto-mark as paid and set paidAt in Cloud Function transaction

Security rules:

- User can access only own cart/wishlist/orders
- Admin role claim required for admin collections and mutations
- Validate writes using Firestore rules + Cloud Functions

Screens required:

- same universal scope (user + admin)

Deliverables:

- Full app
- Firebase rules
- Cloud Functions templates
- Seed script for products
- Readme with setup and emulators instructions

PROMPT B END

---

## 3) Prompt Variant C: Supabase Auth + Postgres + Edge Functions

Paste this to AI if you want Supabase as primary backend.

PROMPT C START

You are a senior React Native + Expo architect. Build a production-ready TypeScript Expo ecommerce app for Pandit Ji Collection Mobile using Supabase-first backend.

Use:

- Supabase Auth (email/password)
- Postgres tables + RLS
- Supabase Storage for images
- Edge Functions for payment verification and order workflow
- Realtime subscriptions for order status updates

Mandatory architecture:

- Expo + TS
- TanStack Query
- Zustand
- React Hook Form + Zod
- Reanimated
- Supabase client wrappers in src/services/supabase

Required tables:

- profiles
- products
- carts
- cart_items
- wishlists
- wishlist_items
- orders
- order_items
- payments
- admin_audit_logs

Critical SQL constraints/business logic:

- status enum: Pending, Processing, Shipped, Delivered, Cancelled
- payment_status enum: pending, created, authorized, captured, failed, refunded
- Trigger/function: if COD order becomes Delivered then set is_paid=true and paid_at=now() and payment_status='captured'

RLS rules:

- Users only see/update their own profile/cart/wishlist/orders
- Admin role can manage all orders/products/users

Screens required:

- same universal scope (user + admin)

Deliverables:

- Full app
- SQL migration files
- RLS policies
- Edge functions skeleton
- Readme with local dev setup

PROMPT C END

---

## 4) Expo Install Commands (Common)

```bash
npx create-expo-app@latest panditji-mobile -t expo-template-blank-typescript
cd panditji-mobile
npm install @tanstack/react-query zustand axios react-hook-form zod @hookform/resolvers
npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage expo-secure-store
npm install moti
```

Navigation options:

React Navigation:

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
```

Expo Router:

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar
```

Payments:

```bash
npm install react-native-razorpay
```

---

## 5) File/Folder Blueprint

```text
src/
  app/
  components/
    ui/
    common/
  features/
    auth/
    home/
    shop/
    product/
    cart/
    checkout/
    orders/
    wishlist/
    profile/
    admin/
  services/
    api/            # Variant A
    firebase/       # Variant B
    supabase/       # Variant C
  store/
  hooks/
  types/
  utils/
  theme/
```

---

## 6) Shared QA Checklist

- Auth survives app restart
- Guest-to-user wishlist sync works
- Cart totals/tax/shipping consistent
- Razorpay flow success/failure handled
- Order detail heading updates by status
- Delivered COD displays paid status
- Admin status updates reflect immediately
- Admin badge shows auto-paid on delivery cases
- All list pages have skeleton + empty + error state
- No TypeScript errors

---

## 7) Recommendation

If you already have this web backend live, start with Variant A for fastest launch.
If you want fully managed infra and rapid mobile backend iteration, choose Variant C (Supabase).
If your team already uses Firebase ecosystem, choose Variant B.
