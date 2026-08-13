import pg1 from "@/assets/pg1.webp";
import pg2 from "@/assets/pg2.webp";
import type {
  Category,
  Localized,
  Product,
  ProductOption,
  ProductReview,
  ProductVariant,
} from "@/lib/types";

export const categoryImages = {
  "children-clothing": pg1,
  "school-supplies": pg2,
  "kids-clothing": pg1,
  "newborn-clothing": pg2,
  "teens-clothing": pg1,
};

export const categories: Category[] = [
  {
    handle: "children-clothing",
    name: { ar: "ملابس أطفال", en: "Children's Clothing" },
    description: {
      ar: "أرقى تشكيلات ملابس الأطفال المصنوعة من أفضل الخامات القطنية المريحة لكل الفئات العمرية.",
      en: "The finest collections of kids' fashion made from ultra-soft cotton fabrics for all ages.",
    },
    image: pg1,
  },
  {
    handle: "school-supplies",
    name: { ar: "مستلزمات مدرسية", en: "School Supplies" },
    description: {
      ar: "تشكيلة متكاملة من الحقائب المدرسية والمقالم والأدوات الكتابية ذات الجودة العالية والتصاميم المبهجة.",
      en: "A complete range of school backpacks, pencil cases, and stationery supplies of superior quality.",
    },
    image: pg2,
  },
];

export const clothingSubcategories = [
  {
    handle: "kids-clothing",
    name: { ar: "ملابس أطفال", en: "Kids Fashion" },
    description: { ar: "تصميمات عصرية ومريحة للأولاد والبنات", en: "Trendy & comfortable clothes for boys and girls" },
  },
  {
    handle: "newborn-clothing",
    name: { ar: "ملابس حديثي ولادة", en: "Newborn Wear" },
    description: { ar: "أطقم وسالوبيتات ناعمة على بشرة الأطفال الرضع", en: "Ultra-soft baby onesies and sets for newborns" },
  },
  {
    handle: "teens-clothing",
    name: { ar: "ملابس محير", en: "Teens Wear" },
    description: { ar: "أزياء عصرية تناسب مرحلة الناشئين والمحير", en: "Modern outfits tailored for pre-teens and teens" },
  },
];

export const AVAILABLE_CLOTHING_SIZES = [
  "حديثي ولادة",
  "0-3 شهور",
  "3-6 شهور",
  "6-9 شهور",
  "9-12 شهر",
  "1 سنة",
  "2 سنة",
  "3 سنة",
  "4 سنة",
  "5 سنة",
  "6 سنة",
  "7 سنة",
  "8 سنة",
  "9 سنة",
  "10 سنة",
  "11 سنة",
  "12 سنة",
  "13 سنة",
  "14 سنة",
];

const sampleReviews: ProductReview[] = [
  {
    id: "r1",
    author: { ar: "أم أحمد", en: "Om Ahmed" },
    city: { ar: "كفر الزيات", en: "Kafr El Zayat" },
    rating: 5,
    body: {
      ar: "الخامة ممتازة جداً والمقاس مضبوط كالمعتاد من العزازي مول.",
      en: "Excellent material and perfect sizing as always from Al3azzazy.",
    },
    date: "2026-08-01",
  },
  {
    id: "r2",
    author: { ar: "محمود حسن", en: "Mahmoud Hassan" },
    city: { ar: "طنطا", en: "Tanta" },
    rating: 5,
    body: {
      ar: "شنطة المدرسة خامتها قوية جداً وتقسيمها ممتاز للأولاد.",
      en: "The school bag is super durable with great compartments.",
    },
    date: "2026-08-05",
  },
];

