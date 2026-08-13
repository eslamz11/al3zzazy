/**
 * Homepage CMS Service — allows admin to control homepage sections via Firestore.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { HomepageSection } from "@/lib/types";

const HOMEPAGE_COL = "homepage";

const DEFAULT_SECTIONS: HomepageSection[] = [
  {
    id: "announcement_bar",
    type: "announcement_bar",
    order: -1,
    active: true,
    content: {
      textAr: "",
      textEn: "",
    },
  },
  {
    id: "hero",
    type: "hero",
    order: 0,
    active: true,
    content: {
      slides: [
        {
          id: "slide_1",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDUBSHwgL0VmBdEGE-Q5dt9DkbwG6eVXv_42_Cb3TecEe3jW-I3S0nuY3GNH-9ZsFborBsO_sAcQi5YpHeXI2ye5aw070Nf6jUMp7OGDweABdOdSnoukjNGKp-NsLWzvQC_DWJXOc3eOPug1dm0LOycsiz-197f8BWcb-TJ4bY6C-9LM95hM_kwYGU5jErK3ZIvUS0XvlLEiuy3C3k__CXCahFoJZfjEcQDNuyY9EUktArCgjOVPemv",
          headingAr: "نوم أفضل يبدأ من هنا",
          headingEn: "Better sleep starts here",
          descriptionAr:
            "اكتشف منتجات نوم مصممة لتمنحك الراحة والدعم كل ليلة، بخامات مختارة وتصنيع مصري بمعايير عالية.",
          descriptionEn:
            "Discover sleep products designed for ultimate comfort and support every night.",
          buttonTextAr: "تسوق الآن",
          buttonTextEn: "Shop now",
          buttonLink: "/ar/collections",
        },
        {
          id: "slide_2",
          image:
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1200&auto=format&fit=crop",
          headingAr: "قم بتصميم مرتبتك الخاصة",
          headingEn: "Design your custom mattress",
          descriptionAr: "كل تصميم ولون فراش مخصص لأحلامك. اختر العرض والطول والارتفاع والنوع",
          descriptionEn: "Every design and color customized for your dreams.",
          buttonTextAr: "ابدأ بالتصميم",
          buttonTextEn: "Start designing",
          buttonLink: "/ar/collections/mattresses",
        },
      ],
    },
  },
  {
    id: "categories",
    type: "categories",
    order: 1,
    active: true,
    content: {
      headingAr: "تصفح حسب الفئة",
      headingEn: "Shop by Category",
    },
  },
  {
    id: "featured_products",
    type: "featured_products",
    order: 2,
    active: true,
    content: {
      headingAr: "المنتجات الأكثر طلباً",
      headingEn: "Popular Products",
    },
  },
  {
    id: "promo_banner",
    type: "promo_banner",
    order: 3,
    active: true,
    content: {
      headingAr: "تجربة نوم فندقية في منزلك",
      headingEn: "Hotel sleep experience at home",
      descriptionAr: "احصل على مراتب وتطريات سليب هاي المميزة بضمان حتى ٥ سنوات.",
      descriptionEn: "Get premium SleepHigh mattresses with up to 5 years warranty.",
      buttonTextAr: "اكتشف العروض",
      buttonTextEn: "Discover Offers",
      buttonLink: "/ar/collections/mattresses",
    },
  },
  {
    id: "benefits",
    type: "benefits",
    order: 4,
    active: true,
    content: {},
  },
  {
    id: "testimonials",
    type: "testimonials",
    order: 5,
    active: true,
    content: {
      headingAr: "ماذا يقول عملاؤنا",
      headingEn: "What Our Customers Say",
    },
  },
];

let cachedHomepageSections: HomepageSection[] | null = null;
let homepageFetchTime = 0;
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes cache

/** Get homepage configuration (public). */
export async function getHomepageSections(): Promise<HomepageSection[]> {
  if (cachedHomepageSections && Date.now() - homepageFetchTime < CACHE_TTL_MS) {
    return cachedHomepageSections;
  }

  try {
    const q = query(collection(db, HOMEPAGE_COL), orderBy("order", "asc"));
    const snap = await getDocs(q);
    const result = snap.empty
      ? DEFAULT_SECTIONS
      : snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as HomepageSection);
    cachedHomepageSections = result;
    homepageFetchTime = Date.now();
    return result;
  } catch {
    return DEFAULT_SECTIONS;
  }
}

/** Update a homepage section (admin). */
export async function updateHomepageSection(
  id: string,
  data: Partial<HomepageSection>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await setDoc(
      doc(db, HOMEPAGE_COL, id),
      { ...data, updatedAt: serverTimestamp() },
      { merge: true },
    );
    cachedHomepageSections = null;
    homepageFetchTime = 0;
    return { ok: true };
  } catch (err) {
    console.error("[homepageService] updateHomepageSection error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Reorder homepage sections (admin). */
export async function reorderHomepageSections(
  sections: Array<{ id: string; order: number; active: boolean }>,
): Promise<{ ok: boolean }> {
  try {
    for (const item of sections) {
      await setDoc(
        doc(db, HOMEPAGE_COL, item.id),
        { order: item.order, active: item.active, updatedAt: serverTimestamp() },
        { merge: true },
      );
    }
    cachedHomepageSections = null;
    homepageFetchTime = 0;
    return { ok: true };
  } catch (err) {
    console.error("[homepageService] reorderHomepageSections error:", err);
    return { ok: false };
  }
}
