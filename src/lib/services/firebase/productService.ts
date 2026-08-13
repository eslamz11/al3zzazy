/**
 * Product service — reads from Firestore, falls back to demo catalog.
 * Admins can create/update/soft-delete products.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as demoProducts, categories as demoCategories } from "@/data/catalog";
import type { Product, CategoryHandle, ProductFilters, SortKey } from "@/lib/types";

const PRODUCTS_COL = "products";
const PAGE_SIZE = 10;

// ─── Firestore → Product adapter ────────────────────────────────────────────

function docToProduct(id: string, data: any): Product {
  return {
    id,
    slug: (data.slug as string) ?? id,
    name: (data.name as Product["name"]) ?? { ar: "", en: "" },
    tagline: (data.tagline as Product["tagline"]) ?? { ar: "", en: "" },
    description: (data.description as Product["description"]) ?? { ar: "", en: "" },
    category: (data.categoryId as CategoryHandle) ?? "mattresses",
    images: ((data.images as Product["images"]) ?? []).map((img: unknown) => {
      const i = img as Record<string, unknown>;
      return {
        src: (i["url"] as string) ?? (i["src"] as string) ?? "",
        alt: (i["alt"] as Product["images"][0]["alt"]) ?? { ar: "", en: "" },
      };
    }),
    price: (data.price as number) ?? 0,
    compareAtPrice: data.compareAtPrice as number | undefined,
    costPrice: data.costPrice as number | undefined,
    currency: "EGP",
    options: (data.options as Product["options"]) ?? [],
    variants: (data.variants as Product["variants"]) ?? [],
    materials: (data.materials as Product["materials"]) ?? { ar: "", en: "" },
    features: (data.features as Product["features"]) ?? [],
    usage: (data.usage as Product["usage"]) ?? { ar: "", en: "" },
    care: (data.care as Product["care"]) ?? { ar: "", en: "" },
    firmness: (data.firmness as Product["firmness"]) ?? "medium",
    stock: (data.stock as number) ?? 0,
    lowStockThreshold: data.lowStockThreshold as number | undefined,
    sku: (data.sku as string) ?? "",
    barcode: data.barcode as string | undefined,
    rating: (data.rating as number) ?? 0,
    reviewCount: (data.reviewCount as number) ?? 0,
    reviews: [],
    featured: Boolean(data.featured),
    active: data.active !== false,
    tags: (data.tags as string[]) ?? [],
    seo: data.seo as Product["seo"],
    brand: data.brand as string | undefined,
    trust: data.trust as Product["trust"],
    viewerCount: data.viewerCount as Product["viewerCount"],
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      (data.createdAt as string) ??
      new Date().toISOString(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
    deletedAt: data.deletedAt
      ? ((data.deletedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined)
      : undefined,
  };
}

// ─── Public storefront reads ────────────────────────────────────────────────

/** List active products, with optional category filter and pagination. */
export async function listProducts(
  category?: CategoryHandle,
  cursor?: DocumentSnapshot,
): Promise<{ products: Product[]; nextCursor: DocumentSnapshot | null }> {
  try {
    // Avoid composite index: filter by categoryId only when provided,
    // then filter active client-side to skip the need for a compound index.
    const constraints: QueryConstraint[] = [
      limit(PAGE_SIZE * 2), // fetch extra to account for inactive filtered out
    ];
    if (category) {
      constraints.unshift(where("categoryId", "==", category));
    }
    if (cursor) constraints.push(startAfter(cursor));

    const q = query(collection(db, PRODUCTS_COL), ...constraints);
    const snap = await getDocs(q);
    const items = snap.docs
      .map((d) => docToProduct(d.id, d.data()))
      .filter((p) => p.active !== false && !p.deletedAt)
      .slice(0, PAGE_SIZE);
    const nextCursor = snap.docs.length >= PAGE_SIZE * 2 ? snap.docs[snap.docs.length - 1]! : null;
    return { products: items, nextCursor };
  } catch (err) {
    console.error(
      "[productService] listProducts Firestore error — check Firestore rules and indexes:",
      err,
    );
    // Only fall back to demo data if Firestore is completely unreachable
    const items = category ? demoProducts.filter((p) => p.category === category) : demoProducts;
    return { products: items, nextCursor: null };
  }
}

