import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { base64UrlEncode } from "@/lib/base64url";
import { requestConversion } from "@/lib/conversion/ytdlp-client";
import { ConversionError } from "@/lib/conversion/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { sanitizeFilename } from "@/lib/sanitize";
import { resolveSource } from "@/lib/sources/registry";
import { SourceError } from "@/lib/sources/types";
import { parsePublicUrl, prepareRequestSchema } from "@/lib/validation";
import type { PrepareResponseBody } from "@/types";

// yt-dlp/ffmpeg run as native child processes — unavailable on the Edge runtime.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rate = await checkRateLimit("prepare", getClientIp(req.headers));
  if (!rate.success) return errorResponse("rate_limited");

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return errorResponse("invalid_request");
  }

  const parsed = prepareRequestSchema.safeParse(json);
  if (!parsed.success) return errorResponse("invalid_request");
  const { format, quality } = parsed.data;

  let url: URL;
  try {
    url = parsePublicUrl(parsed.data.url);
  } catch {
    return errorResponse("invalid_url");
  }

  const source = resolveSource(url);
  if (!source) return errorResponse("unsupported_source");

  if (
    !source.supportedFormats.includes(format) ||
    !source.qualitiesFor(format).includes(quality)
  ) {
    return errorResponse("invalid_request");
  }

  try {
    const parsedUrl = source.parseUrl(url);
    const result = await requestConversion(parsedUrl.canonicalUrl, format, quality);
    const filename = sanitizeFilename(
      result.filename,
      `cliply-${parsedUrl.externalId}`,
      format,
    );
    const downloadUrl = `/api/stream?u=${base64UrlEncode(result.jobId)}&f=${encodeURIComponent(filename)}`;
    const body: PrepareResponseBody = { downloadUrl, filename };
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof SourceError) return errorResponse(err.code);
    if (err instanceof ConversionError) return errorResponse(err.code);
    return errorResponse("service_unavailable");
  }
}
