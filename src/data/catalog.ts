import pg1 from "@/assets/pg1.webp";
import pg2 from "@/assets/pg2.webp";

const mattress1 = pg1;
const mattress2 = pg2;
const mattress3 = pg1;
const pillow1 = pg2;
const pillow2 = pg1;
const topper1 = pg2;
import type {
  Category,
  Localized,
  Product,
  ProductOption,
  ProductReview,
  ProductVariant,
} from "@/lib/types";

export const categoryImages = {
  mattresses: mattress1,
  pillows: pillow1,
  toppers: topper1,
};

export const categories: Category[] = [
  {
    handle: "mattresses",
    name: { ar: "المراتب", en: "Mattresses" },
    description: {
      ar: "مراتب بنوابض منفصلة وبنوابض متصلة وفوم عالي الكثافة، بمقاسات وارتفاعات متعددة تناسب كل غرفة نوم.",
      en: "Pocket spring, bonnell spring and high-density foam mattresses in sizes and heights to fit every bedroom.",
    },
    image: mattress1,
  },
  {
    handle: "pillows",
    name: { ar: "الوسائد", en: "Pillows" },
    description: {
      ar: "وسائد بارتفاعات وخامات مختلفة لدعم الرقبة في كل وضعية نوم.",
      en: "Pillows with different lofts and fills to support your neck in every sleep position.",
    },
    image: pillow1,
  },
  {
    handle: "toppers",
    name: { ar: "مراتب التطرية", en: "Mattress toppers" },
    description: {
      ar: "طبقة راحة إضافية تضيف نعومة ودعمًا لمرتبتك الحالية.",
      en: "An extra comfort layer that adds softness and support to your current mattress.",
    },
    image: topper1,
  },
];

const lengths = ["190", "195", "200"];
const widths = ["90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200"];
const heights = ["23", "25", "27"];

const cm: Localized = { ar: "سم", en: "cm" };
const cmValue = (v: string): Localized => ({ ar: `${v} ${cm.ar}`, en: `${v} ${cm.en}` });

const upgradeValues = [
  { value: "standard", label: { ar: "قياسي", en: "Standard" } as Localized },
  {
    value: "memory",
    label: { ar: "ترقية ميموري فوم", en: "Memory foam upgrade" } as Localized,
  },
];

function mattressOptions(): ProductOption[] {
  return [
    {
      key: "length",
      label: { ar: "الطول", en: "Length" },
      values: lengths.map((v) => ({ value: v, label: cmValue(v) })),
    },
    {
      key: "width",
      label: { ar: "العرض", en: "Width" },
      values: widths.map((v) => ({ value: v, label: cmValue(v) })),
    },
    {
      key: "height",
      label: { ar: "الارتفاع", en: "Height" },
      values: heights.map((v) => ({ value: v, label: cmValue(v) })),
    },
    {
      key: "upgrade",
      label: { ar: "نوع المنتج", en: "Product type" },
      values: upgradeValues,
    },
  ];
}

function mattressVariants(skuPrefix: string, basePrice: number, seed: number): ProductVariant[] {
  const variants: ProductVariant[] = [];
  lengths.forEach((length, li) => {
    widths.forEach((width, wi) => {
      heights.forEach((height, hi) => {
        upgradeValues.forEach((upgrade, ui) => {
          const area = (Number(length) * Number(width)) / (195 * 120);
          const heightFactor = 1 + (Number(height) - 23) * 0.035;
          const upgradeFactor = upgrade.value === "memory" ? 1.18 : 1;
          const raw = basePrice * area * heightFactor * upgradeFactor;
          const price = Math.round(raw / 10) * 10;
          // deterministic stock so SSR and client agree
          const stock = (seed + li * 7 + wi * 3 + hi * 5 + ui * 11) % 13;
          variants.push({
            id: `${skuPrefix}-${length}-${width}-${height}-${upgrade.value}`,
            sku: `${skuPrefix}-${length}${width}${height}${upgrade.value === "memory" ? "M" : "S"}`,
            options: { length, width, height, upgrade: upgrade.value },
            price,
            compareAtPrice: Math.round((price * 1.15) / 10) * 10,
            stock,
            available: stock > 0,
          });
        });
      });
    });
  });
  return variants;
}

