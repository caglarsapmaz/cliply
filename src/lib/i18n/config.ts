import { en } from "./dictionaries/en";
import { tr } from "./dictionaries/tr";
import type { Dictionary } from "./types";

export const locales = ["en", "tr"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const dictionaries: Record<Locale, Dictionary> = { en, tr };

export const localeStorageKey = "cliply-locale";

export function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "tr";
}
