"use client";

import { locales } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/format";
import { GlobeIcon } from "./icons";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="radiogroup"
      aria-label={t.language.switchLabel}
      className="inline-flex items-center gap-1 border-2 border-ink bg-paper-card px-2"
    >
      <GlobeIcon className="h-3.5 w-3.5 text-ink-soft" />
      {locales.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setLocale(code)}
            className={cn(
              "px-1.5 py-1.5 text-xs font-semibold tracking-wide transition-colors",
              active ? "text-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            <span className={cn(active && "underline decoration-accent decoration-2 underline-offset-4")}>
              {code.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
