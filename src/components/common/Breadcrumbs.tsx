import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHref, useLocale, useT } from "@/lib/locale";

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const href = useHref();
  const locale = useLocale();
  const t = useT();
  const Chevron = locale === "ar" ? ChevronLeft : ChevronRight;

  return (
    <nav aria-label={t("common.breadcrumb")} className="py-4">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground sm:text-sm">
        <li className="flex items-center gap-1">
          <Link to={href("/")} className="transition-colors hover:text-foreground">
            {t("common.home")}
          </Link>
          <Chevron className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />
        </li>
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="transition-colors hover:text-foreground">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? "truncate font-medium text-foreground" : undefined}>
                  {item.label}
                </span>
              )}
              {!last && <Chevron className="size-3.5 shrink-0 opacity-60" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
