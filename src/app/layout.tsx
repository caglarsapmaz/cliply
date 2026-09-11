import type { Metadata, Viewport } from "next";
import { Archivo_Black, Inter } from "next/font/google";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { siteUrl } from "@/lib/env";
import { Providers } from "./providers";
import "./globals.css";

const heading = Archivo_Black({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Cliply — Media Downloader & Converter",
  description:
    "A free, ad-free media downloader and converter. No ads. No accounts. Just downloads.",
  keywords: ["media downloader", "youtube to mp3", "youtube to mp4", "video converter", "cliply"],
  authors: [{ name: "Çağlar Sapmaz", url: "https://github.com/caglarsapmaz" }],
  openGraph: {
    title: "Cliply — Media Downloader & Converter",
    description:
      "A free, ad-free media downloader and converter. No ads. No accounts. Just downloads.",
    url: siteUrl,
    siteName: "Cliply",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cliply — Media Downloader & Converter",
    description:
      "A free, ad-free media downloader and converter. No ads. No accounts. Just downloads.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4efe2" },
    { media: "(prefers-color-scheme: dark)", color: "#17140f" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${heading.variable} ${body.variable}`}>
      <body className="grain flex min-h-screen flex-col font-sans antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:border-2 focus:border-ink focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-ink"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main" className="flex flex-1 flex-col">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
