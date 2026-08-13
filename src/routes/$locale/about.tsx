import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, ShieldCheck, Shirt, HeartHandshake, ChevronLeft } from "lucide-react";
import { useHref, useT, useDir } from "@/lib/locale";

export const Route = createFileRoute("/$locale/about")({
  component: AboutPage,
});

function AboutPage() {
  const href = useHref();
  const t = useT();
  const dir = useDir();

  return (
    <div dir={dir} className="container-page py-12 space-y-16 text-foreground">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-8 md:p-16 space-y-6 shadow-xl">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3.5 py-1 text-xs font-bold text-sky-300 border border-sky-400/30">
          <Sparkles className="h-3.5 w-3.5" />
          {t("about.eyebrow")}
        </span>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl text-white">
          {t("about.title")}
        </h1>
        <p className="text-sm md:text-base text-sky-100 max-w-3xl leading-relaxed">
          {t("about.intro")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Shirt className="h-6 w-6" />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{t("about.factoriesTitle")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("about.factoriesText")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{t("about.warrantyTitle")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("about.warrantyText")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{t("about.cottonTitle")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("about.cottonText")}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-sky-50 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <h3 className="font-black text-base text-slate-900 dark:text-slate-100">{t("about.supportTitle")}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {t("about.supportText")}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-right">
          <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            {t("about.ctaTitle")}
          </h3>
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">
            {t("about.ctaText")}
          </p>
        </div>
        <Link
          to={href("/collections/children-clothing")}
          className="inline-flex items-center space-x-2 space-x-reverse rounded-xl bg-sky-600 px-6 py-3.5 text-xs md:text-sm font-black text-white hover:bg-sky-700 transition-colors shadow-md shrink-0"
        >
          <span>{t("about.ctaButton")}</span>
          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
        </Link>
      </div>
    </div>
  );
}
