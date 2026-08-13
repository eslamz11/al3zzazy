/**
 * Audit service — records admin actions in adminLogs collection.
 * Never stores passwords or sensitive credentials.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { AdminLog, AdminActionType } from "@/lib/types";

const LOGS_COL = "adminLogs";

/** Log an admin action. Silent on failure. */
export async function logAdminAction(
  action: AdminActionType,
  resourceType: string,
  resourceId?: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    await addDoc(collection(db, LOGS_COL), {
      adminId: currentUser.uid,
      adminEmail: currentUser.email ?? undefined,
      action,
      resourceType,
      resourceId: resourceId ?? null,
      timestamp: serverTimestamp(),
      metadata: metadata ?? null,
    });
  } catch (err) {
    // Log failure should never break the admin flow
    console.error("[auditService] logAdminAction error:", err);
  }
}

/** Get recent admin logs. */
export async function getAdminLogs(lim = 100): Promise<AdminLog[]> {
  try {
    const q = query(collection(db, LOGS_COL), orderBy("timestamp", "desc"), limit(lim));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data() as Record<string, unknown>;
      return {
        id: d.id,
        adminId: (data["adminId"] as string) ?? "",
        adminEmail: data["adminEmail"] as string | undefined,
        action: (data["action"] as AdminActionType) ?? "login",
        resourceType: (data["resourceType"] as string) ?? "",
        resourceId: data["resourceId"] as string | undefined,
        timestamp:
          (data["timestamp"] as { toDate?: () => Date })?.toDate?.()?.toISOString() ??
          new Date().toISOString(),
        metadata: data["metadata"] as Record<string, unknown> | undefined,
      } satisfies AdminLog;
    });
  } catch (err) {
    console.error("[auditService] getAdminLogs error:", err);
    return [];
  }
}
