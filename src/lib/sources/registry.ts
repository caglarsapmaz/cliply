import { youtubeSource } from "./youtube";
import type { MediaSource } from "./types";

/** Every source Cliply supports. Adding a platform means adding one entry here. */
export const sources: MediaSource[] = [youtubeSource];

export function resolveSource(url: URL): MediaSource | null {
  return sources.find((source) => source.matches(url)) ?? null;
}
