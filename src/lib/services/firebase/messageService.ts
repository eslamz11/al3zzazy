/**
 * Message Service — Handles contact form submissions and Admin Site Messages.
 * Collection: "site_messages"
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
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { SiteMessage } from "@/lib/types";
import { notifyNewSiteMessage } from "./notificationService";

const MESSAGES_COL = "site_messages";

function docToMessage(id: string, data: Record<string, unknown>): SiteMessage {
  return {
    id,
    name: (data["name"] as string) ?? "",
    email: data["email"] as string | undefined,
    phone: (data["phone"] as string) ?? "",
    subject: data["subject"] as string | undefined,
    message: (data["message"] as string) ?? "",
    read: Boolean(data["read"]),
    createdAt:
      (data["createdAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
      new Date().toISOString(),
    updatedAt:
      (data["updatedAt"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? undefined,
  };
}

/** Submit a message from the Contact Form (Public). */
export async function submitSiteMessage(input: {
  name: string;
  phone: string;
  email?: string;
  subject?: string;
  message: string;
}): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  try {
    const docRef = await addDoc(collection(db, MESSAGES_COL), {
      name: input.name.trim(),
      phone: input.phone.trim(),
      email: input.email?.trim() || null,
      subject: input.subject?.trim() || null,
      message: input.message.trim(),
      read: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Try to notify admin (catch permissions error if unauthenticated)
    try {
      await notifyNewSiteMessage(docRef.id, input.name, input.subject);
    } catch (notifErr) {
      console.warn("[messageService] notifyNewSiteMessage skipped/failed:", notifErr);
    }

    return { ok: true, messageId: docRef.id };
  } catch (err) {
    console.error("[messageService] submitSiteMessage error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** List all site messages for Admin. */
export async function listSiteMessages(filter?: "all" | "unread" | "read"): Promise<SiteMessage[]> {
  try {
    const constraints = [orderBy("createdAt", "desc"), limit(100)];
    if (filter === "unread") {
      constraints.unshift(where("read", "==", false) as never);
    } else if (filter === "read") {
      constraints.unshift(where("read", "==", true) as never);
    }

    const q = query(collection(db, MESSAGES_COL), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToMessage(d.id, d.data() as Record<string, unknown>));
  } catch (err) {
    console.error("[messageService] listSiteMessages error:", err);
    return [];
  }
}

/** Mark a site message as read or unread. */
export async function setSiteMessageRead(
  id: string,
  read: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    await updateDoc(doc(db, MESSAGES_COL, id), {
      read,
      updatedAt: serverTimestamp(),
    });
    return { ok: true };
  } catch (err) {
    console.error("[messageService] setSiteMessageRead error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Delete a site message. */
export async function deleteSiteMessage(id: string): Promise<{ ok: boolean; error?: string }> {
  try {
    await deleteDoc(doc(db, MESSAGES_COL, id));
    return { ok: true };
  } catch (err) {
    console.error("[messageService] deleteSiteMessage error:", err);
    return { ok: false, error: "firestore_error" };
  }
}

/** Get unread message count for dashboard/badges. */
export async function getUnreadSiteMessageCount(): Promise<number> {
  try {
    const q = query(collection(db, MESSAGES_COL), where("read", "==", false), limit(100));
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    return 0;
  }
}
