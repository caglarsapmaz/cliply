# Cliply — Ücretsiz Medya İndirici & Dönüştürücü

> **Yapıştır. Seç. İndir.**

Next.js ile geliştirilmiş, reklamsız ve hesap gerektirmeyen bir medya indirme/dönüştürme aracı. Bir video linki yapıştırın, formatı seçin, dosyanızı alın.

<p align="left">
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Edge_Runtime-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Edge Runtime" />
</p>

---
<img width="1920" height="887" alt="image" src="https://github.com/user-attachments/assets/27acc38e-8a9c-480d-95c6-e08f1cf279d5" />

## 📖 Proje Hakkında

**Cliply**, kullanıcıların video linklerini yapıştırarak istedikleri formatta medya dosyası indirmelerini sağlayan, tamamen ücretsiz ve reklamsız bir web uygulamasıdır. Hesap oluşturmaya gerek yoktur, sunucu tarafında indirme geçmişi tutulmaz.

## ✨ Özellikler

- 🌍 **Türkçe + İngilizce** — elle yazılmış hafif bir i18n katmanı (varsayılan İngilizce), iki dil için ayrı bir i18n framework'üne ihtiyaç duymadan
- 🎨 **Retro/paper/brütalist tasarım sistemi** — Tailwind CSS v4 üzerine özel kurulum, hazır component kütüphanesi ya da glassmorphism yok
- 🌙 **Sistem/Açık/Koyu tema** desteği — `next-themes` ile
- ⚡ **Edge Runtime** — tüm API rotaları Node.js API'lerine bağımlı olmadan Edge üzerinde çalışır; hızlı soğuk başlangıç ve gerçek streaming
- 🔐 **Akıllı rate limiting** — Upstash Redis + `@upstash/ratelimit` ile global sliding-window sayaç, yoksa local geliştirme için bellek içi (in-memory) fallback
- ✅ **Zod ile doğrulama** — hem environment değişkenleri hem de gelen istekler şema üzerinden doğrulanır
- 🧩 **Genişletilebilir kaynak mimarisi** — yeni bir platform eklemek `MediaSource` arayüzünü uygulamak ve registry'ye kaydetmekten ibaret
- 🔒 **Gizlilik öncelikli, ücretsiz ve reklamsız** — hesap yok, sunucuda indirme geçmişi yok

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
| Medya işleme | [Cobalt](https://github.com/imputnet/cobalt) — self-hosted ya da güvenilir bir public instance |
| Çalışma ortamı | Tüm API rotaları **Edge runtime** üzerinde |

## 🏗️ Mimari

Cliply, `yt-dlp`/`ffmpeg` gibi araçları kendi içinde **hiçbir zaman çalıştırmaz.** Bunlar; uzun süren, CPU
yoğun, native binary gerektiren işler olduğu için Vercel'in serverless modeline uymaz. Bu yüzden
çıkarma (extraction) ve dönüştürme işlemleri, açık kaynaklı bir medya işleme API'si olan
[Cobalt](https://github.com/imputnet/cobalt)'a devredilir — tek bir Docker container ile
self-host edebilir ya da [instances.cobalt.best](https://instances.cobalt.best) üzerinden
güvenilir bir public instance kullanabilirsiniz.

```
Kaynak (src/lib/sources)         →  URL'yi eşler, id çıkarır, metadata getirir
  └── youtube.ts                    (varsa YouTube Data API v3, yoksa oEmbed fallback)
Dönüştürme (src/lib/conversion)  →  kanonik URL + format/kalite bilgisini Cobalt'a iletir
  └── cobalt-client.ts              kısa ömürlü, tek kullanımlık bir tünel URL'i döner
API rotaları (src/app/api)       →  /api/metadata, /api/prepare, /api/stream
  └── /api/stream                   tünel URL'ini doğrudan tarayıcıya proxy-stream eder —
                                     hiçbir şey diske yazılmaz ya da buffer'lanmaz
```

Yeni bir kaynak (platform) eklemek, `src/lib/sources` içinde `MediaSource` arayüzünü uygulayıp
`src/lib/sources/registry.ts` dosyasına kaydetmekten ibarettir — istek akışındaki başka hiçbir şey
değişmez. Yeni format/kaliteler de kaynağın `qualitiesFor()` fonksiyonunda aynı desenle eklenir.

**`COBALT_API_URL` ayarlanmadığında `/api/prepare`, sahte bir sonuç döndürmek yerine net bir
`conversion_unavailable` hatası döner.** Metadata sorgusu (thumbnail/başlık) ise YouTube'un public
oEmbed endpoint'i sayesinde kutudan çıktığı gibi çalışır.

## 🚀 Kurulum

```bash
# Bağımlılıkları yükleyin
npm install

# Ortam değişkenlerini kopyalayın
cp .env.example .env

# Yerel olarak çalıştırın
npm run dev        # http://localhost:3000
```

Metadata sorgusu hiçbir ek ayar yapmadan çalışır; indirmeler için `COBALT_API_URL` gereklidir
(bkz. `.env.example`).

## ⚙️ Ortam Değişkenleri

Her değişken hakkında detay ve nereden alınacağı için `.env.example` dosyasına bakın. İndirmeler
dışında hepsi opsiyoneldir:

| Değişken | Zorunlu mu? | Amaç |
|---|---|---|
| `COBALT_API_URL` | indirmeler için evet | Kullanılacak Cobalt instance'ı |
| `COBALT_API_KEY` | instance gerektiriyorsa | Cobalt için auth header |
| `YOUTUBE_API_KEY` | hayır | Metadata'ya tam süre (duration) bilgisi ekler (oEmbed'de duration alanı yok) |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | prod için önerilir | Kalıcı, çoklu-instance rate limiting |
| `NEXT_PUBLIC_SITE_URL` | prod için önerilir | Kanonik URL / Open Graph etiketleri |

## ☁️ Vercel'e Deploy

1. Bu repoyu push'layın ve Vercel'de import edin.
2. Yukarıdaki ortam değişkenlerini Vercel proje ayarlarında tanımlayın.
3. Deploy edin — ekstra build config gerekmez, standart bir Next.js App Router projesidir.

## 🛡️ Rate Limiting

`/api/metadata`, `/api/prepare` ve `/api/stream` rotalarının tümü IP başına rate-limit'lidir
(`src/lib/rate-limit.ts`). Upstash yapılandırıldığında limitler, Redis üzerinde sliding-window
sayaç ile tüm serverless instance'lar genelinde uygulanır. Yapılandırılmadığında ise Cliply,
yalnızca tek bir çalışan instance'ı koruyan bellek içi bir sayaca düşer — local geliştirme için
yeterli, tek bölgeli bir production deployment için de makul ama kusursuz olmayan bir güvenlik ağı.

## 🔒 Gizlilik

- Hesap yok, sunucu tarafında indirme geçmişi yok.
- `/api/stream`, byte'ları doğrudan proxy-stream eder; hiçbir şey diske yazılmaz, dolayısıyla
  temizlenmesi gereken bir geçici dosya oluşmaz.
- Kullanıcının yapıştırdığı ham URL hiçbir yere iletilmez — her kaynak, metadata sorgusu ya da
  dönüştürme için kullanılmadan önce çıkarılan video id'sinden kanonik bir URL yeniden oluşturur;
  `/api/stream` da yalnızca yapılandırılmış Cobalt instance'ının origin'ine proxy yapar (asla
  keyfi bir host'a değil).
- Google Analytics ya da reklam teknolojisi izleyicisi yok.

## ⚠️ Bilinen Sınırlamalar (V1)

- Şu an için tek desteklenen kaynak YouTube'dur; mimari, istek akışına dokunmadan yeni kaynaklar
  eklenebilecek şekilde tasarlanmıştır (bkz. Mimari bölümü).
- İndirme geçmişi yoktur — akışı basit tutmak adına `localStorage` tabanlı yerel geçmiş bile
  bilinçli olarak V1'e dahil edilmemiştir.
- Cobalt'ın API'si sürümler arasında değişti; `src/lib/conversion/cobalt-client.ts`, v10+
  dokümante edilmiş processing API'sine göre yazılmıştır. Yanıtlar parse edilmiyorsa öncelikle
  instance'ınızın sürümünü buna göre kontrol edin.
- Upstash yapılandırılmadığında kullanılan bellek içi rate-limit fallback'i, serverless
  instance'lar arasında state paylaşmaz — gerçek production trafiği için Upstash'i yapılandırın.
