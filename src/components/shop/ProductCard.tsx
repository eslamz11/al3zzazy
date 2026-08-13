import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Price } from "@/components/shop/Price";
import { QuickView } from "@/components/shop/QuickView";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { Button } from "@/components/ui/button";
import { defaultSelection, findVariantByOptions, priceRange } from "@/lib/services/catalog";
import { useHref, useLocalized, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";
import type { Product, ProductVariant } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const href = useHref();
  const L = useLocalized();
  const t = useT();
  const { addToCart, setCartOpen, user, requestLogin } = useStore();
  const [quickOpen, setQuickOpen] = useState(false);
  const { min, hasRange } = priceRange(product);
  const primary = product.images[0];
  const hover = product.images[1] ?? primary;
  const inStock =
    product.variants.length > 0
      ? product.variants.some((v) => v.available)
      : product.stock > 0 && product.active !== false;

  const quickAdd = () => {
    if (!user) {
      requestLogin();
      return;
    }
    let variant = findVariantByOptions(product, defaultSelection(product)) ?? product.variants[0];
    if (!variant && product.variants.length === 0) {
      variant = {
        id: product.id,
        sku: product.sku,
        options: {},
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        available: product.stock > 0 && product.active !== false,
      } as ProductVariant;
    }
    if (!variant) return;
    addToCart(product.id, variant.id, 1);
    toast.success(t("product.addedToCart"));
    setCartOpen(true);
  };

  return (
    <article className="group relative flex h-full flex-col">
      <div className="relative overflow-hidden rounded-lg bg-surface-secondary">
        <Link
          to={href(`/products/${product.slug}`)}
          preload="intent"
          className="block aspect-square"
          aria-label={L(product.name)}
        >
          {primary ? (
            <>
              <img
                src={primary.src}
                alt={L(primary.alt)}
                width={1200}
                height={1200}
                loading={priority ? "eager" : "lazy"}
                decoding="async"
                className="size-full object-cover transition-opacity duration-500 group-hover:opacity-0"
              />
              <img
                src={hover?.src ?? primary.src}
                alt=""
                aria-hidden="true"
                width={1200}
                height={1200}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full scale-105 object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              />
            </>
          ) : null}
        </Link>

        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1.5">
            {!inStock ? (
              <span className="rounded-sm bg-foreground/85 px-2 py-1 text-[11px] font-semibold text-background">
                {t("product.outOfStock")}
              </span>
            ) : null}
          </div>
          <WishlistButton productId={product.id} />
        </div>

        <div className="pointer-events-none absolute inset-x-3 bottom-3 hidden opacity-0 transition-opacity duration-300 group-hover:pointer-events-auto group-hover:opacity-100 md:block">
          <button
            type="button"
            onClick={() => setQuickOpen(true)}
            className="w-full rounded-md border border-border bg-surface/95 py-2.5 text-sm font-medium text-foreground shadow-soft backdrop-blur transition-colors hover:bg-accent"
          >
            {t("product.quickView")}
          </button>
        </div>
      </div>

      <div className="mt-3 flex min-w-0 flex-1 flex-col gap-1.5">
        <h3 className="text-sm font-semibold leading-snug text-foreground sm:text-base">
          <Link to={href(`/products/${product.slug}`)} className="hover:text-brand">
            {L(product.name)}
          </Link>
        </h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {L(product.tagline)}
        </p>
        <Price price={min} fromLabel={hasRange} size="sm" className="mt-auto pt-1" />
        <Button
          type="button"
          onClick={quickAdd}
          disabled={!inStock}
          variant="outline"
          className="mt-2 min-h-11 w-full border-border bg-surface text-sm font-medium hover:bg-accent"
        >
          {t(inStock ? "product.addToCart" : "product.outOfStock")}
        </Button>
      </div>

      <QuickView product={product} open={quickOpen} onOpenChange={setQuickOpen} />
    </article>
  );
}
