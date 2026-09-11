import Link from "next/link";
import { ClipMark } from "./icons";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-display text-xl tracking-tight text-ink transition-transform hover:-translate-y-0.5"
      aria-label="Cliply — home"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center border-2 border-ink bg-accent text-accent-ink">
        <ClipMark className="h-4 w-4" strokeWidth={3} />
      </span>
      {!compact && <span>CLIPLY</span>}
    </Link>
  );
}
