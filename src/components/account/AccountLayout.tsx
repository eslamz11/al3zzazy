import { ReactNode, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useDir, useHref, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";
import {
  UserCircle,
  Package,
  Settings,
  LogOut,
  ChevronRight,
  ChevronLeft,
  MapPin,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AccountLayoutProps {
  children: ReactNode;
  activeTab: "dashboard" | "orders" | "addresses" | "settings";
}

export function AccountLayout({ children, activeTab }: AccountLayoutProps) {
  const { user, hydrated, logout } = useStore();
  const dir = useDir();
  const href = useHref();
  const t = useT();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) {
      navigate({ to: href("/account/login") });
    }
  }, [hydrated, user, navigate, href]);

  if (!hydrated || !user) {
    return (
       <div className="py-24 text-center text-muted-foreground font-bold">
         {t("common.loading")}
       </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate({ to: href("/account/login") });
  };

  const navItems = [
    { id: "dashboard", label: t("account.dashboard"), icon: LayoutDashboard, path: "/account" },
    { id: "orders", label: t("account.orders"), icon: Package, path: "/account/orders" },
    { id: "addresses", label: t("account.addresses"), icon: MapPin, path: "/account/addresses" },
    { id: "settings", label: t("account.settings"), icon: Settings, path: "/account/settings" },
  ] as const;

  return (
    <div className={cn("container-page py-12 space-y-8", dir === "rtl" ? "dir-rtl" : "dir-ltr")}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border pb-4">
         <h1 className="fluid-h2 font-bold text-foreground">{t("account.title")}</h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-2 font-bold text-destructive hover:bg-destructive/20 transition-colors text-sm"
        >
          <LogOut className="h-4 w-4" />
           <span>{t("account.logout")}</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-4 text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-brand/10 flex items-center justify-center overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-10 w-10 text-brand" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
            {navItems.map((item) => (
              <Link
                key={item.id}
                to={href(item.path)}
                className={cn(
                  "flex items-center justify-between p-4 transition-colors border-b border-border last:border-b-0 group",
                  activeTab === item.id
                    ? dir === "rtl"
                      ? "bg-brand/10 text-brand border-r-4 border-r-brand"
                      : "bg-brand/10 text-brand border-l-4 border-l-brand"
                    : "hover:bg-muted/50",
                )}
              >
                <div className="flex items-center gap-3 font-bold">
                  <item.icon
                    className={cn(
                      "h-5 w-5 transition-colors",
                      activeTab === item.id
                        ? "text-brand"
                        : "text-muted-foreground group-hover:text-brand",
                    )}
                  />
                  <span className={activeTab === item.id ? "text-brand" : ""}>{item.label}</span>
                </div>
                <ChevronLeft
                  className={cn(
                    "h-5 w-5 transition-transform",
                    activeTab === item.id
                      ? "text-brand"
                      : "text-muted-foreground group-hover:text-brand",
                    dir === "ltr" && "rotate-180",
                  )}
                />
              </Link>
            ))}
          </div>

          {/* Admin Button */}
          {user.role === "admin" && (
            <div className="rounded-3xl border border-brand/20 bg-brand/5 p-5 shadow-sm">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-brand/10 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-brand" />
                </div>
                <div>
                   <h3 className="font-bold text-foreground">{t("account.adminPanel")}</h3>
                   <p className="text-xs text-muted-foreground mt-1 mb-4">
                     {t("account.adminPanelText")}
                   </p>
                </div>
                <Link
                  to="/admin"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 font-bold text-brand-foreground hover:bg-brand-hover transition-all shadow-md shadow-brand/20"
                >
                  <ShieldCheck className="h-4 w-4" />
                   <span>{t("account.adminPanelCta")}</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-8">{children}</div>
      </div>
    </div>
  );
}
