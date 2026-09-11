import type { Dictionary } from "../types";

export const en: Dictionary = {
  meta: {
    title: "Cliply — Media Downloader & Converter",
    description:
      "A free, ad-free media downloader and converter. No ads. No accounts. Just downloads.",
  },
  nav: {
    about: "About",
    github: "GitHub",
    skipToContent: "Skip to content",
  },
  hero: {
    titleLine1: "YOUR LINK.",
    titleLine2: "YOUR FORMAT.",
    titleLine3: "DONE.",
    tagline: "No ads. No accounts. Just downloads.",
    urlLabel: "Media URL",
    urlPlaceholder: "https://youtube.com/...",
    submit: "Download",
    submitting: "Looking it up…",
    pasteHint: "Paste a link to get started",
  },
  badges: {
    free: "FREE",
    noAds: "NO ADS",
    noAccount: "NO ACCOUNT",
    openWeb: "OPEN WEB",
  },
  sources: {
    youtube: "YouTube",
    moreComingSoon: "more coming soon",
  },
  metadata: {
    duration: "Duration",
    unknownDuration: "Unknown",
    source: "Source",
  },
  format: {
    heading: "Format",
    mp3: "MP3",
    mp3Sub: "Audio",
    mp4: "MP4",
    mp4Sub: "Video",
  },
  quality: {
    heading: "Quality",
    auto: "Auto",
    kbps: "kbps",
  },
  actions: {
    download: "Download",
    startOver: "Start over",
    tryAgain: "Try again",
  },
  progress: {
    preparing: "Preparing…",
    fetching: "Fetching media…",
    converting: "Converting…",
    finishing: "Almost there…",
  },
  result: {
    heading: "Ready",
    subheading: "Your file is ready to download.",
    downloadFile: "Download file",
    format: "Format",
    quality: "Quality",
  },
  errors: {
    invalid_url: "That doesn't look like a valid link. Double-check it and try again.",
    unsupported_source: "This source isn't supported yet — check Supported Sources below.",
    video_unavailable: "This video isn't available. It may have been removed.",
    private_video: "This video is private and can't be downloaded.",
    conversion_failed: "Conversion failed. Try a different format or quality.",
    conversion_unavailable: "The conversion service is temporarily unavailable. Try again shortly.",
    rate_limited: "You've hit the request limit. Wait a moment and try again.",
    service_unavailable: "Something's down on our end. Try again in a bit.",
    download_failed: "The download failed partway through. Try again.",
    invalid_request: "That request didn't look right. Try again.",
    generic: "Something went wrong. Try again.",
  },
  footer: {
    tagline: "Made for the open web.",
    copyrightLine: "© {year} Cliply — Made by Çağlar Sapmaz {heart}",
    linkedinLabel: "Çağlar Sapmaz on LinkedIn",
    githubLabel: "Çağlar Sapmaz on GitHub",
    heartLabel: "Made with love",
    legalNotice:
      "Only download content you own or have the right to download. Cliply doesn't host or store any media.",
  },
  about: {
    heading: "About Cliply",
    body: [
      "Cliply is a free, ad-free media downloader and converter. Paste a link, pick a format, get your file — that's it.",
      "No accounts, no tracking, no dark patterns. Files are streamed straight through and nothing is kept on our servers once your download finishes.",
      "It's built as an open utility for the open web, not a growth product. If it's useful, that's the whole point.",
    ],
    backLink: "Back to Cliply",
  },
  theme: {
    system: "System",
    light: "Light",
    dark: "Dark",
    toggleLabel: "Change theme",
  },
  language: {
    switchLabel: "Change language",
  },
};
