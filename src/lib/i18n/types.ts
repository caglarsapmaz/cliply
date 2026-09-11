export interface Dictionary {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    about: string;
    github: string;
    skipToContent: string;
  };
  hero: {
    titleLine1: string;
    titleLine2: string;
    titleLine3: string;
    tagline: string;
    urlLabel: string;
    urlPlaceholder: string;
    submit: string;
    submitting: string;
    pasteHint: string;
  };
  badges: {
    free: string;
    noAds: string;
    noAccount: string;
    openWeb: string;
  };
  sources: {
    youtube: string;
    moreComingSoon: string;
  };
  metadata: {
    duration: string;
    unknownDuration: string;
    source: string;
  };
  format: {
    heading: string;
    mp3: string;
    mp3Sub: string;
    mp4: string;
    mp4Sub: string;
  };
  quality: {
    heading: string;
    auto: string;
    kbps: string;
  };
  actions: {
    download: string;
    startOver: string;
    tryAgain: string;
  };
  progress: {
    preparing: string;
    fetching: string;
    converting: string;
    finishing: string;
  };
  result: {
    heading: string;
    subheading: string;
    downloadFile: string;
    format: string;
    quality: string;
  };
  errors: {
    invalid_url: string;
    unsupported_source: string;
    video_unavailable: string;
    private_video: string;
    conversion_failed: string;
    conversion_unavailable: string;
    rate_limited: string;
    service_unavailable: string;
    download_failed: string;
    invalid_request: string;
    generic: string;
  };
  footer: {
    tagline: string;
    copyrightLine: string;
    linkedinLabel: string;
    githubLabel: string;
    heartLabel: string;
    legalNotice: string;
  };
  about: {
    heading: string;
    body: string[];
    backLink: string;
  };
  theme: {
    system: string;
    light: string;
    dark: string;
    toggleLabel: string;
  };
  language: {
    switchLabel: string;
  };
}