/** Get a single product by slug (public). */
export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const q = query(
      collection(db, PRODUCTS_COL),
      where("slug", "==", slug),
      where("active", "==", true),
      limit(1),
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return docToProduct(snap.docs[0]!.id, snap.docs[0]!.data());
  } catch {
    return demoProducts.find((p) => p.slug === slug) ?? null;
  }
}

/** Get a product by Firestore document ID. */
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const snap = await getDoc(doc(db, PRODUCTS_COL, id));
    if (!snap.exists()) return null;
    return docToProduct(snap.id, snap.data());
  } catch {
    return demoProducts.find((p) => p.id === id) ?? null;
  }
}

let cachedFeaturedProducts: Product[] | null = null;
let featuredFetchTime = 0;
let cachedAdminProducts: Product[] | null = null;
let adminProductsFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export function invalidateProductsCache() {
  cachedFeaturedProducts = null;
  cachedAdminProducts = null;
  featuredFetchTime = 0;
  adminProductsFetchTime = 0;
}

/** Get featured products for the homepage. */
export async function featuredProducts(lim = 8): Promise<Product[]> {
  if (cachedFeaturedProducts && Date.now() - featuredFetchTime < CACHE_TTL_MS) {
    return cachedFeaturedProducts.slice(0, lim);
  }

  try {
    // Avoid composite index by fetching featured products only,
    // then filtering active and sorting by createdAt client-side.
    const q = query(
      collection(db, PRODUCTS_COL),
      where("featured", "==", true),
      limit(lim * 2), // fetch extra in case some are inactive
    );
    const snap = await getDocs(q);
    const result = snap.docs
      .map((d) => docToProduct(d.id, d.data()))
      .filter((p) => p.active !== false && !p.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, lim);

    if (result.length === 0) {
      // No featured products in DB yet — fetch any active products instead
      const fallbackQ = query(collection(db, PRODUCTS_COL), limit(lim * 2));
      const fallbackSnap = await getDocs(fallbackQ);
      const fallbackResult = fallbackSnap.docs
        .map((d) => docToProduct(d.id, d.data()))
        .filter((p) => p.active !== false && !p.deletedAt)
        .slice(0, lim);
      cachedFeaturedProducts = fallbackResult;
      featuredFetchTime = Date.now();
      return fallbackResult;
    }

    cachedFeaturedProducts = result;
    featuredFetchTime = Date.now();
    return result;
  } catch (err) {
    console.error(
      "[productService] featuredProducts Firestore error — check Firestore rules and indexes:",
      err,
    );
    return demoProducts.filter((p) => p.featured).slice(0, lim);
  }
}

