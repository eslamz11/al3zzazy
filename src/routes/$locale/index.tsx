import { useEffect, useState, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  CheckCircle,
  Truck,
  ShieldCheck,
  Headset,
  RotateCcw,
  ArrowRight,
  Sparkles,
  Heart,
  BookOpen,
} from "lucide-react";
import { featuredProducts } from "@/lib/services/firebase/productService";
import { listCategories } from "@/lib/services/firebase/categoryService";
import { getHomepageSections } from "@/lib/services/firebase/homepageService";
import { submitSiteMessage } from "@/lib/services/firebase/messageService";
import confetti from "canvas-confetti";
import { useHref, useT, useLocalized, useDir, useFormatters } from "@/lib/locale";
import type { Category, Product, HomepageSection, HeroSlide } from "@/lib/types";
import { useStore } from "@/lib/store";
import { HOME_TESTIMONIALS, HOME_BENEFITS } from "@/lib/content";
import { SmartImage } from "@/components/common/SmartImage";
import { Reveal } from "@/components/common/Reveal";

export const Route = createFileRoute("/$locale/")({
  component: StorefrontHomePage,
});

const FALLBACK_IMAGE =
  " ";

function stripLocalePrefix(path: string): string {
  return path.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
}

function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "start",
  viewAllHref,
  viewAllLabel,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "start" | "center";
  viewAllHref?: string;
  viewAllLabel?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`mb-10 md:mb-14 flex flex-col gap-4 sm:flex-row sm:items-end ${centered ? "sm:justify-center text-center" : "sm:justify-between text-start"
        }`}
    >
      <div className={`max-w-2xl ${centered ? "mx-auto" : ""}`}>
        {eyebrow && (
          <span className="mb-2 inline-block text-xs md:text-sm font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400">
            {eyebrow}
          </span>
        )}
        <h2 className="text-3xl md:text-4xl font-extrabold leading-tight text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-2.5 text-slate-600 dark:text-slate-400 text-base md:text-lg ${centered ? "mx-auto" : ""}`}>
            {subtitle}
          </p>
        )}
      </div>
      {viewAllHref && viewAllLabel && (
        <Link
          to={viewAllHref}
          className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-800 dark:text-sky-400 transition-colors"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 rtl:-scale-x-100 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
        </Link>
      )}
    </div>
  );
}

