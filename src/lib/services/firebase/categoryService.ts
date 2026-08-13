/**
 * Category service — Firestore-backed with demo data fallback.
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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { categories as demoCategories } from "@/data/catalog";
import type { Category, CategoryHandle } from "@/lib/types";

const CATEGORIES_COL = "categories";

function docToCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    handle: (data["handle"] as CategoryHandle) ?? (id as CategoryHandle),
    slug: (data["slug"] as string) ?? id,
    name: (data["name"] as Category["name"]) ?? { ar: "", en: "" },
    description: (data["description"] as Category["description"]) ?? { ar: "", en: "" },
    image: (data["image"] as string) ?? "",
    order: (data["order"] as number) ?? 0,
    active: data["active"] !== false,
    createdAt:
      (data["createdAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (data["updatedAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
  };
}

let cachedCategories: Category[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export function invalidateCategoriesCache() {
  cachedCategories = null;
  lastFetchTime = 0;
}

/** List active categories, ordered. */
export async function listCategories(): Promise<Category[]> {
  const all = await adminListCategories();
  return all.filter((c) => c.active !== false);
}

/** List ALL categories for admin (including inactive). */
export async function adminListCategories(): Promise<Category[]> {
  if (cachedCategories && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return cachedCategories;
  }

  try {
    const q = query(collection(db, CATEGORIES_COL), orderBy("order", "asc"));
    const snap = await getDocs(q);
    const result = snap.empty
      ? demoCategories
      : snap.docs.map((d) => docToCategory(d.id, d.data()));
    cachedCategories = result;
    lastFetchTime = Date.now();
    return result;
  } catch {
    return demoCategories;
  }
}

/** Get a single category by handle. */
export async function getCategory(handle: string): Promise<Category | null> {
  const all = await adminListCategories();
  return all.find((c) => c.handle === handle || c.slug === handle) ?? null;
}

/** Get category by Firestore ID. */
export async function getCategoryById(id: string): Promise<Category | null> {
  const all = await adminListCategories();
  return all.find((c) => c.id === id) ?? null;
}

export interface CategoryInput {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  handle: CategoryHandle;
  slug: string;
  image: string;
  imageProvider?: string;
  order: number;
  active: boolean;
}

/** Create a new category (admin only). */
export async function createCategory(
  input: CategoryInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ref = await addDoc(collection(db, CATEGORIES_COL), {
      handle: input.handle,
      slug: input.slug,
      name: { ar: input.nameAr, en: input.nameEn },
      description: { ar: input.descriptionAr, en: input.descriptionEn },
      image: input.image,
      imageProvider: input.imageProvider ?? "external",
      order: input.order,
      active: input.active,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateCategoriesCache();
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error("[categoryService] createCategory error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Update an existing category (admin only). */
export async function updateCategory(
  id: string,
  input: Partial<CategoryInput>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (input.nameAr !== undefined) updates["name.ar"] = input.nameAr;
    if (input.nameEn !== undefined) updates["name.en"] = input.nameEn;
    if (input.descriptionAr !== undefined) updates["description.ar"] = input.descriptionAr;
    if (input.descriptionEn !== undefined) updates["description.en"] = input.descriptionEn;
    if (input.handle !== undefined) updates["handle"] = input.handle;
    if (input.slug !== undefined) updates["slug"] = input.slug;
    if (input.image !== undefined) updates["image"] = input.image;
    if (input.order !== undefined) updates["order"] = input.order;
    if (input.active !== undefined) updates["active"] = input.active;
    await updateDoc(doc(db, CATEGORIES_COL, id), updates);
    invalidateCategoriesCache();
    return { ok: true };
  } catch (err) {
    console.error("[categoryService] updateCategory error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Delete a category (admin only — use with caution). */
export async function deleteCategory(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, CATEGORIES_COL, id));
    invalidateCategoriesCache();
    return { ok: true };
  } catch (err) {
    console.error("[categoryService] deleteCategory error:", err);
    return { ok: false, error: "firestore_error" };
  }
}
