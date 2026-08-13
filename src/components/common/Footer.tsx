import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Mail, MapPin, ChevronLeft, ChevronRight, Facebook, CreditCard } from "lucide-react";
import { getSettings } from "@/lib/services/firebase/settingsService";
import type { StoreSettings } from "@/lib/types";

const TikTokIcon = () => (
  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);
import { useHref, useDir, useT, useLocale } from "@/lib/locale";

export function Footer() {
  const href = useHref();
  const dir = useDir();
  const locale = useLocale();
  const t = useT();
  const ArrowIcon = dir === "rtl" ? ChevronLeft : ChevronRight;
  const [settings, setSettings] = useState<StoreSettings | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getSettings();
      setSettings(data);
    }
    load();
  }, []);

  const csPhone = settings?.customerServicePhone || settings?.phone || "01207864015";
  const salesPhone = settings?.salesPhone || "01016787142";
  const emailAddr = settings?.email || "info@sleephigh-eg.com";
  const branch1Text = settings?.branch1 || "كفر الزيات — شارع مجلس المدينة، بجوار البوسطة الجديدة";
  const branch2Text = settings?.branch2 || "كفر الزيات — بنوفر، بجوار بنك ناصر الاجتماعي";
  const facebookUrl = settings?.social?.facebook || "https://www.facebook.com/share/18dusX3iui/";
  const tiktokUrl = settings?.social?.tiktok || "https://tiktok.com/@sleephigh29";

  return (
    <footer className="relative bg-[#0B1220] text-slate-300 mt-16 transition-colors">
      {/* TOP ACCENT LINE */}
      <div className="h-[3px] w-full bg-gradient-to-r from-[#C8102E] via-[#E63950] to-[#C8102E]" />

      {/* MAIN FOOTER COLUMNS */}
      <div className="container-page pt-14 pb-12 space-y-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 text-xs">
          {/* COL 1: LOGO & BRAND DESCRIPTION */}
          <div className="space-y-5 md:col-span-1">
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg shadow-black/20">
              <img
                src="https://sleephigh-eg.myshopify.com/cdn/shop/files/h_logo_250x.png?v=1697100417"
                alt={t("brand.logoAlt")}
                className="h-11 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs font-medium">
              {locale === "ar"
                ? settings?.descriptionAr ||
                t("brand.description")
                : settings?.descriptionEn ||
                "SleepHigh is Egypt's leading bedding brand specializing in medical mattresses, luxury pillows, and hotel-grade sleep accessories."}
            </p>

            {/* SOCIAL */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 ring-1 ring-white/10 hover:bg-[#C8102E] hover:text-white hover:ring-[#C8102E] transition-all duration-200"
              >
                <Facebook className="h-3.5 w-3.5" />
              </a>
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 ring-1 ring-white/10 hover:bg-[#C8102E] hover:text-white hover:ring-[#C8102E] transition-all duration-200"
              >
                <TikTokIcon />
              </a>
            </div>
          </div>

          {/* COL 2: CONTACT */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white tracking-tight relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-[2px] after:w-8 after:bg-[#C8102E]">
              {t("footer.contact")}
            </h4>

            <div className="space-y-3">
              {/* Branch 1 */}
              <div className="flex items-start gap-2.5 group">
                <div className="mt-0.5 h-6 w-6 rounded-lg bg-[#C8102E]/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-[#C8102E]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                    {t("footer.branch1")}
                  </p>
                  <p className="text-slate-400 font-medium leading-relaxed text-[11px]">
                    {branch1Text}
                  </p>
                </div>
              </div>

              {/* Branch 2 */}
              <div className="flex items-start gap-2.5 group">
                <div className="mt-0.5 h-6 w-6 rounded-lg bg-[#C8102E]/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-[#C8102E]" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-0.5">
                    {t("footer.branch2")}
                  </p>
                  <p className="text-slate-400 font-medium leading-relaxed text-[11px]">
                    {branch2Text}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/5 pt-3 space-y-2">
                {/* Customer Service */}
                <a href={`tel:${csPhone}`} className="flex items-center gap-2.5 group">
                  <div className="h-6 w-6 rounded-lg bg-[#C8102E]/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-[#C8102E]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {t("footer.customerService")}
                    </p>
                    <p
                      dir="ltr"
                      className="text-slate-300 font-bold text-[11px] group-hover:text-white transition-colors"
                    >
                      {csPhone}
                    </p>
                  </div>
                </a>

                {/* Sales */}
                <a href={`tel:${salesPhone}`} className="flex items-center gap-2.5 group">
                  <div className="h-6 w-6 rounded-lg bg-[#C8102E]/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-[#C8102E]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {t("footer.sales")}
                    </p>
                    <p
                      dir="ltr"
                      className="text-slate-300 font-bold text-[11px] group-hover:text-white transition-colors"
                    >
                      {salesPhone}
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a href={`mailto:${emailAddr}`} className="flex items-center gap-2.5 group">
                  <div className="h-6 w-6 rounded-lg bg-[#C8102E]/10 flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5 text-[#C8102E]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {t("footer.email")}
                    </p>
                    <p
                      dir="ltr"
                      className="text-slate-300 font-bold text-[11px] group-hover:text-white transition-colors"
                    >
                      {emailAddr}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* COL 3: PRODUCTS */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white tracking-tight relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-[2px] after:w-8 after:bg-[#C8102E]">
              {t("footer.products")}
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-bold">
              <li>
                <Link
                  to={href("/collections/mattresses")}
                  className="group hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-[#C8102E] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.mattresses")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={href("/collections/pillows")}
                  className="group hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-[#C8102E] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.pillows")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* COL 4: CUSTOMER CARE & POLICIES */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white tracking-tight relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-[2px] after:w-8 after:bg-[#C8102E]">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-bold">
              <li>
                <Link
                  to={href("/about")}
                  className="group hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-[#C8102E] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.about")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={href("/contact")}
                  className="group hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-[#C8102E] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.contact")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={href("/account")}
                  className="group hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-[#C8102E] transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("header.account")}</span>
                </Link>
              </li>
            </ul>

            {/* Policy Links */}
            <div className="border-t border-white/5 pt-4 mt-4">
              <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">
                {t("footer.legal")}
              </h5>
              <ul className="space-y-2 text-slate-500 font-bold text-[11px]">
                <li>
                  <Link
                    to={href("/privacy")}
                    className="group hover:text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowIcon className="h-3 w-3 text-[#C8102E]/60 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    <span>{t("footer.privacy")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={href("/terms")}
                    className="group hover:text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowIcon className="h-3 w-3 text-[#C8102E]/60 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    <span>{t("footer.terms")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={href("/returns")}
                    className="group hover:text-slate-300 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowIcon className="h-3 w-3 text-[#C8102E]/60 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    <span>{t("footer.returns")}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT & PAYMENT METHODS */}
        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-semibold">
          <p>
            {locale === "ar"
              ? `© ${new Date().getFullYear()} ${t("brand.name")}. ${t("footer.rights")}.`
              : `© ${new Date().getFullYear()} ${t("brand.name")}. ${t("footer.rights")}.`}
          </p>
          <div className="flex items-center gap-2 rounded-full bg-white/[0.03] ring-1 ring-white/10 px-3.5 py-2 text-slate-400">
            <CreditCard className="h-4 w-4 text-[#C8102E]" />
            <span>
              {t("footer.payments")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
