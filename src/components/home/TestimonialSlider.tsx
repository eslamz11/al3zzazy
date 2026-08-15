import { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { HOME_TESTIMONIALS } from "@/lib/content";
import { useLocalized, useT } from "@/lib/locale";

/** Animated customer testimonials with dots and prev/next controls. */
export function TestimonialSlider() {
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
    <div className="relative mx-auto max-w-4xl overflow-visible rounded-3xl border border-border bg-surface p-8 shadow-sm md:p-16">
      <div className="mb-8 flex justify-center gap-1 text-brand-yellow">
        {Array.from({ length: testimonial?.rating || 5 }).map((_, i) => (
          <Star key={i} className="h-6 w-6 fill-current" />
        ))}
      </div>

      <div
        className={`transition-all duration-300 ease-in-out ${slideClass} flex min-h-[140px] flex-col items-center justify-center`}
      >
        <p className="mb-8 max-w-3xl text-center text-lg font-medium leading-relaxed text-foreground md:text-2xl">
          &ldquo;{L(testimonial?.body)}&rdquo;
        </p>
        <div className="flex flex-col items-center gap-1.5">
          <span className="text-lg font-bold text-foreground">{L(testimonial?.name)}</span>
          <span className="text-sm font-medium text-muted-foreground">{L(testimonial?.city)}</span>
        </div>
      </div>

      <div className="mt-10 flex justify-center gap-2.5">
        {HOME_TESTIMONIALS.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i, i > active ? "left" : "right")}
            className={`rounded-full transition-all duration-300 ${
              i === active ? "h-2.5 w-8 bg-brand" : "h-2.5 w-2.5 bg-brand-soft hover:bg-brand/60"
            }`}
            aria-label={t("home.testimonialNav", { index: i + 1 })}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={prev}
        className="absolute -right-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition-all hover:bg-accent hover:text-brand md:flex"
        aria-label={t("common.previous")}
      >
        <ChevronRight className="ml-1 h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute -left-6 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-md transition-all hover:bg-accent hover:text-brand md:flex"
        aria-label={t("common.next")}
      >
        <ChevronLeft className="mr-1 h-6 w-6" />
      </button>
    </div>
  );
}
