import { Star } from "lucide-react";
import { formatNumber } from "@/lib/format";
import { useLocale, useT } from "@/lib/locale";
import { cn } from "@/lib/utils";

export function StarRating({
  rating,
  count,
  className,
  showCount = true,
}: {
  rating: number;
  count?: number;
  className?: string;
  showCount?: boolean;
}) {
  const locale = useLocale();
  const t = useT();
  const rounded = Math.round(rating);
  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <span className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn("size-3.5", i <= rounded ? "fill-brand text-brand" : "text-border")}
          />
        ))}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatNumber(Number(rating.toFixed(1)), locale)}
        {showCount && count !== undefined
          ? ` · ${formatNumber(count, locale)} ${t("product.reviews")}`
          : ""}
      </span>
    </div>
  );
}
