import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  ExternalLink,
  ShieldCheck,
  LogOut,
  Settings,
  UserCheck,
  ChevronDown,
  User as UserIcon,
} from "lucide-react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { auth } from "@/lib/firebase";
import { NotificationBell } from "./NotificationBell";
import { signOutAdmin } from "@/lib/services/firebase/adminAuthService";

interface AdminHeaderProps {
  onToggleMobileMenu: () => void;
}

const pageTitles: Record<string, string> = {
  "/admin": "نظرة عامة",
  "/admin/homepage": "الصفحة الرئيسية",
  "/admin/products": "إدارة المنتجات",
  "/admin/products/new": "إضافة منتج جديد",
  "/admin/categories": "التصنيفات والقوائم",
  "/admin/inventory": "المخزون والجاهزية",
  "/admin/reviews": "رسائل الموقع",
  "/admin/orders": "إدارة الطلبات",
  "/admin/customers": "سجل العملاء",
  "/admin/discounts": "الكوبونات والخصومات",
  "/admin/media": "مكتبة وسائط الصور",
  "/admin/settings": "إعدادات المتجر",
  "/admin/profile": "الملف الشخصي",
};

export function AdminHeader({ onToggleMobileMenu }: AdminHeaderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isWideDesktop, setIsWideDesktop] = useState(false);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentUser = auth.currentUser;

  useEffect(() => {
    const check = () => {
      setIsDesktop(window.innerWidth >= 1024);
      setIsWideDesktop(window.innerWidth >= 1280);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const currentTitle =
    pageTitles[pathname] ||
    (pathname.startsWith("/admin/products/")
      ? "تعديل المنتج"
      : pathname.startsWith("/admin/orders/")
        ? "تفاصيل الطلب"
        : "لوحة التحكم");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate({ to: "/admin/products", search: { q: searchQuery.trim() } as never });
  };

  const handleLogout = async () => {
    await signOutAdmin();
    window.location.href = "/admin/login";
  };

  const showHeaderSearch = isDesktop && pathname !== "/admin";

  return (
    <header
      dir="rtl"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5dfd7",
        padding: "0 24px",
        gap: 16,
        boxShadow: "0 1px 4px rgba(26, 28, 28, 0.04)",
      }}
    >
      {/* RIGHT: Mobile Hamburger toggle + Breadcrumb navigation */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {!isDesktop && (
          <button
            onClick={onToggleMobileMenu}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid #e5dfd7",
              backgroundColor: "#fbf9f5",
              color: "#1a1c1c",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 150ms ease",
            }}
            aria-label="القائمة"
          >
            <Menu style={{ width: 20, height: 20 }} />
          </button>
        )}

        {/* Breadcrumb path */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
          <span style={{ color: "#6b7280", fontWeight: 500 }}>لوحة التحكم</span>
          <span style={{ color: "#d0c8be", fontSize: 12 }}>/</span>
          <span style={{ color: "#1a1c1c", fontWeight: 700 }}>{currentTitle}</span>
        </div>
      </div>

      {/* CENTER: Search Bar (Desktop only, hidden on Dashboard Overview) */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: showHeaderSearch ? "block" : "none",
          position: "relative",
          width: 320,
          flexShrink: 0,
        }}
      >
        <Search
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            width: 16,
            height: 16,
            color: "#9ca3af",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث عن المنتجات أو الطلبات..."
          className="admin-search-input"
          style={{
            width: "100%",
            boxSizing: "border-box",
            borderRadius: 10,
            paddingRight: 38,
            paddingLeft: 14,
            paddingTop: 9,
            paddingBottom: 9,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        />
      </form>

      {/* LEFT: Actions (Notifications, User Menu) */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        {/* Real-time Notifications Bell */}
        <NotificationBell />

        {/* Profile Avatar & Menu Dropdown */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="admin-profile-btn"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: "1px solid #e5dfd7",
              backgroundColor: "#ffffff",
              cursor: "pointer",
            }}
          >
            {/* Avatar Pill */}
            <div className="admin-avatar">
              {currentUser?.email ? (
                currentUser.email.charAt(0).toUpperCase()
              ) : (
                <UserIcon style={{ width: 16, height: 16 }} />
              )}
            </div>

            {/* Admin Name (Desktop only) */}
            {isDesktop && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  textAlign: "right",
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: "#1a1c1c", lineHeight: 1.2 }}>
                  {currentUser?.displayName || "مدير النظام"}
                </span>
                <span style={{ fontSize: 11, color: "#6b7280", lineHeight: 1.2, marginTop: 2 }}>
                  {currentUser?.email?.split("@")[0] || "admin"}
                </span>
              </div>
            )}

            {isDesktop && <ChevronDown style={{ width: 14, height: 14, color: "#6b7280" }} />}
          </button>

          {/* Profile Dropdown Popup */}
          {showProfileMenu && (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 40 }}
                onClick={() => setShowProfileMenu(false)}
              />
              <div
                dir="rtl"
                className="admin-dropdown"
                style={{
                  position: "absolute",
                  left: 0,
                  top: "calc(100% + 8px)",
                  width: 220,
                  zIndex: 50,
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "14px 16px",
                    borderBottom: "1px solid #f4f0eb",
                    backgroundColor: "#fbf9f5",
                  }}
                >
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1a1c1c" }}>
                    {currentUser?.displayName || "مدير النظام"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "#6b7280" }}>
                    {currentUser?.email}
                  </p>
                </div>

                {/* Items */}
                <div style={{ padding: 6 }}>
                  <Link
                    to="/admin/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="admin-dropdown-item"
                  >
                    <UserCheck style={{ width: 16, height: 16, color: "#6b7280" }} />
                    <span>الملف الشخصي</span>
                  </Link>

                  <Link
                    to="/admin/settings"
                    onClick={() => setShowProfileMenu(false)}
                    className="admin-dropdown-item"
                  >
                    <Settings style={{ width: 16, height: 16, color: "#6b7280" }} />
                    <span>إعدادات المتجر</span>
                  </Link>

                  <div style={{ borderTop: "1px solid #f4f0eb", margin: "4px 0" }} />

                  <button
                    onClick={handleLogout}
                    className="admin-dropdown-item admin-dropdown-danger"
                    style={{ border: "none", background: "none", cursor: "pointer", width: "100%" }}
                  >
                    <LogOut style={{ width: 16, height: 16 }} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
