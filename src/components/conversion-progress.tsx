import { useLocale } from "@/lib/i18n/provider";
import { cn } from "@/lib/format";
import { CheckIcon, SpinnerIcon } from "./icons";

export type ProgressStage = "preparing" | "fetching" | "converting" | "finishing";

const ORDER: ProgressStage[] = ["preparing", "fetching", "converting", "finishing"];

export function ConversionProgress({ stage }: { stage: ProgressStage }) {
  const { t } = useLocale();
  const currentIndex = ORDER.indexOf(stage);

  return (
    <div
      role="status"
      aria-live="polite"
      className="grain grain-card flex flex-col gap-3 border-2 border-ink bg-paper-card p-5 shadow-hard-sm animate-fade-in-up"
    >
      <ul className="flex flex-col gap-2.5">
        {ORDER.map((step, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <li
              key={step}
              className={cn(
                "flex items-center gap-2.5 text-sm transition-opacity",
                !done && !active && "opacity-40",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center border-2 border-ink",
                  done && "bg-success text-paper",
                  active && "bg-accent text-accent-ink",
                  !done && !active && "bg-paper",
                )}
              >
                {done && <CheckIcon className="h-3 w-3" strokeWidth={3} />}
                {active && <SpinnerIcon className="h-3 w-3 animate-spin" />}
              </span>
              <span className={cn("font-medium", active ? "text-ink" : "text-ink-soft")}>
                {t.progress[step]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
