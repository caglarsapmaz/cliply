/** Strips control chars and filesystem/header-reserved characters from a Content-Disposition filename. */
export function sanitizeFilename(raw: string, fallbackBase: string, extension: string): string {
  const cleaned = raw
    .normalize("NFKC")
    .replace(/[\x00-\x1f\x7f\\/:*?"<>|]/g, "")
    .trim()
    .slice(0, 100);

  const base = cleaned.length > 0 ? cleaned : fallbackBase;
  const hasExtension = base.toLowerCase().endsWith(`.${extension}`);
  return hasExtension ? base : `${base}.${extension}`;
}
