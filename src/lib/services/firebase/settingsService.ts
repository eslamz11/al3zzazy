/**
 * Settings service — store-level settings in Firestore.
 */

import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { StoreSettings } from "@/lib/types";

const SETTINGS_DOC = "settings/store";

const DEFAULT_SETTINGS: StoreSettings = {
  nameAr: "سليب هاي",
  nameEn: "SleepHigh",
  phone: "01207864015",
  customerServicePhone: "01207864015",
  salesPhone: "01016787142",
  email: "info@sleephigh-eg.com",
  address: "كفر الزيات — محافظة الغربية — مصر",
  branch1: "كفر الزيات — شارع مجلس المدينة، بجوار البوسطة الجديدة",
  branch2: "كفر الزيات — بنوفر، بجوار بنك ناصر الاجتماعي",
  descriptionAr:
    "سليب هاي هي العلامة التجارية المصرية الأولى المتخصصة في إنتاج وتفصيل المراتب الطبية والوسائد المصنعة وفق مواصفات النوم الفندقي الفاخر.",
  descriptionEn:
    "SleepHigh is Egypt's leading bedding brand specializing in medical mattresses, luxury pillows, and hotel-grade sleep accessories.",
  shipping: {
    fee: 150,
    freeThreshold: 5000,
    areas: ["القاهرة", "الجيزة", "الإسكندرية", "كفر الزيات", "الغربية"],
  },
  payments: {
    codEnabled: true,
    onlineEnabled: false,
  },
  social: {
    tiktok: "https://www.tiktok.com/@sleephigh29",
    facebook: "https://www.facebook.com/share/18dusX3iui/",
  },
  seo: {
    titleAr: "سليب هاي — مراتب ووسائد مصرية فاخرة",
    titleEn: "SleepHigh — Egyptian Premium Mattresses & Pillows",
    descriptionAr: "اكتشف مراتب، وسائد، ومراتب تطرية مصممة لأفضل تجربة نوم.",
    descriptionEn:
      "Discover mattresses, pillows, and toppers designed for the best sleep experience.",
  },
};

let cachedSettings: StoreSettings | null = null;
let settingsFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache

/** Get store settings. Falls back to defaults if not set. */
export async function getSettings(): Promise<StoreSettings> {
  if (cachedSettings && Date.now() - settingsFetchTime < CACHE_TTL_MS) {
    return cachedSettings;
  }

  try {
    const snap = await getDoc(doc(db, "settings", "store"));
    const result = !snap.exists()
      ? DEFAULT_SETTINGS
      : { ...DEFAULT_SETTINGS, ...(snap.data() as Partial<StoreSettings>) };
    cachedSettings = result;
    settingsFetchTime = Date.now();
    return result;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/** Update store settings (admin only). */
export async function updateSettings(
  data: Partial<StoreSettings>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await setDoc(
      doc(db, "settings", "store"),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
    cachedSettings = null;
    settingsFetchTime = 0;
    return { ok: true };
  } catch (err) {
    console.error("[settingsService] updateSettings error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Validation helper for settings */
export function validateSettings(data: Partial<StoreSettings>): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("البريد الإلكتروني غير صحيح.");
  }
  if (data.customerServicePhone && !/^[\d\s+()-]{7,15}$/.test(data.customerServicePhone)) {
    errors.push("رقم هاتف خدمة العملاء غير صحيح.");
  }
  if (data.salesPhone && !/^[\d\s+()-]{7,15}$/.test(data.salesPhone)) {
    errors.push("رقم هاتف المبيعات غير صحيح.");
  }
  if (data.social?.facebook && !data.social.facebook.startsWith("http")) {
    errors.push("رابط فيسبوك يجب أن يبدأ بـ http:// أو https://");
  }
  if (data.social?.tiktok && !data.social.tiktok.startsWith("http")) {
    errors.push("رابط تيك توك يجب أن يبدأ بـ http:// أو https://");
  }

  return { ok: errors.length === 0, errors };
}

export { DEFAULT_SETTINGS };
