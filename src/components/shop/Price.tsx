import { discountPercent, formatPrice } from "@/lib/format";
import { useLocale, useT } from "@/lib/locale";
import { cn } from "@/lib/utils";

interface PriceProps {
  price: number;
  compareAtPrice?: number | undefined;
  fromLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "text-sm",
  md: "text-base sm:text-lg",
  lg: "text-xl sm:text-2xl",
};

export function Price({ price, compareAtPrice, fromLabel, size = "md", className }: PriceProps) {
  const locale = useLocale();
  const t = useT();
  const off = discountPercent(price, compareAtPrice);

  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-1", className)}>
      {fromLabel && <span className="text-xs text-muted-foreground">{t("product.from")}</span>}
      <span className={cn("font-bold text-foreground", sizes[size])}>
        {formatPrice(price, locale)}
      </span>
      {off > 0 && compareAtPrice ? (
        <>
          <span className="text-xs text-muted-foreground line-through sm:text-sm">
            {formatPrice(compareAtPrice, locale)}
          </span>
          <span className="rounded-sm bg-brand-soft px-1.5 py-0.5 text-[11px] font-semibold text-brand">
            {t("product.discount")} {off}%
          </span>
        </>
      ) : null}
    </div>
  );
}
