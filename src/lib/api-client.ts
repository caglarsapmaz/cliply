import type {
  ApiErrorBody,
  ApiErrorCode,
  MediaFormat,
  MediaQuality,
  MetadataResponse,
  PrepareResponseBody,
} from "@/types";

export class ApiRequestError extends Error {
  constructor(public code: ApiErrorCode) {
    super(code);
    this.name = "ApiRequestError";
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiRequestError("service_unavailable");
  }

  if (!res.ok) {
    let code: ApiErrorCode = "service_unavailable";
    try {
      const parsed = (await res.json()) as ApiErrorBody;
      if (parsed.error) code = parsed.error;
    } catch {
      // keep fallback code
    }
    throw new ApiRequestError(code);
  }

  return (await res.json()) as T;
}

export function fetchMetadata(url: string) {
  return postJson<MetadataResponse>("/api/metadata", { url });
}

export function prepareDownload(url: string, format: MediaFormat, quality: MediaQuality) {
  return postJson<PrepareResponseBody>("/api/prepare", { url, format, quality });
}
