import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/format";
import type { MediaFormat, MediaQuality } from "@/types";

interface QualitySelectorProps {
  format: MediaFormat;
  qualities: MediaQuality[];
  value: MediaQuality;
  onChange: (quality: MediaQuality) => void;
}

export function QualitySelector({ format, qualities, value, onChange }: QualitySelectorProps) {
  const { t } = useLocale();

  function label(quality: MediaQuality): string {
    if (quality === "auto") return t.quality.auto;
    return format === "mp3" ? `${quality} ${t.quality.kbps}` : `${quality}p`;
  }

  return (
    <fieldset>
      <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
        {t.quality.heading}
      </legend>
      <div role="radiogroup" className="flex flex-wrap gap-2">
        {qualities.map((quality) => {
          const active = value === quality;
          return (
            <button
              key={quality}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(quality)}
              className={cn(
                "press-tactile border-2 border-ink px-3.5 py-2 text-sm font-semibold transition-colors",
                active
                  ? "bg-ink text-paper shadow-hard-sm"
                  : "bg-paper-card text-ink hover:bg-paper-muted",
              )}
            >
              {label(quality)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
