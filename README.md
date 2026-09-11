# Cliply

A free, ad-free media downloader & converter. No ads, no accounts — paste a link, pick a format, get your file.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — custom retro/paper/brutalist design system, no component library, no glassmorphism
- **next-themes** for System/Light/Dark
- A hand-rolled i18n layer (EN/TR, English by default) — no i18n framework needed for two languages
- **zod** for env and request validation
- **Upstash Redis + `@upstash/ratelimit`** for rate limiting, with an in-memory fallback for local dev
- All API routes run on the **Edge runtime** — no Node-only APIs, fast cold starts, real streaming

## Architecture

Cliply never runs `yt-dlp`/`ffmpeg` itself. That's exactly the kind of long-running, CPU-heavy,
native-binary work that doesn't fit Vercel's serverless model — so extraction and conversion are
delegated to a [Cobalt](https://github.com/imputnet/cobalt) instance, an open-source media
processing API you either self-host (one Docker container) or point at a trusted public instance
from [instances.cobalt.best](https://instances.cobalt.best).

```
Source (src/lib/sources)        →  matches a URL, extracts an id, fetches metadata
  └── youtube.ts                   (YouTube Data API v3 if configured, oEmbed fallback)
Conversion (src/lib/conversion) →  hands the canonicalized URL + format/quality to Cobalt
  └── cobalt-client.ts             gets back a short-lived, single-use tunnel URL
API routes (src/app/api)        →  /api/metadata, /api/prepare, /api/stream
  └── /api/stream                  proxy-streams the tunnel URL straight to the browser —
                                    nothing is ever buffered or written to disk
```

Adding a new source (platform) means implementing the `MediaSource` interface in
`src/lib/sources` and registering it in `src/lib/sources/registry.ts` — nothing else in the
request flow changes. New formats/qualities follow the same pattern in the source's
`qualitiesFor()`.

**Without `COBALT_API_URL` set, `/api/prepare` returns a clear `conversion_unavailable` error
instead of faking a result.** Metadata lookup (thumbnail/title) still works out of the box via
YouTube's public oEmbed endpoint.

## Local development

```bash
npm install
cp .env.example .env
npm run dev
```

The app runs at `http://localhost:3000`. Metadata lookup works immediately; downloads require
`COBALT_API_URL` (see `.env.example`).

## Environment variables

See `.env.example` for the full list and where to get each one. Everything is optional except
that downloads won't work without `COBALT_API_URL`:

| Variable | Required | Purpose |
|---|---|---|
| `COBALT_API_URL` | for downloads | Your Cobalt instance |
| `COBALT_API_KEY` | if your instance needs it | Auth header for Cobalt |
| `YOUTUBE_API_KEY` | no | Adds exact duration to metadata (oEmbed has no duration field) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | recommended in prod | Durable, multi-instance rate limiting |
| `NEXT_PUBLIC_SITE_URL` | recommended in prod | Canonical URL / Open Graph tags |

## Deploying to Vercel

1. Push this repo, import it in Vercel.
2. Set the environment variables above in the Vercel project settings.
3. Deploy. No build config needed — it's a standard Next.js App Router project.

## Rate limiting

`/api/metadata`, `/api/prepare` and `/api/stream` are all rate-limited per IP
(`src/lib/rate-limit.ts`). With Upstash configured, limits are enforced globally across every
serverless instance via a sliding-window counter in Redis. Without it, Cliply falls back to an
in-memory counter that only protects a single running instance — fine for local dev, a
reasonable-but-imperfect safety net for a single-region production deployment.

## Privacy

- No accounts, no server-side download history.
- `/api/stream` proxy-streams bytes straight through; nothing is ever written to disk, so
  there's no temp file to clean up.
- The raw URL a user pastes is never forwarded anywhere — every source reconstructs a
  canonical URL from the extracted video id before it's used for metadata lookup or
  conversion, and `/api/stream` only ever proxies back to the origin of the configured
  Cobalt instance (never an arbitrary host).
- No Google Analytics or ad-tech trackers.

## Known limitations (V1)

- Only YouTube is supported as a source; the architecture is built to add more without
  touching the request flow (see Architecture above).
- No download history — even local (`localStorage`) history was deliberately left out of V1
  to keep the flow simple, as the spec allows.
- `Cobalt`'s API has evolved across versions; `src/lib/conversion/cobalt-client.ts` is written
  against its documented v10+ processing API. If responses stop parsing, check your instance's
  version against that first.
- The in-memory rate-limit fallback (used when Upstash isn't configured) doesn't share state
  across serverless instances — configure Upstash for real production traffic.
