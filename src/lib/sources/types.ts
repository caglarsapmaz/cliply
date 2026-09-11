import type { MediaFormat, MediaQuality, VideoMetadata } from "@/types";

export type SourceErrorCode =
  | "invalid_url"
  | "unsupported_source"
  | "video_unavailable"
  | "private_video";

export class SourceError extends Error {
  constructor(
    public code: SourceErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "SourceError";
  }
}

export interface ParsedSourceUrl {
  externalId: string;
  canonicalUrl: string;
}

/**
 * One media platform Cliply knows how to handle. Every step — matching a
 * pasted URL, pulling metadata, listing the formats/qualities it can
 * actually produce — is isolated here so a new source is additive, not a
 * rewrite of the request flow.
 */
export interface MediaSource {
  id: string;
  displayName: string;
  matches(url: URL): boolean;
  parseUrl(url: URL): ParsedSourceUrl;
  fetchMetadata(parsed: ParsedSourceUrl): Promise<VideoMetadata>;
  supportedFormats: MediaFormat[];
  qualitiesFor(format: MediaFormat): MediaQuality[];
}
