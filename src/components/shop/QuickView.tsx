import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Price } from "@/components/shop/Price";
import { ProductOptions } from "@/components/shop/ProductOptions";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { defaultSelection, findVariantByOptions } from "@/lib/services/catalog";
import { useHref, useLocalized, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";
import type { Product, ProductVariant, VariantOptionValues } from "@/lib/types";

export function QuickView({
  product,
  open,
  onOpenChange,
}: {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useT();
  const L = useLocalized();
  const href = useHref();
  const { addToCart, setCartOpen, user, requestLogin } = useStore();
  const [selection, setSelection] = useState<VariantOptionValues>(() => defaultSelection(product));
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (open) {
      setSelection(defaultSelection(product));
      setQuantity(1);
    }
  }, [open, product]);

  const variant = findVariantByOptions(product, selection);
  const available =
    product.variants.length > 0
      ? Boolean(variant?.available)
      : product.stock > 0 && product.active !== false;
  const image = product.images[0];

  const add = () => {
    if (!user) {
      onOpenChange(false);
      requestLogin();
      return;
    }
    let targetVariant = variant;
    if (!targetVariant && product.variants.length === 0) {
      targetVariant = {
        id: product.id,
        sku: product.sku,
        options: {},
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        stock: product.stock,
        available: product.stock > 0 && product.active !== false,
      } as ProductVariant;
    }
    if (!targetVariant) return;
    addToCart(product.id, targetVariant.id, quantity);
    onOpenChange(false);
    toast.success(t("product.addedToCart"));
    setCartOpen(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-[calc(100vw-2rem)] overflow-y-auto sm:max-w-3xl">
        <DialogHeader className="text-start">
          <DialogTitle className="pe-8 text-lg">{L(product.name)}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="overflow-hidden rounded-md bg-surface-secondary">
            {image ? (
              <img
                src={image.src}
                alt={L(image.alt)}
                width={1200}
                height={1200}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
            ) : null}
          </div>
          <div className="min-w-0 space-y-4">
            <Price
              price={variant?.price ?? product.price}
              compareAtPrice={variant?.compareAtPrice}
            />
            <p className="text-sm leading-relaxed text-muted-foreground">{L(product.tagline)}</p>
            <ProductOptions
              product={product}
              selection={selection}
              onChange={setSelection}
              compact
            />
            <div className="flex flex-wrap items-center gap-3">
              <QuantitySelector value={quantity} onChange={setQuantity} size="sm" />
              <Button
                onClick={add}
                disabled={!available}
                className="min-h-11 flex-1 bg-brand text-brand-foreground hover:bg-brand-hover"
              >
                {t(available ? "product.addToCart" : "product.outOfStock")}
              </Button>
            </div>
            <Link
              to={href(`/products/${product.slug}`)}
              onClick={() => onOpenChange(false)}
              className="inline-block text-sm font-medium text-brand underline-offset-4 hover:underline"
            >
              {t("product.viewFull")}
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
