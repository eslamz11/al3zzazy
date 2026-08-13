import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useT } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export function WishlistButton({
  productId,
  variant = "icon",
  className,
}: {
  productId: string;
  variant?: "icon" | "inline";
  className?: string;
}) {
  const t = useT();
  const { isWishlisted, toggleWishlist, user, requestLogin } = useStore();
  const active = isWishlisted(productId);

  const handle = () => {
    if (!user) {
      requestLogin();
      return;
    }
    const added = toggleWishlist(productId);
    toast.success(t(added ? "product.addedToWishlist" : "product.removedFromWishlist"));
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-pressed={active}
        className={cn(
          "inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-accent",
          className,
        )}
      >
        <Heart className={cn("size-4", active && "fill-brand text-brand")} />
        <span>{t(active ? "product.removeFromWishlist" : "product.addToWishlist")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-pressed={active}
      aria-label={t(active ? "product.removeFromWishlist" : "product.addToWishlist")}
      className={cn(
        "grid size-9 place-items-center rounded-full border border-border bg-surface/90 text-foreground shadow-soft backdrop-blur transition-colors hover:bg-accent",
        className,
      )}
    >
      <Heart className={cn("size-4", active && "fill-brand text-brand")} />
    </button>
  );
}
