# React Native Expo Master Prompt (Pandit Ji Collection)

Copy everything below and paste it into your AI coding assistant to generate the full mobile app.

---

## Prompt Start

You are a senior React Native + Expo architect. Build a production-grade ecommerce mobile app for Android and iOS that mirrors the existing Pandit Ji Collection web platform.

### Product Context

- App name: Pandit Ji Collection Mobile
- Domain: Fashion ecommerce
- Existing backend is already available with REST APIs
- Target: User app + Admin app (role-based)
- Visual style: modern premium UI, blue-cyan accents, clean cards, smooth micro-animations

### Non-Negotiable Stack

- Expo (latest stable)
- React Native with TypeScript
- Expo Router or React Navigation (choose one and stay consistent)
- TanStack Query for server state
- Zustand (preferred) or Redux Toolkit for local app state
- React Hook Form + Zod for forms
- Reanimated (and Moti optional) for animations
- Axios API client with interceptors
- AsyncStorage for non-sensitive persistence
- Expo Secure Store for auth/token persistence
- Razorpay mobile SDK integration for online payments

### Functional Scope

#### A) User App

1. Auth

- Signup
- Login
- Forgot Password
- Reset Password
- Persistent session

1. Home

- Hero banners
- New arrivals
- Featured products
- Product carousels

1. Shop

- Product grid
- Filters: category, brand, price, rating, material, size, color
- Sort: relevance, newest, price asc/desc, rating, popular
- Search with debounce and suggestions

1. Product Detail

- Image gallery
- Variant selectors (size/color)
- Quantity controls
- Add to cart
- Add/remove wishlist
- Buy now

1. Cart

- Add/remove/update quantity
- Price summary
- Shipping/tax/total breakdown

1. Checkout

- Shipping form
- Payment method: Razorpay + Cash on Delivery
- Razorpay create order + verify payment flow

1. Orders

- Orders list with status filters and search
- Scrollable modern order cards with progress tracking
- Order detail page with animated confirmation hero and timeline
- Dynamic heading behavior:
  - Delivered => Your order is delivered
  - Otherwise => Your order is on the way
- Poll order status periodically
- Dynamic payment behavior:
  - Delivered COD order must display as Paid

1. Wishlist

- Guest local persistence
- Logged-in API persistence
- Guest wishlist sync on login

1. Profile

- User profile details
- Order history shortcuts
- Logout

#### B) Admin App (role-based)

1. Admin login
2. Dashboard with stats and recent orders
3. Orders management:

- View, search, filter
- Update status
- Show Auto-paid on delivery badge for COD delivered paid orders

4. Product management:

- Create/edit/delete/list/search/filter

5. User/customer management
2. Team/admin management
3. Analytics overview

### Backend API Integration

Use these existing endpoints:

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

### Data Rules to Preserve

1. Order status enum: Pending, Processing, Shipped, Delivered, Cancelled
2. COD logic: when delivered, payment treated as paid
3. Cart and wishlist persistence behavior must match web logic
4. Shipping rule: free shipping above threshold
5. Tax and total calculations must be accurate and consistent

### App Architecture Requirements

Build with clean scalable structure:

- src/app
- src/features/auth
- src/features/home
- src/features/shop
- src/features/product
- src/features/cart
- src/features/checkout
- src/features/orders
- src/features/wishlist
- src/features/profile
- src/features/admin
- src/components/ui
- src/components/common
- src/services/api
- src/store
- src/hooks
- src/utils
- src/theme
- src/types

### Quality Requirements

- Type-safe API contracts
- Centralized error handling
- Skeleton loaders (not only spinners)
- Empty and error states on all list/detail screens
- Optimistic updates for cart/wishlist where safe
- Proper cache invalidation for query keys
- Smooth 60fps animations
- High performance list rendering
- Accessible touch targets and typography

### Navigation Requirements

- Auth flow stack
- Main user tab navigation
- Nested stacks for Shop, Orders, Profile
- Admin stack hidden unless role is admin
- Deep links for product and order details

### Deliverables

1. Complete Expo TypeScript app code
2. Readme with setup and run instructions
3. .env.example
4. API integration modules
5. Reusable UI components
6. Role guards
7. Payment integration flow
8. Lint-clean codebase

### Build Order (Important)

1. Initialize Expo app and architecture
2. Setup navigation and auth session
3. Build API clients and query layer
4. Implement user commerce flow
5. Implement checkout + Razorpay
6. Implement orders list/detail dynamic behaviors
7. Implement admin modules
8. Apply animation polish + final QA

Now start implementing the app end-to-end with production-quality code.

## Prompt End

---

## Expo Setup Blueprint (Use This Exactly)

### 1) Create Project

```bash
npx create-expo-app@latest panditji-mobile -t expo-template-blank-typescript
cd panditji-mobile
```

### 2) Install Core Dependencies

```bash
npm install @tanstack/react-query axios zustand react-hook-form zod @hookform/resolvers
npm install react-native-reanimated react-native-gesture-handler react-native-screens react-native-safe-area-context
npm install @react-native-async-storage/async-storage expo-secure-store
npm install @expo/vector-icons
npm install react-native-razorpay
npm install moti
```

If using React Navigation:

```bash
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler react-native-reanimated
```

If using Expo Router:

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar
```

### 3) Environment Files

Create these files:

- .env
- .env.example

Put variables:

```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_BACKEND_URL
EXPO_PUBLIC_RAZORPAY_KEY_ID=YOUR_KEY_ID
```

### 4) Recommended Starter Folders

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
  hooks/
  services/
    api/
  store/
  theme/
  types/
  utils/
```

### 5) Minimum Shared Core to Implement First

1. QueryClient provider
2. API client with auth interceptors
3. Auth session store with SecureStore
4. Navigation guards (guest/user/admin)
5. Reusable UI kit:

- AppScreen
- AppHeader
- AppButton
- AppInput
- StatusBadge
- ProductCard
- SkeletonCard

### 6) API Modules to Create

- authApi.ts
- productsApi.ts
- searchApi.ts
- cartApi.ts
- wishlistApi.ts
- ordersApi.ts
- paymentsApi.ts
- adminApi.ts

### 7) Critical Query Keys

- auth.me
- products.list
- products.detail
- search.results
- cart.items
- wishlist.items
- orders.list
- orders.detail
- admin.orders
- admin.stats

### 8) Mutation Invalidation Rules

- After add/remove cart => invalidate cart.items
- After wishlist toggle => invalidate wishlist.items
- After checkout success => invalidate cart.items + orders.list
- After order status update => invalidate orders.detail + orders.list + admin.orders

### 9) Run Commands

```bash
npm run start
npm run android
npm run ios
```

### 10) Final QA Checklist

- Auth persists after app restart
- Guest wishlist sync after login works
- COD delivered order shows paid dynamically
- Razorpay payment verify flow works
- Orders page updates status/polling correctly
- Admin order table shows Auto-paid on delivery where applicable
- All major screens have loading, empty, and error UI
- No TypeScript errors

---

## Optional Add-on Prompt (If You Want Extra Polish)

After base app is complete, run a second pass to:

1. Add haptic feedback on add-to-cart, order success, status updates
2. Add shared element transitions between product list and detail
3. Add shimmer skeletons for all content lists
4. Add offline fallback screen and retry queue for key actions
5. Add crash/error logging abstraction
6. Add in-app toast system and centralized snackbar service
7. Add analytics event tracking for funnel steps
