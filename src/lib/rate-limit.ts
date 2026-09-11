import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { env, isRateLimitBackendConfigured } from "@/lib/env";

export type LimiterKind = "metadata" | "prepare" | "stream";

const CONFIG: Record<LimiterKind, { limit: number; windowSeconds: number }> = {
  metadata: { limit: 20, windowSeconds: 60 },
  prepare: { limit: 8, windowSeconds: 60 },
  stream: { limit: 20, windowSeconds: 60 },
};

interface RateLimitResult {
  success: boolean;
  resetAt: number;
}

// Fallback for local dev / no Upstash configured. Only protects a single
// running instance — fine for dev, a reasonable-not-perfect safety net in
// a single-region prod deployment, documented as such in the README.
const memoryStore = new Map<string, { count: number; resetAt: number }>();

function memoryLimit(key: string, limit: number, windowSeconds: number): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const entry = memoryStore.get(key);
  if (!entry || entry.resetAt < now) {
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, resetAt: now + windowMs };
  }
  if (entry.count >= limit) {
    return { success: false, resetAt: entry.resetAt };
  }
  entry.count += 1;
  return { success: true, resetAt: entry.resetAt };
}

const upstashLimiters = new Map<LimiterKind, Ratelimit>();

function getUpstashLimiter(kind: LimiterKind): Ratelimit {
  const existing = upstashLimiters.get(kind);
  if (existing) return existing;

  const redis = new Redis({
    url: env.UPSTASH_REDIS_REST_URL!,
    token: env.UPSTASH_REDIS_REST_TOKEN!,
  });
  const { limit, windowSeconds } = CONFIG[kind];
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds} s`),
    prefix: `cliply:${kind}`,
    analytics: false,
  });
  upstashLimiters.set(kind, limiter);
  return limiter;
}

export async function checkRateLimit(
  kind: LimiterKind,
  identifier: string,
): Promise<RateLimitResult> {
  if (isRateLimitBackendConfigured) {
    const result = await getUpstashLimiter(kind).limit(identifier);
    return { success: result.success, resetAt: result.reset };
  }
  const { limit, windowSeconds } = CONFIG[kind];
  return memoryLimit(`${kind}:${identifier}`, limit, windowSeconds);
}
