/**
 * Coupon / Discount service — Firestore-backed.
 */

import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Coupon } from "@/lib/types";

function docToCoupon(id: string, data: any): Coupon {
  return {
    id,
    code: (data.code as string) ?? "",
    type: (data.type as Coupon["type"]) ?? "percentage",
    value: (data.value as number) ?? 0,
    productIds: data.productIds as string[] | undefined,
    categoryIds: data.categoryIds as string[] | undefined,
    startDate: data.startDate as string | undefined,
    endDate: data.endDate as string | undefined,
    usageLimit: data.usageLimit as number | undefined,
    usageCount: (data.usageCount as number) ?? 0,
    minOrderAmount: data.minOrderAmount as number | undefined,
    active: data.active !== false,
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
  };
}

/** Validate a coupon code against order subtotal. */
export async function validateCoupon(
  code: string,
  subtotal: number,
): Promise<{ ok: true; coupon: Coupon; discountAmount: number } | { ok: false; error: string }> {
  try {
    const cleanCode = code.trim().toUpperCase();
    const q = query(
      collection(db, COUPONS_COL),
      where("code", "==", cleanCode),
      where("active", "==", true),
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return { ok: false, error: "كوبون غير صالح" };
    }

    const coupon = docToCoupon(snap.docs[0]!.id, snap.docs[0]!.data() as Record<string, unknown>);
    const now = new Date().toISOString();

    if (coupon.startDate && coupon.startDate > now) {
      return { ok: false, error: "الكوبون غير مفعل بعد" };
    }
    if (coupon.endDate && coupon.endDate < now) {
      return { ok: false, error: "الكوبون منتهي الصلاحية" };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { ok: false, error: "تم الوصول للحد الأقصى لاستخدام الكوبون" };
    }
    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return {
        ok: false,
        error: `الحد الأدنى للطلب لاستخدام الكوبون هو ${coupon.minOrderAmount} ج.م`,
      };
    }

    let discountAmount = 0;
    if (coupon.type === "percentage") {
      discountAmount = Math.round((subtotal * coupon.value) / 100);
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    return { ok: true, coupon, discountAmount };
  } catch (err) {
    console.error("[couponService] validateCoupon error:", err);
    return { ok: false, error: "حدث خطأ أثناء التحقق من الكوبون" };
  }
}

/** Admin: list all coupons. */
export async function adminListCoupons(): Promise<Coupon[]> {
  try {
    const snap = await getDocs(collection(db, COUPONS_COL));
    return snap.docs.map((d) => docToCoupon(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Admin: create a coupon. */
export async function createCoupon(
  input: Omit<Coupon, "id" | "usageCount" | "createdAt" | "updatedAt">,
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  try {
    const ref = await addDoc(collection(db, COUPONS_COL), {
      ...input,
      code: input.code.trim().toUpperCase(),
      usageCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ok: true, id: ref.id };
  } catch (err) {
    console.error("[couponService] createCoupon error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Admin: update a coupon. */
export async function updateCoupon(
  id: string,
  input: Partial<Coupon>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const updates: any = { updatedAt: serverTimestamp() };
    if (input.code !== undefined) updates.code = input.code.trim().toUpperCase();
    if (input.type !== undefined) updates.type = input.type;
    if (input.value !== undefined) updates.value = input.value;
    if (input.active !== undefined) updates.active = input.active;
    if (input.minOrderAmount !== undefined) updates.minOrderAmount = input.minOrderAmount;
    if (input.usageLimit !== undefined) updates.usageLimit = input.usageLimit;
    if (input.startDate !== undefined) updates.startDate = input.startDate;
    if (input.endDate !== undefined) updates.endDate = input.endDate;

    await updateDoc(doc(db, COUPONS_COL, id), updates);
    return { ok: true };
  } catch (err) {
    console.error("[couponService] updateCoupon error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Admin: delete a coupon. */
export async function deleteCoupon(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, COUPONS_COL, id));
    return { ok: true };
  } catch (err) {
    console.error("[couponService] deleteCoupon error:", err);
    return { ok: false, error: "firestore_error" };
  }
}
