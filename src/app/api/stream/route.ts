import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-response";
import { base64UrlDecode } from "@/lib/base64url";
import { consumeJob } from "@/lib/conversion/job-store";
import { removeJobDir } from "@/lib/conversion/tmp";
import { checkRateLimit } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/request-ip";

// Streams the temp file yt-dlp produced — needs real filesystem access.
export const runtime = "nodejs";

const CONTENT_TYPES: Record<string, string> = {
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
};

function contentTypeFor(filename: string): string {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  return CONTENT_TYPES[ext] ?? "application/octet-stream";
}

export async function GET(req: NextRequest) {
  const rate = await checkRateLimit("stream", getClientIp(req.headers));
  if (!rate.success) return errorResponse("rate_limited");

  const encoded = req.nextUrl.searchParams.get("u");
  const filenameParam = req.nextUrl.searchParams.get("f");
  if (!encoded || !filenameParam) return errorResponse("invalid_request");

  let jobId: string;
  try {
    jobId = base64UrlDecode(encoded);
  } catch {
    return errorResponse("invalid_request");
  }

  // Single-use: the same jobId can't be replayed once consumed here.
  const job = consumeJob(jobId);
  if (!job) return errorResponse("download_failed");

  let size: number;
  try {
    size = (await stat(job.filePath)).size;
  } catch {
    void removeJobDir(job.jobDir);
    return errorResponse("download_failed");
  }

  const nodeStream = createReadStream(job.filePath);
  nodeStream.on("close", () => void removeJobDir(job.jobDir));
  nodeStream.on("error", () => void removeJobDir(job.jobDir));

  const filename = filenameParam.replace(/["\r\n]/g, "");
  const headers = new Headers({
    "Content-Type": contentTypeFor(job.filename),
    "Content-Disposition": `attachment; filename="${filename}"`,
    "Content-Length": String(size),
    "Cache-Control": "no-store",
  });

  // Streamed straight from the temp file and deleted as soon as the read
  // finishes (success, error, or client disconnect) — nothing lingers on disk.
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    status: 200,
    headers,
  });
}
