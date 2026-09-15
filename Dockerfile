# ---- build ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---- runtime ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# python3 runs the yt-dlp script; ffmpeg does the actual muxing/encoding;
# ca-certificates so yt-dlp's own HTTPS requests to YouTube verify correctly.
# curl is only needed to fetch the yt-dlp binary, then removed.
RUN apk add --no-cache python3 ffmpeg ca-certificates curl \
  && curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp \
  && chmod a+rx /usr/local/bin/yt-dlp \
  && apk del curl

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER app

ENV PORT=3000
# Required so the standalone server binds to all interfaces, not just
# localhost — without this Render can't reach the container.
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
