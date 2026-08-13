import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  FolderTree,
  ShoppingBag,
  Users,
  MessageSquare,
  Home,
  Tag,
  Boxes,
  Image as ImageIcon,
  Settings,
  UserCheck,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { signOutAdmin } from "@/lib/services/firebase/adminAuthService";
import { auth } from "@/lib/firebase";

interface AdminSidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  href: string;
  label: string;
  icon: any;
  exact?: boolean;
  badge?: string;
  badgeColor?: string;
}

interface NavGroup {
  id: string;
  title: string;
  icon?: any;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    id: "overview",
    title: "الرئيسية والواجهة",
    items: [
      { href: "/admin", label: "لوحة التحكم - نظرة عامة", icon: LayoutDashboard, exact: true },
      { href: "/admin/homepage", label: "تعديل الصفحة الرئيسية", icon: Home },
    ],
  },
  {
    id: "catalog",
    title: "إدارة المنتجات والكتالوج",
    items: [
      { href: "/admin/products", label: "جميع المنتجات", icon: Package },
      {
        href: "/admin/products/new",
        label: "إضافة منتج جديد",
        icon: PlusCircle,
        badge: "جديد",
        badgeColor: "#c8102e",
      },
      { href: "/admin/categories", label: "التصنيفات والقوائم", icon: FolderTree },
      { href: "/admin/inventory", label: "إدارة المخزون والتخزين", icon: Boxes },
      { href: "/admin/reviews", label: "رسائل الموقع والاستفسارات", icon: MessageSquare },
    ],
  },
  {
    id: "sales",
    title: "المبيعات والعملاء",
    items: [
      {
        href: "/admin/orders",
        label: "سجل وإدارة الطلبات",
        icon: ShoppingBag,
        badge: "مباشر",
        badgeColor: "#10b981",
      },
      { href: "/admin/customers", label: "سجل العملاء والحسابات", icon: Users },
      {
        href: "/admin/discounts",
        label: "الكوبونات والخصومات",
        icon: Tag,
        badge: "خصومات",
        badgeColor: "#f59e0b",
      },
    ],
  },
  {
    id: "system",
    title: "النظام والإعدادات",
    items: [
      { href: "/admin/media", label: "مكتبة الوسائط والصور", icon: ImageIcon },
      { href: "/admin/settings", label: "إعدادات المتجر العامة", icon: Settings },
      { href: "/admin/profile", label: "الملف الشخصي للمدير", icon: UserCheck },
    ],
  },
];

