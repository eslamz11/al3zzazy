/**
 * Subcategory service — Firestore-backed subcategories for parent categories.
 */

import {
  collection,
  doc,
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
import type { Subcategory } from "@/lib/types";

const SUBCATEGORIES_COL = "subcategories";

function docToSubcategory(id: string, data: Record<string, unknown>): Subcategory {
  return {
    id,
    handle: (data["handle"] as string) ?? id,
    slug: (data["slug"] as string) ?? id,
    name: (data["name"] as Subcategory["name"]) ?? { ar: "", en: "" },
    description: (data["description"] as Subcategory["description"]) ?? { ar: "", en: "" },
    parentCategoryId: (data["parentCategoryId"] as string) ?? "",
    order: (data["order"] as number) ?? 0,
    active: data["active"] !== false,
    createdAt:
      (data["createdAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (data["updatedAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
  };
}

let cachedSubcategories: Subcategory[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export function invalidateSubcategoriesCache() {
  cachedSubcategories = null;
  lastFetchTime = 0;
}

/** List ALL subcategories for admin (including inactive). */
export async function adminListSubcategories(): Promise<Subcategory[]> {
  if (cachedSubcategories && Date.now() - lastFetchTime < CACHE_TTL_MS) {
    return cachedSubcategories;
  }

  try {
    const q = query(collection(db, SUBCATEGORIES_COL), orderBy("order", "asc"));
    const snap = await getDocs(q);
    const result = snap.docs.map((d) => docToSubcategory(d.id, d.data()));
    cachedSubcategories = result;
    lastFetchTime = Date.now();
    return result;
  } catch (err) {
    console.error("[subcategoryService] adminListSubcategories error:", err);
    return [];
  }
}

/** List active subcategories, optionally filtered by parent category. */
export async function listSubcategories(parentCategoryId?: string): Promise<Subcategory[]> {
  const all = await adminListSubcategories();
  const filtered = all.filter((s) => s.active !== false);
  if (parentCategoryId) {
    return filtered.filter((s) => s.parentCategoryId === parentCategoryId);
  }
  return filtered;
}

/** Get subcategory by ID. */
export async function getSubcategoryById(id: string): Promise<Subcategory | null> {
  const all = await adminListSubcategories();
  return all.find((s) => s.id === id) ?? null;
}

/** Get subcategory by handle or slug. */
export async function getSubcategory(handle: string): Promise<Subcategory | null> {
  const all = await adminListSubcategories();
  return all.find((s) => s.handle === handle || s.slug === handle) ?? null;
}

export interface SubcategoryInput {
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  handle: string;
  slug: string;
  parentCategoryId: string;
  order: number;
  active: boolean;
}

/** Create a new subcategory (admin only). */
export async function createSubcategory(
  input: SubcategoryInput,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ref = await addDoc(collection(db, SUBCATEGORIES_COL), {
      handle: input.handle,
      slug: input.slug,
      name: { ar: input.nameAr, en: input.nameEn },
      description: { ar: input.descriptionAr, en: input.descriptionEn },
      parentCategoryId: input.parentCategoryId,
      order: input.order,
      active: input.active,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    invalidateSubcategoriesCache();
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error("[subcategoryService] createSubcategory error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Update an existing subcategory (admin only). */
export async function updateSubcategory(
  id: string,
  input: Partial<SubcategoryInput>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updates: Record<string, unknown> = { updatedAt: serverTimestamp() };
    if (input.nameAr !== undefined) updates["name.ar"] = input.nameAr;
    if (input.nameEn !== undefined) updates["name.en"] = input.nameEn;
    if (input.descriptionAr !== undefined) updates["description.ar"] = input.descriptionAr;
    if (input.descriptionEn !== undefined) updates["description.en"] = input.descriptionEn;
    if (input.handle !== undefined) updates["handle"] = input.handle;
    if (input.slug !== undefined) updates["slug"] = input.slug;
    if (input.parentCategoryId !== undefined) updates["parentCategoryId"] = input.parentCategoryId;
    if (input.order !== undefined) updates["order"] = input.order;
    if (input.active !== undefined) updates["active"] = input.active;
    await updateDoc(doc(db, SUBCATEGORIES_COL, id), updates);
    invalidateSubcategoriesCache();
    return { ok: true };
  } catch (err) {
    console.error("[subcategoryService] updateSubcategory error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Delete a subcategory (admin only). */
export async function deleteSubcategory(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, SUBCATEGORIES_COL, id));
    invalidateSubcategoriesCache();
    return { ok: true };
  } catch (err) {
    console.error("[subcategoryService] deleteSubcategory error:", err);
    return { ok: false, error: "firestore_error" };
  }
}
