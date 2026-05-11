# Storefront Performance Steps

This document explains the performance fixes applied to the storefront and the exact steps used to reduce font issues, LCP, and CLS on product and listing pages.

## Quick Summary

The main performance work focused on four areas:

- Remove the broken font loading path that caused decode errors.
- Render the product detail page on the server so the hero image is available immediately.
- Optimize product images and keep the API response small and cacheable.
- Fix loading skeleton ratios so the page reserves space consistently and avoids layout shift.

| Area | Before | After |
| --- | --- | --- |
| Fonts | Manual `@font-face` pointed at a Google Fonts CSS URL | `next/font/google` handles Inter and the manual rule was removed |
| Product detail loading | Product data was fetched after hydration | Product is fetched in the server route and passed to a client shell |
| Images | Hero image could arrive late and be heavier than needed | Cloudinary images use `f_auto,q_auto,c_limit,w_*` and `priority` for the hero |
| CLS placeholders | Skeletons used a mismatched aspect class | Skeletons now use the defined `aspect-3-4` utility |
| API reads | Repeated product reads could re-hit the database | Projection is narrowed and cached with Redis/in-memory fallback |

The browser metrics seen before the fix were roughly:

- LCP: 5.70 s
- CLS: 0.81

These numbers should improve after the fixes are deployed and the page is retested in DevTools or Lighthouse.

## 1. Remove the broken font loading path

Problem:

- The app was trying to load Inter through a manual `@font-face` rule that pointed at a Google Fonts CSS URL.
- That produced font decode errors in the browser and introduced unnecessary font loading instability.

Fix:

- Keep the font setup in `src/app/layout.js` with `next/font/google`.
- Remove the manual `@font-face` blocks from `src/app/globals.css`.
- Let the framework handle font preloading and fallback behavior.

Result:

- No more font decode error from the bad CSS URL.
- Less risk of font-related CLS.

## 2. Render the product detail page on the server

Problem:

- The `/shop/[id]` page originally fetched product data inside a client component after hydration.
- That delayed the hero image request and pushed the LCP later than necessary.

Fix:

- Move the data lookup into the route module at `src/app/shop/[id]/page.jsx`.
- Use `dbConnect()` and `Product.findById(...).lean()` on the server.
- Pass the product object into a separate client component for interactive UI only.

Implementation steps:

1. Read `params.id` in the server component.
2. Decode and validate the ID.
3. Connect to MongoDB.
4. Query the product with a narrow projection so only storefront fields are fetched.
5. Send the product to `ProductDetailClient`.

Result:

- The hero image is present in the first server response.
- The browser can start rendering sooner.
- LCP improves because the main visual no longer waits on client-side fetch timing.

## 3. Keep only interactive state in the client component

Problem:

- The client side was doing both data loading and interactivity.
- That mixed concerns and delayed meaningful paint.

Fix:

- Move cart, wishlist, quantity, and payment dialog handling into `src/app/shop/[id]/ProductDetailClient.jsx`.
- Keep product data immutable and injected from the server.

Result:

- The client bundle stays focused on interactions.
- The page paints earlier and hydrates with less work.

## 4. Optimize the product image pipeline

Problem:

- Product images could be loaded without consistent transformation.
- Large images increase time to load and decode.

Fix:

- Use the helper in `src/lib/image-utils.js`.
- Transform Cloudinary URLs with `f_auto,q_auto,c_limit,w_*`.
- Use the optimized image for the main product hero and for listing cards.

Implementation steps:

1. Get the primary product image from `image` or `images`.
2. Detect Cloudinary URLs.
3. Add responsive Cloudinary parameters when possible.
4. Keep `priority` on the hero image so Next preloads it.

Result:

- Smaller image payloads.
- Faster hero image delivery.
- Better LCP on product and catalog pages.

## 5. Fix invalid skeleton aspect ratios

Problem:

- Some loading placeholders used `aspect-3/4`, but the stylesheet defines `aspect-3-4`.
- That meant the skeletons were not reserving the intended space consistently.

Fix:

- Replace every `aspect-3/4` usage with `aspect-3-4` on storefront loading states.
- Keep the skeleton ratio aligned with the final image container.

Files updated:

- `src/app/shop/page.jsx`
- `src/app/search/page.jsx`
- `src/app/wishlist/page.jsx`

Result:

- Less layout shift during loading.
- Better visual stability while content hydrates.

## 6. Keep the API response lean and cacheable

Problem:

- Product reads can be repeated often on storefront routes.
- Rebuilding the same document on every request wastes time.

Fix:

- In `src/app/api/products/[id]/route.js`, keep the storefront projection small.
- Cache product detail payloads in Redis and in-memory fallback.
- Return cache-friendly headers such as `Cache-Control: public, max-age=60, stale-while-revalidate=300`.

Result:

- Faster repeated product requests.
- Reduced database load.
- Better perceived navigation speed.

## 7. Preserve layout stability in CSS

Problem:

- Small CSS inconsistencies can still trigger layout jumps.

Fix:

- Define reusable aspect ratio utilities in `src/app/globals.css`.
- Keep image containers and skeletons aligned to those ratios.
- Use consistent spacing and avoid ad hoc height changes during loading.

Result:

- Lower CLS on product, search, and listing views.

## 8. Validate the changes

Recommended checks:

1. Run `npm run lint`.
2. Open a product page in the browser and confirm the hero image appears immediately.
3. Check the console for font decode errors.
4. Measure LCP and CLS in DevTools Performance or Lighthouse.

What should be true after the fix:

- No font decode error from the stylesheet.
- The product detail page renders without waiting for client fetch.
- Skeletons keep the same visual space as the final cards.
- The main product image loads as the LCP candidate instead of a late client-rendered image.

## Summary

The performance improvement came from removing a broken font path, moving the product detail fetch to the server, optimizing image delivery, correcting aspect-ratio placeholders, and keeping the API cache-friendly. Together these changes reduce render delay, improve LCP, and keep layout stable during load.
