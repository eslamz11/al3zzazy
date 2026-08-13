/**
 * Order service — Firestore-backed.
 * Customers can create orders and read their own. Admins can read/update all.
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
  onSnapshot,
  serverTimestamp,
  type DocumentSnapshot,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Order,
  OrderStatus,
  OrderStatusHistoryEntry,
  Address,
  PaymentMethod,
  CartLineView,
} from "@/lib/types";

const ORDERS_COL = "orders";
const PAGE_SIZE = 20;

function docToOrder(id: string, data: any): Order {
  return {
    id,
    number: (data.number as string) ?? id,
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      (data.createdAt as string) ??
      new Date().toISOString(),
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
    userId: data.userId as string | undefined,
    customer: data.customer as Order["customer"],
    lines: (data.lines as Order["lines"]) ?? [],
    subtotal: (data.subtotal as number) ?? 0,
    shipping: (data.shipping as number) ?? 0,
    discount: (data.discount as number) ?? 0,
    total: (data.total as number) ?? 0,
    address: (data.address as Address) ?? ({} as Address),
    paymentMethod: (data.paymentMethod as PaymentMethod) ?? "cod",
    paymentStatus: (data.paymentStatus as Order["paymentStatus"]) ?? "pending",
    status: (data.status as OrderStatus) ?? "pending",
    couponCode: data.couponCode as string | undefined,
    notes: data.notes as string | undefined,
    statusHistory: (data.statusHistory as OrderStatusHistoryEntry[]) ?? [],
  };
}

// ─── Customer-facing ─────────────────────────────────────────────────────────

/** Create a new order from cart. */
export async function createOrder(input: {
  userId?: string;
  address: Address;
  paymentMethod: PaymentMethod;
  cartLines: CartLineView[];
  subtotal: number;
  shipping: number;
  discount: number;
  couponCode?: string;
}): Promise<{ ok: true; order: Order } | { ok: false; error: string }> {
  try {
    const now = new Date();
    const number = `SH-${String(now.getTime()).slice(-8)}`;
    const total = input.subtotal + input.shipping - input.discount;

    const data = {
      number,
      userId: input.userId ?? null,
      customer: {
        name: input.address.fullName,
        phone: input.address.phone,
        email: input.address.email,
      },
      lines: input.cartLines.map((line) => ({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
        name: line.product.name,
        unitPrice: line.unitPrice,
        options: line.variant.options,
        image: line.product.images[0]?.src ?? "",
      })),
      subtotal: input.subtotal,
      shipping: input.shipping,
      discount: input.discount,
      total,
      address: input.address,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      status: "pending",
      couponCode: input.couponCode ?? null,
      notes: input.address.notes ?? null,
      statusHistory: [
        {
          status: "pending",
          timestamp: now.toISOString(),
        },
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const ref = await addDoc(collection(db, ORDERS_COL), data);

    return {
      ok: true,
      order: {
        ...data,
        id: ref.id,
        createdAt: now.toISOString(),
        paymentStatus: "pending",
        statusHistory: data.statusHistory as OrderStatusHistoryEntry[],
      } as unknown as Order,
    };
  } catch (err) {
    console.error("[orderService] createOrder error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Get orders for a specific customer. */
export async function getUserOrders(userId: string): Promise<Order[]> {
  try {
    const q = query(
      collection(db, ORDERS_COL),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToOrder(d.id, d.data()));
  } catch (err) {
    console.error("[orderService] getUserOrders error:", err);
    return [];
  }
}

/** Get a single order by ID. */
export async function getOrder(orderId: string): Promise<Order | null> {
  try {
    const snap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (!snap.exists()) return null;
    return docToOrder(snap.id, snap.data() as Record<string, unknown>);
  } catch {
    return null;
  }
}

// ─── Admin-facing ─────────────────────────────────────────────────────────────

/** List all orders (admin). */
export async function adminListOrders(opts?: {
  status?: OrderStatus;
  cursor?: DocumentSnapshot;
  limit_?: number;
}): Promise<{ orders: Order[]; nextCursor: DocumentSnapshot | null }> {
  try {
    const lim = opts?.limit_ ?? PAGE_SIZE;
    const constraints: QueryConstraint[] = [orderBy("createdAt", "desc"), limit(lim)];
    if (opts?.status) constraints.unshift(where("status", "==", opts.status));
    if (opts?.cursor) constraints.push(startAfter(opts.cursor));

    const q = query(collection(db, ORDERS_COL), ...constraints);
    const snap = await getDocs(q);
    const orders = snap.docs.map((d) => docToOrder(d.id, d.data()));
    const nextCursor = snap.docs.length === lim ? snap.docs[snap.docs.length - 1]! : null;
    return { orders, nextCursor };
  } catch (err) {
    console.error("[orderService] adminListOrders error:", err);
    return { orders: [], nextCursor: null };
  }
}

/** Update order status (admin). Records history entry. */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminId: string,
  note?: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    // Build history entry without undefined values
    const historyEntry: Partial<OrderStatusHistoryEntry> = {
      status: newStatus,
      timestamp: new Date().toISOString(),
      adminId,
    };
    if (note) {
      historyEntry.note = note;
    }

    console.log("[orderService] updateOrderStatus - payload:", {
      orderId,
      newStatus,
      adminId,
      note,
      historyEntry,
    });

    const orderSnap = await getDoc(doc(db, ORDERS_COL, orderId));
    if (!orderSnap.exists()) return { ok: false, error: "not_found" };
    const existing = orderSnap.data() as any;
    const existingHistory = (existing.statusHistory as OrderStatusHistoryEntry[]) ?? [];

    // Clean existing history entries by removing undefined values
    const cleanedHistory = existingHistory.map((entry) => {
      const cleaned: Partial<OrderStatusHistoryEntry> = {
        status: entry.status,
        timestamp: entry.timestamp,
        adminId: entry.adminId,
      };
      if (entry.note !== undefined) {
        cleaned.note = entry.note;
      }
      return cleaned;
    });

    const updateData = {
      status: newStatus,
      statusHistory: [...cleanedHistory, historyEntry],
      updatedAt: serverTimestamp(),
    };
    console.log("[orderService] updateOrderStatus - updateData:", updateData);

    await updateDoc(doc(db, ORDERS_COL, orderId), updateData);
    return { ok: true };
  } catch (err) {
    console.error("[orderService] updateOrderStatus error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Delete an order (admin). */
export async function deleteOrder(orderId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, ORDERS_COL, orderId));
    return { ok: true };
  } catch (err) {
    console.error("[orderService] deleteOrder error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Real-time listener for orders (admin dashboard). */
export function subscribeToOrders(
  onData: (orders: Order[]) => void,
  onError?: (err: Error) => void,
): Unsubscribe {
  const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"), limit(50));
  return onSnapshot(
    q,
    (snap) => {
      onData(snap.docs.map((d) => docToOrder(d.id, d.data())));
    },
    (err) => {
      console.error("[orderService] subscribeToOrders error:", err);
      onError?.(err);
    },
  );
}

/** Get dashboard stats. */
export async function getDashboardStats() {
  try {
    const q = query(collection(db, ORDERS_COL), orderBy("createdAt", "desc"), limit(100));
    const ordersSnap = await getDocs(q);
    const orders = ordersSnap.docs.map((d) =>
      docToOrder(d.id, d.data() as Record<string, unknown>),
    );

    const totalSales = orders
      .filter((o) => o.status !== "cancelled" && o.status !== "returned")
      .reduce((sum, o) => sum + o.total, 0);

    const newOrders = orders.filter((o) => o.status === "pending").length;

    return {
      totalSales,
      totalOrders: ordersSnap.size,
      newOrders,
    };
  } catch {
    return { totalSales: 0, totalOrders: 0, newOrders: 0 };
  }
}
