import { tmpdir } from "node:os";
import path from "node:path";
import { mkdtemp, readdir, rm, stat } from "node:fs/promises";

export const JOB_PREFIX = "cliply-";

/** One fresh directory per conversion job — lets us `rm -rf` the whole thing on cleanup. */
export function makeJobDir(): Promise<string> {
  return mkdtemp(path.join(tmpdir(), JOB_PREFIX));
}

export function removeJobDir(jobDir: string): Promise<void> {
  return rm(jobDir, { recursive: true, force: true });
}

const STALE_MS = 30 * 60 * 1000;

/**
 * Safety net for job dirs a crashed process never got to clean up.
 * Anything older than STALE_MS is assumed abandoned.
 */
export async function sweepStaleJobDirs(): Promise<void> {
  let entries: string[];
  try {
    entries = await readdir(tmpdir());
  } catch {
    return;
  }
  const now = Date.now();
  await Promise.all(
    entries
      .filter((name) => name.startsWith(JOB_PREFIX))
      .map(async (name) => {
        const full = path.join(tmpdir(), name);
        try {
          const info = await stat(full);
          if (now - info.mtimeMs > STALE_MS) {
            await rm(full, { recursive: true, force: true });
          }
        } catch {
          // already gone — fine
        }
      }),
  );
}
