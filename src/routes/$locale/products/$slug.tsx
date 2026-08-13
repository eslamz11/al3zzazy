import { useEffect, useState } from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { useLocalized, useDir, useT, useHref } from "@/lib/locale";
import { useStore } from "@/lib/store";
import {
  getProduct,
  relatedProducts,
  defaultSelection,
  findVariantByOptions,
} from "@/lib/services/firebase/productService";
import type { Product, VariantOptionValues } from "@/lib/types";
import { ProductOptions } from "@/components/shop/ProductOptions";
import { QuantitySelector } from "@/components/shop/QuantitySelector";
import { WishlistButton } from "@/components/shop/WishlistButton";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { Price } from "@/components/shop/Price";
import { ProductPageSkeleton } from "@/components/common/Skeletons";
import {
  ShoppingCart,
  Share2,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  Eye,
  Ruler,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";

export const Route = createFileRoute("/$locale/products/$slug")({
  component: ProductDetailsPage,
});

function ProductDetailsPage() {
  const { slug, locale } = useParams({ from: "/$locale/products/$slug" });
  const L = useLocalized();
  const dir = useDir();
  const t = useT();
  const href = useHref();
  const { addToCart, setCartOpen, user, requestLogin } = useStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selection, setSelection] = useState<VariantOptionValues>({});
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [viewerCount, setViewerCount] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const prod = await getProduct(slug);
      if (prod) {
        setProduct(prod);

        // Check if there's a variant in URL
        const params = new URLSearchParams(window.location.search);
        const variantId = params.get("variant");
        if (variantId) {
          const v = prod.variants.find((v) => v.id === variantId);
          if (v) {
            setSelection(v.options);
          } else {
            setSelection(defaultSelection(prod));
          }
        } else {
          setSelection(defaultSelection(prod));
        }

        const rel = await relatedProducts(prod);
        setRelated(rel);
        setActiveImage(0);

        // Initialize viewer count
        if (prod.viewerCount?.enabled) {
          if (prod.viewerCount.mode === "fixed") {
            setViewerCount(prod.viewerCount.fixed);
          } else {
            const min = prod.viewerCount.min || 8;
            const max = prod.viewerCount.max || 25;
            setViewerCount(Math.floor(Math.random() * (max - min + 1)) + min);
          }
        } else {
          setViewerCount(null);
        }
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  useEffect(() => {
    if (!product || !product.viewerCount?.enabled || product.viewerCount.mode === "fixed") return;

    const interval = setInterval(() => {
      setViewerCount((prev) => {
        if (!prev) return prev;
        const min = product.viewerCount!.min || 8;
        const max = product.viewerCount!.max || 25;
        // Randomly go up or down by 1-3
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        let next = prev + change;
        if (next < min) next = min + 1;
        if (next > max) next = max - 1;
        return next;
      });
    }, 12000); // Update every 12 seconds

    return () => clearInterval(interval);
  }, [product]);

  const variant = product ? findVariantByOptions(product, selection) : null;

  useEffect(() => {
    if (variant && !loading) {
      const url = new URL(window.location.href);
      url.searchParams.set("variant", variant.id);
      window.history.replaceState({}, "", url.toString());
    }
  }, [variant, loading]);

  if (loading) {
    return <ProductPageSkeleton />;
  }

  if (!product) {
    return (
      <div className="container-page py-24 text-center space-y-4">
         <h1 className="text-2xl font-bold">{t("product.notFound")}</h1>
         <p className="text-muted-foreground">{t("product.notFoundHint")}</p>
         <Link
           to="/$locale"
           params={{ locale }}
           className="inline-block mt-4 text-[#C8102E] hover:underline font-bold"
         >
           {t("common.backHome")}
         </Link>
      </div>
    );
  }

  const isAvailable =
    product.variants.length > 0
      ? variant
        ? variant.available && variant.stock > 0
        : false
      : product.stock > 0 && product.active !== false;
  const price = variant?.price ?? product.price;
  const compareAt = variant?.compareAtPrice ?? product.compareAtPrice;
  const hasMultipleImages = product.images.length > 1;

  const handlePrev = () => {
    setActiveImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: L(product.name),
    image: product.images,
    description: L(product.description),
    sku: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: "سليب هاي SleepHigh",
    },
    offers: {
      "@type": "Offer",
      url:
        typeof window !== "undefined"
          ? window.location.href
          : `https://sleephigh-eg.com/products/${product.slug}`,
      priceCurrency: "EGP",
      price: price,
      availability: isAvailable ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };

  const handleAddToCart = () => {
    if (!user) {
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
      } as typeof variant;
    }
    if (!targetVariant || !isAvailable) return;
    addToCart(product.id, targetVariant.id, quantity);
    setCartOpen(true);
  };

  return (
    <div className={cn("container-page py-8 space-y-12", dir === "rtl" ? "dir-rtl" : "dir-ltr")}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      {/* Breadcrumb */}
      <nav className="flex text-sm text-muted-foreground items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
         <Link to="/$locale" params={{ locale }} className="hover:text-foreground transition-colors">
           {t("common.home")}
         </Link>
        <span className="text-gray-400">/</span>
         <Link
           to="/$locale/collections"
           params={{ locale }}
           className="hover:text-foreground transition-colors"
         >
           {t("product.breadcrumbProducts")}
         </Link>
        <span className="text-gray-400">/</span>
        <span className="text-foreground font-medium truncate max-w-[200px]">
          {L(product.name)}
        </span>
      </nav>

      {/* Product Top Section */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Gallery (Right Side on RTL) */}
        <div className="lg:col-span-7 space-y-4 flex flex-col md:flex-row-reverse gap-4">
          <div className="relative flex-1 aspect-[4/3] md:aspect-square overflow-hidden rounded-3xl bg-gray-50/50">
            {product.images.length > 0 ? (
              <>
                <img
                  src={product.images[activeImage]?.src}
                  alt={L(product.images[activeImage]?.alt ?? { ar: "", en: "" }) || L(product.name)}
                  className="h-full w-full object-cover"
                />
                {hasMultipleImages && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition hover:bg-background"
                       aria-label={t("product.previousImage")}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-background/80 text-foreground shadow-md backdrop-blur-sm transition hover:bg-background"
                       aria-label={t("product.nextImage")}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}
                <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-background/80 px-3 py-1.5 text-xs font-semibold text-foreground shadow-md backdrop-blur-sm transition hover:bg-background"
                    >
                       <ZoomIn className="h-4 w-4" />
                       {t("product.zoom")}
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-h-[90dvh] max-w-[calc(100vw-2rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-5xl">
                    <img
                      src={product.images[activeImage]?.src}
                      alt={
                        L(product.images[activeImage]?.alt ?? { ar: "", en: "" }) || L(product.name)
                      }
                      className="max-h-[85dvh] w-full rounded-2xl object-contain"
                    />
                  </DialogContent>
                </Dialog>
              </>
            ) : (
                 <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                 {t("product.noImage")}
               </div>
            )}
            <div className="absolute top-4 right-4 z-10">
              <WishlistButton
                productId={product.id}
                className="h-10 w-10 bg-background/80 backdrop-blur-md hover:bg-background"
              />
            </div>
          </div>

          {hasMultipleImages && (
            <div className="flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:pr-2 w-full md:w-24 shrink-0">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "relative aspect-square w-20 md:w-full shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                    activeImage === idx
                      ? "border-brand"
                      : "border-transparent hover:border-gray-200",
                  )}
                  aria-label={t("product.showImage", { index: idx + 1 })}
                >
                  <img src={img.src} alt="" className="h-full w-full object-cover bg-gray-50" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details (Left Side on RTL) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <h1 className="fluid-h2 font-bold text-foreground">{L(product.name)}</h1>
            <p className="text-base text-muted-foreground">{L(product.tagline)}</p>
            {product.rating > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("product.reviewsCount", { count: product.reviewCount })}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-end gap-3">
            <Price price={price} compareAtPrice={compareAt} size="lg" />
          </div>

          <div className="flex flex-col items-center justify-center gap-6 py-4 bg-gray-50/50 rounded-2xl border border-gray-100">
            {/* Trust Badges */}
            {(product.trust?.warranty10Years || product.trust?.freeShipping) && (
              <div className="flex flex-wrap items-center justify-center gap-6">
                {product.trust?.warranty10Years && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="https://www.sleephigh-eg.com/cdn/shop/files/w-ar@2x.png?v=1704697997"
                      alt="ضمان 10 سنوات"
                      className="h-16 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
                    />
                  </div>
                )}
                {product.trust?.freeShipping && (
                  <div className="flex flex-col items-center gap-2">
                    <img
                      src="https://www.sleephigh-eg.com/cdn/shop/files/fd-ar@2x.png?v=1704697995"
                      alt="شحن مجاني"
                      className="h-16 w-auto object-contain drop-shadow-sm transition-transform hover:scale-105"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Simulated Viewer Count */}
            {viewerCount !== null && (
              <div className="flex items-center justify-center gap-2 text-base font-bold text-gray-800 bg-white shadow-sm border border-gray-100 px-5 py-3 rounded-full animate-in fade-in slide-in-from-bottom-2">
                <Eye className="h-6 w-6 text-brand" />
                <span>{t("product.viewers", { count: viewerCount })}</span>
              </div>
            )}
          </div>

          <div className="h-px bg-border w-full" />

          {/* Mattress Size Guide */}
          {product.category === "mattresses" && (
            <div className="flex justify-end mb-[-1rem] relative z-10">
              <Dialog>
                <DialogTrigger asChild>
                  <button className="flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-brand transition-colors">
                   <Ruler className="h-4 w-4" />
                   {t("product.sizeGuide")}
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl p-0 overflow-hidden bg-white border-none rounded-2xl">
                  <div className="relative">
                    <DialogClose asChild>
                      <button className="absolute top-4 right-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors">
                        <X className="h-4 w-4" />
                      </button>
                    </DialogClose>
                    <img
                      src="https://www.sleephigh-eg.com/cdn/shop/files/mattresse-sizechart.jpg?v=7540685469412662580"
                      alt="دليل المقاسات"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )}

          {product.options.length > 0 && (
            <ProductOptions product={product} selection={selection} onChange={setSelection} />
          )}

          <div className="space-y-4 pt-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    max={variant?.stock ?? 10}
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-black px-6 h-[52px] font-bold text-white transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {t(isAvailable ? "product.addToCart" : "product.outOfStock")}
                </button>
              </div>
              <button
                onClick={() => {
                  handleAddToCart();
                  // In a real flow, this would redirect directly to checkout
                  // navigate({ to: '/checkout' });
                }}
                disabled={!isAvailable}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-200 px-6 h-[52px] font-bold text-black transition-transform hover:bg-gray-300 active:scale-[0.98] disabled:opacity-50"
              >
                <span>{t("product.buyNow")}</span>
              </button>
            </div>
            {product.variants.length > 0 &&
              variant &&
              variant.stock <= (product.lowStockThreshold || 5) &&
              variant.stock > 0 && (
                 <p className="text-sm text-warning font-semibold">
                   {t("product.lowStockWarning", { count: variant.stock })}
                 </p>
              )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
               <Truck className="h-5 w-5 text-gray-400" />
               <span>{t("product.trustFastShipping")}</span>
             </div>
             <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
               <ShieldCheck className="h-5 w-5 text-gray-400" />
               <span>{t("product.trustSecurePayment")}</span>
             </div>
             <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
               <RotateCcw className="h-5 w-5 text-gray-400" />
               <span>{t("product.trustReturns")}</span>
             </div>
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              {copied ? (
                <ShieldCheck className="h-5 w-5 text-green-500" />
              ) : (
                <Share2 className="h-5 w-5 text-gray-400" />
              )}
              <button
                className={`transition-colors ${copied ? "text-green-600 font-bold" : "hover:text-foreground"}`}
                onClick={handleShare}
              >
                 {copied ? t("product.linkCopied") : t("product.share")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Specs */}
      <div className="mx-auto max-w-4xl space-y-12 pt-12 border-t border-border">
        <div className="space-y-6">
           <h2 className="text-2xl font-bold">{t("product.descriptionTitle")}</h2>
          <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {L(product.description)}
          </div>
        </div>

        {(L(product.materials) || product.features.length > 0) && (
          <div className="grid md:grid-cols-2 gap-8 bg-card p-8 rounded-3xl border border-border">
            {L(product.materials) && (
              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-foreground">{t("product.materialsTitle")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {L(product.materials)}
                </p>
              </div>
            )}
            {product.features.length > 0 && (
              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-foreground">{t("product.featuresTitle")}</h3>
                <ul className="space-y-2">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                      <span>{L(feat)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Related Products */}
      {related.length > 0 && (
        <div className="space-y-8 pt-12 border-t border-border">
          <div className="text-center">
             <h2 className="fluid-h2 font-black tracking-tight text-gray-900">
               {t("product.relatedTitle")}
             </h2>
             <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">
               {t("product.relatedSub")}
             </p>
          </div>
          <ProductGrid products={related.slice(0, 4)} columns={4} />
        </div>
      )}
    </div>
  );
}
