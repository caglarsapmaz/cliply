"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/format";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

const OPTIONS = [
  { value: "system", Icon: MonitorIcon },
  { value: "light", Icon: SunIcon },
  { value: "dark", Icon: MoonIcon },
] as const;

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      role="radiogroup"
      aria-label={t.theme.toggleLabel}
      className="inline-flex border-2 border-ink bg-paper-card"
    >
      {OPTIONS.map(({ value, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={t.theme[value]}
            onClick={() => setTheme(value)}
            className={cn(
              "grid h-9 w-9 place-items-center transition-colors",
              active ? "bg-accent text-accent-ink" : "text-ink-soft hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
}
