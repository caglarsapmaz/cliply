# Cliply

A free, ad-free media downloader & converter. No ads, no accounts — paste a link, pick a format, get your file.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — custom retro/paper/brutalist design system, no component library, no glassmorphism
- **next-themes** for System/Light/Dark
- A hand-rolled i18n layer (EN/TR, English by default) — no i18n framework needed for two languages
- **zod** for env and request validation
- **Upstash Redis + `@upstash/ratelimit`** for rate limiting, with an in-memory fallback for local dev
- API routes run on the **Node.js runtime** (required for `yt-dlp`/`ffmpeg` child processes)

## Architecture

Cliply runs `yt-dlp` (with `ffmpeg` on `PATH` for muxing/encoding) directly, as a child process,
inside its own container — no external conversion API. That's why it deploys as a Docker web
service (see below) instead of to a serverless/Edge platform: native binaries and long-running
child processes don't fit that model.

```
Source (src/lib/sources)        →  matches a URL, extracts an id, fetches metadata
  └── youtube.ts                   (YouTube Data API v3 if configured, oEmbed fallback)
Conversion (src/lib/conversion) →  spawns yt-dlp for the canonicalized URL + format/quality
  └── ytdlp-client.ts              writes to a per-job temp dir, registers it in job-store.ts
  └── job-store.ts                 opaque single-use jobId → temp file path, in-memory, TTL'd
  └── concurrency.ts               caps how many yt-dlp jobs run at once (MAX_CONCURRENT_JOBS)
API routes (src/app/api)        →  /api/metadata, /api/prepare, /api/stream, /api/health
  └── /api/prepare                 runs the yt-dlp job, returns a downloadUrl carrying the jobId
  └── /api/stream                  streams the temp file to the browser, then deletes it —
                                    nothing is ever left on disk after a request completes
```

Adding a new source (platform) means implementing the `MediaSource` interface in
`src/lib/sources` and registering it in `src/lib/sources/registry.ts` — nothing else in the
request flow changes. New formats/qualities follow the same pattern in the source's
`qualitiesFor()`.

Video is never re-encoded — the format selector pins an h264 (avc1) source stream and only
remuxes/muxes it, which is cheap on a small instance. Only MP3 extraction does real (but
audio-only, lightweight) encoding.

## Local development

Requires `yt-dlp` and `ffmpeg` on your `PATH` (`brew install yt-dlp ffmpeg` on macOS), since
`/api/prepare` spawns them directly — there's no bundled fallback for local dev the way there
was with a hosted conversion API.

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:3000`.

## Environment variables

See `.env.example` for the full list and where to get each one. Everything is optional:

| Variable | Required | Purpose |
|---|---|---|
| `MAX_CONCURRENT_JOBS` | no (default 2) | Caps concurrent yt-dlp conversions on this instance |
| `YTDLP_TIMEOUT_MS` | no (default 120000) | Kills a stuck yt-dlp process after this long |
| `YOUTUBE_API_KEY` | no | Adds exact duration to metadata (oEmbed has no duration field) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | recommended in prod | Durable, multi-instance rate limiting |
| `NEXT_PUBLIC_SITE_URL` | recommended in prod | Canonical URL / Open Graph tags |

## Deploying to Render

Ships as a Docker web service (`Dockerfile` + `render.yaml`), free tier, no VPS management:

1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, point it at the repo — it reads `render.yaml` and creates the
   `cliply` web service (Docker runtime, free plan, health check on `/api/health`).
   - Or manually: **New → Web Service** → connect the repo → Environment: **Docker** → Instance
     type: **Free** → deploy.
3. Set the environment variables from the table above in the Render dashboard (the ones marked
   `sync: false` in `render.yaml` aren't filled in automatically).
4. Deploy. Render builds the `Dockerfile` (installs `yt-dlp` + `ffmpeg` into the image) and runs it.

**Free tier notes:** the instance spins down after 15 minutes idle (next request pays a cold-start
penalty), and RAM/CPU are limited — `MAX_CONCURRENT_JOBS` exists specifically to keep the box from
falling over under concurrent conversions. See the project's own notes on this tradeoff before
relying on it for real traffic.

## Rate limiting

`/api/metadata`, `/api/prepare` and `/api/stream` are all rate-limited per IP
(`src/lib/rate-limit.ts`). With Upstash configured, limits are enforced globally across every
serverless instance via a sliding-window counter in Redis. Without it, Cliply falls back to an
in-memory counter that only protects a single running instance — fine for local dev, a
reasonable-but-imperfect safety net for a single-region production deployment.

## Privacy

- No accounts, no server-side download history.
- `/api/prepare` writes the converted file to a per-job temp directory; `/api/stream` streams
  it straight through and deletes the directory as soon as the request ends (success, error, or
  client disconnect). A startup sweep also removes any job directory left behind by a crash.
- The raw URL a user pastes is never forwarded anywhere — every source reconstructs a
  canonical URL from the extracted video id before it's used for metadata lookup or conversion.
- No Google Analytics or ad-tech trackers.

## Known limitations (V1)

- Only YouTube is supported as a source; the architecture is built to add more without
  touching the request flow (see Architecture above).
- No download history — even local (`localStorage`) history was deliberately left out of V1
  to keep the flow simple, as the spec allows.
- The job registry, concurrency cap, and in-memory rate-limit fallback are all per-instance —
  fine for Render's free single-instance plan, but a multi-instance deployment would need the
  job registry moved into Redis (Upstash is already a dependency for rate limiting).
- yt-dlp needs periodic updates to keep working as YouTube changes — rebuild/redeploy the image
  regularly (or add a scheduled job) to pick up new yt-dlp releases.