/** Search products by query string (client-side filter over Firestore results). */
export async function searchProducts(query_: string): Promise<Product[]> {
  const q = query_.trim().toLowerCase();
  if (!q) return [];
  try {
    // Firestore doesn't support full-text search natively.
    // Fetch all products (no active filter to avoid composite index) and filter client-side.
    // For production scale, use Algolia or Typesense.
    const snap = await getDocs(query(collection(db, PRODUCTS_COL), limit(200)));
    const all = snap.docs
      .map((d) => docToProduct(d.id, d.data()))
      .filter((p) => p.active !== false && !p.deletedAt);
    return all.filter((p) => {
      const hay = [p.name.ar, p.name.en, p.tagline.ar, p.tagline.en, p.category, ...p.tags]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
  } catch (err) {
    console.error("[productService] searchProducts Firestore error:", err);
    const all = demoProducts;
    return all.filter((p) => {
      const hay = [p.name.ar, p.name.en, p.tagline.ar, p.tagline.en, ...p.tags]
        .join(" ")
        .toLowerCase();
      return q.split(/\s+/).every((word) => hay.includes(word));
    });
  }
}

/** Apply client-side filters to a product list. */
export function applyFilters(items: Product[], filters: ProductFilters): Product[] {
  return items.filter((product) => {
    const prices = product.variants.map((v) => v.price);
    const minP = prices.length ? Math.min(...prices) : product.price;
    const maxP = prices.length ? Math.max(...prices) : product.price;
    if (filters.minPrice !== undefined && maxP < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && minP > filters.maxPrice) return false;
    if (filters.firmness.length && !filters.firmness.includes(product.firmness)) return false;
    if (filters.inStockOnly && !product.variants.some((v) => v.available)) return false;
    if (filters.sizes.length) {
      const sizes = new Set(
        product.variants.flatMap((v) => [v.options["width"], v.options["size"]].filter(Boolean)),
      );
      if (!filters.sizes.some((s) => sizes.has(s))) return false;
    }
    if (filters.heights.length) {
      const heights = new Set(product.variants.map((v) => v.options["height"]));
      if (!filters.heights.some((h) => heights.has(h))) return false;
    }
    return true;
  });
}

/** Sort a product list. */
export function sortProducts(items: Product[], sort: SortKey): Product[] {
  const copy = [...items];
  const priceMin = (p: Product) =>
    p.variants.length ? Math.min(...p.variants.map((v) => v.price)) : p.price;
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => priceMin(a) - priceMin(b));
    case "price-desc":
      return copy.sort((a, b) => priceMin(b) - priceMin(a));
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

// ─── Admin writes ────────────────────────────────────────────────────────────

export interface ProductInput {
  nameAr: string;
  nameEn: string;
  taglineAr: string;
  taglineEn: string;
  descriptionAr: string;
  descriptionEn: string;
  slug: string;
  categoryId: CategoryHandle;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  stock: number;
  lowStockThreshold?: number;
  featured: boolean;
  active: boolean;
  tags: string[];
  images: Array<{
    url: string;
    provider: string;
    altAr: string;
    altEn: string;
    position: number;
    isPrimary: boolean;
  }>;
  variants: Product["variants"];
  options: Product["options"];
  materials: { ar: string; en: string };
  features: Array<{ ar: string; en: string }>;
  usage: { ar: string; en: string };
  care: { ar: string; en: string };
  firmness: Product["firmness"];
  brand?: string;
  seo?: Product["seo"];
  trust?: Product["trust"];
  viewerCount?: Product["viewerCount"];
}

/** Create a new product (admin only). */
export async function createProduct(
  input: ProductInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const data = {
      slug: input.slug,
      name: { ar: input.nameAr, en: input.nameEn },
      tagline: { ar: input.taglineAr, en: input.taglineEn },
      description: { ar: input.descriptionAr, en: input.descriptionEn },
      categoryId: input.categoryId,
      price: input.price,
      compareAtPrice: input.compareAtPrice ?? null,
      costPrice: input.costPrice ?? null,
      sku: input.sku,
      barcode: input.barcode ?? null,
      stock: input.stock,
      lowStockThreshold: input.lowStockThreshold ?? 5,
      featured: input.featured,
      active: input.active,
      tags: input.tags,
      images: input.images,
      variants: input.variants,
      options: input.options,
      materials: input.materials,
      features: input.features,
      usage: input.usage,
      care: input.care,
      firmness: input.firmness,
      brand: input.brand ?? null,
      seo: input.seo ?? null,
      trust: input.trust ?? null,
      viewerCount: input.viewerCount ?? null,
      rating: 0,
      reviewCount: 0,
      deletedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    const ref = await addDoc(collection(db, PRODUCTS_COL), data);
    invalidateProductsCache();
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error("[productService] createProduct error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Update an existing product (admin only). */
export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updates: any = { updatedAt: serverTimestamp() };
    if (input.nameAr !== undefined) updates["name.ar"] = input.nameAr;
    if (input.nameEn !== undefined) updates["name.en"] = input.nameEn;
    if (input.taglineAr !== undefined) updates["tagline.ar"] = input.taglineAr;
    if (input.taglineEn !== undefined) updates["tagline.en"] = input.taglineEn;
    if (input.descriptionAr !== undefined) updates["description.ar"] = input.descriptionAr;
    if (input.descriptionEn !== undefined) updates["description.en"] = input.descriptionEn;
    if (input.slug !== undefined) updates.slug = input.slug;
    if (input.categoryId !== undefined) updates.categoryId = input.categoryId;
    if (input.price !== undefined) updates.price = input.price;
    if (input.compareAtPrice !== undefined) updates.compareAtPrice = input.compareAtPrice;
    if (input.costPrice !== undefined) updates.costPrice = input.costPrice;
    if (input.sku !== undefined) updates.sku = input.sku;
    if (input.barcode !== undefined) updates.barcode = input.barcode;
    if (input.stock !== undefined) updates.stock = input.stock;
    if (input.lowStockThreshold !== undefined) updates.lowStockThreshold = input.lowStockThreshold;
    if (input.featured !== undefined) updates.featured = input.featured;
    if (input.active !== undefined) updates.active = input.active;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.images !== undefined) updates.images = input.images;
    if (input.variants !== undefined) updates.variants = input.variants;
    if (input.options !== undefined) updates.options = input.options;
    if (input.materials !== undefined) updates.materials = input.materials;
    if (input.features !== undefined) updates.features = input.features;
    if (input.usage !== undefined) updates.usage = input.usage;
    if (input.care !== undefined) updates.care = input.care;
    if (input.firmness !== undefined) updates.firmness = input.firmness;
    if (input.brand !== undefined) updates.brand = input.brand;
    if (input.seo !== undefined) updates.seo = input.seo;
    if (input.trust !== undefined) updates.trust = input.trust;
    if (input.viewerCount !== undefined) updates.viewerCount = input.viewerCount;

    await updateDoc(doc(db, PRODUCTS_COL, id), updates);
    invalidateProductsCache();
    return { ok: true };
  } catch (err) {
    console.error("[productService] updateProduct error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Soft-delete a product (sets active=false, records deletedAt). */
export async function softDeleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, PRODUCTS_COL, id), {
      active: false,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateProductsCache();
    return { ok: true };
  } catch (err) {
    console.error("[productService] softDeleteProduct error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Permanently delete a product from Firestore (admin only). */
export async function hardDeleteProduct(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, PRODUCTS_COL, id));
    invalidateProductsCache();
    return { ok: true };
  } catch (err) {
    console.error("[productService] hardDeleteProduct error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** List ALL products for admin (including inactive). */
export async function adminListProducts(opts?: {
  category?: CategoryHandle;
  limit_?: number;
  cursor?: DocumentSnapshot;
}): Promise<{ products: Product[]; nextCursor: DocumentSnapshot | null }> {
  try {
    const lim = opts?.limit_ ?? PAGE_SIZE;
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(lim)];
    if (opts?.category) constraints.unshift(where("categoryId", "==", opts.category));
    if (opts?.cursor) constraints.push(startAfter(opts.cursor));

    const q = query(collection(db, PRODUCTS_COL), ...constraints);
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => docToProduct(d.id, d.data()));
    const nextCursor = snap.docs.length === lim ? snap.docs[snap.docs.length - 1]! : null;
    return { products: items, nextCursor };
  } catch (err) {
    console.error("[productService] adminListProducts error:", err);
    return { products: demoProducts, nextCursor: null };
  }
}

/** Get related products in the same category. */
export async function relatedProducts(product: Product, lim = 4): Promise<Product[]> {
  try {
    const q = query(
      collection(db, PRODUCTS_COL),
      where("categoryId", "==", product.category),
      where("active", "==", true),
      limit(lim + 1),
    );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => docToProduct(d.id, d.data()))
      .filter((p) => p.id !== product.id)
      .slice(0, lim);
  } catch {
    return demoProducts
      .filter((p) => p.category === product.category && p.id !== product.id)
      .slice(0, lim);
  }
}

/** Collect unique sizes across a product list for filters. */
export function collectSizes(items: Product[]): string[] {
  const set = new Set<string>();
  items.forEach((p) =>
    p.variants.forEach((v) => {
      const s = v.options["width"] ?? v.options["size"];
      if (s) set.add(s);
    }),
  );
  return [...set].sort((a, b) => (Number(a) || 0) - (Number(b) || 0) || a.localeCompare(b));
}

export function collectHeights(items: Product[]): string[] {
  const set = new Set<string>();
  items.forEach((p) =>
    p.variants.forEach((v) => v.options["height"] && set.add(v.options["height"])),
  );
  return [...set].sort((a, b) => Number(a) - Number(b));
}

export function collectFirmness(items: Product[]): string[] {
  return [...new Set(items.map((p) => p.firmness))];
}

export function emptyFilters(): ProductFilters {
  return { sizes: [], heights: [], materials: [], firmness: [], inStockOnly: false };
}

export function findVariantByOptions(product: Product, selection: Record<string, string>) {
  const norm = (v: unknown) => String(v ?? "").trim();
  return product.variants.find((v) =>
    Object.entries(selection).every(([k, val]) => norm(v.options[k]) === norm(val)),
  );
}

export function defaultSelection(product: Product): Record<string, string> {
  const first = product.variants.find((v) => v.available) ?? product.variants[0];
  if (first) return { ...first.options };
  return Object.fromEntries(product.options.map((o) => [o.key, o.values[0]?.value ?? ""]));
}

export function generateOptionsFromVariants(variants: Product["variants"]): Product["options"] {
  const optionsMap: Record<string, Set<string>> = {};
  variants.forEach((v) => {
    Object.entries(v.options).forEach(([k, val]) => {
      if (val) {
        if (!optionsMap[k]) optionsMap[k] = new Set();
        optionsMap[k].add(val);
      }
    });
  });

  const optionLabels: Record<string, { ar: string; en: string }> = {
    width: { ar: "العرض", en: "Width" },
    length: { ar: "الطول", en: "Length" },
    height: { ar: "الارتفاع", en: "Height" },
    size: { ar: "المقاس", en: "Size" },
    color: { ar: "اللون", en: "Color" },
  };

  return Object.entries(optionsMap).map(([key, valuesSet]) => ({
    key,
    label: optionLabels[key] || { ar: key, en: key },
    values: Array.from(valuesSet).map((val) => ({
      value: val,
      label: { ar: val, en: val },
    })),
  }));
}

// Re-export demo categories for fallback use
export { demoCategories };

// ─── Client-side pagination helpers ─────────────────────────────────────────

let cachedAllProducts: Product[] | null = null;
let allProductsFetchTime = 0;

export function invalidateAllProductsCache() {
  cachedAllProducts = null;
  allProductsFetchTime = 0;
}

/** Get all active products (cached 1 min). Used for client-side pagination on storefront. */
export async function listAllActiveProducts(category?: CategoryHandle): Promise<Product[]> {
  if (cachedAllProducts && Date.now() - allProductsFetchTime < CACHE_TTL_MS) {
    const items = category
      ? cachedAllProducts.filter((p) => p.category === category)
      : cachedAllProducts;
    return items;
  }

  try {
    const constraints: QueryConstraint[] = [limit(200)];
    const q = query(collection(db, PRODUCTS_COL), ...constraints);
    const snap = await getDocs(q);
    const all = snap.docs
      .map((d) => docToProduct(d.id, d.data()))
      .filter((p) => p.active !== false && !p.deletedAt);

    cachedAllProducts = all;
    allProductsFetchTime = Date.now();

    return category ? all.filter((p) => p.category === category) : all;
  } catch (err) {
    console.error("[productService] listAllActiveProducts error:", err);
    const items = category ? demoProducts.filter((p) => p.category === category) : demoProducts;
    return items;
  }
}

/** Returns the configured page size. */
export function getPageSize(): number {
  return PAGE_SIZE;
}
