/**
 * Admin authentication service.
 * Uses Firebase Auth + Firestore adminRoles collection for authorization.
 * NEVER stores passwords. NEVER trusts frontend-only state for admin access.
 */

import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import type { AdminRole, User } from "@/lib/types";

const ADMIN_EMAIL = "sleephigh31@gmail.com";

/**
 * Sign in as admin via Firebase Auth.
 * After successful auth, checks if the user has admin role in Firestore.
 * The password is verified by Firebase — never compared in code.
 */
export async function signInAdmin(
  email: string,
  password: string,
): Promise<
  { ok: true; user: User } | { ok: false; error: "credentials" | "not_admin" | "unknown" }
> {
  try {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const isAdmin = await verifyAdminRole(cred.user);

    if (!isAdmin) {
      // Sign out immediately — auth succeeded but role is not admin
      await firebaseSignOut(auth);
      return { ok: false, error: "not_admin" };
    }

    return {
      ok: true,
      user: {
        id: cred.user.uid,
        name: cred.user.displayName ?? email,
        email: cred.user.email ?? email,
        role: "admin",
        photoURL: cred.user.photoURL ?? undefined,
      },
    };
  } catch (err: unknown) {
    const code = (err as { code?: string }).code ?? "";
    if (
      code === "auth/user-not-found" ||
      code === "auth/wrong-password" ||
      code === "auth/invalid-credential"
    ) {
      return { ok: false, error: "credentials" };
    }
    console.error("[adminAuthService] signInAdmin error:", err);
    return { ok: false, error: "unknown" };
  }
}

export const adminRoleCache = new Map<string, { isAdmin: boolean; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes cache

/**
 * Synchronously check if a user is an admin based on active cache.
 * Returns true/false immediately without async database calls.
 */
export function isCurrentUserAdminSync(user: FirebaseUser | null = auth.currentUser): boolean {
  if (!user) return false;
  const cached = adminRoleCache.get(user.uid);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.isAdmin;
  }
  return false;
}

/**
 * Verify admin role by checking Firestore adminRoles collection.
 * This is the primary authorization check — not just authentication.
 * Results are cached in-memory for 15 minutes per user session.
 */
export async function verifyAdminRole(user: FirebaseUser | null): Promise<boolean> {
  if (!user) return false;

  if (isCurrentUserAdminSync(user)) {
    return true;
  }

  try {
    const roleDoc = await getDoc(doc(db, "adminRoles", user.uid));
    let isAdmin = false;

    if (roleDoc.exists()) {
      const data = roleDoc.data() as AdminRole;
      isAdmin = data.role === "admin";
    } else if (user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      // Bootstrap: if no adminRoles doc exists and email matches, create it
      await setDoc(doc(db, "adminRoles", user.uid), {
        uid: user.uid,
        email: user.email,
        role: "admin",
        grantedAt: serverTimestamp(),
        grantedBy: "system_bootstrap",
      } satisfies Omit<AdminRole, "grantedAt"> & { grantedAt: ReturnType<typeof serverTimestamp> });
      isAdmin = true;
    }

    adminRoleCache.set(user.uid, { isAdmin, timestamp: Date.now() });
    return isAdmin;
  } catch (err) {
    console.error("[adminAuthService] verifyAdminRole error:", err);
    return false;
  }
}

/**
 * Check if the currently signed-in user is an admin.
 * Used for client-side route guards (NOT for security rules — those are in Firestore).
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = auth.currentUser;
  if (isCurrentUserAdminSync(user)) return true;
  return verifyAdminRole(user);
}

/** Sign out the admin. */
export async function signOutAdmin(): Promise<void> {
  adminRoleCache.clear();
  await firebaseSignOut(auth);
}

/** Get the admin role document for display. */
export async function getAdminRole(uid: string): Promise<AdminRole | null> {
  try {
    const snap = await getDoc(doc(db, "adminRoles", uid));
    if (!snap.exists()) return null;
    return snap.data() as AdminRole;
  } catch {
    return null;
  }
}
