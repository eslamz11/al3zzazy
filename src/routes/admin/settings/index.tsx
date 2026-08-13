import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Save,
  Store,
  Truck,
  CreditCard,
  Share2,
  MapPin,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  getSettings,
  updateSettings,
  validateSettings,
} from "@/lib/services/firebase/settingsService";
import { SleepHighLoader } from "@/components/common/SleepHighLoader";
import { useLocale } from "@/lib/locale";
import type { StoreSettings } from "@/lib/types";

export const Route = createFileRoute("/admin/settings/")({
  component: AdminSettingsPage,
});

function AdminSettingsPage() {
  const locale = useLocale();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setErrorMessages([]);
    setSuccessMsg(false);

    // Validate settings input
    const validation = validateSettings(settings);
    if (!validation.ok) {
      setErrorMessages(validation.errors);
      return;
    }

    setSaving(true);
    const res = await updateSettings(settings);
    setSaving(false);

    if (res.ok) {
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } else {
      setErrorMessages(["حدث خطأ أثناء حفظ البيانات في قاعدة البيانات."]);
    }
  };

  if (loading || !settings) {
    return (
      <div className="py-16">
        <SleepHighLoader label="جاري تحميل إعدادات متجر سليب هاي..." />
      </div>
    );
  }

  const currencyLabel = locale === "ar" ? "ج.م" : "EGP";

  return (
    <form onSubmit={handleSave} className="space-y-6 text-foreground dir-rtl pb-12">
      {/* PAGE HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">إعدادات المتجر العامة (Sleep High)</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            إدارة بيانات سليب هاي الفعليه، الفروع، أرقام التواصل، الشحن والتوصيل والروابط الرسمية
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center space-x-2 space-x-reverse rounded-xl bg-[#c8102e] px-6 py-3 text-xs font-bold text-white hover:bg-red-700 transition-colors shadow-xs disabled:opacity-50 min-h-[44px]"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              <span>حفظ التغييرات</span>
            </>
          )}
        </button>
      </div>

      {/* SUCCESS ALERTS */}
      {successMsg && (
        <div className="flex items-center space-x-2 space-x-reverse rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-700 shadow-2xs">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>تم حفظ تحديثات إعدادات المتجر بنجاح وتحديث الواجهة مباشرة.</span>
        </div>
      )}

      {/* ERROR ALERTS */}
      {errorMessages.length > 0 && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-xs font-bold text-[#c8102e] space-y-1">
          <div className="flex items-center space-x-2 space-x-reverse">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <span>يرجى تصحيح الأخطاء التالية قبل الحفظ:</span>
          </div>
          <ul className="list-disc list-inside pr-6 space-y-0.5 font-medium text-gray-700">
            {errorMessages.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* GENERAL BRAND INFO */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <Store className="h-4 w-4 text-[#c8102e]" />
            <span>بيانات المتجر والماركة</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-bold block mb-1">اسم المتجر بالعربية</label>
              <input
                type="text"
                required
                value={settings.nameAr}
                onChange={(e) => setSettings({ ...settings, nameAr: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </div>
            <div>
              <label className="font-bold block mb-1">اسم المتجر بالإنجليزية</label>
              <input
                type="text"
                required
                value={settings.nameEn}
                onChange={(e) => setSettings({ ...settings, nameEn: e.target.value })}
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">الوصف المختصر بالعربية</label>
            <textarea
              rows={3}
              value={settings.descriptionAr || ""}
              onChange={(e) => setSettings({ ...settings, descriptionAr: e.target.value })}
              className="w-full rounded-xl border border-input bg-background px-3 py-2 leading-relaxed"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">العنوان الرئيسي للمقر</label>
            <input
              type="text"
              value={settings.address || ""}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              placeholder="كفر الزيات — محافظة الغربية — مصر"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5"
            />
          </div>
        </div>

        {/* CONTACT PHONES & EMAIL */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <PhoneCall className="h-4 w-4 text-[#c8102e]" />
            <span>أرقام الهواتف والبريد</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-bold block mb-1">خدمة العملاء (Customer Service)</label>
              <input
                type="text"
                required
                value={settings.customerServicePhone || ""}
                onChange={(e) => setSettings({ ...settings, customerServicePhone: e.target.value })}
                placeholder="01207864015"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr text-right"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">قسم المبيعات (Sales)</label>
              <input
                type="text"
                required
                value={settings.salesPhone || ""}
                onChange={(e) => setSettings({ ...settings, salesPhone: e.target.value })}
                placeholder="01016787142"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr text-right"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">البريد الإلكتروني الرسمي</label>
            <input
              type="email"
              required
              value={settings.email || ""}
              onChange={(e) => setSettings({ ...settings, email: e.target.value })}
              placeholder="info@sleephigh-eg.com"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr text-right"
            />
          </div>
        </div>

        {/* BRANCHES INFORMATION */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <MapPin className="h-4 w-4 text-[#c8102e]" />
            <span>عنوان الفروع (Branches)</span>
          </h2>

          <div>
            <label className="font-bold block mb-1">الفرع الأول (Branch 1)</label>
            <input
              type="text"
              required
              value={settings.branch1 || ""}
              onChange={(e) => setSettings({ ...settings, branch1: e.target.value })}
              placeholder="كفر الزيات — شارع مجلس المدينة، بجوار البوسطة الجديدة"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5"
            />
          </div>

          <div>
            <label className="font-bold block mb-1">الفرع الثاني (Branch 2)</label>
            <input
              type="text"
              required
              value={settings.branch2 || ""}
              onChange={(e) => setSettings({ ...settings, branch2: e.target.value })}
              placeholder="كفر الزيات — بنوفر، بجوار بنك ناصر الاجتماعي"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5"
            />
          </div>
        </div>

        {/* SOCIAL MEDIA LINKS */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <Share2 className="h-4 w-4 text-[#c8102e]" />
            <span>حسابات وسائط التواصل</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-bold block mb-1">رابط تيك توك (TikTok)</label>
              <input
                type="text"
                value={settings.social.tiktok || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, tiktok: e.target.value },
                  })
                }
                placeholder="https://www.tiktok.com/@sleephigh29"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">رابط فيسبوك (Facebook)</label>
              <input
                type="text"
                value={settings.social.facebook || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    social: { ...settings.social, facebook: e.target.value },
                  })
                }
                placeholder="https://www.facebook.com/share/18dusX3iui/"
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1">واتساب (WhatsApp Link/Number)</label>
            <input
              type="text"
              value={settings.social.whatsapp || ""}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  social: { ...settings.social, whatsapp: e.target.value },
                })
              }
              placeholder="https://wa.me/201207864015"
              className="w-full rounded-xl border border-input bg-background px-3 py-2.5 dir-ltr"
            />
          </div>
        </div>

        {/* SHIPPING & DELIVERY */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <Truck className="h-4 w-4 text-[#c8102e]" />
            <span>إعدادات الشحن والتوصيل</span>
          </h2>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="font-bold block mb-1">رسوم الشحن القياسية ({currencyLabel})</label>
              <input
                type="number"
                value={settings.shipping.fee}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: { ...settings.shipping, fee: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </div>

            <div>
              <label className="font-bold block mb-1">حد الشحن المجاني ({currencyLabel})</label>
              <input
                type="number"
                value={settings.shipping.freeThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    shipping: { ...settings.shipping, freeThreshold: Number(e.target.value) },
                  })
                }
                className="w-full rounded-xl border border-input bg-background px-3 py-2.5"
              />
            </div>
          </div>
        </div>

        {/* PAYMENTS */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold border-b border-border pb-2 flex items-center space-x-2 space-x-reverse">
            <CreditCard className="h-4 w-4 text-[#c8102e]" />
            <span>خيارات الدفع</span>
          </h2>

          <label className="flex items-center space-x-3 space-x-reverse cursor-pointer p-3 rounded-xl bg-background border border-border hover:border-gray-400 transition-colors">
            <input
              type="checkbox"
              checked={settings.payments.codEnabled}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  payments: { ...settings.payments, codEnabled: e.target.checked },
                })
              }
              className="h-4 w-4 rounded-md border-input text-[#c8102e]"
            />
            <span className="font-bold text-gray-900">
              تفعيل الدفع عند الاستلام (Cash On Delivery)
            </span>
          </label>
        </div>
      </div>
    </form>
  );
}
