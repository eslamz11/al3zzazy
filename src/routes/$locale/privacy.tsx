import { createFileRoute, Link } from "@tanstack/react-router";
import { useHref, useT, useDir } from "@/lib/locale";
import { Shield, Home, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/$locale/privacy")({
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  const href = useHref();
  const t = useT();
  const dir = useDir();

  return (
    <div dir={dir} className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-[#1c1b1b] via-[#2a1f1e] to-[#1c1b1b]">
        <div className="absolute top-0 left-0 w-80 h-80 bg-brand/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />
        <div className="relative max-w-[900px] mx-auto px-5 md:px-8 py-14 md:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/50 text-sm mb-6">
            <Link
              to={href("/")}
              className="hover:text-white transition-colors flex items-center gap-1"
            >
              <Home className="h-3.5 w-3.5" />
               <span>{t("common.home")}</span>
            </Link>
            <ChevronDown className="h-3 w-3 rotate-90" />
             <span className="text-white font-medium">{t("privacy.title")}</span>
          </nav>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">{t("privacy.title")}</h1>
          </div>
          <p className="text-white/60 text-sm">{t("policy.lastUpdated")}</p>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-[900px] mx-auto px-5 md:px-8 py-10 md:py-16">
        <div className="prose-policy space-y-10">
          <section>
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-sm font-black flex items-center justify-center">
                1
              </span>
              {t("privacy.s1Title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
             {t("privacy.s1Text")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-sm font-black flex items-center justify-center">
                2
              </span>
              {t("privacy.s2Title")}
            </h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s2Item1Label")} {t("privacy.s2Item1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s2Item2Label")} {t("privacy.s2Item2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s2Item3Label")} {t("privacy.s2Item3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s2Item4Label")} {t("privacy.s2Item4")}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-sm font-black flex items-center justify-center">
                3
              </span>
              {t("privacy.s3Title")}
            </h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s3Item1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s3Item2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s3Item3")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s3Item4")}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-sm font-black flex items-center justify-center">
                4
              </span>
              {t("privacy.s4Title")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
             {t("privacy.s4Text")}
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-sm font-black flex items-center justify-center">
                5
              </span>
              {t("privacy.s5Title")}
            </h2>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s5Item1")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s5Item2")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 shrink-0" />
                 <span>{t("privacy.s5Item3")}</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-brand/10 text-brand text-sm font-black flex items-center justify-center">
                6
              </span>
              {t("policy.contactUs")}
            </h2>
            <p className="text-muted-foreground leading-relaxed text-sm">
               {t("privacy.s6Text")}{" "}
               <Link to={href("/contact")} className="text-brand font-bold hover:underline">
                 {t("policy.contactLink")}
               </Link>{" "}
               {t("privacy.s6TextEnd")} info@sleephigh-eg.com
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
