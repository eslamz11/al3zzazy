export type Locale = "ar" | "en";

export type CategoryHandle = "mattresses" | "pillows" | "toppers" | "protectors" | "accessories";

export interface Localized {
  ar: string;
  en: string;
}

export interface ProductImage {
  src: string;
  alt: Localized;
}

export interface VariantOptionValues {
  /** e.g. { length: "195", width: "150", height: "25", upgrade: "standard" } */
  [optionKey: string]: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  options: VariantOptionValues;
  price: number;
  compareAtPrice?: number | undefined;
  stock: number;
  available: boolean;
  image?: string | undefined;
}

export interface ProductOptionValue {
  value: string;
  label: Localized;
}

export interface ProductOption {
  key: string;
  label: Localized;
  values: ProductOptionValue[];
}

export interface ProductReview {
  id: string;
  author: Localized;
  city: Localized;
  rating: number;
  body: Localized;
  date: string;
}

export interface ProductSection {
  title: Localized;
  body: Localized;
}

export interface ProductSeo {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
}

export interface Product {
  id: string;
  slug: string;
  name: Localized;
  tagline: Localized;
  description: Localized;
  category: CategoryHandle;
  images: ProductImage[];
  /** base price, used when no variant is selected */
  price: number;
  compareAtPrice?: number | undefined;
  costPrice?: number | undefined;
  currency: "EGP";
  options: ProductOption[];
  variants: ProductVariant[];
  materials: Localized;
  features: Localized[];
  usage: Localized;
  care: Localized;
  firmness: "soft" | "medium" | "medium-firm" | "firm";
  stock: number;
  lowStockThreshold?: number | undefined;
  sku: string;
  barcode?: string | undefined;
  rating: number;
  reviewCount: number;
  reviews: ProductReview[];
  featured: boolean;
  active?: boolean | undefined;
  tags: string[];
  seo?: ProductSeo | undefined;
  brand?: string | undefined;
  trust?:
    | {
        warranty10Years: boolean;
        freeShipping: boolean;
      }
    | undefined;
  viewerCount?:
    | {
        enabled: boolean;
        mode: "random" | "fixed";
        min: number;
        max: number;
        fixed: number;
      }
    | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
  deletedAt?: string | undefined;
}

export interface Category {
  handle: CategoryHandle;
  name: Localized;
  description: Localized;
  image: string;
  /** Firestore-specific fields */
  id?: string | undefined;
  slug?: string | undefined;
  order?: number | undefined;
  active?: boolean | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface CartLine {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
}

export interface CartLineView extends CartLine {
  product: Product;
  variant: ProductVariant;
  unitPrice: number;
  lineTotal: number;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  street: string;
  notes?: string | undefined;
}

export type PaymentMethod = "cod" | "card";

export type OrderStatus =
  "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned";

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  timestamp: string;
  note?: string | undefined;
  adminId?: string | undefined;
}

export interface Order {
  id: string;
  number: string;
  createdAt: string;
  updatedAt?: string | undefined;
  userId?: string | undefined;
  customer?:
    | {
        name: string;
        phone: string;
        email: string;
      }
    | undefined;
  lines: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    name: Localized;
    unitPrice: number;
    options: VariantOptionValues;
    image: string;
  }>;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  address: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  status: OrderStatus;
  couponCode?: string | undefined;
  notes?: string | undefined;
  statusHistory?: OrderStatusHistoryEntry[] | undefined;
}

export type UserRole = "customer" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | undefined;
  defaultAddress?: Address | undefined;
  role?: UserRole | undefined;
  photoURL?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface ProductFilters {
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  sizes: string[];
  heights: string[];
  materials: string[];
  firmness: string[];
  inStockOnly: boolean;
}

export type SortKey = "featured" | "price-asc" | "price-desc" | "newest" | "rating";

// ─── Firebase-specific types ────────────────────────────────────────────────

export type ImageProvider = "imgbb" | "freeimage" | "local";

