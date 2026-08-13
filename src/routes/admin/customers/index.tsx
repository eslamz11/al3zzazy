import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Eye, Users, Shield, ShieldOff, Loader2 } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminListOrders } from "@/lib/services/firebase/orderService";
import { formatPrice } from "@/lib/format";
import { useLocale, useT } from "@/lib/locale";
import { RoleConfirmDialog } from "@/components/admin/RoleConfirmDialog";
import { promoteToAdmin, removeAdminRole, type RoleManagementResult } from "@/lib/services/firebase/customerRoleService";
import { useToast } from "@/components/admin/AdminLayout";

export const Route = createFileRoute("/admin/customers/")({
  component: AdminCustomersPage,
});

interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  createdAt: string;
  role?: "admin" | "customer";
}

function AdminCustomersPage() {
  const t = useT();
  const locale = useLocale();
  const toast = useToast();
  const [customers, setCustomers] = useState<CustomerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ userId: string; mode: "promote" | "demote" } | null>(null);

  // Load customers data
  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const [usersSnap, ordersRes] = await Promise.all([
        getDocs(collection(db, "users")).catch(() => null),
        adminListOrders({ limit_: 500 }).catch(() => ({ orders: [] })),
      ]);

      if (!usersSnap || usersSnap.empty) {
        setCustomers([]);
        setLoading(false);
        return;
      }

      const ordersList = ordersRes?.orders || [];

      // Map orders by customer ID or email/phone
      const orderStatsMap: Record<string, { count: number; total: number }> = {};
      ordersList.forEach((o) => {
        const custId = o.customer?.email || o.address?.email;
        if (custId) {
          if (!orderStatsMap[custId]) {
            orderStatsMap[custId] = { count: 0, total: 0 };
          }
          orderStatsMap[custId].count += 1;
          orderStatsMap[custId].total += o.total || 0;
        }
      });

      // Fetch all admin roles ONCE (not per user)
      const adminRolesMap = new Map<string, boolean>();
      try {
        const roleSnap = await getDocs(collection(db, "adminRoles"));
        roleSnap.docs.forEach((doc) => {
          const data = doc.data();
          if (data && data["role"] === "admin") {
            adminRolesMap.set(doc.id, true);
          }
        });
      } catch (err) {
        console.error("Failed to fetch admin roles:", err);
      }

      // Get role info for each user (synchronous - adminRoles already fetched above)
      const users: CustomerRecord[] = usersSnap.docs.map((d) => {
          const data = d.data() as Record<string, any>;
          const email = data["email"] || "";
          const stats = orderStatsMap[d.id] || orderStatsMap[email] || { count: 0, total: 0 };

          // Check if user is admin from the pre-fetched map
          const role: "admin" | "customer" = adminRolesMap.has(d.id) ? "admin" : "customer";

          return {
            id: d.id,
            name: data["displayName"] || data["name"] || "عميل بدون اسم",
            email: email,
            phone: data["phone"] || "—",
            ordersCount: stats.count,
            totalSpent: stats.total,
            createdAt: data["createdAt"]?.toDate?.()?.toISOString() || new Date().toISOString(),
            role,
          };
        });

      setCustomers(users);
    } catch (err) {
      console.error("Failed to fetch customers:", err);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // Filter customers
  const filtered = customers.filter((c) => {
    // Role filter
    if (roleFilter === "admin" && c.role !== "admin") return false;
    if (roleFilter === "customer" && c.role === "admin") return false;

    // Search filter
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return [c.name, c.email, c.phone].join(" ").toLowerCase().includes(q);
  });

  // Handle role change confirmation
  const handleRoleChange = async (userId: string, mode: "promote" | "demote") => {
    setPendingAction({ userId, mode });
    setDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingAction) return;

    const { userId, mode } = pendingAction;
    const user = customers.find((c) => c.id === userId);
    const userName = user?.name || user?.email || "Unknown";

    let result: RoleManagementResult;

    if (mode === "promote") {
      result = await promoteToAdmin(userId);
    } else {
      result = await removeAdminRole(userId);
    }

    if (result.ok) {
      toast.success(result.message || (mode === "promote" ? t("admin.role.promoteSuccess") : t("admin.role.demoteSuccess")));
      await loadCustomers(); // Refresh to show updated role
    } else {
      if (result.error === "self_demote") {
        toast.error(t("admin.role.errorSelfDemote"));
      } else if (result.error === "last_admin") {
        toast.error(t("admin.role.errorLastAdmin"));
      } else if (result.error === "not_authorized") {
        toast.error(t("admin.role.errorNotAuthorized"));
      } else if (result.error === "user_not_found") {
        toast.error(t("admin.role.errorUserNotFound"));
      } else {
        toast.error(t("admin.role.errorGeneric"));
      }
    }
  };

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("admin.customers.title")}</h1>
          <p className="text-xs text-muted-foreground mt-0.5">{t("admin.customers.subtitle")}</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.customers.searchPlaceholder")}
            className="w-full rounded-xl border border-input bg-background pr-9 pl-4 py-2.5 text-xs"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | "admin" | "customer")}
            className="rounded-xl border border-input bg-background px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">{t("admin.customers.filterAll")}</option>
            <option value="admin">{t("admin.customers.filterAdmins")}</option>
            <option value="customer">{t("admin.customers.filterCustomers")}</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">
          {t("admin.customers.loading")}
        </div>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground space-y-2">
          <Users className="h-10 w-10 text-muted-foreground mx-auto" />
          <p className="font-bold">{t("admin.customers.empty")}</p>
          <p className="text-xs">{t("admin.customers.emptyHint")}</p>
        </div>
      ) : (
        /* Customer Table */
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-right text-xs text-foreground border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="py-3.5 px-4">{t("admin.customers.customer")}</th>
                <th className="py-3.5 px-4">{t("admin.customers.phone")}</th>
                <th className="py-3.5 px-4">{t("admin.customers.email")}</th>
                <th className="py-3.5 px-4">{t("admin.customers.role") || "الدور"}</th>
                <th className="py-3.5 px-4">{t("admin.customers.ordersCount")}</th>
                <th className="py-3.5 px-4">{t("admin.customers.totalSpent")}</th>
                <th className="py-3.5 px-4">{t("admin.customers.registeredAt")}</th>
                <th className="py-3.5 px-4 text-left">{t("admin.customers.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-3 px-4 font-bold flex items-center space-x-2 space-x-reverse">
                    <div className="h-8 w-8 rounded-full bg-brand/15 text-brand flex items-center justify-center font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <span>{c.name}</span>
                  </td>
                  <td className="py-3 px-4 font-mono">{c.phone}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{c.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                        c.role === "admin"
                          ? "bg-amber-500/10 text-amber-700"
                          : "bg-gray-500/10 text-gray-700"
                      }`}
                    >
                      {c.role === "admin" ? (
                        <Shield className="h-3 w-3" />
                      ) : (
                        <ShieldOff className="h-3 w-3" />
                      )}
                      {c.role === "admin" ? t("admin.role.admin") : t("admin.role.customer")}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold">{c.ordersCount} طلبات</td>
                  <td className="py-3 px-4 font-bold text-brand">
                    {formatPrice(c.totalSpent, locale)}
                  </td>
                  <td className="py-3 px-4 text-muted-foreground">
                    {new Date(c.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="py-3 px-4 text-left space-y-2">
                    <Link
                      to="/admin/customers/$id"
                      params={{ id: c.id }}
                      className="inline-flex items-center space-x-1 space-x-reverse rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent min-h-[36px]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>{t("admin.customers.viewProfile")}</span>
                    </Link>

                    {c.role !== "admin" ? (
                      <button
                        onClick={() => handleRoleChange(c.id, "promote")}
                        className="inline-flex items-center space-x-1 space-x-reverse rounded-lg bg-brand/10 text-brand px-3 py-1.5 text-xs font-semibold hover:bg-brand/20 min-h-[36px]"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        <span>{t("admin.role.makeAdmin")}</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRoleChange(c.id, "demote")}
                        className="inline-flex items-center space-x-1 space-x-reverse rounded-lg bg-amber-500/10 text-amber-700 px-3 py-1.5 text-xs font-semibold hover:bg-amber-500/20 min-h-[36px]"
                      >
                        <ShieldOff className="h-3.5 w-3.5" />
                        <span>{t("admin.role.removeAdmin")}</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role Confirmation Dialog */}
      <RoleConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={pendingAction?.mode || "promote"}
        userName={customers.find((c) => c.id === pendingAction?.userId)?.name || ""}
        onConfirm={confirmRoleChange}
      >
        {pendingAction && (
          <div className="hidden">{pendingAction.userId}</div>
        )}
      </RoleConfirmDialog>
    </div>
  );
}