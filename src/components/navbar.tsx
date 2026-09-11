"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/provider";
import { Logo } from "./logo";
import { ThemeSwitcher } from "./theme-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { GithubIcon } from "./icons";

export function Navbar() {
  const { t } = useLocale();

  return (
    <header className="border-b-2 border-ink bg-paper">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
        <Logo />
        <nav className="flex flex-wrap items-center gap-3 sm:gap-4" aria-label="Primary">
          <Link
            href="/about"
            className="hidden text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:inline"
          >
            {t.nav.about}
          </Link>
          <a
            href="https://github.com/caglarsapmaz"
            target="_blank"
            rel="noreferrer noopener"
            className="hidden items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:inline-flex"
          >
            <GithubIcon className="h-4 w-4" />
            {t.nav.github}
          </a>
          <LanguageSwitcher />
          <ThemeSwitcher />
        </nav>
      </div>
    </header>
  );
}
