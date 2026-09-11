import { z } from "zod";

export const metadataRequestSchema = z.object({
  url: z.string().trim().min(1).max(2048),
});

export const prepareRequestSchema = z.object({
  url: z.string().trim().min(1).max(2048),
  format: z.enum(["mp3", "mp4"]),
  quality: z.enum(["auto", "128", "192", "320", "360", "480", "720", "1080"]),
});

/** Parses + restricts to http(s) — the only schemes any source is allowed to resolve. */
export function parsePublicUrl(raw: string): URL {
  const url = new URL(raw);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("invalid_protocol");
  }
  return url;
}
