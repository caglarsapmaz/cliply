import { env } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { MediaFormat, MediaQuality } from "@/types";
import { ConversionError, type ConversionResult } from "./types";

/**
 * Talks to a Cobalt (https://github.com/imputnet/cobalt) instance — an
 * open-source media processing API. Cobalt does the actual extraction and
 * conversion and hands back a short-lived, single-use tunnel URL; Cliply
 * never runs yt-dlp/ffmpeg itself, which is what keeps this Vercel-safe
 * (no long-running processes, no native binaries, no local storage).
 *
 * Body/response shape follows Cobalt's documented processing API
 * (docs/api.md as of the v10 rewrite). Self-hosted instances can drift
 * across versions — if `parseCobaltResponse` starts hitting the `default`
 * branch, check that first before assuming Cliply is broken.
 */

interface CobaltRequestBody {
  url: string;
  downloadMode: "auto" | "audio";
  videoQuality?: string;
  audioFormat?: "mp3";
  audioBitrate?: string;
  youtubeVideoCodec?: "h264";
  filenameStyle: "pretty";
}

type CobaltResponse =
  | { status: "tunnel" | "redirect"; url: string; filename: string }
  | { status: "picker" }
  | { status: "local-processing" }
  | { status: "error"; error: { code: string } };

const MP4_QUALITY_MAP: Partial<Record<MediaQuality, string>> = {
  auto: "1080",
  "1080": "1080",
  "720": "720",
  "480": "480",
  "360": "360",
};

const MP3_BITRATE_MAP: Partial<Record<MediaQuality, string>> = {
  auto: "128",
  "320": "320",
  "192": "192",
  "128": "128",
};

function buildRequestBody(
  canonicalUrl: string,
  format: MediaFormat,
  quality: MediaQuality,
): CobaltRequestBody {
  if (format === "mp3") {
    return {
      url: canonicalUrl,
      downloadMode: "audio",
      audioFormat: "mp3",
      audioBitrate: MP3_BITRATE_MAP[quality] ?? "128",
      filenameStyle: "pretty",
    };
  }
  return {
    url: canonicalUrl,
    downloadMode: "auto",
    videoQuality: MP4_QUALITY_MAP[quality] ?? "1080",
    youtubeVideoCodec: "h264",
    filenameStyle: "pretty",
  };
}

function mapCobaltErrorCode(code: string): ConversionError {
  // Cobalt's own rate limiter (IP-hash based) sees every Cliply request as
  // coming from one source — our server. That's a capacity problem with the
  // shared engine, not something the visitor did, so it gets the "try again
  // shortly" message rather than "you're making too many requests".
  if (code.includes("rate_exceeded") || code.includes("rate_limit")) {
    return new ConversionError("conversion_unavailable", code);
  }
  return new ConversionError("conversion_failed", code);
}

export async function requestConversion(
  canonicalUrl: string,
  format: MediaFormat,
  quality: MediaQuality,
): Promise<ConversionResult> {
  if (!env.COBALT_API_URL) {
    throw new ConversionError(
      "conversion_unavailable",
      "No conversion engine is configured (COBALT_API_URL is unset).",
    );
  }

  const body = buildRequestBody(canonicalUrl, format, quality);

  let res: Response;
  try {
    res = await fetchWithTimeout(
      env.COBALT_API_URL,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(env.COBALT_API_KEY ? { Authorization: `Api-Key ${env.COBALT_API_KEY}` } : {}),
        },
        body: JSON.stringify(body),
      },
      20000,
    );
  } catch (err) {
    console.error("[cobalt] request failed:", err);
    throw new ConversionError("conversion_unavailable", "Conversion engine did not respond");
  }

  if (!res.ok && res.status !== 400) {
    console.error(`[cobalt] engine returned HTTP ${res.status}`);
    throw new ConversionError("conversion_unavailable", `Engine returned HTTP ${res.status}`);
  }

  let payload: CobaltResponse;
  try {
    payload = (await res.json()) as CobaltResponse;
  } catch {
    throw new ConversionError("conversion_failed", "Engine returned a non-JSON response");
  }

  switch (payload.status) {
    case "tunnel":
    case "redirect":
      return { streamUrl: payload.url, filename: payload.filename };
    case "error":
      console.error(`[cobalt] engine returned error: ${payload.error.code}`);
      throw mapCobaltErrorCode(payload.error.code);
    case "picker":
    case "local-processing":
      throw new ConversionError(
        "conversion_failed",
        `Engine returned unsupported response type: ${payload.status}`,
      );
    default:
      throw new ConversionError("conversion_failed", "Unrecognized engine response");
  }
}
