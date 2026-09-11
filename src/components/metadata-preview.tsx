import Image from "next/image";
import { useLocale } from "@/lib/i18n/provider";
import { formatDuration } from "@/lib/format";
import type { VideoMetadata } from "@/types";

export function MetadataPreview({ metadata }: { metadata: VideoMetadata }) {
  const { t } = useLocale();
  const duration = formatDuration(metadata.durationSeconds);

  return (
    <div className="grain grain-card flex gap-4 border-2 border-ink bg-paper-card p-3 shadow-hard-sm animate-fade-in-up">
      <div className="relative z-10 aspect-video w-32 shrink-0 overflow-hidden border-2 border-ink bg-paper-muted sm:w-44">
        <Image
          src={metadata.thumbnailUrl}
          alt=""
          fill
          sizes="176px"
          className="object-cover"
        />
      </div>
      <div className="relative z-10 flex min-w-0 flex-col justify-center gap-1.5">
        <h2 className="line-clamp-2 text-sm font-semibold text-ink sm:text-base">
          {metadata.title}
        </h2>
        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          <div className="flex gap-1">
            <dt className="font-medium">{t.metadata.source}:</dt>
            <dd>YouTube</dd>
          </div>
          <div className="flex gap-1">
            <dt className="font-medium">{t.metadata.duration}:</dt>
            <dd>{duration ?? t.metadata.unknownDuration}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
