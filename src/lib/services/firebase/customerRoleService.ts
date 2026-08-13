/**
 * Customer role management service.
 * Provides server-verified functions to promote/demote users to admin role.
 * ALL operations are verified server-side via Firestore security rules.
 */

import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  getDocs,
  query,
  collection,
  where,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { verifyAdminRole, adminRoleCache } from "./adminAuthService";
import { logAdminAction } from "./auditService";
import type { AdminRole } from "@/lib/types";

const ADMIN_ROLES_COL = "adminRoles";

/** Result type for role management operations */
export type RoleManagementResult =
  | { ok: true; message: string }
  | { ok: false; error: "not_authorized" | "self_demote" | "last_admin" | "user_not_found" | "unknown" };

/**
 * Check if the current authenticated user has admin privileges.
 * This is the server-side verification - it checks Firestore.
 */
async function verifyCurrentUserIsAdmin(): Promise<boolean> {
  const currentUser = auth.currentUser;
  if (!currentUser) return false;
  return verifyAdminRole(currentUser);
}

/**
 * Count total number of admins in the system.
 * Used to prevent removing the last admin.
 */
async function countAdmins(): Promise<number> {
  try {
    const q = query(collection(db, ADMIN_ROLES_COL), where("role", "==", "admin"));
    const snap = await getDocs(q);
    return snap.size;
  } catch {
    return 0;
  }
}

/**
 * Get the admin role for a specific user.
 */
