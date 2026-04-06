import { Ratelimit } from "@upstash/ratelimit";
import redis from "./redis";

// Create a new ratelimiter, that allows 5 requests per 1 minute
// If redis is not available, we won't instantiate a ratelimiter.
const ratelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "60 s"),
  analytics: true,
}) : null;

export async function checkRateLimit(req) {
  // In Next.js App Router, req is a standard Request/NextRequest.
  // We try to get the IP from headers (x-forwarded-for) or falling back to a placeholder.
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

  // Use Upstash Redis Ratelimit if available
  if (ratelimit) {
    try {
      const { success, limit, reset, remaining } = await ratelimit.limit(ip);
      if (!success) {
        return {
          success: false,
          retryAfter: Math.max(0, Math.ceil((reset - Date.now()) / 1000))
        };
      }
      return { success: true };
    } catch (error) {
      console.warn("[RateLimit] Redis error, falling back to memory:", error);
    }
  }

  // Fallback to in-memory globally scoped Map (for simple dev or basic limits)
  const limitCount = 5; // 5 attempts
  const windowMs = 60 * 1000; // 1 minute window

  const now = Date.now();
  const cleanupTime = now - windowMs;

  if (!global.rateLimitMap) {
    global.rateLimitMap = new Map();
  }

  const record = global.rateLimitMap.get(ip);

  if (!record) {
    global.rateLimitMap.set(ip, { count: 1, startTime: now });
    return { success: true };
  }

  if (record.startTime < cleanupTime) {
    // Window has passed, reset
    global.rateLimitMap.set(ip, { count: 1, startTime: now });
    return { success: true };
  }

  if (record.count >= limitCount) {
    return {
      success: false,
      retryAfter: Math.ceil((record.startTime + windowMs - now) / 1000)
    };
  }

  // Increment
  record.count += 1;
  return { success: true };
}
