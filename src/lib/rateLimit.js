export async function checkRateLimit(req) {
  // In Next.js App Router, req is a standard Request/NextRequest.
  // We try to get the IP from headers (x-forwarded-for) or falling back to a placeholder.
  // detailed IP extraction can be complex behind proxies, but this acts as a basic guard.
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor ? forwardedFor.split(",")[0] : "unknown";

  const limit = 5; // 5 attempts
  const windowMs = 60 * 1000; // 1 minute window

  const now = Date.now();
  const cleanupTime = now - windowMs;

  // Clean up old entries from the map to prevent memory leaks
  // (Simple lazy cleanup: just delete this IP's old data if expired, 
  // logic below handles expiry check. For global cleanup, we'd need a interval,
  // but for this scope, per-request check is sufficient to reset checking).

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

  if (record.count >= limit) {
    return {
      success: false,
      retryAfter: Math.ceil((record.startTime + windowMs - now) / 1000)
    };
  }

  // Increment
  record.count += 1;
  return { success: true };
}