function simpleVariants(
  skuPrefix: string,
  entries: Array<{ value: string; price: number; stock: number }>,
  optionKey = "size",
): ProductVariant[] {
  return entries.map((entry) => ({
    id: `${skuPrefix}-${entry.value}`,
    sku: `${skuPrefix}-${entry.value.toUpperCase()}`,
    options: { [optionKey]: entry.value },
    price: entry.price,
    compareAtPrice: Math.round((entry.price * 1.2) / 10) * 10,
    stock: entry.stock,
    available: entry.stock > 0,
  }));
}

function reviews(items: Array<[string, string, string, string, number]>): ProductReview[] {
  return items.map(([ar, en, city, cityEn, rating], i) => ({
    id: `r${i}`,
    author: { ar, en },
    city: { ar: city, en: cityEn },
    rating,
    body: {
      ar: "منتج ممتاز وجودة تستحق السعر، والتوصيل كان سريعًا ومنظمًا.",
      en: "Excellent product, quality worth the price, and delivery was fast and organised.",
    },
    date: "2026-05-12",
  }));
}

const sharedReviews = reviews([
  ["محمد عبد الرحمن", "Mohamed Abdelrahman", "القاهرة", "Cairo", 5],
  ["سارة إبراهيم", "Sara Ibrahim", "الإسكندرية", "Alexandria", 5],
  ["أحمد فوزي", "Ahmed Fawzy", "طنطا", "Tanta", 4],
]);

const mattressGallery = (main: string) => [
  { src: main, alt: { ar: "صورة المرتبة الأمامية", en: "Front view of the mattress" } },
  { src: mattress2, alt: { ar: "طبقات المرتبة الداخلية", en: "Inner mattress layers" } },
  { src: mattress3, alt: { ar: "تفاصيل قماش المرتبة", en: "Mattress fabric detail" } },
];

const pillowGallery = (main: string) => [
  { src: main, alt: { ar: "صورة الوسادة", en: "Pillow view" } },
  { src: pillow2, alt: { ar: "تفاصيل حشو الوسادة", en: "Pillow fill detail" } },
  { src: pillow1, alt: { ar: "الوسادة على السرير", en: "Pillow on a bed" } },
];

interface MattressSeed {
  slug: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  basePrice: number;
  firmness: Product["firmness"];
  materialsAr: string;
  materialsEn: string;
  image: string;
  featured: boolean;
  tags: string[];
  rating: number;
}

const mattressSeeds: MattressSeed[] = [
  {
    slug: "pocket",
    nameAr: "بوكيت",
    nameEn: "Pocket",
    taglineAr: "نوابض منفصلة لدعم دقيق لكل منطقة في الجسم",
    taglineEn: "Independent pocket springs for precise body support",
    basePrice: 6510,
    firmness: "medium",
    materialsAr: "نوابض منفصلة مغلفة، فوم عالي الكثافة، قماش جاكارد قطني قابل للتهوية.",
    materialsEn:
      "Individually wrapped pocket springs, high-density foam, breathable cotton jacquard cover.",
    image: mattress1,
    featured: true,
    tags: ["pocket", "spring", "بوكيت", "نوابض"],
    rating: 4.8,
  },
  {
    slug: "pocket-plus",
    nameAr: "بوكيت بلس",
    nameEn: "Pocket+",
    taglineAr: "نسخة أعلى من بوكيت بطبقة راحة إضافية",
    taglineEn: "An elevated Pocket with an extra comfort layer",
    basePrice: 7890,
    firmness: "medium",
    materialsAr: "نوابض منفصلة مزدوجة، طبقة فوم مرن، قماش مبطّن فاخر.",
    materialsEn: "Dual pocket spring core, resilient foam layer, premium quilted cover.",
    image: mattress2,
    featured: true,
    tags: ["pocket", "premium", "بوكيت بلس"],
    rating: 4.9,
  },
  {
    slug: "bonnell",
    nameAr: "بونيل",
    nameEn: "Bonnell",
    taglineAr: "دعم صلب متين بسعر اقتصادي",
    taglineEn: "Firm, durable support at a practical price",
    basePrice: 4980,
    firmness: "firm",
    materialsAr: "نوابض بونيل متصلة، طبقة فوم، قماش مقاوم للاحتكاك.",
    materialsEn: "Connected bonnell springs, foam layer, abrasion-resistant cover.",
    image: mattress3,
    featured: false,
    tags: ["bonnell", "firm", "بونيل"],
    rating: 4.5,
  },
  {
    slug: "bonnell-plus",
    nameAr: "بونيل بلس",
    nameEn: "Bonnell+",
    taglineAr: "صلابة بونيل مع سطح أكثر نعومة",
    taglineEn: "Bonnell firmness with a softer surface",
    basePrice: 5740,
    firmness: "medium-firm",
    materialsAr: "نوابض بونيل، طبقة فوم مزدوجة، قماش مبطّن.",
    materialsEn: "Bonnell springs, dual foam layer, quilted cover.",
    image: mattress1,
    featured: false,
    tags: ["bonnell", "بونيل بلس"],
    rating: 4.6,
  },
  {
    slug: "comfort-care",
    nameAr: "كومفورت كير",
    nameEn: "Comfort Care",
    taglineAr: "فوم عالي الكثافة لتوزيع متوازن للضغط",
    taglineEn: "High-density foam for balanced pressure relief",
    basePrice: 8450,
    firmness: "medium",
    materialsAr: "فوم عالي الكثافة، طبقة ميموري فوم، قماش قابل للفك والغسل.",
    materialsEn: "High-density foam, memory foam layer, removable washable cover.",
    image: mattress2,
    featured: true,
    tags: ["foam", "memory", "كومفورت"],
    rating: 4.7,
  },
];

