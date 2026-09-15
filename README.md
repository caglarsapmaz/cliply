# Cliply — Ücretsiz Medya İndirici & Dönüştürücü

> **Yapıştır. Seç. İndir.**

Next.js ile geliştirilmiş, reklamsız ve hesap gerektirmeyen bir medya indirme/dönüştürme aracı. Bir video linki yapıştırın, formatı seçin, dosyanızı alın.

<p align="left">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=black" alt="Render" />
</p>

---
<img width="1920" height="887" alt="image" src="https://github.com/user-attachments/assets/27acc38e-8a9c-480d-95c6-e08f1cf279d5" />

## 📖 Proje Hakkında

**Cliply**, kullanıcıların video linklerini yapıştırarak istedikleri formatta medya dosyası indirmelerini sağlayan, tamamen ücretsiz ve reklamsız bir web uygulamasıdır. Hesap oluşturmaya gerek yoktur, sunucu tarafında indirme geçmişi tutulmaz.

## ✨ Özellikler

- 🌍 **Türkçe + İngilizce** — elle yazılmış hafif bir i18n katmanı (varsayılan İngilizce), iki dil için ayrı bir i18n framework'üne ihtiyaç duymadan
- 🎨 **Retro/paper/brütalist tasarım sistemi** — Tailwind CSS v4 üzerine özel kurulum, hazır component kütüphanesi ya da glassmorphism yok
- 🌙 **Sistem/Açık/Koyu tema** desteği — `next-themes` ile
- 🎬 **Kendi içinde `yt-dlp` + `ffmpeg`** — indirme/dönüştürme dış bir servise bağımlı değil, Docker image'ına gömülü
- 🔐 **Akıllı rate limiting** — Upstash Redis + `@upstash/ratelimit` ile global sliding-window sayaç, yoksa local geliştirme için bellek içi (in-memory) fallback
- ✅ **Zod ile doğrulama** — hem environment değişkenleri hem de gelen istekler şema üzerinden doğrulanır
- 🧩 **Genişletilebilir kaynak mimarisi** — yeni bir platform eklemek `MediaSource` arayüzünü uygulamak ve registry'ye kaydetmekten ibaret
- 🔒 **Gizlilik öncelikli, ücretsiz ve reklamsız** — hesap yok, sunucuda indirme geçmişi yok, geçici dosyalar iş bitince silinir

## 🛠️ Kullanılan Teknolojiler

| Katman | Tercih |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 |
| Dil | TypeScript (strict) |
| Stil | Tailwind CSS v4 — özel retro/paper/brütalist tasarım sistemi |
| Tema | `next-themes` (Sistem/Açık/Koyu) |
| i18n | Hazır bir framework yerine elle yazılmış hafif i18n katmanı (EN/TR) |
| Doğrulama | `zod` (env + request validation) |
| Rate limiting | Upstash Redis + `@upstash/ratelimit`, in-memory fallback ile |
| Medya işleme | `yt-dlp` + `ffmpeg` — süreç içinde (in-process), child process olarak |
| Çalışma ortamı | Node.js runtime, Docker container, Render'da deploy |

## 🏗️ Mimari

Cliply, `yt-dlp`'yi (muxing/encoding için `PATH`'teki `ffmpeg` ile birlikte) kendi container'ı
içinde doğrudan bir child process olarak çalıştırır — harici bir dönüştürme API'sine bağımlılık
yoktur. Native binary'ler ve uzun süren child process'ler serverless/Edge modeline uymadığı için
uygulama bir Docker web servisi olarak deploy edilir (bkz. aşağıdaki Render bölümü).

```
Kaynak (src/lib/sources)         →  URL'yi eşler, id çıkarır, metadata getirir
  └── youtube.ts                    (varsa YouTube Data API v3, yoksa oEmbed fallback)
Dönüştürme (src/lib/conversion)  →  kanonik URL + format/kalite için yt-dlp'yi çalıştırır
  └── ytdlp-client.ts               job'a özel geçici dizine yazar, job-store.ts'e kaydeder
  └── job-store.ts                  tek kullanımlık jobId → geçici dosya yolu, bellekte, TTL'li
  └── concurrency.ts                aynı anda kaç yt-dlp job'ı çalışabileceğini sınırlar (MAX_CONCURRENT_JOBS)
API rotaları (src/app/api)       →  /api/metadata, /api/prepare, /api/stream, /api/health
  └── /api/prepare                  yt-dlp job'ını çalıştırır, jobId taşıyan bir downloadUrl döner
  └── /api/stream                   geçici dosyayı tarayıcıya stream eder, sonra siler —
                                     istek tamamlandığında diskte hiçbir şey kalmaz
```

Yeni bir kaynak (platform) eklemek, `src/lib/sources` içinde `MediaSource` arayüzünü uygulayıp
`src/lib/sources/registry.ts` dosyasına kaydetmekten ibarettir — istek akışındaki başka hiçbir şey
değişmez. Yeni format/kaliteler de kaynağın `qualitiesFor()` fonksiyonunda aynı desenle eklenir.

Video hiçbir zaman yeniden encode edilmez — format selector h264 (avc1) kaynak stream'i sabitler
ve yalnızca remux/mux yapar, bu da küçük bir instance için ucuzdur. Sadece MP3 çıkarımı gerçek
(ama audio-only, hafif) bir encode işlemi yapar.

## 🚀 Kurulum

