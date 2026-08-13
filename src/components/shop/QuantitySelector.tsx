import { Minus, Plus } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useLocale, useT } from "@/lib/locale";

export function QuantitySelector({
  value,
  onChange,
  max = 20,
  size = "md",
}: {
  value: number;
  onChange: (next: number) => void;
  max?: number;
  size?: "sm" | "md";
}) {
  const t = useT();
  const locale = useLocale();
  const btn = size === "sm" ? "grid size-9 place-items-center" : "grid size-11 place-items-center";

  return (
    <div className="inline-flex items-center rounded-md border border-border bg-surface">
      <button
        type="button"
        className={`${btn} rounded-s-md text-foreground transition-colors hover:bg-accent disabled:opacity-40`}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label={t("product.decrease")}
      >
        <Minus className="size-4" />
      </button>
      <span
        className="min-w-10 text-center text-sm font-semibold tabular-nums"
        aria-live="polite"
        aria-label={t("product.quantity")}
      >
        {formatNumber(value, locale)}
      </span>
      <button
        type="button"
        className={`${btn} rounded-e-md text-foreground transition-colors hover:bg-accent disabled:opacity-40`}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t("product.increase")}
      >
        <Plus className="size-4" />
      </button>
    </div>
  );
}
