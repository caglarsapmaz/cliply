import { NextResponse } from "next/server";
import type { ApiErrorCode } from "@/types";

const STATUS: Record<ApiErrorCode, number> = {
  invalid_url: 400,
  unsupported_source: 400,
  video_unavailable: 404,
  private_video: 403,
  conversion_failed: 502,
  conversion_unavailable: 503,
  rate_limited: 429,
  service_unavailable: 503,
  download_failed: 502,
  invalid_request: 400,
};

/**
 * Body carries only a stable error code, never a human sentence — the
 * client owns translating it (EN/TR) so nothing hardcoded in one language
 * ever reaches the UI.
 */
export function errorResponse(code: ApiErrorCode) {
  return NextResponse.json({ error: code }, { status: STATUS[code] });
}
