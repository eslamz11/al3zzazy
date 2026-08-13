/**
 * Review service — Firestore-backed.
 * Public reads: approved reviews only.
 * Admin: full CRUD + moderation.
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
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { FirebaseReview, ReviewStatus } from "@/lib/types";

const REVIEWS_COL = "reviews";

function docToReview(id: string, data: Record<string, unknown>): FirebaseReview {
  return {
    id,
    productId: (data["productId"] as string) ?? "",
    userId: data["userId"] as string | undefined,
    customerName: (data["customerName"] as string) ?? "",
    rating: (data["rating"] as number) ?? 5,
    comment: (data["comment"] as string) ?? "",
    status: (data["status"] as ReviewStatus) ?? "pending",
    featured: Boolean(data["featured"]),
    createdAt:
      (data["createdAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (data["updatedAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
  };
}

/** Get approved reviews for a product (public). */
export async function getApprovedReviews(productId: string, lim = 20): Promise<FirebaseReview[]> {
  try {
    const q = query(
      collection(db, REVIEWS_COL),
      where("productId", "==", productId),
      where("status", "==", "approved"),
      orderBy("createdAt", "desc"),
      limit(lim),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToReview(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Submit a customer review (pending by default). */
export async function submitReview(input: {
  productId: string;
  userId?: string;
  customerName: string;
  rating: number;
  comment: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    await addDoc(collection(db, REVIEWS_COL), {
      productId: input.productId,
      userId: input.userId ?? null,
      customerName: input.customerName,
      rating: Math.min(5, Math.max(1, Math.round(input.rating))),
      comment: input.comment.trim(),
      status: "pending",
      featured: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error("[reviewService] submitReview error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Admin: list all reviews with optional status filter. */
export async function adminListReviews(status?: ReviewStatus): Promise<FirebaseReview[]> {
  try {
    const constraints = [orderBy("createdAt", "desc"), limit(100)];
    if (status) constraints.unshift(where("status", "==", status) as never);
    const q = query(collection(db, REVIEWS_COL), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToReview(d.id, d.data() as Record<string, unknown>));
  } catch (err) {
    console.error("[reviewService] adminListReviews error:", err);
    return [];
  }
}

/** Admin: approve a review. */
export async function approveReview(id: string): Promise<{ ok: boolean; error?: string }> {
  return updateReviewStatus(id, "approved");
}

/** Admin: reject a review. */
export async function rejectReview(id: string): Promise<{ ok: boolean; error?: string }> {
  return updateReviewStatus(id, "rejected");
}

async function updateReviewStatus(
  id: string,
  status: ReviewStatus,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, REVIEWS_COL, id), {
      status,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error("[reviewService] updateReviewStatus error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Admin: feature/unfeature a review. */
export async function setReviewFeatured(
  id: string,
  featured: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, REVIEWS_COL, id), {
      featured,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error("[reviewService] setReviewFeatured error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Admin: delete a review. */
export async function deleteReview(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, REVIEWS_COL, id));
    return { ok: true };
  } catch (err) {
    console.error("[reviewService] deleteReview error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Get a single review. */
export async function getReview(id: string): Promise<FirebaseReview | null> {
  try {
    const snap = await getDoc(doc(db, REVIEWS_COL, id));
    if (!snap.exists()) return null;
    return docToReview(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return null;
  }
}