const mattresses: Product[] = mattressSeeds.map((seed, index) => ({
  id: `m-${seed.slug}`,
  slug: seed.slug,
  name: { ar: `مرتبة ${seed.nameAr}`, en: `${seed.nameEn} Mattress` },
  tagline: { ar: seed.taglineAr, en: seed.taglineEn },
  description: {
    ar: `مرتبة ${seed.nameAr} مصممة لتمنحك دعمًا متوازنًا طوال الليل مع سطح مريح لا يترك أثر ضغط على الجسم. تُصنّع في مصر بخامات مختارة وتخضع لاختبارات جودة قبل التسليم، وتتوفر بمقاسات وارتفاعات متعددة لتناسب سريرك تمامًا.`,
    en: `The ${seed.nameEn} mattress is built to give you balanced support all night with a comfortable surface that relieves pressure points. Made in Egypt from selected materials and quality-tested before delivery, available in multiple sizes and heights to fit your bed exactly.`,
  },
  category: "mattresses",
  images: mattressGallery(seed.image),
  price: seed.basePrice,
  compareAtPrice: Math.round((seed.basePrice * 1.15) / 10) * 10,
  currency: "EGP",
  options: mattressOptions(),
  variants: mattressVariants(seed.slug.toUpperCase().slice(0, 4), seed.basePrice, index + 3),
  materials: { ar: seed.materialsAr, en: seed.materialsEn },
  features: [
    { ar: "دعم متوازن يقلل نقاط الضغط", en: "Balanced support that reduces pressure points" },
    {
      ar: "قماش قابل للتهوية يحافظ على برودة السطح",
      en: "Breathable cover that keeps the surface cool",
    },
    { ar: "حواف مقوّاة لثبات أفضل", en: "Reinforced edges for better stability" },
    { ar: "خامات خالية من المواد الضارة", en: "Materials free from harmful substances" },
  ],
  usage: {
    ar: "ضع المرتبة على قاعدة مستوية جيدة التهوية، واتركها ٤ إلى ٦ ساعات بعد فك التغليف قبل الاستخدام.",
    en: "Place the mattress on a flat, well-ventilated base and let it rest 4–6 hours after unpacking before use.",
  },
  care: {
    ar: "قم بتدوير المرتبة كل ٣ أشهر، ونظّف السطح بقطعة قماش مبللة فقط، وتجنّب الغسل بالماء الغزير.",
    en: "Rotate the mattress every 3 months, clean the surface with a damp cloth only, and avoid soaking it in water.",
  },
  firmness: seed.firmness,
  stock: 24,
  sku: `SH-M-${seed.slug.toUpperCase()}`,
  rating: seed.rating,
  reviewCount: 42 + index * 9,
  reviews: sharedReviews,
  featured: seed.featured,
  tags: seed.tags,
  createdAt: `2026-0${(index % 6) + 1}-10`,
}));

interface SimpleSeed {
  slug: string;
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  category: Product["category"];
  image: string;
  prices: Array<{ value: string; labelAr: string; labelEn: string; price: number; stock: number }>;
  materialsAr: string;
  materialsEn: string;
  firmness: Product["firmness"];
  featured?: boolean;
  tags: string[];
  rating: number;
}

const pillowSizeOption = (
  values: Array<{ value: string; labelAr: string; labelEn: string }>,
): ProductOption => ({
  key: "size",
  label: { ar: "المقاس", en: "Size" },
  values: values.map((v) => ({ value: v.value, label: { ar: v.labelAr, en: v.labelEn } })),
});

