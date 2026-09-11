"use client";

import { useState, type FormEvent } from "react";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/format";
import { ArrowRightIcon, SpinnerIcon } from "./icons";

interface UrlInputFormProps {
  onSubmit: (url: string) => void;
  loading: boolean;
}

export function UrlInputForm({ onSubmit, loading }: UrlInputFormProps) {
  const { t } = useLocale();
  const [value, setValue] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || loading) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <label htmlFor="media-url" className="sr-only">
        {t.hero.urlLabel}
      </label>
      <div className="grain grain-card flex flex-col gap-3 border-2 border-ink bg-paper-card p-2 shadow-hard sm:flex-row sm:items-center sm:gap-2">
        <input
          id="media-url"
          name="url"
          type="text"
          inputMode="url"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder={t.hero.urlPlaceholder}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          disabled={loading}
          className="relative z-10 flex-1 bg-transparent px-3 py-3 text-base text-ink placeholder:text-ink-soft focus:outline-none disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={loading || value.trim().length === 0}
          className={cn(
            "press-tactile relative z-10 inline-flex items-center justify-center gap-2 border-2 border-ink bg-accent px-6 py-3 text-sm font-bold uppercase tracking-wide text-accent-ink shadow-hard-sm transition-opacity",
            "disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {loading ? (
            <>
              <SpinnerIcon className="h-4 w-4 animate-spin" />
              {t.hero.submitting}
            </>
          ) : (
            <>
              {t.hero.submit}
              <ArrowRightIcon className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 px-1 text-xs text-ink-soft">
        <span>{t.hero.pasteHint}</span>
        <span aria-hidden>·</span>
        <span className="inline-flex items-center gap-1.5">
          <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-pill bg-success" />
          {t.sources.youtube}
          <span className="text-ink-soft/70">({t.sources.moreComingSoon})</span>
        </span>
      </div>
    </form>
  );
}
