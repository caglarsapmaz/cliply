import { randomUUID } from "node:crypto";
import { removeJobDir } from "./tmp";

interface Job {
  jobDir: string;
  filePath: string;
  filename: string;
  expiresAt: number;
}

/**
 * Maps an opaque, single-use jobId (handed to the browser in the download
 * URL) to the real temp-file path on this instance. In-memory only — fine
 * because Render's free plan runs a single instance; a multi-instance
 * deployment would need this in Redis instead.
 */
const jobs = new Map<string, Job>();

const JOB_TTL_MS = 5 * 60 * 1000;

let sweeper: NodeJS.Timeout | null = null;
function ensureSweeper() {
  if (sweeper) return;
  sweeper = setInterval(() => {
    const now = Date.now();
    for (const [id, job] of jobs) {
      if (job.expiresAt < now) {
        jobs.delete(id);
        void removeJobDir(job.jobDir);
      }
    }
  }, 60_000);
  sweeper.unref();
}

export function registerJob(jobDir: string, filePath: string, filename: string): string {
  ensureSweeper();
  const id = randomUUID();
  jobs.set(id, { jobDir, filePath, filename, expiresAt: Date.now() + JOB_TTL_MS });
  return id;
}

/** Looks up and removes a job in one step — a jobId is single-use. */
export function consumeJob(id: string): Job | null {
  const job = jobs.get(id);
  if (!job) return null;
  jobs.delete(id);
  return job;
}
