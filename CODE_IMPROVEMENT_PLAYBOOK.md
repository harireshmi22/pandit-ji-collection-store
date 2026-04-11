# Code Improvement Playbook

This file explains:

- what we changed recently
- how to think before changing code
- a practical approach for improving code safely

## 1) What We Changed Recently

Wishlist reliability and UX were improved in two parts.

### Functional Fix

- Added server persistence for logged-in users through wishlist API routes.
- Synced guest wishlist (local storage) into user wishlist on login.
- Added data-model safety by enforcing one wishlist document per user.

Primary files:

- src/app/api/wishlist/route.js
- src/context/WishlistContext.jsx
- src/models/Wishlist.js

### UX Improvement

- Added loading state and skeleton placeholders on wishlist page.
- Prevented empty-state flicker while data initializes.

Primary file:

- src/app/wishlist/page.jsx

## 2) How To Think First (Before Coding)

Use this sequence before touching code.

1. Define the exact user problem.

- Example: "Wishlist item appears saved but disappears after login or refresh."

1. Map the data flow.

- Where data is created
- Where it is stored
- Where it is read
- Where it can be lost

1. Reproduce with smallest path.

- Guest flow
- Login flow
- Refresh flow
- Different page entry points

1. Identify the true source of truth.

- Guest-only state can be browser storage.
- Logged-in state should come from backend persistence.

1. Design minimal safe fix first.

- Keep existing behavior working.
- Add only what is needed to solve the bug.

## 3) Approach: Fix First, Improve Next

### Phase A: Correctness First

- Make the feature work end-to-end.
- Add error handling for network and auth cases.
- Keep data shape consistent between API and UI.

Checklist:

- Can create data
- Can read data after refresh
- Can read data after login/logout transition
- Handles API failure without app crash

### Phase B: Stability

- Normalize identifiers and payloads.
- Validate inputs at API boundaries.
- Add schema constraints (indexes/uniqueness when required).

Checklist:

- Invalid IDs are rejected
- Duplicate records are prevented
- DB writes are idempotent where possible

### Phase C: UX

- Add loading, empty, and error states.
- Remove UI flicker and stale counters.
- Keep interaction responsive even during API round trips.

Checklist:

- Loading state visible
- Empty state accurate
- Buttons disabled/guarded when needed

### Phase D: Quality

- Run lint and basic flow tests.
- Keep commits focused by concern.
- Document behavior changes and edge cases.

Checklist:

- No new lint errors in touched files
- Manual smoke test completed
- Docs updated

## 4) Daily Working Pattern

Use this repeatable pattern for future tasks.

1. Understand

- Read related context/provider/api/model files together.

1. Reproduce

- Confirm current broken behavior once.

1. Patch minimally

- Small, targeted changes in the right layer.

1. Verify

- Check editor errors + run lint + quick manual flow.

1. Document

- Update README and add short implementation notes.

1. Commit cleanly

- Commit 1: functional fix
- Commit 2: UX/refactor/docs (if separate)

## 5) Red Flags (Pause And Re-check)

- Feature depends only on local storage for logged-in users.
- UI state and backend state diverge.
- Same business record can be duplicated.
- API accepts malformed IDs without validation.
- Fix introduces broad unrelated file changes.

## 6) How To Improve Code Over Time

Use incremental improvement instead of large rewrites.

- Step 1: Make behavior correct.
- Step 2: Reduce duplication in utilities/hooks.
- Step 3: Add lightweight tests around critical flows.
- Step 4: Improve observability (clear logs, error messages).
- Step 5: Optimize performance only after correctness is stable.

## 7) Suggested Next Improvements

- Add integration tests for wishlist guest-to-user sync.
- Add optimistic update rollback on wishlist API failure.
- Add request-level telemetry for cart/wishlist/order routes.
- Add role and auth guard tests for admin routes.
