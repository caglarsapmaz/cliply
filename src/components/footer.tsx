"use client";

import { useLocale } from "@/lib/i18n/provider";
import { HeartIcon, GithubIcon, LinkedinIcon } from "./icons";

export function Footer() {
  const { t } = useLocale();
  const year = new Date().getFullYear();
  const [before, after] = t.footer.copyrightLine
    .replace("{year}", String(year))
    .split("{heart}");

  return (
    <footer className="border-t-2 border-ink bg-paper-muted">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="text-sm text-ink-soft">
          <p>{t.footer.tagline}</p>
          <p className="mt-1 inline-flex flex-wrap items-center gap-1 text-ink">
            <span>{before}</span>
            <button
              type="button"
              className="heart-trigger inline-grid place-items-center rounded-pill p-0.5"
              aria-label={t.footer.heartLabel}
              tabIndex={0}
            >
              <HeartIcon className="heart-icon h-4 w-4 text-ink-soft transition-colors" />
            </button>
            <span>{after}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://linkedin.com/in/caglarsapmaz"
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t.footer.linkedinLabel}
            className="grid h-9 w-9 place-items-center border-2 border-ink bg-paper-card text-ink transition-transform hover:-translate-y-0.5 hover:bg-accent hover:text-accent-ink"
          >
            <LinkedinIcon className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/caglarsapmaz"
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t.footer.githubLabel}
            className="grid h-9 w-9 place-items-center border-2 border-ink bg-paper-card text-ink transition-transform hover:-translate-y-0.5 hover:bg-accent hover:text-accent-ink"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </div>
      <div className="border-t border-ink/15 px-5 py-4 text-center text-xs text-ink-soft sm:px-8">
        {t.footer.legalNotice}
      </div>
    </footer>
  );
}
