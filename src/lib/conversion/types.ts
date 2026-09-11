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
  /** Short-lived, single-use tunnel URL served by the conversion engine. */
  streamUrl: string;
  filename: string;
}
