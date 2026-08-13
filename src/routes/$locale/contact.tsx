import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone,
  Mail,
  Send,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Loader2,
  MapPin,
} from "lucide-react";
import { getSettings } from "@/lib/services/firebase/settingsService";
import { submitSiteMessage } from "@/lib/services/firebase/messageService";
import type { StoreSettings } from "@/lib/types";
import { useT, useDir } from "@/lib/locale";

export const Route = createFileRoute("/$locale/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    subject: "",
    message: "",
  });
  const t = useT();
  const dir = useDir();

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings();
      setSettings(data);
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.name.trim() || !formData.phone.trim() || !formData.message.trim()) {
      setErrorMessage(t("contact.formMissing"));
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrorMessage(t("contact.formInvalidEmail"));
      return;
    }

    setSubmitting(true);
    const res = await submitSiteMessage({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      subject: formData.subject,
      message: formData.message,
    });
    setSubmitting(false);

    if (res.ok) {
      setSubmitted(true);
    } else {
      setErrorMessage(t("contact.formFailed"));
    }
  };

  const csPhone = settings?.customerServicePhone || settings?.phone || "01207864015";
  const salesPhone = settings?.salesPhone || "01016787142";
  const emailAddr = settings?.email || "info@al3azzazy.com";
  const facebookUrl = settings?.social?.facebook || "https://www.facebook.com/share/1LmRjaCWsU/?mibextid=wwXIfr";
  const tiktokUrl = settings?.social?.tiktok || "";
  const telegramUrl = settings?.social?.telegram || "";
  const address = settings?.address || "";
  const locationUrl = settings?.locationUrl || "";

  return (
    <div
      dir={dir}
      className="container-page py-10 md:py-14 space-y-10 md:space-y-14 text-foreground"
    >
      <div className="text-center space-y-3.5 max-w-2xl mx-auto px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 dark:bg-sky-950 px-4 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 shadow-2xs border border-sky-100 dark:border-sky-900">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{t("contact.badge")}</span>
        </span>
        <h1 className="text-2xl md:text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
          {t("contact.title")}
        </h1>
        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
          {t("contact.intro")}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-6">
            <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 border-b border-sky-100 dark:border-slate-800 pb-3.5 flex items-center justify-between">
              <span>{t("contact.infoTitle")}</span>
              <span className="text-xs font-bold text-sky-700 bg-sky-50 dark:bg-sky-950 dark:text-sky-300 px-2.5 py-1 rounded-full">
                {t("brand.name")}
              </span>
            </h2>

            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t("contact.phonesTitle")}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href={`tel:${csPhone}`}
                  className="flex flex-col p-3.5 rounded-2xl bg-sky-50/50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-700 hover:border-sky-400 hover:bg-sky-50 transition-all group"
                >
                  <span className="text-[11px] font-bold text-slate-500">{t("contact.customerService")}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      dir="ltr"
                      className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600"
                    >
                      {csPhone}
                    </span>
                    <Phone className="h-4 w-4 text-sky-600 shrink-0" />
                  </div>
                </a>

                <a
                  href={`tel:${salesPhone}`}
                  className="flex flex-col p-3.5 rounded-2xl bg-sky-50/50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-700 hover:border-sky-400 hover:bg-sky-50 transition-all group"
                >
                  <span className="text-[11px] font-bold text-slate-500">{t("contact.sales")}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      dir="ltr"
                      className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-sky-600"
                    >
                      {salesPhone}
                    </span>
                    <Phone className="h-4 w-4 text-sky-600 shrink-0" />
                  </div>
                </a>
              </div>
            </div>

              {/* Address */}
              {address && (
                <div className="flex items-start justify-between p-3.5 rounded-2xl bg-sky-50/50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-700">
                  <div className="flex items-start space-x-2.5 space-x-reverse">
                    <MapPin className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-bold text-slate-500 block mb-0.5">{t("contact.address") || "العنوان"}</span>
                      {locationUrl ? (
                        <a
                          href={locationUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-sky-600 hover:underline leading-relaxed"
                        >
                          {address}
                        </a>
                      ) : (
                        <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">{address}</span>
                      )}
                    </div>
                  </div>
                  {locationUrl && (
                    <ExternalLink className="h-3.5 w-3.5 text-sky-400 shrink-0 mt-1" />
                  )}
                </div>
              )}

              <a
                href={`mailto:${emailAddr}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-sky-50/50 dark:bg-slate-800/50 border border-sky-100 dark:border-slate-700 hover:border-sky-400 transition-all group"
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <Mail className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{t("contact.email")}</span>
                </div>
                <span
                  dir="ltr"
                  className="text-xs font-semibold text-slate-600 dark:text-slate-400 group-hover:text-sky-600"
                >
                  {emailAddr}
                </span>
              </a>

              <div className="flex flex-col gap-2 pt-1">
                {/* Facebook */}
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 space-x-reverse py-3 px-4 rounded-xl bg-[#1877F2] text-white hover:bg-blue-700 text-xs font-bold transition-all shadow-xs w-full"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                  <span>{t("contact.facebook")}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                {/* TikTok */}
                {tiktokUrl && (
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 space-x-reverse py-3 px-4 rounded-xl bg-black text-white hover:bg-slate-800 text-xs font-bold transition-all shadow-xs w-full"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.2 8.2 0 004.81 1.54V6.77a4.85 4.85 0 01-1.04-.08z"/>
                    </svg>
                    <span>TikTok</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}

                {/* Telegram */}
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 space-x-reverse py-3 px-4 rounded-xl bg-[#229ED9] text-white hover:bg-sky-600 text-xs font-bold transition-all shadow-xs w-full"
                  >
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                    <span>Telegram</span>
                    <ExternalLink className="h-3 w-3 opacity-60" />
                  </a>
                )}
              </div>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-sky-100 dark:border-slate-800 shadow-xs space-y-6">
          <h2 className="font-extrabold text-lg text-slate-900 dark:text-slate-100 border-b border-sky-100 dark:border-slate-800 pb-3.5">
            {t("contact.formTitle")}
          </h2>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-600">
              {errorMessage}
            </div>
          )}

          {submitted ? (
            <div className="py-14 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-slate-100">{t("contact.successTitle")}</h3>
                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400">
                  {t("contact.successText")}
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-sky-50 dark:bg-slate-800 hover:bg-sky-100 text-xs font-bold text-sky-900 dark:text-sky-300 transition-colors"
              >
                {t("contact.sendAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    {t("contact.formName")} <span className="text-sky-600">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("contact.formNamePlaceholder")}
                    className="w-full p-3 bg-sky-50/50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    {t("contact.formPhone")} <span className="text-sky-600">*</span>
                  </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full p-3 bg-sky-50/50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">
                    {t("contact.formEmail")}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full p-3 bg-sky-50/50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all dir-ltr text-right"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-slate-800 dark:text-slate-200 block">{t("contact.formSubject")}</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("contact.formSubjectPlaceholder")}
                    className="w-full p-3 bg-sky-50/50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-slate-800 dark:text-slate-200 block">
                  {t("contact.formMessage")} <span className="text-sky-600">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("contact.formMessagePlaceholder")}
                  className="w-full p-3 bg-sky-50/50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-xl focus:outline-none focus:border-sky-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 font-extrabold text-sm text-white flex items-center justify-center space-x-2 space-x-reverse transition-all shadow-md disabled:opacity-60 min-h-[48px]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("contact.formSubmitting")}</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>{t("contact.formSubmit")}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
