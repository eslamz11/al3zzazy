import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, ShieldCheck, Factory, HeartHandshake, ChevronLeft } from "lucide-react";
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
      {/* HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-[#990011] text-white p-8 md:p-16 space-y-6 shadow-xl">
         <span className="inline-block rounded-full bg-red-500/20 px-3.5 py-1 text-xs font-bold text-red-300 border border-red-500/30">
           {t("about.eyebrow")}
         </span>
         <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl">
           {t("about.title")}
         </h1>
         <p className="text-xs md:text-base text-gray-300 max-w-3xl leading-relaxed">
           {t("about.intro")}
         </p>
      </div>

      {/* BRAND VALUES GRID */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-[#C8102E]">
            <Factory className="h-6 w-6" />
          </div>
           <h3 className="font-black text-base text-gray-900">{t("about.factoriesTitle")}</h3>
           <p className="text-xs text-gray-500 leading-relaxed">
             {t("about.factoriesText")}
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-[#C8102E]">
            <Award className="h-6 w-6" />
          </div>
           <h3 className="font-black text-base text-gray-900">{t("about.warrantyTitle")}</h3>
           <p className="text-xs text-gray-500 leading-relaxed">
             {t("about.warrantyText")}
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-[#C8102E]">
            <ShieldCheck className="h-6 w-6" />
          </div>
           <h3 className="font-black text-base text-gray-900">{t("about.cottonTitle")}</h3>
           <p className="text-xs text-gray-500 leading-relaxed">
             {t("about.cottonText")}
           </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-3">
          <div className="h-12 w-12 rounded-xl bg-red-50 flex items-center justify-center text-[#C8102E]">
            <HeartHandshake className="h-6 w-6" />
          </div>
           <h3 className="font-black text-base text-gray-900">{t("about.supportTitle")}</h3>
           <p className="text-xs text-gray-500 leading-relaxed">
             {t("about.supportText")}
           </p>
        </div>
      </div>

      {/* BOTTOM CALL TO ACTION */}
      <div className="bg-white p-8 md:p-12 rounded-3xl border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-right">
           <h3 className="text-xl md:text-2xl font-black text-gray-900">
             {t("about.ctaTitle")}
           </h3>
           <p className="text-xs md:text-sm text-gray-500">
             {t("about.ctaText")}
           </p>
        </div>
        <Link
          to={href("/collections/mattresses")}
          className="inline-flex items-center space-x-2 space-x-reverse rounded-xl bg-[#C8102E] px-6 py-3.5 text-xs md:text-sm font-black text-white hover:bg-red-700 transition-colors shadow-md shrink-0"
        >
           <span>{t("about.ctaButton")}</span>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
