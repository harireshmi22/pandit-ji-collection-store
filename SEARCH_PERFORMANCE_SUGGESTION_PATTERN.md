# Search Performance and Suggestion Improvements

## What I fixed

- Reduced slow product loading in search by adding API-level caching in Redis with in-memory fallback.
- Added fast live product suggestions in navbar search.
- Added debounce and request cancellation so frequent typing does not flood APIs.
- Added keyboard navigation for suggestions:
  - Arrow Down: move to next suggestion
  - Arrow Up: move to previous suggestion
  - Enter: select highlighted suggestion
  - Escape: close suggestions

## Where changes were made

- `src/app/api/search/route.js`
  - Added cache read/write utilities (`getCachedValue`, `setCachedValue`)
  - Added cache keys for both full search and suggestion mode
  - Added TTL strategy:
    - Search results TTL: 120s
    - Suggestion results TTL: 90s

- `src/app/components/home/Navbar.jsx`
  - Added debounced query hook (`useDebouncedValue`)
  - Added suggestion fetching with `AbortController`
  - Added visual suggestion dropdown with image, name, brand/category, and price
  - Added keyboard navigation state (`activeSuggestionIndex`)
  - Added highlighted active suggestion and auto-scroll into view

## How it works (implementation flow)

1. User types in navbar search input.
2. Input value is debounced (320ms).
3. After debounce, frontend calls `/api/search?q=<text>&suggest=true`.
4. API checks cache first:
   - Redis (if configured)
   - Memory cache fallback
5. On cache miss, API queries MongoDB and returns compact suggestion objects.
6. Frontend displays suggestions and allows:
   - mouse click selection
   - keyboard navigation and selection
7. Selecting a suggestion navigates to `/search?q=<selected-name>`.

## Pattern used (reusable)

### Pattern name

`Debounced Async Suggest + Multi-layer Cache + Keyboard Accessible Combobox`

### Pattern goals

- Keep typing smooth.
- Minimize duplicate backend load.
- Ensure suggestions are accessible and navigable without mouse.

### Pattern checklist

- Debounce user input (`250-400ms`)
- Cancel stale requests (`AbortController`)
- Cache responses (`Redis + memory fallback`)
- Return compact suggestion payloads only
- Add active index for arrow key navigation
- Handle Enter/Escape behavior
- Reset active index when query/suggestions change
- Close dropdown on outside click

## Why this pattern improves performance

- Debounce reduces API calls during rapid typing.
- AbortController prevents old responses from racing and overwriting newer state.
- Caching avoids repeated MongoDB work for same queries.
- Compact payloads reduce response size and rendering cost.

## Optional next improvements

- Add prefix-specific index in MongoDB for frequent name lookups.
- Add telemetry for suggestion click-through rate.
- Add ranking boost based on stock/featured/popularity.
