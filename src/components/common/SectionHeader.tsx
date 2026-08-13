import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLocale } from "@/lib/locale";

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionTo,
}: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
}) {
  const locale = useLocale();
  const Arrow = locale === "ar" ? ArrowLeft : ArrowRight;

  return (
    <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:mb-8 sm:flex sm:justify-between">
      <div className="min-w-0">
        <h2 className="fluid-h2 text-foreground">{title}</h2>
        {subtitle ? (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>
      {actionLabel && actionTo ? (
        <Link
          to={actionTo}
          className="inline-flex shrink-0 items-center gap-1.5 self-end whitespace-nowrap text-sm font-medium text-brand transition-colors hover:text-brand-hover"
        >
          {actionLabel}
          <Arrow className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
