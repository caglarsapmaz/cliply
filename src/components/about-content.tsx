"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/provider";
import { ArrowRightIcon } from "./icons";

export function AboutContent() {
  const { t } = useLocale();

  return (
    <section className="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-20">
      <h1 className="mb-8 font-display text-4xl leading-tight text-ink sm:text-5xl">
        {t.about.heading}
      </h1>
      <div className="flex flex-col gap-4 text-base leading-relaxed text-ink-soft">
        {t.about.body.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <Link
        href="/"
        className="press-tactile mt-10 inline-flex items-center gap-2 border-2 border-ink bg-accent px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-accent-ink shadow-hard-sm"
      >
        {t.about.backLink}
        <ArrowRightIcon className="h-4 w-4" />
      </Link>
    </section>
  );
}