export interface StoredImage {
  id: string;
  url: string;
  provider: ImageProvider;
  altAr: string;
  altEn: string;
  position: number;
  isPrimary: boolean;
  originalName?: string | undefined;
  mimeType?: string | undefined;
  size?: number | undefined;
}

export interface UploadedImage {
  url: string;
  provider: ImageProvider;
  originalName: string;
  mimeType: string;
  size: number;
}

export type CouponType = "percentage" | "fixed";

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  productIds?: string[] | undefined;
  categoryIds?: string[] | undefined;
  startDate?: string | undefined;
  endDate?: string | undefined;
  usageLimit?: number | undefined;
  usageCount: number;
  minOrderAmount?: number | undefined;
  active: boolean;
  createdAt: string;
  updatedAt?: string | undefined;
}

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface FirebaseReview {
  id: string;
  productId: string;
  userId?: string | undefined;
  customerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  featured: boolean;
  createdAt: string;
  updatedAt?: string | undefined;
}

export type HomepageSectionType =
  | "hero"
  | "categories"
  | "featured_products"
  | "promo_banner"
  | "benefits"
  | "testimonials"
  | "newsletter"
  | "announcement_bar";

export interface HeroSlide {
  id: string;
  image: string;
  headingAr: string;
  headingEn: string;
  descriptionAr: string;
  descriptionEn: string;
  buttonTextAr: string;
  buttonTextEn: string;
  buttonLink: string;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  order: number;
  active: boolean;
  content: Record<string, unknown>;
  updatedAt?: string | undefined;
}

export interface StoreSettings {
  nameAr: string;
  nameEn: string;
  logo?: string | undefined;
  favicon?: string | undefined;
  phone?: string | undefined;
  customerServicePhone?: string | undefined;
  salesPhone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  branch1?: string | undefined;
  branch2?: string | undefined;
  /**
   * Optional English counterparts for the free-text location fields.
   * When empty the storefront falls back to the Arabic value so real data is
   * never hidden, and to a translated default when nothing is stored at all.
   */
  addressEn?: string | undefined;
  branch1En?: string | undefined;
  branch2En?: string | undefined;
  descriptionAr?: string | undefined;
  descriptionEn?: string | undefined;
  shipping: {
    fee: number;
    freeThreshold: number;
    areas: string[];
  };
  payments: {
    codEnabled: boolean;
    onlineEnabled: boolean;
  };
  social: {
    facebook?: string | undefined;
    instagram?: string | undefined;
    tiktok?: string | undefined;
    whatsapp?: string | undefined;
  };
  seo: {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
  };
  updatedAt?: string | undefined;
}

export interface SiteMessage {
  id: string;
  name: string;
  email?: string | undefined;
  phone: string;
  subject?: string | undefined;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt?: string | undefined;
}

export type AdminActionType =
  | "login"
  | "logout"
  | "product_created"
  | "product_updated"
  | "product_deleted"
  | "order_status_changed"
  | "customer_updated"
  | "settings_changed"
  | "image_uploaded"
  | "review_approved"
  | "review_rejected"
  | "category_created"
  | "category_updated"
  | "category_deleted"
  | "coupon_created"
  | "coupon_updated"
  | "coupon_deleted"
  | "homepage_updated"
  | "message_received";

export interface AdminLog {
  id: string;
  adminId: string;
  adminEmail?: string | undefined;
  action: AdminActionType;
  resourceType: string;
  resourceId?: string | undefined;
  timestamp: string;
  metadata?: Record<string, unknown> | undefined;
}

export type NotificationType =
  | "new_order"
  | "low_stock"
  | "out_of_stock"
  | "new_review"
  | "image_upload_error"
  | "new_user"
  | "new_site_message";

export interface AdminNotification {
  id: string;
  type: NotificationType;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  read: boolean;
  createdAt: string;
  relatedId?: string | undefined;
  relatedType?: string | undefined;
}

export interface AdminRole {
  uid: string;
  email: string;
  role: "admin";
  grantedAt: string;
  grantedBy?: string | undefined;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  newOrders: number;
  totalProducts: number;
  totalCustomers: number;
  lowStockCount: number;
  unreadMessagesCount?: number | undefined;
}
