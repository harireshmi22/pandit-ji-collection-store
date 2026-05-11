import { Redis } from '@upstash/redis'

/**
 * Upstash Redis client (HTTP-based, serverless-friendly)
 *
 * Required env vars:
 *   UPSTASH_REDIS_REST_URL   — Upstash REST endpoint (e.g. https://xxx.upstash.io)
 *   UPSTASH_REDIS_REST_TOKEN — Upstash REST auth token
 *
 * When env vars are missing (e.g. during build), the client stays null
 * and all call sites guard with `if (redis)`.
 */

let redis = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    try {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        // Only log in development, not during build
        if (process.env.NODE_ENV !== 'production') {
            console.log('[REDIS] Upstash client initialized');
        }
    } catch (err) {
        // Only log in development, not during build
        if (process.env.NODE_ENV !== 'production') {
            console.warn('[REDIS] Failed to initialize Upstash client:', err.message);
        }
        redis = null;
    }
} else {
    // Only log in development, not during build
    if (process.env.NODE_ENV !== 'production') {
        console.warn('[REDIS] UPSTASH env vars not set — Redis disabled');
    }
}

export default redis;

/* ─────────────────────────────────────────────
 *  In-memory LRU cache (fallback when Redis
 *  is unavailable, e.g. Netlify serverless).
 *  Survives within a single warm function
 *  instance; resets on cold start.
 * ───────────────────────────────────────────── */
const MAX_ENTRIES = 200;
const _mem = new Map();

export const memCache = {
    get(key) {
        const entry = _mem.get(key);
        if (!entry) return null;
        if (Date.now() > entry.exp) { _mem.delete(key); return null; }
        return entry.val;
    },

    set(key, value, ttlSeconds = 300) {
        // Evict oldest entries when map is full
        if (_mem.size >= MAX_ENTRIES) {
            const oldest = _mem.keys().next().value;
            _mem.delete(oldest);
        }
        _mem.set(key, { val: value, exp: Date.now() + ttlSeconds * 1000 });
    },

    del(key) { _mem.delete(key); },

    /** Delete all keys matching a prefix (e.g. "products:") */
    delByPrefix(prefix) {
        for (const k of _mem.keys()) {
            if (k.startsWith(prefix)) _mem.delete(k);
        }
    },

    clear() { _mem.clear(); },
};
