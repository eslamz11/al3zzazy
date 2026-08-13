import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useDir, useT, useHref } from "@/lib/locale";
import { t as translate, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import { searchProducts } from "@/lib/services/firebase/productService";
import { ProductGrid } from "@/components/shop/ProductGrid";
import { ProductCardSkeleton } from "@/components/common/Skeletons";
import type { Product } from "@/lib/types";
import { Search, Frown, X, Sparkles, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { z } from "zod";

const searchSchema = z.object({
  q: z.string().optional().catch(""),
});

export const Route = createFileRoute("/$locale/search")({
  head: (ctx: any) => {
    const q = ctx?.search?.q;
    const locale = isLocale(ctx?.params?.locale) ? ctx.params.locale : DEFAULT_LOCALE;
    return {
      meta: [
        {
          title: q
            ? translate(locale, "search.metaTitleQuery", { query: q })
            : translate(locale, "search.metaTitle"),
        },
        {
          name: "description",
          content: translate(locale, "search.metaDescription"),
        },
      ],
    };
  },
  component: SearchPage,
  validateSearch: searchSchema,
});

function SearchPage() {
  const { q = "" } = Route.useSearch();
  const dir = useDir();
  const t = useT();
  const href = useHref();
  const navigate = useNavigate();

  const [inputVal, setInputVal] = useState(q);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    setInputVal(q);
  }, [q]);

  useEffect(() => {
    async function performSearch() {
      if (!q.trim()) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setErrored(false);
      try {
        const results = await searchProducts(q.trim());
        setProducts(results);
      } catch (err) {
        console.error("Search error:", err);
        setErrored(true);
      } finally {
        setLoading(false);
      }
    }
    performSearch();
  }, [q]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      navigate({ to: href("/search"), search: { q: inputVal.trim() } });
    }
  };

  const handleClear = () => {
    setInputVal("");
    navigate({ to: href("/search"), search: { q: "" } });
  };

  const popularSearches = [
    t("search.popular1"),
    t("search.popular2"),
    t("search.popular3"),
    t("search.popular4"),
  ];

  return (
    <div
      className={cn(
        "container-page py-10 space-y-10 min-h-[65vh]",
        dir === "rtl" ? "dir-rtl" : "dir-ltr",
      )}
    >
      {/* PAGE HEADER */}
      <div className="flex flex-col items-center justify-center space-y-3 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-red-50 text-[#C8102E] text-xs font-bold border border-red-100">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{t("search.title")}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">
          {t("search.heading")}
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 font-medium">
          {t("search.subheading")}
        </p>
      </div>

      {/* SEARCH BAR CONTAINER */}
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleFormSubmit}
          className="relative flex w-full items-center shadow-lg rounded-2xl"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={t("search.placeholder")}
            className="w-full rounded-2xl border-2 border-gray-200 bg-white py-4 ltr:pl-12 ltr:pr-24 rtl:pr-12 rtl:pl-24 text-sm font-bold text-gray-900 outline-none focus:border-[#C8102E] focus:ring-4 focus:ring-red-100 transition-all placeholder:text-gray-400"
          />

          <Search className="absolute ltr:left-4 rtl:right-4 h-5 w-5 text-gray-400 pointer-events-none" />

          {/* CLEAR BUTTON */}
          {inputVal && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute ltr:right-24 rtl:left-24 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              title={t("search.clearInput")}
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            className="absolute ltr:right-2 rtl:left-2 top-2 bottom-2 rounded-xl bg-[#C8102E] hover:bg-red-700 px-5 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{t("header.searchShort")}</span>
          </button>
        </form>

        {/* POPULAR SEARCH SUGGESTIONS */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs font-semibold text-gray-500">
          <span className="text-gray-400">{t("search.popular")}:</span>
          {popularSearches.map((term, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setInputVal(term);
                navigate({ to: href("/search"), search: { q: term } });
              }}
              className="px-3 py-1 bg-gray-100 hover:bg-red-50 hover:text-[#C8102E] border border-gray-200 rounded-full transition-colors text-[11px]"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS DISPLAY SECTION */}
      <div className="pt-4">
        {loading ? (
          <div className="space-y-6">
            <div className="h-5 w-48 bg-gray-200 rounded-md animate-pulse" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          </div>
        ) : errored ? (
          <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-center text-red-700 text-sm font-bold max-w-lg mx-auto">
            {t("search.failed")}
          </div>
        ) : q && products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 max-w-md mx-auto bg-gray-50/60 rounded-3xl border border-gray-100 p-8 shadow-xs">
            <Frown className="h-16 w-16 text-gray-300 stroke-[1.5]" />
            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900">{t("search.empty")}</h2>
              <p className="text-xs text-gray-500 leading-relaxed">{t("search.emptyHint")}</p>
            </div>
            <Link
              to={href("/collections/mattresses")}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C8102E] text-white text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
            >
              <span>{t("nav.collections")}</span>
              {dir === "rtl" ? (
                <ArrowLeft className="h-4 w-4" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Link>
          </div>
        ) : q && products.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-4">
              <h2 className="text-lg font-black text-gray-900">
                {t("search.resultsFor")} <span className="text-[#C8102E]">"{q}"</span>
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                {t("search.found", { count: products.length })}
              </span>
            </div>
            <ProductGrid products={products} />
          </div>
        ) : (
           <div className="text-center py-12 text-gray-400 text-sm font-semibold">
             {t("search.prompt")}
           </div>
        )}
      </div>
    </div>
  );
}
