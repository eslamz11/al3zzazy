import type { Localized } from "./types";

/**
 * Long-form, bilingual marketing content that belongs to specific pages.
 * Kept out of the translation dictionary because it is structured data
 * (lists/cards) rather than individual UI strings.
 */

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
    name: { ar: "سارة", en: "Sara" },
    city: { ar: "القاهرة", en: "Cairo" },
    rating: 5,
    body: {
      ar: "المرتبة اللي اشتريتها من سليب هاي غيّرت تجربة نومي تمامًا. مريحة جدًا، وبصحى كل يوم حاسة بالانتعاش. الجودة ممتازة.",
      en: "The mattress I bought from SleepHigh completely changed the way I sleep. It's incredibly comfortable and I wake up refreshed every day. Excellent quality.",
    },
  },
  {
    id: "2",
    name: { ar: "أحمد", en: "Ahmed" },
    city: { ar: "الإسكندرية", en: "Alexandria" },
    rating: 5,
    body: {
      ar: "أفضل استثمار عملته لراحتي. الوسائد الطبية ممتازة جداً وتدعم الرقبة بشكل مثالي، وخدمة العملاء كانت راقية.",
      en: "The best investment I've made in my own comfort. The orthopaedic pillows support my neck perfectly and the customer service was outstanding.",
    },
  },
  {
    id: "3",
    name: { ar: "محمود", en: "Mahmoud" },
    city: { ar: "الجيزة", en: "Giza" },
    rating: 5,
    body: {
      ar: "جودة المراتب تفوق التوقعات، السعر مقابل الجودة ممتاز. التوصيل كان سريع جداً ومندوب التوصيل كان متعاون.",
      en: "The mattress quality exceeds expectations and the value for money is excellent. Delivery was very fast and the courier was really helpful.",
    },
  },
  {
    id: "4",
    name: { ar: "منى", en: "Mona" },
    city: { ar: "المنصورة", en: "Mansoura" },
    rating: 5,
    body: {
      ar: "الخامات المستخدمة فخمة جداً، بحس إني نايمة في فندق 5 نجوم. شكراً سليب هاي على الجودة الرائعة.",
      en: "The materials feel truly luxurious — it's like sleeping in a five-star hotel. Thank you SleepHigh for the wonderful quality.",
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
    title: { ar: "جودة لا تتنازل", en: "Uncompromising quality" },
    desc: {
      ar: "نحن ملتزمون بتقديم منتجات عالية الجودة، مصنوعة بعناية للتفاصيل والدقة. التزامنا بالتفوق يضمن أن كل عنصر مصنوع ليتجاوز توقعاتك مما يوفر لك راحة لا مثيل لها.",
      en: "We are committed to high-quality products, crafted with meticulous attention to detail. Our pursuit of excellence means every item is built to exceed your expectations and deliver unmatched comfort.",
    },
  },
  {
    icon: "handshake",
    title: { ar: "حرفية يدوية", en: "Handcrafted care" },
    desc: {
      ar: "تم صنع كل منتجاتنا بحب من قبل حرفيين ماهرين يضعون خبرتهم وشغفهم في كل تفصيلة. هذا الحس الحرفي يضمن مستوى من الحرفية والتميز يميز منتجاتنا مما يرتقي بتجربتك.",
      en: "Every product is made with care by skilled artisans who pour their expertise and passion into each detail. That craftsmanship sets our products apart and elevates your experience.",
    },
  },
  {
    icon: "price_check",
    title: { ar: "رفاهية بأسعار معقولة", en: "Affordable luxury" },
    desc: {
      ar: "نحن نعتقد أن الرفاهية لا يجب أن تأتي بسعر مرتفع. لهذا السبب نقدم منتجاتنا الاستثنائية بأسعار معقولة، مما يجعل الجودة والراحة متاحة للجميع.",
      en: "We believe luxury shouldn't come with a luxury price tag. That's why we offer exceptional products at fair prices, making quality and comfort accessible to everyone.",
    },
  },
  {
    icon: "local_shipping",
    title: { ar: "تكنولوجيا حديثة", en: "Modern technology" },
    desc: {
      ar: "نستغل قوة الآلات عالية التقنية لتعزيز عمليات تصنيعنا من خلال دمج التقنيات المتقدمة، نضمن الدقة والكفاءة والاستمرارية في إنتاج منتجاتنا.",
      en: "We harness high-tech machinery to strengthen our manufacturing. By integrating advanced technology we guarantee precision, efficiency and consistency in everything we produce.",
    },
  },
];