const simpleSeeds: SimpleSeed[] = [
  {
    slug: "cozy",
    nameAr: "كوزي",
    nameEn: "Cozy",
    taglineAr: "وسادة ناعمة متوسطة الارتفاع للاستخدام اليومي",
    taglineEn: "A soft, medium-loft everyday pillow",
    category: "pillows",
    image: pillow1,
    prices: [
      {
        value: "standard",
        labelAr: "قياسي ٧٠×٤٠",
        labelEn: "Standard 70×40",
        price: 590,
        stock: 40,
      },
      { value: "long", labelAr: "طويل ٩٠×٤٠", labelEn: "Long 90×40", price: 720, stock: 18 },
    ],
    materialsAr: "حشو ألياف سيليكون ناعم، قماش قطني ميكرو.",
    materialsEn: "Soft siliconised fibre fill, micro cotton cover.",
    firmness: "soft",
    featured: true,
    tags: ["pillow", "كوزي", "وسادة"],
    rating: 4.6,
  },
  {
    slug: "cozy-double-net",
    nameAr: "كوزي دبل نت",
    nameEn: "Cozy Double Net",
    taglineAr: "طبقة شبكية مزدوجة لتهوية أفضل",
    taglineEn: "Double net layer for better airflow",
    category: "pillows",
    image: pillow1,
    prices: [
      {
        value: "standard",
        labelAr: "قياسي ٧٠×٤٠",
        labelEn: "Standard 70×40",
        price: 690,
        stock: 26,
      },
      { value: "long", labelAr: "طويل ٩٠×٤٠", labelEn: "Long 90×40", price: 830, stock: 12 },
    ],
    materialsAr: "حشو ألياف مجوفة، قماش شبكي مزدوج.",
    materialsEn: "Hollow fibre fill, double net fabric.",
    firmness: "medium",
    tags: ["pillow", "net", "كوزي"],
    rating: 4.5,
  },
  {
    slug: "feather",
    nameAr: "فيذر",
    nameEn: "Feather",
    taglineAr: "إحساس ريشي خفيف وانسيابي",
    taglineEn: "A light, feather-soft feel",
    category: "pillows",
    image: pillow1,
    prices: [
      {
        value: "standard",
        labelAr: "قياسي ٧٠×٤٠",
        labelEn: "Standard 70×40",
        price: 780,
        stock: 22,
      },
      { value: "long", labelAr: "طويل ٩٠×٤٠", labelEn: "Long 90×40", price: 940, stock: 0 },
    ],
    materialsAr: "ألياف دقيقة تحاكي الريش الطبيعي، قماش ساتان قطني.",
    materialsEn: "Microfibre that mimics natural down, cotton sateen cover.",
    firmness: "soft",
    featured: true,
    tags: ["pillow", "feather", "فيذر"],
    rating: 4.7,
  },
  {
    slug: "classic",
    nameAr: "كلاسيك",
    nameEn: "Classic",
    taglineAr: "وسادة متوسطة الصلابة تدعم الرقبة",
    taglineEn: "A medium-firm pillow that supports the neck",
    category: "pillows",
    image: pillow1,
    prices: [
      {
        value: "standard",
        labelAr: "قياسي ٧٠×٤٠",
        labelEn: "Standard 70×40",
        price: 640,
        stock: 34,
      },
      { value: "long", labelAr: "طويل ٩٠×٤٠", labelEn: "Long 90×40", price: 790, stock: 15 },
    ],
    materialsAr: "حشو ألياف مضغوطة، قماش قطني مقاوم.",
    materialsEn: "Compressed fibre fill, durable cotton cover.",
    firmness: "medium-firm",
    tags: ["pillow", "classic", "كلاسيك"],
    rating: 4.4,
  },
  {
    slug: "feather-highline",
    nameAr: "فيذر هاي لاين",
    nameEn: "Feather HighLine",
    taglineAr: "ارتفاع أعلى لمن ينام على الجانب",
    taglineEn: "A higher loft for side sleepers",
    category: "pillows",
    image: pillow2,
    prices: [
      {
        value: "standard",
        labelAr: "قياسي ٧٠×٤٠",
        labelEn: "Standard 70×40",
        price: 890,
        stock: 19,
      },
    ],
    materialsAr: "ألياف دقيقة عالية الكثافة، قماش قطني.",
    materialsEn: "High-density microfibre, cotton cover.",
    firmness: "medium",
    tags: ["pillow", "highline", "هاي لاين"],
    rating: 4.6,
  },
  {
    slug: "memory-foam-pillow",
    nameAr: "ميموري فوم",
    nameEn: "Memory Foam",
    taglineAr: "يتشكّل مع رقبتك ويعود لوضعه ببطء",
    taglineEn: "Contours to your neck and slowly recovers",
    category: "pillows",
    image: pillow2,
    prices: [
      {
        value: "standard",
        labelAr: "قياسي ٦٠×٤٠",
        labelEn: "Standard 60×40",
        price: 1290,
        stock: 25,
      },
      { value: "contour", labelAr: "منحني ٦٠×٤٠", labelEn: "Contour 60×40", price: 1450, stock: 9 },
    ],
    materialsAr: "ميموري فوم عالي الكثافة، غطاء قابل للفك والغسل.",
    materialsEn: "High-density memory foam, removable washable cover.",
    firmness: "medium-firm",
    featured: true,
    tags: ["pillow", "memory", "ميموري"],
    rating: 4.8,
  },
  {
    slug: "foam-topper",
    nameAr: "مرتبة تطرية فوم",
    nameEn: "Foam Topper",
    taglineAr: "طبقة فوم تضيف نعومة لمرتبتك",
    taglineEn: "A foam layer that softens your mattress",
    category: "toppers",
    image: topper1,
    prices: [
      { value: "120", labelAr: "١٢٠×١٩٥ سم", labelEn: "120×195 cm", price: 1990, stock: 14 },
      { value: "150", labelAr: "١٥٠×١٩٥ سم", labelEn: "150×195 cm", price: 2390, stock: 11 },
      { value: "180", labelAr: "١٨٠×٢٠٠ سم", labelEn: "180×200 cm", price: 2790, stock: 6 },
    ],
    materialsAr: "فوم مرن، غطاء قطني مبطّن قابل للغسل.",
    materialsEn: "Resilient foam, quilted washable cotton cover.",
    firmness: "medium",
    featured: true,
    tags: ["topper", "تطرية"],
    rating: 4.5,
  },
  {
    slug: "memory-foam-topper",
    nameAr: "مرتبة تطرية ميموري فوم",
    nameEn: "Memory Foam Topper",
    taglineAr: "ميموري فوم يوزّع الضغط بالكامل",
    taglineEn: "Memory foam that spreads pressure evenly",
    category: "toppers",
    image: topper1,
    prices: [
      { value: "120", labelAr: "١٢٠×١٩٥ سم", labelEn: "120×195 cm", price: 2590, stock: 10 },
      { value: "150", labelAr: "١٥٠×١٩٥ سم", labelEn: "150×195 cm", price: 3090, stock: 8 },
      { value: "180", labelAr: "١٨٠×٢٠٠ سم", labelEn: "180×200 cm", price: 3590, stock: 4 },
    ],
    materialsAr: "ميموري فوم، غطاء قابل للفك والغسل.",
    materialsEn: "Memory foam with a removable washable cover.",
    firmness: "soft",
    tags: ["topper", "memory", "ميموري"],
    rating: 4.7,
  },
];

