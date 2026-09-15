import { spawn } from "node:child_process";
import { readdir } from "node:fs/promises";
import path from "node:path";
import { ytdlpTimeoutMs } from "@/lib/env";
import type { MediaFormat, MediaQuality } from "@/types";
import { tryAcquire, release } from "./concurrency";
import { registerJob } from "./job-store";
import { makeJobDir, removeJobDir, sweepStaleJobDirs } from "./tmp";
import { ConversionError, type ConversionResult } from "./types";

/**
 * Runs yt-dlp (with ffmpeg on PATH for muxing/encoding) directly in this
 * process and writes the result to a per-job temp directory. Cliply used to
 * hand this off to a hosted Cobalt instance; now it does the extraction
 * itself, which is exactly why these routes need the Node.js runtime and a
 * container image with the two binaries baked in (see Dockerfile).
 *
 * Video is never re-encoded: we pin the format selector to an h264
 * (avc1) source stream and just remux/mux it, which is cheap enough for a
 * small box. Only MP3 extraction does real (audio-only, lightweight)
 * encoding.
 */

void sweepStaleJobDirs();

const MP4_HEIGHT_MAP: Partial<Record<MediaQuality, number>> = {
  auto: 1080,
  "1080": 1080,
  "720": 720,
  "480": 480,
  "360": 360,
};

const MP3_BITRATE_MAP: Partial<Record<MediaQuality, string>> = {
  auto: "128K",
  "320": "320K",
  "192": "192K",
  "128": "128K",
};

function buildArgs(
  canonicalUrl: string,
  format: MediaFormat,
  quality: MediaQuality,
  outTemplate: string,
): string[] {
  if (format === "mp3") {
    return [
      "--no-playlist",
      "-f",
      "bestaudio",
      "-x",
      "--audio-format",
      "mp3",
      "--audio-quality",
      MP3_BITRATE_MAP[quality] ?? "128K",
      "-o",
      outTemplate,
      canonicalUrl,
    ];
  }
  const height = MP4_HEIGHT_MAP[quality] ?? 1080;
  return [
    "--no-playlist",
    "-f",
    `bv*[vcodec^=avc1][height<=?${height}]+ba[ext=m4a]/b[vcodec^=avc1][height<=?${height}]/best[height<=?${height}]`,
    "--merge-output-format",
    "mp4",
    "-o",
    outTemplate,
    canonicalUrl,
  ];
}

function runYtDlp(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("yt-dlp", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr = (stderr + chunk.toString()).slice(-4000);
    });

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new ConversionError("conversion_failed", "yt-dlp timed out"));
    }, ytdlpTimeoutMs);

    child.on("error", (err) => {
      clearTimeout(timer);
      reject(new ConversionError("conversion_unavailable", `Failed to start yt-dlp: ${err.message}`));
    });

    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) {
        resolve();
        return;
      }
      console.error(`[yt-dlp] exited with code ${code}: ${stderr}`);
      reject(new ConversionError("conversion_failed", `yt-dlp exited with code ${code}`));
    });
  });
}

async function findOutputFile(jobDir: string): Promise<string> {
  const entries = await readdir(jobDir);
  const output = entries.find((name) => !name.endsWith(".part") && !name.endsWith(".ytdl"));
  if (!output) {
    throw new ConversionError("conversion_failed", "yt-dlp produced no output file");
  }
  return path.join(jobDir, output);
}

export async function requestConversion(
  canonicalUrl: string,
  format: MediaFormat,
  quality: MediaQuality,
): Promise<ConversionResult> {
  if (!tryAcquire()) {
    throw new ConversionError("conversion_unavailable", "Too many conversions in progress");
  }

  let jobDir: string | null = null;
  try {
    jobDir = await makeJobDir();
    const outTemplate = path.join(jobDir, "%(title)s.%(ext)s");
    await runYtDlp(buildArgs(canonicalUrl, format, quality, outTemplate));

    const filePath = await findOutputFile(jobDir);
    const filename = path.basename(filePath);
    const jobId = registerJob(jobDir, filePath, filename);
    return { jobId, filename };
  } catch (err) {
    if (jobDir) await removeJobDir(jobDir);
    throw err;
  } finally {
    release();
  }
}