export async function getUserAdminRole(uid: string): Promise<AdminRole | null> {
  try {
    const snap = await getDoc(doc(db, ADMIN_ROLES_COL, uid));
    if (!snap.exists()) return null;
    const data = snap.data() as AdminRole;
    return {
      ...data,
      grantedAt: data.grantedAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Check if a user has admin role.
 */
export async function isUserAdmin(uid: string): Promise<boolean> {
  const role = await getUserAdminRole(uid);
  return role?.role === "admin";
}

/**
 * Promote a customer to admin.
 * Requires the current user to be an admin (verified server-side).
 *
 * Security checks:
 * - Current user must be an admin
 * - Cannot promote self (use separate endpoint if needed)
 * - Updates are persisted in Firestore (not just frontend state)
 */
export async function promoteToAdmin(targetUserId: string): Promise<RoleManagementResult> {
  const currentUser = auth.currentUser;

  // 1. Verify current user is authenticated
  if (!currentUser) {
    return { ok: false, error: "not_authorized" };
  }

  // 2. Server-side verification: current user must be an admin
  const isCurrentUserAdmin = await verifyCurrentUserIsAdmin();
  if (!isCurrentUserAdmin) {
    // Log unauthorized attempt
    await logAdminAction("customer_updated", "user", targetUserId, {
      action: "promote_attempt",
      blocked: true,
      reason: "current_user_not_admin",
    });
    return { ok: false, error: "not_authorized" };
  }

  // 3. Prevent self-promotion (optional - can be removed if self-promotion is allowed)
  if (targetUserId === currentUser.uid) {
    return { ok: false, error: "not_authorized" };
  }

  try {
    // 4. Check if target user exists in users collection
    const userDoc = await getDoc(doc(db, "users", targetUserId));
    if (!userDoc.exists()) {
      return { ok: false, error: "user_not_found" };
    }

    const userData = userDoc.data();
    const targetEmail = userData["email"] as string;

    // 5. Check if user is already an admin
    const existingRole = await getUserAdminRole(targetUserId);
    if (existingRole?.role === "admin") {
      // Already an admin, no action needed
      return { ok: true, message: "User is already an admin" };
    }

    // 6. Create admin role document in Firestore
    await setDoc(doc(db, ADMIN_ROLES_COL, targetUserId), {
      uid: targetUserId,
      email: targetEmail || "",
      role: "admin",
      grantedAt: serverTimestamp(),
      grantedBy: currentUser.uid,
    } satisfies Omit<AdminRole, "grantedAt"> & { grantedAt: ReturnType<typeof serverTimestamp> });

    // 6b. CRITICAL: Also update the role in the users collection so customer login recognizes admin status
    await updateDoc(doc(db, "users", targetUserId), {
      role: "admin",
      updatedAt: serverTimestamp(),
    });

    // 7. Clear cache for this user so changes take effect immediately
    adminRoleCache.delete(targetUserId);

    // 8. Log the action
    await logAdminAction("customer_updated", "user", targetUserId, {
      action: "promote_to_admin",
      targetEmail,
      grantedBy: currentUser.email,
    });

    return { ok: true, message: "User promoted to admin" };
  } catch (err) {
    console.error("[customerRoleService] promoteToAdmin error:", err);
    await logAdminAction("customer_updated", "user", targetUserId, {
      action: "promote_to_admin",
      error: true,
    });
    return { ok: false, error: "unknown" };
  }
}

/**
 * Remove admin role from a user.
 * Requires the current user to be an admin (verified server-side).
 * Prevents removing the last admin.
 *
 * Security checks:
 * - Current user must be an admin
 * - Cannot remove own admin role (would lock them out)
 * - Cannot remove the last admin in the system
 * - Updates are persisted in Firestore (not just frontend state)
 */
export async function removeAdminRole(targetUserId: string): Promise<RoleManagementResult> {
  const currentUser = auth.currentUser;

  // 1. Verify current user is authenticated
  if (!currentUser) {
    return { ok: false, error: "not_authorized" };
  }

  // 2. Server-side verification: current user must be an admin
  const isCurrentUserAdmin = await verifyCurrentUserIsAdmin();
  if (!isCurrentUserAdmin) {
    // Log unauthorized attempt
    await logAdminAction("customer_updated", "user", targetUserId, {
      action: "demote_attempt",
      blocked: true,
      reason: "current_user_not_admin",
    });
    return { ok: false, error: "not_authorized" };
  }

  // 3. Prevent self-demotion (would lock admin out of dashboard)
  if (targetUserId === currentUser.uid) {
    return { ok: false, error: "self_demote" };
  }

  try {
    // 4. Check if target user exists in users collection
    const userDoc = await getDoc(doc(db, "users", targetUserId));
    if (!userDoc.exists()) {
      return { ok: false, error: "user_not_found" };
    }

    const userData = userDoc.data();
    const targetEmail = userData["email"] as string;

    // 5. Check if user is actually an admin
    const existingRole = await getUserAdminRole(targetUserId);
    if (existingRole?.role !== "admin") {
      // Not an admin, no action needed
      return { ok: true, message: "User is not an admin" };
    }

    // 6. Prevent removing the last admin
    const adminCount = await countAdmins();
    if (adminCount <= 1) {
      await logAdminAction("customer_updated", "user", targetUserId, {
        action: "demote_attempt",
        blocked: true,
        reason: "last_admin",
      });
      return { ok: false, error: "last_admin" };
    }

    // 7. Delete admin role document from Firestore
    await deleteDoc(doc(db, ADMIN_ROLES_COL, targetUserId));

    // 7b. CRITICAL: Also update the role in the users collection so customer login recognizes customer status
    await updateDoc(doc(db, "users", targetUserId), {
      role: "customer",
      updatedAt: serverTimestamp(),
    });

    // 8. Clear cache for this user so changes take effect immediately
    adminRoleCache.delete(targetUserId);

    // 9. Log the action
    await logAdminAction("customer_updated", "user", targetUserId, {
      action: "remove_admin_role",
      targetEmail,
      removedBy: currentUser.email,
    });

    return { ok: true, message: "Admin role removed" };
  } catch (err) {
    console.error("[customerRoleService] removeAdminRole error:", err);
    await logAdminAction("customer_updated", "user", targetUserId, {
      action: "remove_admin_role",
      error: true,
    });
    return { ok: false, error: "unknown" };
  }
}