const simpleProducts: Product[] = simpleSeeds.map((seed, index) => {
  const skuPrefix = seed.slug.toUpperCase().slice(0, 6).replace(/-/g, "");
  const basePrice = Math.min(...seed.prices.map((p) => p.price));
  return {
    id: `p-${seed.slug}`,
    slug: seed.slug,
    name: { ar: seed.nameAr, en: seed.nameEn },
    tagline: { ar: seed.taglineAr, en: seed.taglineEn },
    description: {
      ar: `${seed.nameAr} من سليب هاي منتج مصمم ليمنحك راحة يومية تدوم، بخامات مختارة بعناية وتصنيع محلي دقيق. مناسب للاستخدام اليومي ويأتي بمقاسات متعددة.`,
      en: `${seed.nameEn} by SleepHigh is designed for lasting everyday comfort, with carefully selected materials and precise local manufacturing. Suitable for daily use and available in multiple sizes.`,
    },
    category: seed.category,
    images: seed.category === "pillows" ? pillowGallery(seed.image) : mattressGallery(seed.image),
    price: basePrice,
    compareAtPrice: Math.round((basePrice * 1.2) / 10) * 10,
    currency: "EGP",
    options: [
      pillowSizeOption(
        seed.prices.map((p) => ({ value: p.value, labelAr: p.labelAr, labelEn: p.labelEn })),
      ),
    ],
    variants: simpleVariants(
      skuPrefix,
      seed.prices.map((p) => ({ value: p.value, price: p.price, stock: p.stock })),
    ),
    materials: { ar: seed.materialsAr, en: seed.materialsEn },
    features: [
      { ar: "خامات مختارة بعناية", en: "Carefully selected materials" },
      { ar: "تصنيع مصري بمعايير جودة", en: "Egyptian manufacturing with quality standards" },
      { ar: "مناسب للاستخدام اليومي", en: "Suitable for daily use" },
    ],
    usage: {
      ar: "استخدم المنتج مع مفرش نظيف، واتركه في تهوية جيدة عند أول استخدام.",
      en: "Use with a clean cover and air it out before first use.",
    },
    care: {
      ar: "يُغسل الغطاء الخارجي على درجة ٣٠، وتجنّب المبيّضات.",
      en: "Wash the outer cover at 30°C and avoid bleach.",
    },
    firmness: seed.firmness,
    stock: seed.prices.reduce((sum, p) => sum + p.stock, 0),
    sku: `SH-${skuPrefix}`,
    rating: seed.rating,
    reviewCount: 18 + index * 5,
    reviews: sharedReviews,
    featured: Boolean(seed.featured),
    tags: seed.tags,
    createdAt: `2026-0${(index % 6) + 1}-18`,
  };
});

