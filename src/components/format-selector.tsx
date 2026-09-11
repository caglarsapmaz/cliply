import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/format";
import type { MediaFormat } from "@/types";
import { FilmIcon, MusicIcon } from "./icons";

interface FormatSelectorProps {
  value: MediaFormat;
  onChange: (format: MediaFormat) => void;
}

export function FormatSelector({ value, onChange }: FormatSelectorProps) {
  const { t } = useLocale();

  const options: Array<{ format: MediaFormat; label: string; sub: string; Icon: typeof FilmIcon }> = [
    { format: "mp3", label: t.format.mp3, sub: t.format.mp3Sub, Icon: MusicIcon },
    { format: "mp4", label: t.format.mp4, sub: t.format.mp4Sub, Icon: FilmIcon },
  ];

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
        {t.format.heading}
      </legend>
      <div role="radiogroup" className="grid grid-cols-2 gap-3">
        {options.map(({ format, label, sub, Icon }) => {
          const active = value === format;
          return (
            <button
              key={format}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(format)}
              className={cn(
                "press-tactile flex items-center gap-3 border-2 border-ink px-4 py-3 text-left transition-colors",
                active
                  ? "bg-accent text-accent-ink shadow-hard-sm"
                  : "bg-paper-card text-ink hover:bg-paper-muted",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex flex-col leading-tight">
                <span className="text-sm font-bold">{label}</span>
                <span className={cn("text-xs", active ? "text-accent-ink/80" : "text-ink-soft")}>
                  {sub}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
