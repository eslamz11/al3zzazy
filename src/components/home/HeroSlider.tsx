import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { SmartImage } from "@/components/common/SmartImage";
import { useDir, useHref, useLocalized, useT } from "@/lib/locale";
import type { HeroSlide } from "@/lib/types";

/** Strip a leading /ar or /en so links stay locale-relative. */
function stripLocalePrefix(path: string): string {
  return path.replace(/^\/(ar|en)(?=\/|$)/, "") || "/";
}

/** Full-bleed hero carousel driven by the CMS `hero` section slides. */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
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
      className="relative h-[82svh] max-h-[760px] min-h-[500px] w-full overflow-hidden bg-slate-900 md:h-[620px] lg:h-[680px]"
      aria-roledescription="carousel"
    >
      {slides.map((slide, idx) => {
        const heading = L({ ar: slide.headingAr, en: slide.headingEn }) || t("hero.title");
        const description =
          L({ ar: slide.descriptionAr, en: slide.descriptionEn }) || t("hero.subtitle");
        const buttonText =
          L({ ar: slide.buttonTextAr, en: slide.buttonTextEn }) || t("hero.ctaPrimary");
        const primaryLink = slide.buttonLink
          ? stripLocalePrefix(slide.buttonLink)
          : "/collections/children-clothing";
        const isActive = idx === current;
        return (
          <div
            key={slide.id || idx}
            className={`absolute inset-0 transition-opacity duration-[900ms] ease-in-out ${
              isActive ? "z-20 opacity-100" : "pointer-events-none z-10 opacity-0"
            }`}
            aria-hidden={!isActive}
          >
            <SmartImage
              src={slide.image}
              alt={heading}
              fill
              objectFit="cover"
              priority={idx === 0}
              width={1600}
              height={800}
              sizes="100vw"
              imgClassName={`transition-transform duration-[9000ms] ease-linear ${
                isActive ? "scale-[1.08]" : "scale-100"
              }`}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/85 via-slate-900/50 to-slate-900/20" />

            <div
              dir={dir}
              className="relative z-20 mx-auto flex h-full max-w-[1280px] flex-col items-center justify-end px-6 pb-16 text-center text-white md:items-start md:justify-center md:px-[64px] md:pb-0 md:text-start"
            >
              <div className="max-w-2xl">
                <span
                  className={`mb-4 inline-flex items-center gap-2 rounded-full bg-brand-yellow px-4 py-1.5 text-xs font-extrabold tracking-wide text-slate-950 transition-all duration-700 md:text-sm ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
                  }`}
                >
                  <Sparkles className="h-4 w-4 fill-current" />
                  {t("brand.name")} — {t("brand.tagline")}
                </span>
                <h1
                  className={`mb-4 text-3xl font-black leading-tight text-white transition-all delay-75 duration-700 sm:text-5xl lg:text-[54px] ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  {heading}
                </h1>
                <p
                  className={`mx-auto mb-8 max-w-xl text-base text-slate-100 transition-all delay-150 duration-700 md:mx-0 md:text-lg lg:text-xl ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  {description}
                </p>
                <div
                  className={`flex flex-col items-stretch justify-center gap-3 transition-all delay-200 duration-700 sm:flex-row sm:items-center md:justify-start ${
                    isActive ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                  }`}
                >
                  <Link
                    to={href(primaryLink)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-8 py-3.5 font-extrabold tracking-wide text-brand-foreground shadow-lg shadow-brand/30 transition-all duration-300 hover:bg-brand-hover"
                  >
                    {buttonText}
                    <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
                  </Link>
                  <Link
                    to={href("/collections/school-supplies")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-yellow px-7 py-3.5 font-extrabold tracking-wide text-slate-950 shadow-lg shadow-brand-yellow/20 transition-all duration-300 hover:bg-brand-yellow-hover"
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

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrent(idx)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === current ? "w-8 bg-brand" : "w-2.5 bg-white/50 hover:bg-white/80"
              }`}
              aria-label={t("hero.slide", { index: idx + 1 })}
              aria-current={idx === current}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