export const products: Product[] = [...mattresses, ...simpleProducts];

export const sizeGuideRows = [
  {
    name: { ar: "فردي", en: "Single" },
    length: "190–200",
    width: "90–100",
    height: "23–27",
    usage: { ar: "غرف الأطفال والأفراد", en: "Kids and single sleepers" },
  },
  {
    name: { ar: "نفر ونص", en: "Single plus" },
    length: "190–200",
    width: "110–120",
    height: "23–27",
    usage: { ar: "مساحة إضافية لشخص واحد", en: "Extra room for one sleeper" },
  },
  {
    name: { ar: "مزدوج", en: "Double" },
    length: "195–200",
    width: "140–150",
    height: "23–27",
    usage: { ar: "غرف النوم الرئيسية", en: "Master bedrooms" },
  },
  {
    name: { ar: "كينج", en: "King" },
    length: "195–200",
    width: "160–180",
    height: "25–27",
    usage: { ar: "راحة أكبر للزوجين", en: "More space for couples" },
  },
  {
    name: { ar: "سوبر كينج", en: "Super king" },
    length: "200",
    width: "190–200",
    height: "25–27",
    usage: { ar: "أكبر مساحة نوم متاحة", en: "The largest sleeping surface" },
  },
];

export const testimonials = [
  {
    id: "t1",
    name: { ar: "منى سعيد", en: "Mona Said" },
    city: { ar: "طنطا", en: "Tanta" },
    rating: 5,
    body: {
      ar: "المرتبة غيرت نومي تمامًا، دعم ممتاز للظهر والتوصيل كان في الموعد.",
      en: "The mattress completely changed my sleep, great back support and delivery was on time.",
    },
  },
  {
    id: "t2",
    name: { ar: "كريم مصطفى", en: "Karim Mostafa" },
    city: { ar: "القاهرة", en: "Cairo" },
    rating: 5,
    body: {
      ar: "خدمة عملاء محترمة ساعدتني أختار المقاس المناسب لغرفتي.",
      en: "The team helped me choose exactly the right size for my room.",
    },
  },
  {
    id: "t3",
    name: { ar: "هبة جمال", en: "Heba Gamal" },
    city: { ar: "الإسكندرية", en: "Alexandria" },
    rating: 4,
    body: {
      ar: "الوسائد مريحة جدًا وسعرها مناسب مقارنة بالجودة.",
      en: "The pillows are very comfortable and well priced for the quality.",
    },
  },
  {
    id: "t4",
    name: { ar: "أحمد رفعت", en: "Ahmed Refaat" },
    city: { ar: "المنصورة", en: "Mansoura" },
    rating: 5,
    body: {
      ar: "مرتبة التطرية أضافت إحساس فندقي للسرير القديم.",
      en: "The topper gave our old bed a hotel-like feel.",
    },
  },
];

export const popularSearches = [
  { ar: "مرتبة بوكيت", en: "Pocket mattress" },
  { ar: "وسادة ميموري", en: "Memory pillow" },
  { ar: "مرتبة تطرية", en: "Mattress topper" },
  { ar: "مقاس ١٦٠", en: "160 size" },
];

export const heroImage = mattress1;
