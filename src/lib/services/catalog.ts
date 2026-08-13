import { categories, products } from "@/data/catalog";
import type {
  CategoryHandle,
  Locale,
  Product,
  ProductFilters,
  ProductVariant,
  SortKey,
  VariantOptionValues,
} from "@/lib/types";

/**
 * The only module that knows where catalog data comes from.
 * Swapping the demo arrays for a backend call means changing this file only.
 */

export function listCategories() {
  return categories;
}

export function getCategory(handle: string) {
  return categories.find((c) => c.handle === handle);
}

export function listProducts(category?: CategoryHandle) {
  return category ? products.filter((p) => p.category === category) : products;
}

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string) {
  return products.find((p) => p.id === id);
}

export function getVariant(product: Product, variantId: string) {
  const variant = product.variants.find((v) => v.id === variantId);
  if (variant) return variant;
  if (product.variants.length === 0 && variantId === product.id) {
    return {
      id: product.id,
      sku: product.sku,
      options: {},
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      stock: product.stock,
      available: product.stock > 0 && product.active !== false,
    } as ProductVariant;
  }
  return undefined;
}

export function featuredProducts(limit = 8) {
  return products.filter((p) => p.featured).slice(0, limit);
}

export function relatedProducts(product: Product, limit = 4) {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );
  const rest = products.filter((p) => p.category !== product.category && p.id !== product.id);
  return [...sameCategory, ...rest].slice(0, limit);
}

export function priceRange(product: Product) {
  const prices = product.variants.map((v) => v.price);
  const min = prices.length ? Math.min(...prices) : product.price;
  const max = prices.length ? Math.max(...prices) : product.price;
  return { min, max, hasRange: max > min };
}

/** Normalize an option value for comparison (handles number/string, whitespace). */
export function normalizeOptionValue(value: unknown): string {
  return String(value ?? "").trim();
}

export function findVariantByOptions(product: Product, selection: VariantOptionValues) {
  return product.variants.find((variant) =>
    Object.entries(selection).every(
      ([key, value]) => normalizeOptionValue(variant.options[key]) === normalizeOptionValue(value),
    ),
  );
}

export function defaultSelection(product: Product): VariantOptionValues {
  const firstAvailable =
    product.variants.find((v) => v.available) ?? product.variants[0] ?? undefined;
  if (firstAvailable) return { ...firstAvailable.options };
  return Object.fromEntries(
    product.options.map((option) => [option.key, option.values[0]?.value ?? ""]),
  );
}

export function isVariantAvailable(variant: ProductVariant | undefined) {
  return Boolean(variant && variant.available && variant.stock > 0);
}

export function productMaterialKeys(product: Product) {
  return product.tags;
}

/** available sizes across variants, used by collection filters */
export function collectSizes(items: Product[]) {
  const set = new Set<string>();
  items.forEach((p) =>
    p.variants.forEach((v) => {
      const size = v.options["width"] ?? v.options["size"];
      if (size) set.add(size);
    }),
  );
  return [...set].sort((a, b) => (Number(a) || 0) - (Number(b) || 0) || a.localeCompare(b));
}

export function collectHeights(items: Product[]) {
  const set = new Set<string>();
  items.forEach((p) =>
    p.variants.forEach((v) => v.options["height"] && set.add(v.options["height"])),
  );
  return [...set].sort((a, b) => Number(a) - Number(b));
}

export function collectFirmness(items: Product[]) {
  return [...new Set(items.map((p) => p.firmness))];
}

export function emptyFilters(): ProductFilters {
  return { sizes: [], heights: [], materials: [], firmness: [], inStockOnly: false };
}

export function applyFilters(items: Product[], filters: ProductFilters) {
  return items.filter((product) => {
    const { min, max } = priceRange(product);
    if (filters.minPrice !== undefined && max < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && min > filters.maxPrice) return false;
    if (filters.firmness.length && !filters.firmness.includes(product.firmness)) return false;
    if (
      filters.inStockOnly &&
      !(product.variants.length > 0
        ? product.variants.some((v) => v.available)
        : product.stock > 0 && product.active !== false)
    )
      return false;
    if (filters.sizes.length) {
      const productSizes = new Set(
        product.variants.flatMap((v) => [v.options["width"], v.options["size"]].filter(Boolean)),
      );
      if (!filters.sizes.some((size) => productSizes.has(size))) return false;
    }
    if (filters.heights.length) {
      const productHeights = new Set(product.variants.map((v) => v.options["height"]));
      if (!filters.heights.some((h) => productHeights.has(h))) return false;
    }
    return true;
  });
}

export function sortProducts(items: Product[], sort: SortKey) {
  const copy = [...items];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => priceRange(a).min - priceRange(b).min);
    case "price-desc":
      return copy.sort((a, b) => priceRange(b).min - priceRange(a).min);
    case "newest":
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    default:
      return copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  }
}

export function searchProducts(query: string, locale: Locale) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter((product) => {
    const haystack = [
      product.name.ar,
      product.name.en,
      product.tagline.ar,
      product.tagline.en,
      product.category,
      ...product.tags,
      ...product.variants.map((v) => Object.values(v.options).join(" ")),
      categories.find((c) => c.handle === product.category)?.name[locale] ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return q.split(/\s+/).every((word) => haystack.includes(word));
  });
}
