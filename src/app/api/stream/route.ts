import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { base64UrlDecode } from "@/lib/base64url";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const rate = await checkRateLimit("stream", getClientIp(req.headers));
  if (!rate.success) return errorResponse("rate_limited");

  const encoded = req.nextUrl.searchParams.get("u");
  const filenameParam = req.nextUrl.searchParams.get("f");
  if (!encoded || !filenameParam) return errorResponse("invalid_request");

  if (!env.COBALT_API_URL) return errorResponse("conversion_unavailable");

  let target: URL;
  try {
    target = new URL(base64UrlDecode(encoded));
  } catch {
    return errorResponse("invalid_request");
  }

  // Only ever proxy bytes back from the conversion engine we configured —
  // never an arbitrary host. Without this, /api/stream would be an open
  // proxy for any `u` a caller crafts.
  const allowedOrigin = new URL(env.COBALT_API_URL).origin;
  if (target.protocol !== "https:" || target.origin !== allowedOrigin) {
    return errorResponse("download_failed");
  }

  let upstream: Response;
  try {
    upstream = await fetch(target.toString());
  } catch {
    return errorResponse("download_failed");
  }
  if (!upstream.ok || !upstream.body) {
    return errorResponse("download_failed");
  }

  const filename = filenameParam.replace(/["\r\n]/g, "");
  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") ?? "application/octet-stream",
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Cache-Control": "no-store",
  });
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers.set("Content-Length", contentLength);

  // Streamed straight through — nothing is ever written to disk, so
  // there's no temp file to clean up on our side.
  return new NextResponse(upstream.body, { status: 200, headers });
}