Yerelde `PATH`'inizde `yt-dlp` ve `ffmpeg` gerektirir (macOS'ta `brew install yt-dlp ffmpeg`),
çünkü `/api/prepare` bunları doğrudan çalıştırır — hosted bir dönüştürme API'sinde olduğu gibi
bundle edilmiş bir fallback yoktur.

```bash
# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini kopyalayın
cp .env.example .env

# Yerel olarak çalıştırın
npm run dev        # http://localhost:3000
```

## ⚙️ Ortam Değişkenleri

Her değişken hakkında detay ve nereden alınacağı için `.env.example` dosyasına bakın. Hepsi
opsiyoneldir:

| Değişken | Zorunlu mu? | Amaç |
|---|---|---|
| `MAX_CONCURRENT_JOBS` | hayır (varsayılan 2) | Bu instance'ta aynı anda çalışabilecek yt-dlp dönüştürme sayısını sınırlar |
| `YTDLP_TIMEOUT_MS` | hayır (varsayılan 120000) | Takılı kalan bir yt-dlp sürecini bu süre sonunda sonlandırır |
| `YOUTUBE_API_KEY` | hayır | Metadata'ya tam süre (duration) bilgisi ekler (oEmbed'de duration alanı yok) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | prod için önerilir | Kalıcı, çoklu-instance rate limiting |
| `NEXT_PUBLIC_SITE_URL` | prod için önerilir | Kanonik URL / Open Graph etiketleri |

## ☁️ Render'a Deploy

Docker web servisi olarak deploy edilir (`Dockerfile` + `render.yaml`), ücretsiz tier, VPS/sunucu
yönetimi yok:

1. Bu repoyu GitHub'a push'layın.
2. Render'da: **New → Blueprint**, repoyu seçin — `render.yaml`'ı okuyup `cliply` web servisini
   oluşturur (Docker runtime, ücretsiz plan, `/api/health` üzerinden health check).
   - Ya da manuel: **New → Web Service** → repoyu bağlayın → Environment: **Docker** → Instance
     type: **Free** → deploy edin.
3. Yukarıdaki tablodaki ortam değişkenlerini Render dashboard'unda tanımlayın (`render.yaml`
   içinde `sync: false` olarak işaretlenenler otomatik doldurulmaz).
4. Deploy edin. Render `Dockerfile`'ı build eder (image'a `yt-dlp` + `ffmpeg` kurar) ve çalıştırır.

**Ücretsiz tier notları:** instance 15 dakika hareketsizlikten sonra uykuya geçer (sonraki istek
bir soğuk başlangıç bedeli öder), RAM/CPU sınırlıdır — `MAX_CONCURRENT_JOBS` tam olarak eşzamanlı
dönüştürmeler altında instance'ın çökmesini önlemek için var. Gerçek trafik için buna güvenmeden
önce projenin kendi notlarına (Bilinen Sınırlamalar) bakın.

## 🛡️ Rate Limiting

`/api/metadata`, `/api/prepare` ve `/api/stream` rotalarının tümü IP başına rate-limit'lidir
(`src/lib/rate-limit.ts`). Upstash yapılandırıldığında limitler, Redis üzerinde sliding-window
sayaç ile tüm serverless instance'lar genelinde uygulanır. Yapılandırılmadığında ise Cliply,
yalnızca tek bir çalışan instance'ı koruyan bellek içi bir sayaca düşer — local geliştirme için
yeterli, tek bölgeli bir production deployment için de makul ama kusursuz olmayan bir güvenlik ağı.

## 🔒 Gizlilik

- Hesap yok, sunucu tarafında indirme geçmişi yok.
- `/api/prepare`, dönüştürülen dosyayı job'a özel bir geçici dizine yazar; `/api/stream` bunu
  doğrudan tarayıcıya stream eder ve istek bittiğinde (başarı, hata ya da bağlantının kopması
  fark etmeksizin) dizini hemen siler. Bir çökme sonrası geride kalabilecek dizinler için
  başlangıçta ayrıca bir temizlik taraması da çalışır.
- Kullanıcının yapıştırdığı ham URL hiçbir yere iletilmez — her kaynak, metadata sorgusu ya da
  dönüştürme için kullanılmadan önce çıkarılan video id'sinden kanonik bir URL yeniden oluşturur.
- Google Analytics ya da reklam teknolojisi izleyicisi yok.

## ⚠️ Bilinen Sınırlamalar (V1)

- Şu an için tek desteklenen kaynak YouTube'dur; mimari, istek akışına dokunmadan yeni kaynaklar
  eklenebilecek şekilde tasarlanmıştır (bkz. Mimari bölümü).
- İndirme geçmişi yoktur — akışı basit tutmak adına `localStorage` tabanlı yerel geçmiş bile
  bilinçli olarak V1'e dahil edilmemiştir.
- Job registry, concurrency sınırı ve bellek içi rate-limit fallback'i instance başınadır —
  Render'ın ücretsiz tek-instance planı için sorun değil, ama çoklu-instance bir deployment için
  job registry'nin Redis'e taşınması gerekir (Upstash zaten rate limiting için bir bağımlılık).
- YouTube değiştikçe çalışmaya devam etmesi için yt-dlp'nin düzenli güncellenmesi gerekir —
  yeni yt-dlp sürümlerini almak için image'ı düzenli olarak rebuild/redeploy edin (ya da
  zamanlanmış bir job ekleyin).
