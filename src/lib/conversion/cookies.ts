import { writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { env } from "@/lib/env";

/**
 * YTDLP_COOKIES (optional) holds the full contents of a Netscape-format
 * cookies.txt from a dedicated YouTube account, used only because requests
 * from Render's shared IPs otherwise get YouTube's "Sign in to confirm
 * you're not a bot" error. Never committed to the repo — set as a Render
 * secret env var and written to a local file once at startup so yt-dlp's
 * --cookies flag can read it.
 */
export const cookiesFilePath: string | null = (() => {
  if (!env.YTDLP_COOKIES) return null;
  const filePath = path.join(tmpdir(), "cliply-youtube-cookies.txt");
  writeFileSync(filePath, env.YTDLP_COOKIES, { mode: 0o600 });
  return filePath;
})();
