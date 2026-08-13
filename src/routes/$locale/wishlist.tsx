import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useLocalized, useDir, useHref, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { getProductById } from "@/lib/services/firebase/productService";
import { ProductGrid } from "@/components/shop/ProductGrid";
import type { Product } from "@/lib/types";
import { Heart, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/wishlist")({
  component: WishlistPage,
});

function WishlistPage() {
  const { wishlist } = useStore();
  const dir = useDir();
  const href = useHref();
  const t = useT();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      if (wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const items = await Promise.all(wishlist.map((id) => getProductById(id)));
      setProducts(items.filter((p): p is Product => p !== null));
      setLoading(false);
    }
    loadWishlist();
  }, [wishlist]);

  return (
    <div className={cn("container-page py-12 space-y-8", dir === "rtl" ? "dir-rtl" : "dir-ltr")}>
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <Heart className="h-8 w-8 text-brand" />
         <h1 className="fluid-h2 font-bold text-foreground">{t("wishlist.title")}</h1>
      </div>

      {loading ? (
         <div className="py-24 text-center text-muted-foreground font-bold">
           {t("wishlist.loading")}
         </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border border-border bg-card rounded-3xl shadow-sm">
          <div className="h-24 w-24 rounded-full bg-brand/10 flex items-center justify-center">
            <Heart className="h-12 w-12 text-brand" />
          </div>
          <div className="space-y-2">
             <h2 className="text-xl font-bold text-foreground">{t("wishlist.empty")}</h2>
             <p className="text-muted-foreground">
               {t("wishlist.emptyHint")}
             </p>
          </div>
          <Link
            to={href("/collections")}
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-brand-foreground hover:bg-brand-hover transition-colors"
          >
             <span>{t("wishlist.explore")}</span>
            {dir === "rtl" ? <ArrowLeft className="h-5 w-5" /> : <ArrowRight className="h-5 w-5" />}
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          <p className="text-muted-foreground font-bold">
            {t("wishlist.savedCount", { count: products.length })}
          </p>
          <ProductGrid products={products} />
        </div>
      )}
    </div>
  );
}
