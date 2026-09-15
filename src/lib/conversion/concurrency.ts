import { maxConcurrentJobs } from "@/lib/env";

/**
 * yt-dlp + ffmpeg are real CPU/RAM work running in-process now (no more
 * offloading to a hosted Cobalt instance), so we cap how many run at once
 * instead of letting the box fall over under concurrent requests.
 */
let active = 0;

export function tryAcquire(): boolean {
  if (active >= maxConcurrentJobs) return false;
  active += 1;
  return true;
}

export function release(): void {
  active = Math.max(0, active - 1);
}
