/**
 * Notification service — real-time admin notifications.
 */

import {
  collection,
  addDoc,
  updateDoc,
  getDocs,
  doc,
  query,
  orderBy,
  limit,
  onSnapshot,
  where,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { AdminNotification, NotificationType } from "@/lib/types";

const NOTIF_COL = "notifications";

function docToNotif(id: string, data: any): AdminNotification {
  return {
    id,
    type: (data.type as NotificationType) ?? "new_order",
    titleAr: (data.titleAr as string) ?? "",
    titleEn: (data.titleEn as string) ?? "",
    bodyAr: (data.bodyAr as string) ?? "",
    bodyEn: (data.bodyEn as string) ?? "",
    read: Boolean(data.read),
    createdAt:
      (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    relatedId: data.relatedId as string | undefined,
    relatedType: data.relatedType as string | undefined,
  };
}

/** Create a notification (called by other services on important events). */
export async function createNotification(
  data: Omit<AdminNotification, "id" | "createdAt" | "read">,
): Promise<void> {
  try {
    await addDoc(collection(db, NOTIF_COL), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("[notificationService] createNotification error:", err);
  }
}

/** Get all unread notifications (admin). */
export async function getUnreadNotifications(): Promise<AdminNotification[]> {
  try {
    const q = query(
      collection(db, NOTIF_COL),
      where("read", "==", false),
      orderBy("createdAt", "desc"),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToNotif(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Get recent notifications (admin). */
export async function getNotifications(lim = 20): Promise<AdminNotification[]> {
  try {
    const q = query(collection(db, NOTIF_COL), orderBy("createdAt", "desc"), limit(lim));
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToNotif(d.id, d.data() as Record<string, unknown>));
  } catch {
    return [];
  }
}

/** Mark a notification as read. */
export async function markNotificationRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, NOTIF_COL, id), { read: true });
  } catch (err) {
    console.error("[notificationService] markRead error:", err);
  }
}

/** Mark all notifications as read. */
export async function markAllRead(): Promise<void> {
  try {
    const snap = await getDocs(query(collection(db, NOTIF_COL), where("read", "==", false)));
    const promises = snap.docs.map((d) => updateDoc(d.ref, { read: true }));
    await Promise.all(promises);
  } catch (err) {
    console.error("[notificationService] markAllRead error:", err);
  }
}

/** Real-time listener for unread notification count. */
export function subscribeToUnreadCount(onCount: (count: number) => void): Unsubscribe {
  const q = query(collection(db, NOTIF_COL), where("read", "==", false), limit(99));
  return onSnapshot(q, (snap) => {
    onCount(snap.size);
  });
}

/** Notify about a new order. */
export async function notifyNewOrder(orderId: string, orderNumber: string): Promise<void> {
  await createNotification({
    type: "new_order",
    titleAr: "طلب جديد",
    titleEn: "New Order",
    bodyAr: `تم استلام طلب جديد رقم ${orderNumber}`,
    bodyEn: `New order received: ${orderNumber}`,
    relatedId: orderId,
    relatedType: "order",
  });
}

/** Notify about low stock. */
export async function notifyLowStock(
  productId: string,
  productName: string,
  stock: number,
): Promise<void> {
  await createNotification({
    type: "low_stock",
    titleAr: "مخزون منخفض",
    titleEn: "Low Stock",
    bodyAr: `${productName} — المخزون ${stock} وحدة فقط`,
    bodyEn: `${productName} — only ${stock} units remaining`,
    relatedId: productId,
    relatedType: "product",
  });
}

/** Notify about new customer registration. */
export async function notifyNewUserRegistration(
  userId: string,
  userName: string,
  userEmail: string,
): Promise<void> {
  await createNotification({
    type: "new_user",
    titleAr: "مستخدم جديد",
    titleEn: "New User Registered",
    bodyAr: `انضم مستخدم جديد: ${userName} (${userEmail})`,
    bodyEn: `New user registered: ${userName} (${userEmail})`,
    relatedId: userId,
    relatedType: "user",
  });
}

/** Notify about new contact/site message. */
export async function notifyNewSiteMessage(
  messageId: string,
  senderName: string,
  subject?: string,
): Promise<void> {
  await createNotification({
    type: "new_site_message",
    titleAr: "رسالة جديدة من الموقع",
    titleEn: "New Site Message",
    bodyAr: `رسالة جديدة من ${senderName}${subject ? ` — ${subject}` : ""}`,
    bodyEn: `New site message from ${senderName}${subject ? ` — ${subject}` : ""}`,
    relatedId: messageId,
    relatedType: "message",
  });
}

/** Subtle notification chime sound using Web Audio API (safe, lightweight, browser-compatible). */
export function playNotificationSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 note
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5 note

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // Ignore audio autoplay restrictions safely
  }
}
