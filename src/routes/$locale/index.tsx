import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BadgePercent, Heart, ShieldCheck, Sparkles, Truck } from "lucide-react";
import {
  featuredProducts,
  listAllActiveProducts,
  sortProducts,
} from "@/lib/services/firebase/productService";
import { listCategories } from "@/lib/services/firebase/categoryService";
import { getHomepageSections } from "@/lib/services/firebase/homepageService";
import { discountPercent, formatPrice } from "@/lib/format";
import { useHref, useT, useLocalized, useDir, useLocale } from "@/lib/locale";
import type { Category, Product, HomepageSection, HeroSlide } from "@/lib/types";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/store";
import { HOME_BENEFITS } from "@/lib/content";
import { Reveal } from "@/components/common/Reveal";
import { ProductGridSkeleton } from "@/components/common/Skeletons";
import { SectionHeading } from "@/components/home/SectionHeading";
import { HeroSlider } from "@/components/home/HeroSlider";
import { CategoryCard } from "@/components/home/CategoryCard";
import { ProductRail } from "@/components/home/ProductRail";
import { TrustBar } from "@/components/home/TrustBar";
import { TestimonialSlider } from "@/components/home/TestimonialSlider";
import { NewsletterSection } from "@/components/home/NewsletterSection";

export const Route = createFileRoute("/$locale/")({
  component: StorefrontHomePage,
});

const CONTAINER = "mx-auto max-w-[1280px] px-5 md:px-[64px]";

/** A titled band of products; hides itself when empty (once loaded). */
function ProductSection({
  eyebrow,
  title,
  subtitle,
  products,
  viewAllHref,
  viewAllLabel,
  loading = false,
  tinted = false,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllHref?: string;
  viewAllLabel?: string;
  loading?: boolean;
  tinted?: boolean;
}) {
  if (!loading && products.length === 0) return null;
  return (
    <section className={`py-16 md:py-24 ${tinted ? "bg-surface-secondary/40" : ""}`}>
      <div className={CONTAINER}>
        <Reveal>
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            viewAllHref={viewAllHref}
            viewAllLabel={viewAllLabel}
          />
        </Reveal>
        {loading ? <ProductGridSkeleton count={4} /> : <ProductRail products={products} />}
      </div>
    </section>
  );
}

