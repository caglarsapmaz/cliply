export type ConversionErrorCode = "conversion_failed" | "conversion_unavailable";

export class ConversionError extends Error {
  constructor(
    public code: ConversionErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "ConversionError";
  }
}

export interface ConversionResult {
  /** Opaque, single-use id for the completed temp file — see job-store.ts. */
  jobId: string;
  filename: string;
}
