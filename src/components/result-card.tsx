import Image from "next/image";
import { useLocale } from "@/lib/i18n/provider";
import type { MediaFormat, MediaQuality, VideoMetadata } from "@/types";
import { CheckIcon } from "./icons";

interface ResultCardProps {
  metadata: VideoMetadata;
  format: MediaFormat;
  quality: MediaQuality;
  downloadUrl: string;
  filename: string;
  onStartOver: () => void;
}

export function ResultCard({
  metadata,
  format,
  quality,
  downloadUrl,
  filename,
  onStartOver,
}: ResultCardProps) {
  const { t } = useLocale();
  const qualityLabel =
    quality === "auto" ? t.quality.auto : format === "mp3" ? `${quality} ${t.quality.kbps}` : `${quality}p`;

  return (
    <div className="grain grain-card flex flex-col gap-4 border-2 border-ink bg-paper-card p-5 shadow-hard animate-fade-in-up">
      <div className="flex items-center gap-2 text-success">
        <span className="grid h-6 w-6 place-items-center border-2 border-success bg-success text-paper">
          <CheckIcon className="h-3.5 w-3.5" strokeWidth={3} />
        </span>
        <span className="text-sm font-bold uppercase tracking-wide">{t.result.heading}</span>
      </div>

      <div className="flex gap-4">
        <div className="relative aspect-video w-28 shrink-0 overflow-hidden border-2 border-ink bg-paper-muted sm:w-36">
          <Image src={metadata.thumbnailUrl} alt="" fill sizes="144px" className="object-cover" />
        </div>
        <div className="flex min-w-0 flex-col justify-center gap-1">
          <p className="line-clamp-2 text-sm font-semibold text-ink">{metadata.title}</p>
          <p className="text-xs text-ink-soft">
            {t.result.format}: <span className="font-medium text-ink">{format.toUpperCase()}</span>
            {"  ·  "}
            {t.result.quality}: <span className="font-medium text-ink">{qualityLabel}</span>
          </p>
        </div>
      </div>

      <p className="text-sm text-ink-soft">{t.result.subheading}</p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <a
          href={downloadUrl}
          download={filename}
          className="press-tactile inline-flex flex-1 items-center justify-center border-2 border-ink bg-accent px-5 py-3 text-sm font-bold uppercase tracking-wide text-accent-ink shadow-hard-sm"
        >
          {t.result.downloadFile}
        </a>
        <button
          type="button"
          onClick={onStartOver}
          className="press-tactile inline-flex items-center justify-center border-2 border-ink bg-paper px-5 py-3 text-sm font-semibold text-ink"
        >
          {t.actions.startOver}
        </button>
      </div>
    </div>
  );
}
