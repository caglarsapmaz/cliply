import { useLocale } from "@/lib/i18n/provider";
import type { ApiErrorCode } from "@/types";
import { AlertIcon } from "./icons";

export function ErrorBanner({ code, onRetry }: { code: ApiErrorCode; onRetry?: () => void }) {
  const { t } = useLocale();

  return (
    <div
      role="alert"
      className="flex items-start gap-3 border-2 border-error bg-paper-card px-4 py-3.5 text-sm text-ink shadow-hard-sm animate-fade-in-up"
    >
      <AlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-error" />
      <p className="flex-1">{t.errors[code] ?? t.errors.generic}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-sm font-semibold text-error underline underline-offset-2"
        >
          {t.actions.tryAgain}
        </button>
      )}
    </div>
  );
}
