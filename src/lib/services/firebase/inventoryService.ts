/**
 * Inventory management service.
 */

import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { products as demoProducts } from "@/data/catalog";
import type { Product } from "@/lib/types";

export interface InventoryItem {
  id: string; // product id or product:variant id
  productId: string;
  variantId?: string;
  productNameAr: string;
  productNameEn: string;
  sku: string;
  variantTitleAr?: string;
  variantTitleEn?: string;
  stock: number;
  lowStockThreshold: number;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

/** Get low stock products for admin alerts. */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  try {
    const snap = await getDocs(query(collection(db, "products"), where("active", "==", true)));
    const items: InventoryItem[] = [];

    const docs = snap.empty
      ? demoProducts
      : snap.docs.map((d) => ({ id: d.id, ...(d.data() as object) }) as Product);

    for (const p of docs) {
      const threshold = p.lowStockThreshold ?? 5;
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          const status =
            v.stock <= 0 ? "out_of_stock" : v.stock <= threshold ? "low_stock" : "in_stock";
          if (status !== "in_stock") {
            items.push({
              id: `${p.id}:${v.id}`,
              productId: p.id,
              variantId: v.id,
              productNameAr: p.name.ar,
              productNameEn: p.name.en,
              sku: v.sku,
              variantTitleAr: Object.values(v.options).join(" / "),
              variantTitleEn: Object.values(v.options).join(" / "),
              stock: v.stock,
              lowStockThreshold: threshold,
              status,
            });
          }
        }
      } else {
        const status =
          p.stock <= 0 ? "out_of_stock" : p.stock <= threshold ? "low_stock" : "in_stock";
        if (status !== "in_stock") {
          items.push({
            id: p.id,
            productId: p.id,
            productNameAr: p.name.ar,
            productNameEn: p.name.en,
            sku: p.sku,
            stock: p.stock,
            lowStockThreshold: threshold,
            status,
          });
        }
      }
    }

    return items;
  } catch (err) {
    console.error("[inventoryService] getLowStockItems error:", err);
    return [];
  }
}

/** Update stock level for a product or variant. */
export async function updateStock(
  productId: string,
  variantId: string | undefined,
  newStock: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const productRef = doc(db, "products", productId);
    if (!variantId) {
      await updateDoc(productRef, {
        stock: newStock,
        updatedAt: serverTimestamp(),
      });
      return { ok: true };
    }

    // Update specific variant in product's variants array
    const snap = await getDocs(
      query(collection(db, "products"), where("__name__", "==", productId)),
    );
    if (snap.empty) return { ok: false, error: "Product not found" };
    const pData = snap.docs[0]!.data() as Product;
    const updatedVariants = (pData.variants || []).map((v) =>
      v.id === variantId ? { ...v, stock: newStock, available: newStock > 0 } : v,
    );
    const totalStock = updatedVariants.reduce((sum, v) => sum + v.stock, 0);

    await updateDoc(productRef, {
      variants: updatedVariants,
      stock: totalStock,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error("[inventoryService] updateStock error:", err);
    return { ok: false, error: "firestore_error" };
  }
}