function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const href = useHref();
  const t = useT();
  const L = useLocalized();
  const dir = useDir();

  useEffect(() => {
    if (!slides || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <section
      className="relative h-[82svh] min-h-[500px] max-h-[760px] md:h-[620px] lg:h-[680px] w-full overflow-hidden bg-slate-900"
      aria-roledescription="carousel"
    >
      {slides.map((slide, idx) => {
        const heading = L({ ar: slide.headingAr, en: slide.headingEn }) || t("hero.title");
        const description =
          L({ ar: slide.descriptionAr, en: slide.descriptionEn }) || t("hero.subtitle");
        const buttonText =
          L({ ar: slide.buttonTextAr, en: slide.buttonTextEn }) || t("hero.ctaPrimary");
        const primaryLink = slide.buttonLink ? stripLocalePrefix(slide.buttonLink) : "/collections/children-clothing";
        const isActive = idx === current;
        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${isActive ? "opacity-100 z-20" : "opacity-0 z-10 pointer-events-none"
              }`}
            aria-hidden={!isActive}
          >
            <SmartImage
              src={slide.image}
              fallbackSrc={FALLBACK_IMAGE}
              alt={heading}
              fill
              objectFit="cover"
              priority={idx === 0}
              width={1600}
              height={800}
              sizes="100vw"
              imgClassName={`transition-transform ease-linear duration-[9000ms] ${isActive ? "scale-[1.08]" : "scale-100"
                }`}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-900/20" />

            <div
              dir={dir}
              className="relative z-20 mx-auto flex h-full max-w-[1280px] flex-col items-center justify-end px-6 pb-16 text-center text-white md:items-start md:justify-center md:px-[64px] md:pb-0 md:text-start"
            >
              <div className="max-w-2xl">
                <span
                  className={`mb-4 inline-flex items-center gap-2 rounded-full bg-amber-400/90 text-slate-950 px-4 py-1.5 text-xs md:text-sm font-extrabold tracking-wide transition-all duration-700 ${isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                    }`}
                >
                  <Sparkles className="h-4 w-4 fill-current" />
                  {t("brand.name")} — {t("brand.tagline")}
                </span>
                <h1
                  className={`mb-4 text-3xl leading-tight font-black sm:text-5xl lg:text-[54px] text-white transition-all duration-700 delay-75 ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                >
                  {heading}
                </h1>
                <p
                  className={`mb-8 text-base md:text-lg lg:text-xl text-sky-100 max-w-xl mx-auto md:mx-0 transition-all duration-700 delay-150 ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                >
                  {description}
                </p>
                <div
                  className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-center md:justify-start gap-3 transition-all duration-700 delay-200 ${isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                    }`}
                >
                  <Link
                    to={href(primaryLink)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 hover:bg-sky-600 px-8 py-3.5 font-extrabold tracking-wide text-white shadow-lg shadow-sky-500/30 transition-all duration-300"
                  >
                    {buttonText}
                    <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                  </Link>
                  <Link
                    to={href("/collections/school-supplies")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 hover:bg-amber-500 px-7 py-3.5 font-extrabold tracking-wide text-slate-950 shadow-lg shadow-amber-400/20 transition-all duration-300"
                  >
                    <BookOpen className="h-4 w-4" />
                    {t("hero.ctaSecondary")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {slides.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-30 flex justify-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${idx === current ? "w-8 bg-sky-400" : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
              aria-label={t("hero.slide", { index: idx + 1 })}
              aria-current={idx === current}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function TrustBar() {
  const t = useT();
  const items = [
    {
      icon: Truck,
      label: t("product.trustFastShipping"),
      short: t("product.trustFastShippingShort"),
    },
    {
      icon: ShieldCheck,
      label: t("announce.warranty"),
      short: t("announce.warrantyShort"),
    },
    { icon: Headset, label: t("benefit.support"), short: t("benefit.supportShort") },
    { icon: RotateCcw, label: t("benefit.returns"), short: t("benefit.returnsShort") },
  ];
  return (
    <section className="border-b border-sky-100 bg-white dark:bg-slate-900 dark:border-slate-800">
      <div className="mx-auto max-w-[1280px] px-5 md:px-[64px]">
        <Reveal>
          <div className="grid grid-cols-2 gap-px bg-sky-100 dark:bg-slate-800 md:grid-cols-4">
            {items.map(({ icon: Icon, label, short }, i) => (
              <div
                key={i}
                className="group flex items-center justify-center gap-2.5 bg-white dark:bg-slate-900 px-2 py-4 md:gap-3 md:py-6"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400 transition-transform duration-300 ease-out group-hover:scale-110 md:h-11 md:w-11">
                  <Icon className="h-4 w-4 md:h-5 md:w-5" strokeWidth={1.75} />
                </span>
                <span className="text-center text-xs font-bold leading-tight text-slate-800 dark:text-slate-200 transition-colors duration-300 group-hover:text-sky-600 md:text-sm">
                  <span className="md:hidden">{short}</span>
                  <span className="hidden md:inline">{label}</span>
                </span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function ProductCard({
  product,
  href,
  addToCart,
  aspectClass = "aspect-square",
  objectFit = "cover",
}: {
  product: Product;
  href: (path: string) => string;
  addToCart: (id: string, variantId: string, qty: number) => void;
  aspectClass?: string | undefined;
  objectFit?: "contain" | "cover" | undefined;
}) {
  const L = useLocalized();
  const t = useT();
  const { price } = useFormatters();
  const rating = Math.round(product.rating || 0);
  const hasDiscount = !!product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPct = hasDiscount
    ? Math.round((1 - product.price / (product.compareAtPrice as number)) * 100)
    : 0;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sky-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-sky-200">
      <Link
        to={href(`/products/${product.slug}`)}
        aria-label={L(product.name)}
        className={`relative block ${aspectClass} shrink-0 overflow-hidden bg-sky-50/50 dark:bg-slate-800`}
      >
        <SmartImage
          src={product.images[0]?.src}
          fallbackSrc={FALLBACK_IMAGE}
          alt={L(product.name)}
          objectFit={objectFit}
          width={600}
          height={600}
          sizes="(max-width: 768px) 80vw, 300px"
          className="h-full w-full p-2"
          placeholderClassName="bg-sky-50"
          imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {hasDiscount && (
          <span className="absolute top-3 rtl:right-3 ltr:left-3 rounded-full bg-amber-400 px-2.5 py-1 text-xs font-black text-slate-950 shadow-sm">
            -{discountPct}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4 text-start md:p-5">
        <Link to={href(`/products/${product.slug}`)} className="mb-2 block">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 dark:text-slate-100 transition-colors group-hover:text-sky-600">
            {L(product.name)}
          </h3>
        </Link>

        {rating > 0 && (
          <div className="mb-3 flex gap-0.5 text-amber-400" aria-hidden="true">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i < rating ? "fill-current" : "text-slate-200 dark:text-slate-700"}`}
              />
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-baseline gap-2 pt-2">
          <p className="text-lg font-black text-sky-600 dark:text-sky-400">{price(product.price)}</p>
          {hasDiscount && (
            <p className="text-sm font-medium text-slate-400 line-through">
              {price(product.compareAtPrice as number)}
            </p>
          )}
        </div>

        <button
          onClick={() => addToCart(product.id, product.variants?.[0]?.id || "", 1)}
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-600 hover:bg-sky-700 dark:bg-sky-500 font-bold text-white transition-colors shadow-xs"
        >
          <ShoppingBag className="h-4 w-4" />
          {t("product.addToCart")}
        </button>
      </div>
    </article>
  );
}

function ProductCarousel({
  products,
  href,
  addToCart,
  aspectClass,
  objectFit,
}: {
  products: Product[];
  href: (path: string) => string;
  addToCart: (id: string, variantId: string, qty: number) => void;
  aspectClass?: string;
  objectFit?: "contain" | "cover";
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) return null;

  return (
    <div>
      <div className="md:hidden -mx-5 px-5">
        <div
          ref={trackRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 pt-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product) => (
            <div key={product.id} className="w-[74vw] max-w-[280px] shrink-0 snap-start">
              <ProductCard
                product={product}
                href={href}
                addToCart={addToCart}
                aspectClass={aspectClass}
                objectFit={objectFit}
              />
            </div>
          ))}
          <div className="w-[1px] shrink-0" />
        </div>
      </div>

      <div className="hidden gap-6 md:grid md:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 80}>
            <ProductCard
              product={product}
              href={href}
              addToCart={addToCart}
              aspectClass={aspectClass}
              objectFit={objectFit}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function TestimonialSlider() {
  const [active, setActive] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("left");
  const t = useT();
  const L = useLocalized();

  const go = (nextIndex: number, dir: "left" | "right") => {
    if (animating) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setActive(nextIndex);
      setAnimating(false);
    }, 350);
  };

  const next = () => go((active + 1) % HOME_TESTIMONIALS.length, "left");
  const prev = () =>
    go((active - 1 + HOME_TESTIMONIALS.length) % HOME_TESTIMONIALS.length, "right");

  const testimonial = HOME_TESTIMONIALS[active];

  const slideClass = animating
    ? direction === "left"
      ? "opacity-0 translate-x-8"
      : "opacity-0 -translate-x-8"
    : "opacity-100 translate-x-0";

  return (
    <div className="relative mx-auto max-w-4xl overflow-visible rounded-3xl border border-sky-100 bg-white dark:border-slate-800 dark:bg-slate-900 p-8 shadow-sm md:p-16">
      <div className="mb-8 flex justify-center gap-1 text-amber-400">
        {Array.from({ length: testimonial?.rating || 5 }).map((_, i) => (
          <Star key={i} className="h-6 w-6 fill-current" />
        ))}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${slideClass} flex min-h-[140px] flex-col items-center justify-center`}
      >
        <p className="mb-8 max-w-3xl text-center text-lg font-medium leading-relaxed text-slate-800 dark:text-slate-200 md:text-2xl">
          "{L(testimonial?.body)}"
        </p>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-lg font-bold text-sky-900 dark:text-sky-300">{L(testimonial?.name)}</span>
          <span className="text-sm font-medium text-slate-500">{L(testimonial?.city)}</span>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-2.5">
        {HOME_TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i, i > active ? "left" : "right")}
            className={`rounded-full transition-all duration-300 ${i === active
                ? "h-2.5 w-8 bg-sky-600"
                : "h-2.5 w-2.5 bg-sky-200 dark:bg-slate-700 hover:bg-sky-400"
              }`}
            aria-label={t("home.testimonialNav", { index: i + 1 })}
          />
        ))}
      </div>

      <button
        onClick={prev}
        className="absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 -right-6 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 shadow-md transition-all hover:bg-sky-50 hover:text-sky-600 md:flex"
        aria-label={t("common.previous")}
      >
        <ChevronRight className="ml-1 h-6 w-6" />
      </button>
      <button
        onClick={next}
        className="absolute top-1/2 hidden h-12 w-12 -translate-y-1/2 -left-6 items-center justify-center rounded-full border border-sky-100 bg-white text-slate-700 shadow-md transition-all hover:bg-sky-50 hover:text-sky-600 md:flex"
        aria-label={t("common.next")}
      >
        <ChevronLeft className="mr-1 h-6 w-6" />
      </button>
    </div>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const t = useT();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    const res = await submitSiteMessage({
      name: t("home.newsletterSubscriber"),
      phone: t("home.newsletterUnavailable"),
      email: email,
      subject: t("home.newsletterSubject"),
      message: t("home.newsletterBody", { email }),
    });

    if (res.ok) {
      setStatus("success");
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#0284c7", "#eab308", "#ffffff"],
      });
    } else {
      setStatus("error");
    }
  };

  return (
    <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-[64px] md:py-24">
      <div className="relative flex flex-col items-center justify-between gap-8 overflow-hidden rounded-3xl bg-slate-900 p-10 text-white shadow-xl md:flex-row md:p-16">
        <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="relative z-10 text-center md:w-1/2 md:text-start">
          <h3 className="mb-4 text-3xl font-extrabold md:text-4xl text-white">{t("home.newsletterTitle")}</h3>
          <p className="text-base text-sky-100 md:text-lg">{t("home.newsletterText")}</p>
        </div>
        <div className="relative z-10 w-full md:w-1/2">
          {status === "success" ? (
            <div className="flex animate-in flex-col items-center justify-center space-y-4 rounded-2xl border border-sky-400/20 bg-sky-950/40 p-8 duration-500 fade-in zoom-in">
              <CheckCircle className="h-16 w-16 text-sky-400" />
              <h4 className="text-center text-2xl font-bold text-white">
                {t("home.newsletterSuccessTitle")}
              </h4>
              <p className="text-center text-lg text-sky-200">{t("home.newsletterSuccessText")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === "loading"}
                className="flex-grow rounded-xl bg-white px-6 py-4 text-start font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:opacity-70"
                placeholder={t("home.newsletterPlaceholder")}
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="whitespace-nowrap rounded-xl bg-sky-500 hover:bg-sky-600 px-8 py-4 font-bold text-white shadow-lg shadow-sky-500/20 transition-all duration-300 disabled:opacity-70"
              >
                {status === "loading" ? t("home.newsletterSubmitting") : t("home.newsletterSubmit")}
              </button>
            </form>
          )}
          {status === "error" && (
            <p className="mt-3 text-center text-sm text-sky-500 md:text-start">
              {t("home.newsletterError")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function StorefrontHomePage() {
  const href = useHref();
  const t = useT();
  const L = useLocalized();
  const dir = useDir();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [homepageData, setHomepageData] = useState<HomepageSection[]>([]);
  const { addToCart, user, requestLogin } = useStore();

  const handleAddToCart = (id: string, variantId: string, qty: number) => {
    if (!user) {
      requestLogin();
      return;
    }
    addToCart(id, variantId, qty);
  };

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [prods, cats, sections] = await Promise.all([
          featuredProducts(12),
          listCategories(),
          getHomepageSections(),
        ]);
        if (cancelled) return;
        setProducts(prods);
        setCategories(cats);
        setHomepageData(sections);
      } catch (err) {
        console.error("Failed to load storefront home data", err);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const childrenClothing = products.filter((p) => p.category === "children-clothing" || p.category === "kids-clothing").slice(0, 4);
  const schoolSupplies = products.filter((p) => p.category === "school-supplies").slice(0, 4);
  const displayClothing = childrenClothing.length > 0 ? childrenClothing : products.slice(0, 4);
  const displaySchool = schoolSupplies.length > 0 ? schoolSupplies : products.slice(0, 4);

  const heroSection = homepageData.find((s) => s.id === "hero" && s.active);
  const defaultSlides: HeroSlide[] = [
    {
      id: "default-slide-1",
      headingAr: "العزازي مول — عالم ملابس الأطفال والمدرسة",
      headingEn: "Al3azzazy — Kids Fashion & School Supplies",
      descriptionAr: "أرقى التشكيلات لجميع الأعمار من حديثي الولادة وحتى المحير بجودة عالية وأسعار ممتازة",
      descriptionEn: "Top quality fashion for babies, kids & teens plus school bags and tools",
      buttonTextAr: "تصفح التشكيلة",
      buttonTextEn: "Explore Collection",
      buttonLink: "/collections/children-clothing",
      image: FALLBACK_IMAGE,
    },
  ];
  const slides = (heroSection?.content?.["slides"] as HeroSlide[]) || defaultSlides;

  const benefitIcons = [ShieldCheck, Heart, Sparkles, Truck];

  return (
    <div
      dir={dir}
      className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 selection:bg-sky-200"
    >
      <HeroSlider slides={slides} />

      <TrustBar />

      <section className="mx-auto max-w-[1280px] px-5 py-16 md:px-[64px] md:py-24">
        <Reveal>
          <SectionHeading
            eyebrow={t("brand.name")}
            title={t("section.categories")}
            subtitle={t("section.categoriesSub")}
            viewAllHref={href("/collections")}
            viewAllLabel={t("section.viewAll")}
          />
        </Reveal>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 md:gap-8">
          {categories.slice(0, 2).map((cat, i) => (
            <Reveal key={cat.handle || i} delay={i * 90}>
              <Link
                to={href(`/collections/${cat.handle}`)}
                className="group relative block overflow-hidden rounded-3xl shadow-sm transition-shadow duration-500 hover:shadow-2xl"
              >
                <div className="aspect-[16/9] w-full overflow-hidden bg-sky-50">
                  <SmartImage
                    src={cat.image || FALLBACK_IMAGE}
                    fallbackSrc={FALLBACK_IMAGE}
                    alt={L(cat.name)}
                    objectFit="cover"
                    width={800}
                    height={450}
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="h-full w-full"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-8">
                  <div>
                    <h3 className="text-2xl md:text-3xl font-extrabold text-white">{L(cat.name)}</h3>
                    <p className="text-sm text-sky-100 mt-1 line-clamp-1">{L(cat.description)}</p>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition-all duration-300 group-hover:bg-amber-400 group-hover:text-slate-950">
                    <ArrowRight className="h-6 w-6 rtl:-scale-x-100" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="bg-sky-50/60 dark:bg-slate-900 py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-[64px]">
          <Reveal>
            <SectionHeading
              title={t("section.childrenClothing")}
              subtitle={t("section.childrenClothingSub")}
              viewAllHref={href("/collections/children-clothing")}
              viewAllLabel={t("section.viewAll")}
            />
          </Reveal>
          <ProductCarousel
            products={displayClothing}
            href={href}
            addToCart={handleAddToCart}
            aspectClass="aspect-square"
            objectFit="cover"
          />
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-[64px]">
          <Reveal>
            <SectionHeading
              title={t("section.schoolSupplies")}
              subtitle={t("section.schoolSuppliesSub")}
              viewAllHref={href("/collections/school-supplies")}
              viewAllLabel={t("section.viewAll")}
            />
          </Reveal>
          <ProductCarousel
            products={displaySchool}
            href={href}
            addToCart={handleAddToCart}
            aspectClass="aspect-[4/3]"
            objectFit="cover"
          />
        </div>
      </section>

      <section className="border-y border-sky-100 bg-white dark:border-slate-800 dark:bg-slate-900 py-16 md:py-24">
        <div className="mx-auto max-w-[1280px] px-5 md:px-[64px]">
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
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                      <Icon className="h-7 w-7" strokeWidth={1.5} />
                    </span>
                    <div>
                      <h4 className="mb-2 text-lg font-bold text-slate-900 dark:text-slate-100">{L(benefit.title)}</h4>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{L(benefit.desc)}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

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

      <Reveal>
        <NewsletterSection />
      </Reveal>
    </div>
  );
}
