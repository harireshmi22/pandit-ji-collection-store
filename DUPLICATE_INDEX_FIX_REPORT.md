# Duplicate Mongoose Index Fix Report

Date: 2026-04-08
Repository: pandit-ji-collection-store
Issue: Mongoose warning about duplicate index on `{ paymentGatewayOrderId: 1 }`.

## Reported Warning

- `[MONGOOSE] Warning: Duplicate schema index on {"paymentGatewayOrderId":1} found.`
- Cause in warning text: Index declared using both field-level `index: true` and `schema.index()`.

## Root Cause

In `src/models/Order.js`, `paymentGatewayOrderId` had:

- field-level index declaration (`index: true`)
- schema-level index declaration (`orderSchema.index({ paymentGatewayOrderId: 1 })`)

This produced two index declarations for the same key.

## Fix Applied

File changed: `src/models/Order.js`

1. Removed field-level `index: true` from `paymentGatewayOrderId`.
2. Kept one schema-level index and made it explicit sparse:
   - `orderSchema.index({ paymentGatewayOrderId: 1 }, { sparse: true });`

## Why This Is Correct

- There is now a single source of truth for this index.
- Sparse behavior is preserved at the schema index level, which is appropriate for optional gateway order IDs.
- The duplicate-index warning should no longer occur for this field.

## Validation

- Static validation run on `src/models/Order.js`: No errors found.

## Notes

- Existing duplicate index artifacts in the database may still exist in old environments.
- If needed, clean old indexes in MongoDB manually after confirming index names in each environment.
