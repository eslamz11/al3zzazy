import { useEffect, useState, useMemo } from "react";
import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ProductGrid } from "@/components/shop/ProductGrid";
import {
  listAllActiveProducts,
  sortProducts,
  getPageSize,
} from "@/lib/services/firebase/productService";
import { getCategory } from "@/lib/services/firebase/categoryService";
import { useHref, useT, useDir, useLocalized } from "@/lib/locale";
import { ChevronLeft, ChevronRight, Home, ChevronDown, SlidersHorizontal } from "lucide-react";
import type { Category, CategoryHandle, Product, SortKey } from "@/lib/types";

export const Route = createFileRoute("/$locale/collections/$category")({
  component: StorefrontCategoryCollectionPage,
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
function StorefrontCategoryCollectionPage() {
  const href = useHref();
  const { category: categoryHandle } = useParams({ from: "/$locale/collections/$category" });
  const t = useT();
  const dir = useDir();
  const L = useLocalized();
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("featured");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = getPageSize();

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [catData, prodData] = await Promise.all([
        getCategory(categoryHandle),
        listAllActiveProducts(categoryHandle as CategoryHandle),
      ]);
      if (cancelled) return;
      setCategory(catData);
      setProducts(prodData);
      setLoading(false);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [categoryHandle]);

  // Sort
  const sorted = useMemo(() => sortProducts(products, sortKey), [products, sortKey]);

  // Paginate
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedProducts = useMemo(
    () => sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sorted, currentPage, pageSize],
  );

  // Reset page on sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortKey]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 320, behavior: "smooth" });
  };

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=600&auto=format&fit=crop";

  return (
    <div dir={dir === "rtl" ? "rtl" : "ltr"} className="min-h-screen bg-background text-foreground">
      {/* ── Category Hero ───────────────────────────────────── */}
      <section className="relative h-[280px] md:h-[360px] overflow-hidden">
        {/* Background Image */}
        <img
          src={category?.image || FALLBACK_IMAGE}
          alt={L(category?.name) || categoryHandle}
          className="absolute inset-0 w-full h-full object-cover"
          loading="eager"
          decoding="async"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1c1b1b]/90 via-[#1c1b1b]/60 to-[#1c1b1b]/30" />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end max-w-[1400px] mx-auto px-5 md:px-8 pb-8 md:pb-12">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/60 text-sm mb-4" aria-label={t("common.breadcrumb")}>
            <Link
              to={href("/")}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
               <span>{t("common.home")}</span>
            </Link>
            <ChevronDown className="h-3 w-3 rotate-90" />
            <Link to={href("/collections")} className="hover:text-white transition-colors">
               <span>{t("collection.sections")}</span>
            </Link>
            <ChevronDown className="h-3 w-3 rotate-90" />
             <span className="text-white font-medium">{L(category?.name) || categoryHandle}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
            {L(category?.name) || categoryHandle}
          </h1>
          {L(category?.description) && (
            <p className="text-white/70 text-sm md:text-base max-w-2xl leading-relaxed">
              {L(category?.description)}
            </p>
          )}
        </div>
      </section>

      {/* ── Products Area ───────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Sort bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-6 border-b border-border">
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
              <SlidersHorizontal className="h-10 w-10 text-muted-foreground/50" />
            </div>
             <h3 className="text-xl font-bold text-foreground mb-2">{t("collection.noProducts")}</h3>
             <p className="text-muted-foreground text-sm mb-6">
               {t("collection.noProductsCategoryHint")}
             </p>
             <Link
               to={href("/collections")}
               className="inline-flex items-center gap-2 bg-brand text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-hover transition-colors"
             >
               {t("collection.browseAll")}
             </Link>
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
