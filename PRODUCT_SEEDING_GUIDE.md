# Product Seeding Guide (Dynamic + 20 Products)

Date: 2026-04-08

## Goal

Push product collection data into MongoDB automatically without manual product-by-product entry, while keeping the structure similar to your Add Product flow.

## Basic Thinking and Approach

1. Keep one source of truth for product shape:
   - Use the same fields your Product model already expects.
2. Generate data dynamically:
   - Build products from reusable arrays (category, brand, color, material, etc.).
   - Randomize values like price, stock, rating, and discount.
3. Make script configurable:
   - Use CLI arguments such as count and mode.
   - count: how many products to insert.
   - mode: replace existing data or append new data.
4. Run from npm scripts for easy usage.

## What Was Implemented

Updated file: scripts/seed-database.js

1. Dynamic product generator added.
2. CLI options added:
   - --count=20
   - --mode=replace | append
3. Default behavior:
   - count defaults to 20
   - mode defaults to replace
4. Insert operation uses Product.insertMany for bulk speed.

Updated file: package.json

1. Added quick commands:
   - seed:products
   - seed:products:append

## How to Push 20 Products

Run this command:

```bash
npm run seed:products
```

This will:

1. Connect to MongoDB using your .env.local MONGODB_URI
2. Remove existing products (replace mode)
3. Insert 20 dynamically generated products

If you want to keep existing products and add 20 more:

```bash
npm run seed:products:append
```

## How to Change Count

You can run directly with a different number:

```bash
node scripts/seed-database.js --count=50 --mode=append
```

## Improvements You Can Add Next

1. Add product slug field and enforce uniqueness.
2. Add SKU generation and unique index for inventory operations.
3. Validate generated values by category rules (for example accessories default to One Size).
4. Keep image URLs in Cloudinary or your own CDN for production consistency.
5. Add seed profiles:
   - dev (small random set)
   - staging (realistic mix)
   - demo (fixed deterministic set)
6. Add rollback script to delete only seeded data via seedBatchId.
7. Add a cron/admin endpoint to auto-refresh demo catalog.
8. Add faker-based multilingual names/descriptions if needed.

## Safety Notes

1. replace mode deletes all existing products first.
2. append mode is safer for existing live data.
3. Always test in development/staging before running on production.
