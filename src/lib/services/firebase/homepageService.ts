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
      textAr: "شحن سريع لجميع المحافظات · الدفع عند الاستلام",
      textEn: "Fast shipping nationwide · Cash on delivery",
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
          image: "",
          headingAr: "أشيك ملابس الأطفال لكل المواسم",
          headingEn: "Stylish kids fashion for every season",
          descriptionAr:
            "تشكيلة متكاملة من ملابس حديثي الولادة والأطفال والمراهقين بخامات قطنية مريحة وأسعار مناسبة لكل عائلة.",
          descriptionEn:
            "Newborn, kids and teen clothing in soft cotton fabrics at family-friendly prices.",
          buttonTextAr: "تسوق الآن",
          buttonTextEn: "Shop now",
          buttonLink: "/ar/collections/children-clothing",
        },
        {
          id: "slide_2",
          image: "",
          headingAr: "جهّز أطفالك للعام الدراسي",
          headingEn: "Get ready for back to school",
          descriptionAr:
            "شنط ومقالم وأدوات مدرسية عالية الجودة تناسب العام الدراسي الجديد بأفضل الأسعار.",
          descriptionEn:
            "High-quality school bags, pencil cases and supplies for the new school year.",
          buttonTextAr: "تصفح المستلزمات",
          buttonTextEn: "Explore supplies",
          buttonLink: "/ar/collections/school-supplies",
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
      headingAr: "كل مستلزمات المدرسة في مكان واحد",
      headingEn: "All your school essentials in one place",
      descriptionAr: "احصل على أفضل العروض على الشنط والأدوات المدرسية من العزازي.",
      descriptionEn: "Get the best deals on school bags and supplies from Al3azzazy.",
      buttonTextAr: "اكتشف العروض",
      buttonTextEn: "Discover Offers",
      buttonLink: "/ar/collections/school-supplies",
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
