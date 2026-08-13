/**
 * Wishlist service — localStorage for guests, Firestore for auth users.
 */

import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { readJson, writeJson, STORAGE_KEYS } from "@/lib/services/storage";

const WISHLIST_SUBCOL = "wishlist";

export function loadGuestWishlist(): string[] {
  return readJson<string[]>(STORAGE_KEYS.wishlist, []);
}

export function saveGuestWishlist(ids: string[]): void {
  writeJson(STORAGE_KEYS.wishlist, ids);
}

export async function loadFirestoreWishlist(userId: string): Promise<string[]> {
  try {
    const snap = await getDocs(collection(db, "users", userId, WISHLIST_SUBCOL));
    return snap.docs.map((d) => d.id);
  } catch {
    return [];
  }
}

export async function addToFirestoreWishlist(userId: string, productId: string): Promise<void> {
  try {
    await setDoc(doc(db, "users", userId, WISHLIST_SUBCOL, productId), {
      productId,
      addedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[wishlistService] addToFirestoreWishlist error:", err);
  }
}

export async function removeFromFirestoreWishlist(
  userId: string,
  productId: string,
): Promise<void> {
  try {
    await deleteDoc(doc(db, "users", userId, WISHLIST_SUBCOL, productId));
  } catch (err) {
    console.error("[wishlistService] removeFromFirestoreWishlist error:", err);
  }
}

/**
 * Merge guest wishlist into Firestore on login.
 */
export async function mergeGuestWishlistOnLogin(
  userId: string,
  guestIds: string[],
): Promise<string[]> {
  try {
    const firestoreIds = await loadFirestoreWishlist(userId);
    const merged = [...new Set([...firestoreIds, ...guestIds])];

    if (guestIds.length > 0) {
      const batch = writeBatch(db);
      for (const id of guestIds) {
        if (!firestoreIds.includes(id)) {
          batch.set(doc(db, "users", userId, WISHLIST_SUBCOL, id), {
            productId: id,
            addedAt: serverTimestamp(),
          });
        }
      }
      await batch.commit();
      saveGuestWishlist([]);
    }

    return merged;
  } catch {
    return [...new Set([...guestIds])];
  }
}
