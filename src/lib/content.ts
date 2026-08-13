import type { Localized } from "./types";

export interface HomeTestimonial {
  id: string;
  name: Localized;
  city: Localized;
  rating: number;
  body: Localized;
}

export const HOME_TESTIMONIALS: HomeTestimonial[] = [
  {
    id: "1",
    name: { ar: "أم سارة", en: "Om Sara" },
    city: { ar: "كفر الزيات", en: "Kafr El Zayat" },
    rating: 5,
    body: {
      ar: "الملابس اللي اشتريتها من العزازي مول غاية في الأناقة والقطن مريح جداً للبنات، والأسعار مناسبة جداً.",
      en: "The clothes I bought from Al3azzazy Store are super stylish, soft cotton, and very reasonably priced.",
    },
  },
  {
    id: "2",
    name: { ar: "أحمد علي", en: "Ahmed Ali" },
    city: { ar: "طنطا", en: "Tanta" },
    rating: 5,
    body: {
      ar: "شنطة المدرسة والمقلمة خامتها ممتازة وتستحمل الاستخدام اليومي للأطفال، وسرعة في التوصيل.",
      en: "The school backpack and pencil case are extremely durable for daily kids use with fast delivery.",
    },
  },
  {
    id: "3",
    name: { ar: "إيمان محمود", en: "Eman Mahmoud" },
    city: { ar: "المحلة الكبرى", en: "El Mahalla" },
    rating: 5,
    body: {
      ar: "سالوبيتات حديثي الولادة ناعمة جداً وخامتها آمنة على بشرة البيبي. تعامل محترم وخدمة ممتازة.",
      en: "Newborn onesies are ultra-soft and safe for baby skin. Great customer service and high quality.",
    },
  },
];

export interface HomeBenefit {
  icon: string;
  title: Localized;
  desc: Localized;
}

export const HOME_BENEFITS: HomeBenefit[] = [
  {
    icon: "verified",
    title: { ar: "خامات قطنية 100%", en: "100% Cotton Quality" },
    desc: {
      ar: "نلتزم بتقديم ملابس مصنّعة من أفضل الأقمشة القطنية المريحة التي تضمن حماية بشرة طفلك وحرية حركته.",
      en: "We are committed to providing clothing made from ultra-soft cotton fabrics that protect your child's skin.",
    },
  },
  {
    icon: "handshake",
    title: { ar: "تشكيلة متكاملة", en: "Complete Selection" },
    desc: {
      ar: "كل ما يحتاجه طفلك تحت سقف واحد: ملابس حديثي ولادة، ملابس أطفال، ملابس محير وكافة الأدوات والمستلزمات المدرسية.",
      en: "Everything your child needs under one roof: newborn items, kids wear, teens fashion, and full school supplies.",
    },
  },
  {
    icon: "price_check",
    title: { ar: "أسعار مناسبة لكل عائلة", en: "Best Value Prices" },
    desc: {
      ar: "نقدم أعلى مستويات الجودة بأسعار تنافسية ومناسبة للأسرة المصرية مع عروض وخصومات ممتازة طوال العام.",
      en: "We offer top quality at competitive prices, bringing great value for Egyptian families all year round.",
    },
  },
  {
    icon: "local_shipping",
    title: { ar: "توصيل سريع ودفع عند الاستلام", en: "Fast Shipping & COD" },
    desc: {
      ar: "تغليف ممتاز وتوصيل سريع حتى باب المنزل مع إمكانية الدفع نقداً عند الاستلام ومعاينة المنتجات.",
      en: "Protective packaging, fast delivery right to your door, and cash on delivery for convenience.",
    },
  },
];
