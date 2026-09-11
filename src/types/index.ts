export type MediaFormat = "mp3" | "mp4";

export type Mp3Quality = "auto" | "128" | "192" | "320";
export type Mp4Quality = "auto" | "360" | "480" | "720" | "1080";
export type MediaQuality = Mp3Quality | Mp4Quality;

export interface VideoMetadata {
  sourceId: string;
  externalId: string;
  title: string;
  thumbnailUrl: string;
  durationSeconds: number | null;
  canonicalUrl: string;
}

export type ApiErrorCode =
  | "invalid_url"
  | "unsupported_source"
  | "video_unavailable"
  | "private_video"
  | "conversion_failed"
  | "conversion_unavailable"
  | "rate_limited"
  | "service_unavailable"
  | "download_failed"
  | "invalid_request";

export interface ApiErrorBody {
  error: ApiErrorCode;
  message: string;
}

export interface MetadataResponse {
  metadata: VideoMetadata;
  formats: Record<MediaFormat, MediaQuality[]>;
}

export interface PrepareRequestBody {
  url: string;
  format: MediaFormat;
  quality: MediaQuality;
}

export interface PrepareResponseBody {
  downloadUrl: string;
  filename: string;
}
