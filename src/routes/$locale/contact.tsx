import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  CheckCircle2,
  MessageSquare,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { getSettings } from "@/lib/services/firebase/settingsService";
import { submitSiteMessage } from "@/lib/services/firebase/messageService";
import type { StoreSettings } from "@/lib/types";
import { useT, useFormatters, useDir } from "@/lib/locale";

const TikTokIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
  </svg>
);

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
  const { price } = useFormatters();

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
  const emailAddr = settings?.email || "info@sleephigh-eg.com";
  const branch1Text =
    (dir === "ltr" ? settings?.branch1En : settings?.branch1) || t("footer.branch1Address");
  const branch2Text =
    (dir === "ltr" ? settings?.branch2En : settings?.branch2) || t("footer.branch2Address");
  const tiktokUrl = settings?.social?.tiktok || "https://www.tiktok.com/@sleephigh29";
  const facebookUrl = settings?.social?.facebook || "https://www.facebook.com/share/18dusX3iui/";

  return (
    <div
      dir={dir}
      className="container-page py-10 md:py-14 space-y-10 md:space-y-14 text-foreground"
    >
      {/* HEADER BANNER */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto px-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fde8ea] px-4 py-1.5 text-xs font-bold text-[#C8102E] shadow-2xs">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{t("contact.badge")}</span>
        </span>
         <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
           {t("contact.title")}
         </h1>
         <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
           {t("contact.intro")}
         </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* CONTACT INFO & BRANCHES (MOBILE OPTIMIZED CARDS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
            <h2 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3.5 flex items-center justify-between">
               <span>{t("contact.infoTitle")}</span>
              <span className="text-xs font-bold text-[#C8102E] bg-red-50 px-2.5 py-1 rounded-full">
                Sleep High
              </span>
            </h2>

            {/* BRANCHES LIST */}
            <div className="space-y-4">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                 {t("contact.branchesTitle")}
               </h3>

              {/* Branch 1 */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-gray-100 space-y-1.5 transition-all hover:border-red-200">
                <div className="flex items-center space-x-2 space-x-reverse text-[#C8102E]">
                  <MapPin className="h-4 w-4 shrink-0" />
                   <span className="font-bold text-xs text-gray-900">{t("contact.branch1")}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed pr-6">
                  {branch1Text}
                </p>
              </div>

              {/* Branch 2 */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-gray-100 space-y-1.5 transition-all hover:border-red-200">
                <div className="flex items-center space-x-2 space-x-reverse text-[#C8102E]">
                  <MapPin className="h-4 w-4 shrink-0" />
                   <span className="font-bold text-xs text-gray-900">{t("contact.branch2")}</span>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed pr-6">
                  {branch2Text}
                </p>
              </div>
            </div>

            {/* PHONE NUMBERS (CLICKABLE TOUCH TARGETS FOR MOBILE) */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                 {t("contact.phonesTitle")}
               </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Customer Service */}
                <a
                  href={`tel:${csPhone}`}
                  className="flex flex-col p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C8102E] hover:bg-red-50/50 transition-all group"
                >
                   <span className="text-[11px] font-bold text-gray-500">{t("contact.customerService")}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      dir="ltr"
                      className="text-sm font-extrabold text-gray-900 group-hover:text-[#C8102E]"
                    >
                      {csPhone}
                    </span>
                    <Phone className="h-4 w-4 text-[#C8102E] shrink-0" />
                  </div>
                </a>

                {/* Sales */}
                <a
                  href={`tel:${salesPhone}`}
                  className="flex flex-col p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C8102E] hover:bg-red-50/50 transition-all group"
                >
                   <span className="text-[11px] font-bold text-gray-500">{t("contact.sales")}</span>
                  <div className="flex items-center justify-between mt-1">
                    <span
                      dir="ltr"
                      className="text-sm font-extrabold text-gray-900 group-hover:text-[#C8102E]"
                    >
                      {salesPhone}
                    </span>
                    <Phone className="h-4 w-4 text-[#C8102E] shrink-0" />
                  </div>
                </a>
              </div>
            </div>

            {/* EMAIL & SOCIAL MEDIA */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                 {t("contact.socialTitle")}
               </h3>

              <a
                href={`mailto:${emailAddr}`}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-[#C8102E] hover:bg-red-50/50 transition-all group"
              >
                <div className="flex items-center space-x-2.5 space-x-reverse">
                  <Mail className="h-4 w-4 text-[#C8102E] shrink-0" />
                   <span className="text-xs font-bold text-gray-900">{t("contact.email")}</span>
                </div>
                <span
                  dir="ltr"
                  className="text-xs font-semibold text-gray-600 group-hover:text-[#C8102E]"
                >
                  {emailAddr}
                </span>
              </a>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 space-x-reverse py-3 px-4 rounded-xl bg-black text-white hover:bg-gray-800 text-xs font-bold transition-all shadow-xs"
                >
                  <TikTokIcon />
                   <span>{t("contact.tiktok")}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>

                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center space-x-2 space-x-reverse py-3 px-4 rounded-xl bg-[#1877F2] text-white hover:bg-blue-700 text-xs font-bold transition-all shadow-xs"
                >
                  <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                   <span>{t("contact.facebook")}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-xs space-y-6">
           <h2 className="font-extrabold text-lg text-gray-900 border-b border-gray-100 pb-3.5">
             {t("contact.formTitle")}
           </h2>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-[#C8102E]">
              {errorMessage}
            </div>
          )}

          {submitted ? (
            <div className="py-14 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <div className="space-y-1">
                 <h3 className="font-extrabold text-xl text-gray-900">{t("contact.successTitle")}</h3>
                 <p className="text-xs md:text-sm text-gray-600">
                   {t("contact.successText")}
                 </p>
              </div>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: "", phone: "", email: "", subject: "", message: "" });
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 transition-colors"
              >
                 {t("contact.sendAnother")}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="font-bold text-gray-800 block">
                     {t("contact.formName")} <span className="text-[#C8102E]">*</span>
                   </label>
                  <input
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t("contact.formNamePlaceholder")}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8102E] focus:bg-white transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="font-bold text-gray-800 block">
                     {t("contact.formPhone")} <span className="text-[#C8102E]">*</span>
                   </label>
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="010XXXXXXXX"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8102E] focus:bg-white transition-all dir-ltr text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="font-bold text-gray-800 block">
                     {t("contact.formEmail")}
                   </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8102E] focus:bg-white transition-all dir-ltr text-right"
                  />
                </div>

                <div className="space-y-1.5">
                   <label className="font-bold text-gray-800 block">{t("contact.formSubject")}</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder={t("contact.formSubjectPlaceholder")}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8102E] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                   <label className="font-bold text-gray-800 block">
                     {t("contact.formMessage")} <span className="text-[#C8102E]">*</span>
                   </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={t("contact.formMessagePlaceholder")}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#C8102E] focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 px-6 rounded-2xl bg-[#C8102E] hover:bg-red-700 font-extrabold text-sm text-white flex items-center justify-center space-x-2 space-x-reverse transition-all shadow-md disabled:opacity-60 min-h-[48px]"
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
