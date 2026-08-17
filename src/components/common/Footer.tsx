import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, Mail, ChevronLeft, ChevronRight, Facebook, CreditCard, MapPin } from "lucide-react";
import { getSettings } from "@/lib/services/firebase/settingsService";
import type { StoreSettings } from "@/lib/types";
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
  const emailAddr = settings?.email || "info@al3azzazy.com";
  const facebookUrl = settings?.social?.facebook || "https://www.facebook.com/share/1LmRjaCWsU/?mibextid=wwXIfr";
  const tiktokUrl = settings?.social?.tiktok || "";
  const telegramUrl = settings?.social?.telegram || "";
  const address = settings?.address || "كفر الزيات — محافظة الغربية — مصر";
  const locationUrl = settings?.locationUrl || "";

  const storeLogo = "/icons/logo.png";

  return (
    <footer className="relative bg-slate-900 text-slate-300 mt-16 transition-colors">
      <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-amber-400 to-sky-500" />

      <div className="container-page pt-14 pb-12 space-y-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4 text-xs">
          {/* Brand column */}
          <div className="space-y-5 md:col-span-1">
            <div className="bg-white p-2.5 rounded-2xl inline-block shadow-lg shadow-black/20">
              <img
                src={storeLogo}
                alt={t("brand.logoAlt")}
                className="h-12 w-auto object-contain"
              />
            </div>
            <p className="text-slate-400 leading-relaxed text-xs font-medium">
              {locale === "ar"
                ? settings?.descriptionAr ||
                  "العزازي مول — عالم من الأناقة لملابس الأطفال، حديثي الولادة والمحير مع أجود المستلزمات والحقائب المدرسية."
                : settings?.descriptionEn ||
                  "Al3azzazy Store is your primary destination for kids fashion, newborn wear, teens clothing, and premium school supplies."}
            </p>

            {/* Address — clickable to map if locationUrl is set */}
            {address && (
              <div className="flex items-start gap-2 pt-1">
                <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" />
                </div>
                {locationUrl ? (
                  <a
                    href={locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 font-medium leading-relaxed hover:text-sky-300 transition-colors text-[11px]"
                  >
                    {address}
                  </a>
                ) : (
                  <span className="text-slate-400 font-medium leading-relaxed text-[11px]">
                    {address}
                  </span>
                )}
              </div>
            )}

            {/* Social icons */}
            <div className="flex items-center gap-2.5 pt-1 flex-wrap">
              {/* Facebook */}
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 hover:bg-[#1877F2] hover:text-white hover:ring-[#1877F2] transition-all duration-200"
              >
                <Facebook className="h-4 w-4" />
              </a>

              {/* TikTok */}
              {tiktokUrl && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 hover:bg-black hover:text-white hover:ring-black transition-all duration-200"
                >
                  {/* TikTok SVG */}
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.81 1.54V6.77a4.85 4.85 0 01-1.04-.08z"/>
                  </svg>
                </a>
              )}

              {/* Telegram */}
              {telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20 hover:bg-[#229ED9] hover:text-white hover:ring-[#229ED9] transition-all duration-200"
                >
                  {/* Telegram SVG */}
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Contact column */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white tracking-tight relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-[2px] after:w-8 after:bg-sky-500">
              {t("footer.contact")}
            </h4>

            <div className="space-y-3">
              <div className="pt-1 space-y-2.5">
                <a href={`tel:${csPhone}`} className="flex items-center gap-2.5 group">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {t("footer.customerService")}
                    </p>
                    <p
                      dir="ltr"
                      className="text-slate-300 font-bold text-[11px] group-hover:text-sky-300 transition-colors"
                    >
                      {csPhone}
                    </p>
                  </div>
                </a>

                <a href={`tel:${salesPhone}`} className="flex items-center gap-2.5 group">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Phone className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {t("footer.sales")}
                    </p>
                    <p
                      dir="ltr"
                      className="text-slate-300 font-bold text-[11px] group-hover:text-sky-300 transition-colors"
                    >
                      {salesPhone}
                    </p>
                  </div>
                </a>

                <a href={`mailto:${emailAddr}`} className="flex items-center gap-2.5 group">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
                    <Mail className="h-3.5 w-3.5 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">
                      {t("footer.email")}
                    </p>
                    <p
                      dir="ltr"
                      className="text-slate-300 font-bold text-[11px] group-hover:text-sky-300 transition-colors"
                    >
                      {emailAddr}
                    </p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Products column */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white tracking-tight relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-[2px] after:w-8 after:bg-sky-500">
              {t("footer.products")}
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-bold">
              <li>
                <Link
                  to={href("/collections/children-clothing")}
                  className="group hover:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-sky-400 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.childrenClothing")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={href("/collections/school-supplies")}
                  className="group hover:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-sky-400 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.schoolSupplies")}</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div className="space-y-4">
            <h4 className="font-black text-sm text-white tracking-tight relative inline-block pb-2.5 after:content-[''] after:absolute after:bottom-0 after:start-0 after:h-[2px] after:w-8 after:bg-sky-500">
              {t("footer.support")}
            </h4>
            <ul className="space-y-2.5 text-slate-400 font-bold">
              <li>
                <Link
                  to={href("/about")}
                  className="group hover:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-sky-400 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.about")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={href("/contact")}
                  className="group hover:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-sky-400 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("nav.contact")}</span>
                </Link>
              </li>
              <li>
                <Link
                  to={href("/account")}
                  className="group hover:text-sky-300 transition-colors flex items-center gap-1.5"
                >
                  <ArrowIcon className="h-3.5 w-3.5 text-sky-400 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  <span>{t("header.account")}</span>
                </Link>
              </li>
            </ul>

            <div className="border-t border-white/5 pt-4 mt-4">
              <h5 className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-3">
                {t("footer.legal")}
              </h5>
              <ul className="space-y-2 text-slate-400 font-bold text-[11px]">
                <li>
                  <Link
                    to={href("/privacy")}
                    className="group hover:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowIcon className="h-3 w-3 text-sky-400/60 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    <span>{t("footer.privacy")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={href("/terms")}
                    className="group hover:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowIcon className="h-3 w-3 text-sky-400/60 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    <span>{t("footer.terms")}</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to={href("/returns")}
                    className="group hover:text-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <ArrowIcon className="h-3 w-3 text-sky-400/60 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    <span>{t("footer.returns")}</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-400 font-semibold">
          <p>
            © {new Date().getFullYear()} {t("brand.name")}. {t("footer.rights")}.
          </p>
          <div className="flex items-center gap-2 rounded-full bg-white/[0.03] ring-1 ring-white/10 px-3.5 py-2 text-slate-300">
            <CreditCard className="h-4 w-4 text-sky-400" />
            <span>{t("footer.payments")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