export function AdminSidebar({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
}: AdminSidebarProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const currentUser = auth.currentUser;
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    overview: true,
    catalog: true,
    sales: true,
    system: true,
  });

  const toggleGroup = (id: string) => {
    setOpenGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isActive = (item: { href: string; exact?: boolean }) => {
    if (item.exact) return pathname === item.href;
    return pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
  };

  const handleLogout = async () => {
    await signOutAdmin();
    window.location.href = "/admin/login";
  };

  return (
    <aside
      style={{
        width: isCollapsed ? 78 : 280,
        backgroundColor: "#141619",
        borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "width 280ms cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        userSelect: "none",
        boxShadow: "6px 0 30px rgba(0, 0, 0, 0.3)",
      }}
      dir="rtl"
    >
      {/* ── BRAND HEADER ── */}
      <div
        style={{
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isCollapsed ? "0 16px" : "0 16px 0 12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          flexShrink: 0,
          gap: 10,
          background:
            "linear-gradient(180deg, rgba(200, 16, 46, 0.12) 0%, rgba(20, 22, 25, 0) 100%)",
        }}
      >
        <Link
          to="/admin"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            flex: 1,
            overflow: "hidden",
            textDecoration: "none",
          }}
        >
          {/* Brand Logo Box */}
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#ffffff",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 4,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(200, 16, 46, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
            }}
          >
            <img
              src="https://sleephigh-eg.myshopify.com/cdn/shop/files/h_logo_250x.png?v=1697100417"
              alt="سليب هاي"
              style={{ height: 24, width: "auto", objectFit: "contain" }}
            />
          </div>

          {/* Brand Titles */}
          {!isCollapsed && (
            <div style={{ minWidth: 0, overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <p
                  style={{
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    margin: 0,
                    letterSpacing: "-0.01em",
                  }}
                >
                  سليب هاي
                </p>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 800,
                    backgroundColor: "#c8102e",
                    color: "#ffffff",
                    padding: "2px 6px",
                    borderRadius: 5,
                    letterSpacing: "0.05em",
                  }}
                >
                  PRO ADMIN
                </span>
              </div>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  fontWeight: 500,
                  lineHeight: 1.3,
                  whiteSpace: "nowrap",
                  margin: 0,
                  marginTop: 2,
                }}
              >
                نظام إدارة المتجر الكامل
              </p>
            </div>
          )}
        </Link>

        {/* Collapse & Mobile Close Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
              className="hidden lg:flex"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "#94a3b8",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(200, 16, 46, 0.2)";
                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(200, 16, 46, 0.4)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
              }}
            >
              {isCollapsed ? (
                <ChevronLeft style={{ width: 16, height: 16 }} />
              ) : (
                <ChevronRight style={{ width: 16, height: 16 }} />
              )}
            </button>
          )}

          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="إغلاق القائمة"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "#f1f5f9",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X style={{ width: 16, height: 16 }} />
            </button>
          )}
        </div>
      </div>

      {/* ── SIDEBAR MENU GROUPS & ACCORDIONS ── */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: isCollapsed ? "12px 8px" : "12px 12px",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(255,255,255,0.1) transparent",
        }}
      >
        {navGroups.map((group, idx) => {
          const isGroupOpen = openGroups[group.id] ?? true;

          return (
            <div key={group.id} style={{ marginBottom: 14 }}>
              {/* Collapsed mode divider */}
              {isCollapsed && idx > 0 && (
                <div
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.08)",
                    margin: "10px 4px",
                  }}
                />
              )}

              {/* Group Title Accordion Header (Expanded mode) */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleGroup(group.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "6px 10px 6px 6px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    margin: 0,
                  }}
                >
                  <p
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    {group.title}
                  </p>
                  <ChevronDown
                    style={{
                      width: 14,
                      height: 14,
                      color: "#64748b",
                      transition: "transform 200ms ease",
                      transform: isGroupOpen ? "rotate(0deg)" : "rotate(-90deg)",
                    }}
                  />
                </button>
              )}

              {/* Sub-menu links */}
              {(isGroupOpen || isCollapsed) && (
                <div style={{ marginTop: 4 }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item);

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        preload="intent"
                        onClick={onCloseMobile}
                        title={isCollapsed ? item.label : undefined}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: isCollapsed ? "10px 0" : "10px 12px",
                          borderRadius: 10,
                          marginBottom: 3,
                          textDecoration: "none",
                          fontSize: 13,
                          fontWeight: active ? 700 : 500,
                          color: active ? "#ffffff" : "#94a3b8",
                          backgroundColor: active ? "#c8102e" : "transparent",
                          boxShadow: active ? "0 4px 16px rgba(200, 16, 46, 0.4)" : "none",
                          justifyContent: isCollapsed ? "center" : "flex-start",
                          transition: "all 150ms ease",
                          minHeight: 40,
                          position: "relative",
                        }}
                        onMouseEnter={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                              "rgba(255,255,255,0.06)";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!active) {
                            (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                              "transparent";
                            (e.currentTarget as HTMLAnchorElement).style.color = "#94a3b8";
                          }
                        }}
                      >
                        <Icon
                          style={{
                            width: 18,
                            height: 18,
                            flexShrink: 0,
                            color: active ? "#ffffff" : "#64748b",
                          }}
                        />

                        {!isCollapsed && (
                          <span
                            style={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              flex: 1,
                            }}
                          >
                            {item.label}
                          </span>
                        )}

                        {/* Optional item badge */}
                        {!isCollapsed && item.badge && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              backgroundColor: item.badgeColor || "#c8102e",
                              color: "#ffffff",
                              padding: "2px 6px",
                              borderRadius: 9999,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.badge}
                          </span>
                        )}

                        {/* Active highlight indicator bar for RTL */}
                        {active && !isCollapsed && (
                          <span
                            style={{
                              width: 4,
                              height: 18,
                              backgroundColor: "#ffc700",
                              borderRadius: 2,
                            }}
                          />
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* ── VISIT STORE QUICK ACTION ── */}
      {!isCollapsed && (
        <div style={{ padding: "0 12px 10px", flexShrink: 0 }}>
          <a
            href="/ar"
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "10px 14px",
              borderRadius: 12,
              backgroundColor: "rgba(255, 255, 255, 0.04)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              color: "#f1f5f9",
              fontSize: 12,
              fontWeight: 600,
              textDecoration: "none",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "rgba(200, 16, 46, 0.15)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(200, 16, 46, 0.3)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                "rgba(255, 255, 255, 0.04)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor =
                "rgba(255, 255, 255, 0.08)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#f1f5f9";
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Sparkles style={{ width: 15, height: 15, color: "#ffc700" }} />
              <span>معاينة المتجر المباشر</span>
            </div>
            <ExternalLink style={{ width: 14, height: 14, color: "#94a3b8" }} />
          </a>
        </div>
      )}

      {/* ── ADMIN USER PROFILE FOOTER ── */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          padding: "12px 12px",
          flexShrink: 0,
          background: "linear-gradient(0deg, rgba(0, 0, 0, 0.35) 0%, rgba(20, 22, 25, 0) 100%)",
        }}
      >
        {/* Admin info card */}
        {!isCollapsed && currentUser && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 12px",
              borderRadius: 12,
              backgroundColor: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
              marginBottom: 8,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 9999,
                background: "linear-gradient(135deg, #c8102e, #82081c)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                fontSize: 14,
                fontWeight: 800,
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(200, 16, 46, 0.4)",
              }}
            >
              {currentUser.email?.charAt(0).toUpperCase() ?? "أ"}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p
                style={{
                  color: "#ffffff",
                  fontSize: 13,
                  fontWeight: 700,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                }}
              >
                {currentUser.displayName || "مدير النظام"}
              </p>
              <p
                style={{
                  color: "#94a3b8",
                  fontSize: 11,
                  margin: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  lineHeight: 1.2,
                  marginTop: 2,
                }}
              >
                {currentUser.email}
              </p>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          title={isCollapsed ? "تسجيل الخروج" : undefined}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            gap: 10,
            width: "100%",
            padding: isCollapsed ? "10px 0" : "10px 12px",
            borderRadius: 12,
            border: "1px solid rgba(239, 68, 68, 0.2)",
            backgroundColor: "rgba(239, 68, 68, 0.08)",
            color: "#fca5a5",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 150ms ease",
            minHeight: 42,
            fontFamily: "inherit",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "rgba(220, 38, 38, 0.25)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(220, 38, 38, 0.5)";
            (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "rgba(239, 68, 68, 0.08)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239, 68, 68, 0.2)";
            (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
          }}
        >
          <LogOut style={{ width: 17, height: 17, flexShrink: 0 }} />
          {!isCollapsed && <span>تسجيل الخروج من اللوحة</span>}
        </button>
      </div>
    </aside>
  );
}