export const products: Product[] = [
  {
    id: "prod-kids-1",
    slug: "kids-summer-outfit-set",
    name: { ar: "طقم أطفال صيفي شيك", en: "Kids Stylish Summer Set" },
    tagline: { ar: "قطن 100% ناعم ومريح", en: "100% Soft Cotton" },
    description: {
      ar: "طقم صيفي مميز للأطفال مصنّع من أحدث الخامات القطنية عالية الجودة لضمان حرية الحركة والراحة في الأجواء الحارة.",
      en: "Stylish summer outfit for children made of premium breathable cotton.",
    },
    category: "children-clothing",
    subCategory: "kids-clothing",
    images: [
      { src: pg1, alt: { ar: "طقم أطفال صيفي شيك", en: "Kids Stylish Summer Set" } },
      { src: pg2, alt: { ar: "تفاصيل طقم الأطفال", en: "Kids Outfit Details" } },
    ],
    price: 350,
    compareAtPrice: 420,
    currency: "EGP",
    options: [
      {
        key: "size",
        label: { ar: "المقاس", en: "Size" },
        values: [
          { value: "2 سنة", label: { ar: "2 سنة", en: "2 Years" } },
          { value: "3 سنة", label: { ar: "3 سنة", en: "3 Years" } },
          { value: "4 سنة", label: { ar: "4 سنة", en: "4 Years" } },
          { value: "5 سنة", label: { ar: "5 سنة", en: "5 Years" } },
          { value: "6 سنة", label: { ar: "6 سنة", en: "6 Years" } },
        ],
      },
      {
        key: "color",
        label: { ar: "اللون", en: "Color" },
        values: [
          { value: "أزرق سماوي", label: { ar: "أزرق سماوي", en: "Baby Blue" } },
          { value: "أصفر", label: { ar: "أصفر", en: "Yellow" } },
        ],
      },
    ],
    variants: [
      { id: "v1-1", sku: "KID-SET-BLU-2Y", options: { size: "2 سنة", color: "أزرق سماوي" }, price: 350, stock: 10, available: true },
      { id: "v1-2", sku: "KID-SET-BLU-3Y", options: { size: "3 سنة", color: "أزرق سماوي" }, price: 350, stock: 8, available: true },
      { id: "v1-3", sku: "KID-SET-YEL-2Y", options: { size: "2 سنة", color: "أصفر" }, price: 350, stock: 5, available: true },
      { id: "v1-4", sku: "KID-SET-YEL-3Y", options: { size: "3 سنة", color: "أصفر" }, price: 350, stock: 12, available: true },
    ],
    sizes: ["2 سنة", "3 سنة", "4 سنة", "5 سنة", "6 سنة"],
    colors: ["أزرق سماوي", "أصفر"],
    stock: 35,
    sku: "KID-SET-001",
    rating: 5,
    reviewCount: 12,
    reviews: sampleReviews,
    featured: true,
    isNew: true,
    tags: ["ملابس أطفال", "صيفي", "قطن"],
    createdAt: "2026-08-01T00:00:00.000Z",
  },
  {
    id: "prod-newborn-1",
    slug: "newborn-cotton-onesie",
    name: { ar: "سالوبيت حديثي ولادة قطن صافي", en: "Newborn Soft Cotton Onesie" },
    tagline: { ar: "نعومة فائقة لبشرة الرضيع", en: "Ultra Soft for Baby Skin" },
    description: {
      ar: "سالوبيت قطني ناعم جداً مخصص لحديثي الولادة، مزود بأزرار ضغط سهلة الاستخدام لخامات آمنة على البشرة الحساسة.",
      en: "Ultra-soft cotton onesie designed specifically for newborns with gentle snap buttons.",
    },
    category: "children-clothing",
    subCategory: "newborn-clothing",
    images: [
      { src: pg2, alt: { ar: "سالوبيت حديثي ولادة", en: "Newborn Cotton Onesie" } },
    ],
    price: 220,
    compareAtPrice: 270,
    currency: "EGP",
    options: [
      {
        key: "size",
        label: { ar: "المقاس", en: "Size" },
        values: [
          { value: "حديثي ولادة", label: { ar: "حديثي ولادة", en: "Newborn" } },
          { value: "0-3 شهور", label: { ar: "0-3 شهور", en: "0-3 Months" } },
          { value: "3-6 شهور", label: { ar: "3-6 شهور", en: "3-6 Months" } },
        ],
      },
    ],
    variants: [
      { id: "v2-1", sku: "NB-ONE-NB", options: { size: "حديثي ولادة" }, price: 220, stock: 15, available: true },
      { id: "v2-2", sku: "NB-ONE-03M", options: { size: "0-3 شهور" }, price: 220, stock: 10, available: true },
      { id: "v2-3", sku: "NB-ONE-36M", options: { size: "3-6 شهور" }, price: 220, stock: 8, available: true },
    ],
    sizes: ["حديثي ولادة", "0-3 شهور", "3-6 شهور"],
    colors: ["أبيض", "أزرق فاتح"],
    stock: 33,
    sku: "NB-ONE-002",
    rating: 5,
    reviewCount: 8,
    reviews: sampleReviews,
    featured: true,
    isNew: true,
    tags: ["حديثي ولادة", "بيبي", "سالوبيت"],
    createdAt: "2026-08-02T00:00:00.000Z",
  },
  {
    id: "prod-teens-1",
    slug: "teens-casual-outfit",
    name: { ar: "طقم كاجوال محير شبابي", en: "Teens Trendy Casual Outfit" },
    tagline: { ar: "تصميم عصري وجذاب", en: "Modern Teen Style" },
    description: {
      ar: "طقم مميز لمرحلة المحير والناشئين، خامات عملية وتصميم مواكب لأحدث صيحات الموضة للشباب.",
      en: "Trendy casual outfit for pre-teens and teens made with durable high-grade fabrics.",
    },
    category: "children-clothing",
    subCategory: "teens-clothing",
    images: [
      { src: pg1, alt: { ar: "طقم كاجوال محير", en: "Teens Casual Outfit" } },
    ],
    price: 490,
    compareAtPrice: 580,
    currency: "EGP",
    options: [
      {
        key: "size",
        label: { ar: "المقاس", en: "Size" },
        values: [
          { value: "8 سنة", label: { ar: "8 سنة", en: "8 Years" } },
          { value: "10 سنة", label: { ar: "10 سنة", en: "10 Years" } },
          { value: "12 سنة", label: { ar: "12 سنة", en: "12 Years" } },
          { value: "14 سنة", label: { ar: "14 سنة", en: "14 Years" } },
        ],
      },
    ],
    variants: [
      { id: "v3-1", sku: "TEEN-OUT-8Y", options: { size: "8 سنة" }, price: 490, stock: 7, available: true },
      { id: "v3-2", sku: "TEEN-OUT-10Y", options: { size: "10 سنة" }, price: 490, stock: 9, available: true },
      { id: "v3-3", sku: "TEEN-OUT-12Y", options: { size: "12 سنة" }, price: 490, stock: 6, available: true },
      { id: "v3-4", sku: "TEEN-OUT-14Y", options: { size: "14 سنة" }, price: 490, stock: 4, available: true },
    ],
    sizes: ["8 سنة", "10 سنة", "12 سنة", "14 سنة"],
    colors: ["كحلي", "رمادي"],
    stock: 26,
    sku: "TEEN-OUT-003",
    rating: 4.8,
    reviewCount: 6,
    reviews: sampleReviews,
    featured: true,
    isNew: false,
    tags: ["محير", "شبابي", "أزياء"],
    createdAt: "2026-08-03T00:00:00.000Z",
  },
  {
    id: "prod-school-1",
    slug: "ergonomic-school-backpack",
    name: { ar: "حقيبة مدرسية متينة طبية", en: "Ergonomic School Backpack" },
    tagline: { ar: "حماية للظهر وجيوب متعددة", en: "Back Support & Multi Pockets" },
    description: {
      ar: "شنطة مدرسية مصممة بدعامة مريحة للظهر وحمالات مبطنة لتقليل الحمل على الأطفال مع خامات مضادة للماء وحافظة لابتوب/تابلت.",
      en: "Durable ergonomic school backpack featuring padded shoulder straps and waterproof material.",
    },
    category: "school-supplies",
    subCategory: "school-bags",
    images: [
      { src: pg2, alt: { ar: "حقيبة مدرسية متينة", en: "Ergonomic School Backpack" } },
    ],
    price: 450,
    compareAtPrice: 550,
    currency: "EGP",
    options: [
      {
        key: "color",
        label: { ar: "اللون", en: "Color" },
        values: [
          { value: "أزرق", label: { ar: "أزرق", en: "Blue" } },
          { value: "أسود", label: { ar: "أسود", en: "Black" } },
        ],
      },
    ],
    variants: [
      { id: "v4-1", sku: "SCH-BAG-BLU", options: { color: "أزرق" }, price: 450, stock: 15, available: true },
      { id: "v4-2", sku: "SCH-BAG-BLK", options: { color: "أسود" }, price: 450, stock: 12, available: true },
    ],
    sizes: [],
    colors: ["أزرق", "أسود"],
    stock: 27,
    sku: "SCH-BAG-004",
    rating: 5,
    reviewCount: 15,
    reviews: sampleReviews,
    featured: true,
    isNew: true,
    tags: ["شنط مدرسية", "مستلزمات مدرسية", "مدرسة"],
    createdAt: "2026-08-04T00:00:00.000Z",
  },
  {
    id: "prod-school-2",
    slug: "premium-pencil-case-set",
    name: { ar: "مقلمة أدوات كتابية متكاملة", en: "Complete School Stationery & Pencil Case Set" },
    tagline: { ar: "كل ما يحتاجه الطالب", en: "Everything Student Needs" },
    description: {
      ar: "طقم مقلمة أنيق يحتوي على أقلام، مساطر، ألوان وأدوات هندسية عالية الجودة لتسهيل الاستعداد المدرسي.",
      en: "Comprehensive pencil case set packed with pens, pencils, ruler, and math tools.",
    },
    category: "school-supplies",
    subCategory: "stationery",
    images: [
      { src: pg1, alt: { ar: "مقلمة أدوات كتابية", en: "Stationery Pencil Case Set" } },
    ],
    price: 180,
    compareAtPrice: 220,
    currency: "EGP",
    options: [],
    variants: [
      { id: "v5-1", sku: "SCH-PEN-SET", options: {}, price: 180, stock: 25, available: true },
    ],
    sizes: [],
    colors: ["أزرق سماوي", "أصفر"],
    stock: 25,
    sku: "SCH-PEN-005",
    rating: 4.9,
    reviewCount: 9,
    reviews: sampleReviews,
    featured: true,
    isNew: true,
    tags: ["مقلمة", "أدوات كتابية", "مستلزمات مدرسية"],
    createdAt: "2026-08-05T00:00:00.000Z",
  },
];
