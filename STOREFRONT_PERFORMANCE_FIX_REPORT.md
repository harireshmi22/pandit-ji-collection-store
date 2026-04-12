# Storefront Performance Fix Report

## Objective

Reduce slow storefront rendering and very high mobile LCP (notably product detail pages where the main product image was reported as the LCP element).

## Scope Covered

- Product detail page
- Shop listing page
- Search listing page
- Product/search API response optimization and cache headers
- Shared image optimization utility

## Issues Found

### 1. Product detail relied on client-only fetch before showing main content

Problem:

- Product detail route fetched product data on the client and blocked the page with a spinner.
- The hero product image URL was unknown until API response completed.
- On Slow 4G this delayed the LCP image request and pushed LCP very high.

Files involved:

- src/app/shop/[id]/page.jsx
- src/app/api/products/[id]/route.js

### 2. Listing pages used full-page loading indicators

Problem:

- Shop/search pages showed spinner-only loading states for initial data.
- This delayed visible meaningful structure and hurt perceived speed.

Files involved:

- src/app/shop/page.jsx
- src/app/search/page.jsx

### 3. Product images were not consistently transformed for delivery size/quality

Problem:

- Cloudinary originals could be large.
- Without automatic transformation, image bytes remained high on mobile networks.

Files involved:

- src/app/shop/[id]/page.jsx
- src/app/shop/page.jsx
- src/app/search/page.jsx

### 4. Product/list/search APIs returned no-store cache headers

Problem:

- Browser could not reuse short-lived API responses effectively.
- Repeat navigations paid full round-trip cost.

Files involved:

- src/app/api/products/route.js
- src/app/api/products/[id]/route.js
- src/app/api/search/route.js

## Fixes Implemented

### A. Added shared image optimization utility

What changed:

- Created reusable helper to normalize product images and apply Cloudinary transformations.
- Added width-based transformation: f_auto,q_auto,c_limit,w_<width>.
- Added Cloudinary detector to conditionally bypass Next image optimizer with unoptimized when URL is already optimized by Cloudinary.

File added:

- src/lib/image-utils.js

### B. Product detail now requests storefront-optimized data and renders skeleton shell

What changed:

- Changed fetch to use /api/products/:id?view=storefront.
- Replaced spinner-only loading UI with stable skeleton layout.
- Main product image now uses optimized Cloudinary URL and unoptimized for direct CDN delivery.

File updated:

- src/app/shop/[id]/page.jsx

### C. Shop listing page now uses lighter API payload + skeleton cards

What changed:

- Request now includes fields=card to reduce payload.
- Replaced loading spinner with card skeleton grid.
- Product card images now use transformed Cloudinary URLs.
- First two images marked with priority for quicker above-the-fold image fetch.

File updated:

- src/app/shop/page.jsx

### D. Search page now uses skeleton grid + optimized listing images

What changed:

- Replaced loading spinner with result card skeletons.
- Optimized product/suggestion images for Cloudinary-hosted URLs.
- First two result images marked priority.

File updated:

- src/app/search/page.jsx

### E. Products API now supports storefront card projection and browser-friendly caching

What changed:

- Added fields query parameter support in GET /api/products.
- fields=card returns only listing-relevant fields.
- Updated cache headers to short public caching with stale-while-revalidate.

File updated:

- src/app/api/products/route.js

### F. Product detail API now supports storefront projection and browser-friendly caching

What changed:

- Added view=storefront support in GET /api/products/:id.
- Uses limited field projection for storefront needs.
- Updated headers to public short cache + stale-while-revalidate.

File updated:

- src/app/api/products/[id]/route.js

### G. Search API response headers updated for short browser caching

What changed:

- Changed search and suggestion response headers from no-store to short public cache with stale-while-revalidate.

File updated:

- src/app/api/search/route.js

## Practice Approach You Can Reuse

Use this 8-step loop for any slow storefront route:

1. Measure first

- Capture LCP on mobile throttling.
- Identify LCP element type (image/text/container).

1. Trace request dependency

- Ask: does the LCP element need data before it can even start loading?
- If yes, reduce that dependency path first.

1. Remove blocking loaders

- Avoid full-page spinner returns.
- Render shell/skeleton with stable dimensions.

1. Minimize above-the-fold payload

- Add API projection modes (fields=card, view=storefront).
- Return only fields needed by initial render.

1. Optimize image delivery

- Transform image URL at CDN layer (auto format/quality + width limit).
- Prefer direct CDN optimized delivery where appropriate.

1. Use short caching safely

- Add small max-age + stale-while-revalidate for read-heavy storefront APIs.

1. Validate correctness

- Check loading, empty, error, and normal states.
- Verify compile/lint errors are clean.

1. Re-measure

- Run same device/network profile and compare LCP.

## Expected Impact

- Faster perceived storefront rendering due to skeleton-first strategy.
- Lower time-to-visible product cards/details on mobile.
- Reduced network bytes and better cache reuse for product/search APIs.
- Better LCP outcomes especially on product detail pages where hero image was previously delayed.

## Edited Files Summary

- src/lib/image-utils.js
- src/app/shop/[id]/page.jsx
- src/app/shop/page.jsx
- src/app/search/page.jsx
- src/app/api/products/route.js
- src/app/api/products/[id]/route.js
- src/app/api/search/route.js
