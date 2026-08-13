import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductGrid } from "@/components/shop/ProductGrid";
import {
  listAllActiveProducts,
  sortProducts,
  getPageSize,
} from "@/lib/services/firebase/productService";
import { listCategories } from "@/lib/services/firebase/categoryService";
import { useHref, useT, useDir, useLocalized } from "@/lib/locale";
import { ChevronLeft, ChevronRight, LayoutGrid, SlidersHorizontal } from "lucide-react";
import type { Category, CategoryHandle, Product, SortKey } from "@/lib/types";

export const Route = createFileRoute("/$locale/collections/")({
  component: StorefrontCollectionsIndexPage,
});

/* ── Skeleton Loader ─────────────────────────────────────── */
function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="rounded-xl bg-surface-secondary aspect-square mb-3" />
      <div className="h-4 bg-surface-secondary rounded-lg w-3/4 mb-2" />
      <div className="h-3 bg-surface-secondary rounded-lg w-1/2 mb-3" />
      <div className="h-4 bg-surface-secondary rounded-lg w-1/3" />
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Pagination ──────────────────────────────────────────── */
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const t = useT();
  const pages = useMemo(() => {
    const result: (number | "...")[] = [];
    if (totalPages <= 1) return result;
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) result.push(i);
      if (currentPage < totalPages - 2) result.push("...");
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label={t("common.pagination")}
      className="flex items-center justify-center gap-1.5 pt-12 pb-4"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-surface text-foreground/70 hover:bg-brand hover:text-white hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        aria-label={t("common.previousPage")}
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`dots-${idx}`}
            className="w-10 h-10 flex items-center justify-center text-muted-foreground text-sm"
          >
            ⋯
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 ${
              page === currentPage
                ? "bg-brand text-white shadow-md shadow-brand/20 scale-105"
                : "border border-border bg-surface text-foreground/70 hover:bg-brand-soft hover:text-brand hover:border-brand/30"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex items-center justify-center w-10 h-10 rounded-xl border border-border bg-surface text-foreground/70 hover:bg-brand hover:text-white hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200"
        aria-label={t("common.nextPage")}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
    </nav>
  );
}

/* ── Main Page ───────────────────────────────────────────── */
function StorefrontCollectionsIndexPage() {
  const href = useHref();
  const t = useT();
  const dir = useDir();
  const L = useLocalized();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = getPageSize();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [prods, cats] = await Promise.all([listAllActiveProducts(), listCategories()]);
      if (cancelled) return;
      setAllProducts(prods);
      setCategories(cats);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Filter by category
  const filtered = useMemo(() => {
    if (activeCategory === "all") return allProducts;
    return allProducts.filter((p) => p.category === activeCategory);
  }, [allProducts, activeCategory]);

  // Sort
  const sorted = useMemo(() => sortProducts(filtered, sortKey), [filtered, sortKey]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedProducts = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize],
  );

  // Reset page on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortKey]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 380, behavior: "smooth" });
  };

  return (
    <div dir={dir === "rtl" ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#1c1b1b] via-[#2a1f1e] to-[#1c1b1b]">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-brand/8 rounded-full blur-[100px] translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-6">
            <LayoutGrid className="h-4 w-4 text-brand-foreground" />
             <span className="text-sm font-medium text-white/90">{t("collection.eyebrow")}</span>
          </div>
           <h1 className="text-4xl md:text-5xl lg:text-[56px] font-bold text-white mb-5 leading-tight">
             {t("collection.heroTitle")}
           </h1>
           <p className="text-white/70 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
             {t("collection.heroText")}
           </p>
        </div>
      </section>

      {/* ── Category Quick Filters ──────────────────────────── */}
      <section className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border shadow-sm">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8">
          <div
            className="flex items-center gap-3 py-3 overflow-x-auto scrollbar-hide"
            style={{ scrollbarWidth: "none" }}
          >
            <button
              onClick={() => setActiveCategory("all")}
              className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                activeCategory === "all"
                  ? "bg-brand text-white shadow-md shadow-brand/20"
                  : "bg-surface-secondary text-foreground/70 hover:bg-brand-soft hover:text-brand"
              }`}
            >
               {t("common.all")}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.handle}
                onClick={() => setActiveCategory(cat.handle)}
                className={`shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 ${
                  activeCategory === cat.handle
                    ? "bg-brand text-white shadow-md shadow-brand/20"
                    : "bg-surface-secondary text-foreground/70 hover:bg-brand-soft hover:text-brand"
                }`}
              >
                {L(cat.name)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Products Area ───────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <p className="text-sm text-muted-foreground font-medium">
             {loading ? (
               t("common.loading")
             ) : (
               <>
                 {t("collection.showing", { shown: paginatedProducts.length, total: sorted.length })}
               </>
             )}
          </p>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="rounded-xl border border-input bg-surface px-4 py-2.5 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all cursor-pointer"
            >
               <option value="featured">{t("collection.sortFeatured")}</option>
               <option value="price-asc">{t("collection.sortPriceAsc")}</option>
               <option value="price-desc">{t("collection.sortPriceDesc")}</option>
               <option value="newest">{t("collection.sortNewest")}</option>
               <option value="rating">{t("collection.sortRating")}</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <SkeletonGrid />
        ) : sorted.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-surface-secondary flex items-center justify-center">
              <LayoutGrid className="h-10 w-10 text-muted-foreground/50" />
            </div>
             <h3 className="text-xl font-bold text-foreground mb-2">{t("collection.noProducts")}</h3>
             <p className="text-muted-foreground text-sm">{t("collection.noProductsHint")}</p>
          </div>
        ) : (
          <>
            <ProductGrid products={paginatedProducts} />
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </section>
    </div>
  );
}
