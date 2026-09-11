import { z } from "zod";

const emptyToUndefined = (v: unknown) => (v === "" ? undefined : v);

const envSchema = z.object({
  COBALT_API_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  COBALT_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  YOUTUBE_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  UPSTASH_REDIS_REST_URL: z.preprocess(emptyToUndefined, z.string().url().optional()),
  UPSTASH_REDIS_REST_TOKEN: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
});

const parsed = envSchema.safeParse({
  COBALT_API_URL: process.env.COBALT_API_URL,
  COBALT_API_KEY: process.env.COBALT_API_KEY,
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

if (!parsed.success) {
  throw new Error(`Invalid environment variables: ${parsed.error.message}`);
}

export const env = parsed.data;

export const isConversionEngineConfigured = Boolean(env.COBALT_API_URL);
export const isRateLimitBackendConfigured = Boolean(
  env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN,
);
export const siteUrl = env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
