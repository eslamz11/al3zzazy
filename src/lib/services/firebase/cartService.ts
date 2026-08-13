/**
 * Cart service — localStorage for guests, Firestore for auth users.
 * Merges guest cart on login.
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
import type { CartLine } from "@/lib/types";

const CART_SUBCOL = "cart";

function cartDocId(productId: string, variantId: string) {
  return `${productId}__${variantId}`;
}

/** Load guest cart from localStorage. */
export function loadGuestCart(): CartLine[] {
  return readJson<CartLine[]>(STORAGE_KEYS.cart, []);
}

/** Save guest cart to localStorage. */
export function saveGuestCart(lines: CartLine[]): void {
  writeJson(STORAGE_KEYS.cart, lines);
}

/** Load cart from Firestore for an authenticated user. */
export async function loadFirestoreCart(userId: string): Promise<CartLine[]> {
  try {
    const snap = await getDocs(collection(db, "users", userId, CART_SUBCOL));
    return snap.docs.map((d) => d.data() as CartLine);
  } catch (err) {
    console.error("[cartService] loadFirestoreCart error:", err);
    return [];
  }
}

/** Save a single cart line to Firestore. */
export async function saveCartLine(userId: string, line: CartLine): Promise<void> {
  try {
    const id = cartDocId(line.productId, line.variantId);
    await setDoc(doc(db, "users", userId, CART_SUBCOL, id), {
      ...line,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[cartService] saveCartLine error:", err);
  }
}

/** Remove a single cart line from Firestore. */
export async function removeCartLine(
  userId: string,
  productId: string,
  variantId: string,
): Promise<void> {
  try {
    const id = cartDocId(productId, variantId);
    await deleteDoc(doc(db, "users", userId, CART_SUBCOL, id));
  } catch (err) {
    console.error("[cartService] removeCartLine error:", err);
  }
}

/** Replace the entire cart in Firestore (used on clear). */
export async function clearFirestoreCart(userId: string): Promise<void> {
  try {
    const snap = await getDocs(collection(db, "users", userId, CART_SUBCOL));
    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
  } catch (err) {
    console.error("[cartService] clearFirestoreCart error:", err);
  }
}

/**
 * Merge guest cart (localStorage) into authenticated user's Firestore cart.
 * Called right after login. Avoids duplicates by combining quantities.
 */
export async function mergeGuestCartOnLogin(
  userId: string,
  guestLines: CartLine[],
): Promise<CartLine[]> {
  if (guestLines.length === 0) {
    return loadFirestoreCart(userId);
  }

  try {
    const firestoreLines = await loadFirestoreCart(userId);
    const merged = [...firestoreLines];

    for (const guestLine of guestLines) {
      const existing = merged.find(
        (l) => l.productId === guestLine.productId && l.variantId === guestLine.variantId,
      );
      if (existing) {
        existing.quantity = Math.min(existing.quantity + guestLine.quantity, 20);
      } else {
        merged.push(guestLine);
      }
    }

    // Write merged back to Firestore
    const batch = writeBatch(db);
    // First clear existing
    const snap = await getDocs(collection(db, "users", userId, CART_SUBCOL));
    snap.docs.forEach((d) => batch.delete(d.ref));
    // Then write merged
    for (const line of merged) {
      const id = cartDocId(line.productId, line.variantId);
      batch.set(doc(db, "users", userId, CART_SUBCOL, id), {
        ...line,
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();

    // Clear guest localStorage cart
    saveGuestCart([]);

    return merged;
  } catch (err) {
    console.error("[cartService] mergeGuestCartOnLogin error:", err);
    return guestLines;
  }
}
