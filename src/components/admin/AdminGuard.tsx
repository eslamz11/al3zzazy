import { useEffect, useState, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { onAuthStateChanged as firebaseOnAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { verifyAdminRole, isCurrentUserAdminSync } from "@/lib/services/firebase/adminAuthService";

interface AdminGuardProps {
  children: ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  // Synchronously check current auth state on initial mount
  const currentUser = auth.currentUser;
  const isAlreadyAdmin = isCurrentUserAdminSync(currentUser);

  const [loading, setLoading] = useState(!isAlreadyAdmin);
  const [authorized, setAuthorized] = useState(isAlreadyAdmin);
  const navigate = useNavigate();

  useEffect(() => {
    // If user is synchronously confirmed as admin (e.g. after login or cache), unlock immediately
    if (isAlreadyAdmin) {
      setAuthorized(true);
      setLoading(false);
      return;
    }

    // Direct Firebase auth listener without redundant database calls
    const unsub = firebaseOnAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        setLoading(false);
        navigate({ to: "/admin/login" });
        return;
      }

      const isAdmin = await verifyAdminRole(user);
      if (!isAdmin) {
        setAuthorized(false);
        setLoading(false);
        navigate({ to: "/admin/login", search: { error: "unauthorized" } as never });
        return;
      }

      setAuthorized(true);
      setLoading(false);
    });

    return () => unsub();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fdfbf7] p-4 dir-rtl font-sans">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-[#c8102e] border-t-transparent" />
          <p className="text-xs text-gray-500 font-medium">جاري التحقق من صلاحيات لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
