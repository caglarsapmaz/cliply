import { env } from "@/lib/env";
import { fetchWithTimeout } from "@/lib/fetch-with-timeout";
import type { MediaFormat, MediaQuality, VideoMetadata } from "@/types";
import { SourceError, type MediaSource, type ParsedSourceUrl } from "./types";

const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;
const HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "music.youtube.com",
  "youtu.be",
]);

function extractVideoId(url: URL): string | null {
  const host = url.hostname.toLowerCase();
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id && VIDEO_ID_RE.test(id) ? id : null;
  }
  if (!HOSTS.has(host)) return null;

  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v");
    return id && VIDEO_ID_RE.test(id) ? id : null;
  }
  const shortsMatch = url.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1]!;

  const embedMatch = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1]!;

  return null;
}

/** PT#H#M#S -> seconds. Returns null for anything malformed rather than throwing. */
function parseIso8601Duration(value: string): number | null {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  if (!match) return null;
  const [, h, m, s] = match;
  const hours = h ? parseInt(h, 10) : 0;
  const minutes = m ? parseInt(m, 10) : 0;
  const seconds = s ? parseInt(s, 10) : 0;
  return hours * 3600 + minutes * 60 + seconds;
}

interface YoutubeDataApiVideo {
  snippet?: {
    title?: string;
    thumbnails?: Record<string, { url?: string }>;
  };
  contentDetails?: { duration?: string };
  status?: { privacyStatus?: string };
}

async function fetchViaDataApi(
  videoId: string,
  canonicalUrl: string,
): Promise<VideoMetadata> {
  const endpoint = new URL("https://www.googleapis.com/youtube/v3/videos");
  endpoint.searchParams.set("part", "snippet,contentDetails,status");
  endpoint.searchParams.set("id", videoId);
  endpoint.searchParams.set("key", env.YOUTUBE_API_KEY!);

  const res = await fetchWithTimeout(endpoint);
  if (!res.ok) {
    throw new SourceError("video_unavailable", "YouTube Data API request failed");
  }
  const body = (await res.json()) as { items?: YoutubeDataApiVideo[] };
  const item = body.items?.[0];
  if (!item) {
    throw new SourceError("video_unavailable", "Video not found");
  }
  if (item.status?.privacyStatus === "private") {
    throw new SourceError("private_video", "Video is private");
  }

  const thumbnails = item.snippet?.thumbnails ?? {};
  const thumbnailUrl =
    thumbnails.maxres?.url ??
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.default?.url ??
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return {
    sourceId: "youtube",
    externalId: videoId,
    title: item.snippet?.title ?? "Untitled",
    thumbnailUrl,
    durationSeconds: item.contentDetails?.duration
      ? parseIso8601Duration(item.contentDetails.duration)
      : null,
    canonicalUrl,
  };
}

async function fetchViaOembed(
  videoId: string,
  canonicalUrl: string,
): Promise<VideoMetadata> {
  const endpoint = new URL("https://www.youtube.com/oembed");
  endpoint.searchParams.set("url", canonicalUrl);
  endpoint.searchParams.set("format", "json");

  const res = await fetchWithTimeout(endpoint);
  if (res.status === 404 || res.status === 401) {
    throw new SourceError("video_unavailable", "Video not found or unavailable");
  }
  if (!res.ok) {
    throw new SourceError("video_unavailable", "Could not load video metadata");
  }
  const body = (await res.json()) as { title?: string; thumbnail_url?: string };

  return {
    sourceId: "youtube",
    externalId: videoId,
    title: body.title ?? "Untitled",
    thumbnailUrl: body.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    durationSeconds: null,
    canonicalUrl,
  };
}

const MP3_QUALITIES: MediaQuality[] = ["auto", "128", "192", "320"];
const MP4_QUALITIES: MediaQuality[] = ["auto", "360", "480", "720", "1080"];

export const youtubeSource: MediaSource = {
  id: "youtube",
  displayName: "YouTube",
  supportedFormats: ["mp3", "mp4"] satisfies MediaFormat[],

  matches(url) {
    return HOSTS.has(url.hostname.toLowerCase());
  },

  parseUrl(url) {
    const externalId = extractVideoId(url);
    if (!externalId) {
      throw new SourceError("invalid_url", "Could not find a video in that URL");
    }
    return {
      externalId,
      // Rebuilt from the extracted ID, never the raw user string — this is
      // the only URL that ever gets handed to oEmbed/the Data API/Cobalt.
      canonicalUrl: `https://www.youtube.com/watch?v=${externalId}`,
    };
  },

  async fetchMetadata(parsed: ParsedSourceUrl) {
    if (env.YOUTUBE_API_KEY) {
      try {
        return await fetchViaDataApi(parsed.externalId, parsed.canonicalUrl);
      } catch (err) {
        if (err instanceof SourceError) throw err;
        // Data API hiccup (quota, network) — fall through to oEmbed rather
        // than failing a request we could still serve.
      }
    }
    return fetchViaOembed(parsed.externalId, parsed.canonicalUrl);
  },

  qualitiesFor(format) {
    return format === "mp3" ? MP3_QUALITIES : MP4_QUALITIES;
  },
};
