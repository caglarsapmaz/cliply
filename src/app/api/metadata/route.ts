import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";
import { resolveSource } from "@/lib/sources/registry";
import { SourceError } from "@/lib/sources/types";
import { metadataRequestSchema, parsePublicUrl } from "@/lib/validation";
import type { MetadataResponse } from "@/types";

// Self-hosted on a single Node container — no cold-start benefit from Edge.
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const rate = await checkRateLimit("metadata", getClientIp(req.headers));
  if (!rate.success) return errorResponse("rate_limited");

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return errorResponse("invalid_request");
  }

  const parsed = metadataRequestSchema.safeParse(json);
  if (!parsed.success) return errorResponse("invalid_request");

  let url: URL;
  try {
    url = parsePublicUrl(parsed.data.url);
  } catch {
    return errorResponse("invalid_url");
  }

  const source = resolveSource(url);
  if (!source) return errorResponse("unsupported_source");

  try {
    const parsedUrl = source.parseUrl(url);
    const metadata = await source.fetchMetadata(parsedUrl);
    const body: MetadataResponse = {
      metadata,
      formats: {
        mp3: source.qualitiesFor("mp3"),
        mp4: source.qualitiesFor("mp4"),
      },
    };
    return NextResponse.json(body);
  } catch (err) {
    if (err instanceof SourceError) return errorResponse(err.code);
    return errorResponse("service_unavailable");
  }
}