function StorefrontHomePage() {
  const href = useHref();
  const t = useT();
  const L = useLocalized();
  const dir = useDir();
  const locale = useLocale();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageData, setHomepageData] = useState<HomepageSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [feat, all, cats, sections] = await Promise.all([
          featuredProducts(12),
          listAllActiveProducts(),
          listCategories(),
          getHomepageSections(),
        ]);
        if (cancelled) return;
        setFeatured(feat);
        setAllProducts(all);
        setCategories(cats);
        setHomepageData(sections);
      } catch (err) {
        console.error("Failed to load storefront home data", err);
      } finally {
        if (!cancelled) setLoaded(true);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived sections — computed client-side from a single cached fetch,
  // so no extra Firestore reads or composite indexes are required.
  const featuredList = featured.slice(0, 8);
  const onSale = [...allProducts]
    .filter((p) => p.compareAtPrice && p.compareAtPrice > p.price)
    .sort(
      (a, b) =>
        discountPercent(b.price, b.compareAtPrice) - discountPercent(a.price, a.compareAtPrice),
    )
    .slice(0, 8);
  const newArrivals = sortProducts(allProducts, "newest").slice(0, 8);
  const bestSellers = sortProducts(allProducts, "rating").slice(0, 8);
  const clothing = allProducts
    .filter((p) => p.category === "children-clothing" || p.category === "kids-clothing")
    .slice(0, 8);
  const school = allProducts.filter((p) => p.category === "school-supplies").slice(0, 8);

  // Hero slides come from the CMS `hero` section; fall back to a kids/school default.
  const heroSection = homepageData.find((s) => s.id === "hero" && s.active);
  const defaultSlides: HeroSlide[] = [
    {
      id: "default-slide-1",
      headingAr: "العزازي — عالم ملابس الأطفال والمدرسة",
      headingEn: "Al3azzazy — Kids Fashion & School Supplies",
      descriptionAr:
        "أرقى التشكيلات لجميع الأعمار من حديثي الولادة وحتى المراهقين بجودة عالية وأسعار ممتازة.",
      descriptionEn: "Top quality fashion for babies, kids & teens plus school bags and tools.",
      buttonTextAr: "تصفح التشكيلة",
      buttonTextEn: "Explore Collection",
      buttonLink: "/collections/children-clothing",
      image: "",
    },
  ];
  const slides = (heroSection?.content?.["slides"] as HeroSlide[]) || defaultSlides;

  const benefitIcons = [ShieldCheck, Heart, Sparkles, Truck];
  const catCols = categories.length <= 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div dir={dir} className="min-h-screen bg-background font-sans text-foreground">
      <HeroSlider slides={slides} />

      <TrustBar />

      {/* ── Categories ─────────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className={CONTAINER}>
          <Reveal>
            <SectionHeading
              eyebrow={t("brand.name")}
              title={t("section.categories")}
              subtitle={t("section.categoriesSub")}
              viewAllHref={href("/collections")}
              viewAllLabel={t("section.viewAll")}
            />
          </Reveal>
          {!loaded && categories.length === 0 ? (
            <div className={`grid grid-cols-1 gap-6 ${catCols} md:gap-8`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="shg-skel aspect-[4/3] w-full rounded-3xl" />
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 ${catCols} md:gap-8`}>
              {categories.map((cat, i) => (
                <Reveal key={cat.handle || i} delay={i * 80}>
                  <CategoryCard category={cat} priority={i < 3} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Featured ───────────────────────────────────────── */}
      <ProductSection
        eyebrow={t("brand.name")}
        title={t("section.popular")}
        subtitle={t("section.popularSub")}
        products={featuredList}
        viewAllHref={href("/collections")}
        viewAllLabel={t("section.viewAll")}
        loading={!loaded}
        tinted
      />

      {/* ── Special Offers (on-sale, from public compareAtPrice) ── */}
      {onSale.length > 0 ? (
        <section className="py-16 md:py-24">
          <div className={CONTAINER}>
            <Reveal>
              <div className="mb-10 flex flex-col gap-4 md:mb-14 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-2xl">
                  <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow/15 px-3 py-1 text-xs font-extrabold uppercase tracking-widest text-brand-yellow-hover md:text-sm">
                    <BadgePercent className="h-4 w-4" />
                    {t("home.saleEyebrow")}
                  </span>
                  <h2 className="text-3xl font-extrabold leading-tight text-foreground md:text-4xl">
                    {t("home.specialOffersTitle")}
                  </h2>
                  <p className="mt-2.5 text-base text-muted-foreground md:text-lg">
                    {t("home.specialOffersSub")}
                  </p>
                </div>
                <Link
                  to={href("/collections")}
                  search={{ filter: "sale" }}
                  className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand transition-colors hover:text-brand-hover"
                >
                  {t("section.viewAll")}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <ProductRail products={onSale} />
          </div>
        </section>
      ) : null}

      {/* ── Children's Clothing ────────────────────────────── */}
      <ProductSection
        title={t("section.childrenClothing")}
        subtitle={t("section.childrenClothingSub")}
        products={clothing}
        viewAllHref={href("/collections/children-clothing")}
        viewAllLabel={t("section.viewAll")}
      />

      {/* ── School Essentials ──────────────────────────────── */}
      <ProductSection
        title={t("section.schoolSupplies")}
        subtitle={t("section.schoolSuppliesSub")}
        products={school}
        viewAllHref={href("/collections/school-supplies")}
        viewAllLabel={t("section.viewAll")}
        tinted
      />

      {/* ── New Arrivals ───────────────────────────────────── */}
      <ProductSection
        title={t("home.newArrivalsTitle")}
        subtitle={t("home.newArrivalsSub")}
        products={newArrivals}
        viewAllHref={href("/collections")}
        viewAllLabel={t("section.viewAll")}
      />

      {/* ── Why Choose Us ──────────────────────────────────── */}
      <section className="border-y border-border bg-surface py-16 md:py-24">
        <div className={CONTAINER}>
          <Reveal>
            <SectionHeading
              align="center"
              eyebrow={t("brand.name")}
              title={t("section.benefits")}
            />
          </Reveal>
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2">
            {HOME_BENEFITS.map((benefit, i) => {
              const Icon = benefitIcons[i % benefitIcons.length]!;
              return (
                <Reveal key={i} delay={i * 80}>
                  <div className="flex items-start gap-5">
                    <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                      <Icon className="size-7" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h4 className="mb-2 text-lg font-bold text-foreground">{L(benefit.title)}</h4>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {L(benefit.desc)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Best Sellers ───────────────────────────────────── */}
      <ProductSection
        title={t("section.popular")}
        subtitle={t("section.popularSub")}
        products={bestSellers}
        viewAllHref={href("/collections")}
        viewAllLabel={t("section.viewAll")}
        tinted
      />

      {/* ── Testimonials ───────────────────────────────────── */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-5xl px-5">
          <Reveal>
            <SectionHeading
              align="center"
              title={t("home.testimonialsTitle")}
              subtitle={t("home.testimonialsText")}
            />
          </Reveal>
          <Reveal>
            <TestimonialSlider />
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────── */}
      <section className={`${CONTAINER} pb-4`}>
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-brand-hover px-6 py-14 text-center text-brand-foreground shadow-xl md:px-16 md:py-20">
            <div className="absolute -left-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-brand-yellow/20 blur-3xl" />
            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="mb-3 inline-block text-xs font-extrabold uppercase tracking-widest text-white/80 md:text-sm">
                {t("home.finalCtaEyebrow")}
              </span>
              <h2 className="text-3xl font-black leading-tight md:text-4xl">
                {t("home.finalCtaTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-white/90 md:text-lg">
                {t("home.finalCtaText")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  to={href("/collections")}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 font-extrabold tracking-wide text-brand shadow-lg transition-transform duration-300 hover:scale-[1.03]"
                >
                  {t("home.finalCtaButton")}
                  <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                </Link>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-white/90">
                  <Truck className="h-4 w-4" />
                  {t("home.freeShippingNote", {
                    amount: formatPrice(FREE_SHIPPING_THRESHOLD, locale),
                  })}
                </span>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <NewsletterSection />
    </div>
  );
}
