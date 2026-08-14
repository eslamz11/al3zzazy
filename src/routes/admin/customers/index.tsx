import { useEffect, useState, useCallback } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Eye,
  Loader2,
  Mail,
  Phone,
  Search,
  Shield,
  ShieldOff,
  ShoppingBag,
  SlidersHorizontal,
  Users,
  WalletCards,
} from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { adminListOrders } from "@/lib/services/firebase/orderService";
import { formatPrice } from "@/lib/format";
import { useLocale, useT } from "@/lib/locale";
import { RoleConfirmDialog } from "@/components/admin/RoleConfirmDialog";
import {
  promoteToAdmin,
  removeAdminRole,
  type RoleManagementResult,
} from "@/lib/services/firebase/customerRoleService";
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
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">(
    "all",
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    userId: string;
    mode: "promote" | "demote";
  } | null>(null);

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
        const stats = orderStatsMap[d.id] ||
          orderStatsMap[email] || { count: 0, total: 0 };

        // Check if user is admin from the pre-fetched map
        const role: "admin" | "customer" = adminRolesMap.has(d.id)
          ? "admin"
          : "customer";

        return {
          id: d.id,
          name: data["displayName"] || data["name"] || "عميل بدون اسم",
          email,
          phone: data["phone"] || "—",
          ordersCount: stats.count,
          totalSpent: stats.total,
          createdAt:
            data["createdAt"]?.toDate?.()?.toISOString() ||
            new Date().toISOString(),
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
  const handleRoleChange = async (
    userId: string,
    mode: "promote" | "demote",
  ) => {
    setPendingAction({ userId, mode });
    setDialogOpen(true);
  };

  const confirmRoleChange = async () => {
    if (!pendingAction) return;

    const { userId, mode } = pendingAction;
    let result: RoleManagementResult;

    if (mode === "promote") {
      result = await promoteToAdmin(userId);
    } else {
      result = await removeAdminRole(userId);
    }

    if (result.ok) {
      toast.success(
        result.message ||
        (mode === "promote"
          ? t("admin.role.promoteSuccess")
          : t("admin.role.demoteSuccess")),
      );
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

  const roleBadge = (customer: CustomerRecord) => (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold sm:text-[11px] ${customer.role === "admin"
        ? "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        : "border-border bg-muted text-muted-foreground"
        }`}
    >
      {customer.role === "admin" ? (
        <Shield className="h-3.5 w-3.5" />
      ) : (
        <ShieldOff className="h-3.5 w-3.5" />
      )}
      {customer.role === "admin"
        ? t("admin.role.admin")
        : t("admin.role.customer")}
    </span>
  );

  const customerActions = (customer: CustomerRecord, mobile = false) => (
    <div
      className={
        mobile
          ? "grid grid-cols-1 gap-2 sm:grid-cols-2"
          : "flex min-w-max flex-col items-stretch justify-end gap-2 xl:flex-row xl:items-center"
      }
    >
      <Link
        to="/admin/customers/$id"
        params={{ id: customer.id }}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-xs font-bold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        <Eye className="h-4 w-4" />
        <span>{t("admin.customers.viewProfile")}</span>
      </Link>

      {customer.role !== "admin" ? (
        <button
          type="button"
          onClick={() => handleRoleChange(customer.id, "promote")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-brand/15 bg-brand/10 px-3 py-2 text-xs font-bold text-brand transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          <Shield className="h-4 w-4" />
          <span>{t("admin.role.makeAdmin")}</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleRoleChange(customer.id, "demote")}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-amber-400"
        >
          <ShieldOff className="h-4 w-4" />
          <span>{t("admin.role.removeAdmin")}</span>
        </button>
      )}
    </div>
  );

  return (
    <div className="dir-rtl space-y-5 text-foreground sm:space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-8 h-44 w-44 rounded-full bg-amber-500/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-brand/20 sm:h-14 sm:w-14">
              <Users className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                {t("admin.customers.title")}
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-muted-foreground sm:text-sm">
                {t("admin.customers.subtitle")}
              </p>
            </div>
          </div>

          {!loading && (
            <div className="flex w-fit items-center gap-2 rounded-2xl border border-border bg-background/80 px-4 py-2.5 shadow-sm backdrop-blur">
              <Users className="h-4 w-4 text-brand" />
              <span className="text-xs font-bold text-muted-foreground">
                {t("admin.customers.filterAll")}
              </span>
              <span className="flex min-w-7 items-center justify-center rounded-lg bg-brand/10 px-2 py-1 text-xs font-black text-brand">
                {customers.length}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Search and Filter */}
      <section className="rounded-2xl border border-border bg-card p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("admin.customers.searchPlaceholder")}
              className="min-h-12 w-full rounded-xl border border-input bg-background py-3 pe-4 ps-11 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
            />
          </div>

          <div className="relative w-full lg:w-60">
            <SlidersHorizontal className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              value={roleFilter}
              onChange={(e) =>
                setRoleFilter(e.target.value as "all" | "admin" | "customer")
              }
              className="min-h-12 w-full appearance-none rounded-xl border border-input bg-background py-3 pe-9 ps-4 text-sm font-semibold text-foreground outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
            >
              <option value="all">{t("admin.customers.filterAll")}</option>
              <option value="admin">{t("admin.customers.filterAdmins")}</option>
              <option value="customer">
                {t("admin.customers.filterCustomers")}
              </option>
            </select>
          </div>
        </div>

        {!loading && (searchQuery.trim() || roleFilter !== "all") && (
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-border px-1 pt-3">
            <p className="text-xs font-medium text-muted-foreground">
              {t("admin.customers.filterAll")}
            </p>
            <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-black text-foreground">
              {filtered.length}
            </span>
          </div>
        )}
      </section>

      {/* Loading State */}
      {loading ? (
        <section className="rounded-3xl border border-border bg-card px-5 py-16 text-center shadow-sm sm:py-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-bold text-foreground">
            {t("admin.customers.loading")}
          </p>
          <div className="mx-auto mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-pulse rounded-full bg-brand" />
          </div>
        </section>
      ) : filtered.length === 0 ? (
        /* Empty State */
        <section className="rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-sm sm:px-10 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-8 ring-muted/50">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-base font-black text-foreground sm:text-lg">
            {t("admin.customers.empty")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-muted-foreground sm:text-sm">
            {t("admin.customers.emptyHint")}
          </p>
        </section>
      ) : (
        <>
          {/* Desktop and tablet table */}
          <section className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-brand" />
                <span className="text-sm font-black text-foreground">
                  {t("admin.customers.title")}
                </span>
              </div>
              <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-black text-muted-foreground">
                {filtered.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] border-collapse text-right text-xs text-foreground">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4">
                      {t("admin.customers.customer")}
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      {t("admin.customers.phone")}
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      {t("admin.customers.email")}
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      {t("admin.customers.role") || "الدور"}
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      {t("admin.customers.ordersCount")}
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      {t("admin.customers.totalSpent")}
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">
                      {t("admin.customers.registeredAt")}
                    </th>
                    <th className="whitespace-nowrap px-5 py-4 text-left">
                      {t("admin.customers.actions")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((customer) => (
                    <tr
                      key={customer.id}
                      className="group transition-colors hover:bg-accent/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-[170px] items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 text-sm font-black text-brand ring-1 ring-brand/10 transition-transform group-hover:scale-105">
                            {customer.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[170px] truncate text-sm font-black text-foreground">
                              {customer.name}
                            </p>
                            <p
                              dir="ltr"
                              className="mt-0.5 max-w-[170px] truncate text-right font-mono text-[10px] text-muted-foreground"
                            >
                              {customer.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 font-mono font-semibold">
                        {customer.phone}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          dir="ltr"
                          className="block max-w-[190px] truncate text-right font-mono text-muted-foreground"
                          title={customer.email}
                        >
                          {customer.email}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        {roleBadge(customer)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 font-bold text-foreground">
                          <ShoppingBag className="h-3.5 w-3.5 text-muted-foreground" />
                          {customer.ordersCount} طلبات
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-black text-brand">
                        {formatPrice(customer.totalSpent, locale)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {new Date(customer.createdAt).toLocaleDateString(
                            "ar-EG",
                          )}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-left">
                        {customerActions(customer)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile customer cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {filtered.map((customer) => (
              <article
                key={`${customer.id}-mobile`}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="border-b border-border bg-muted/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-base font-black text-brand ring-1 ring-brand/10">
                        {customer.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-black text-foreground">
                          {customer.name}
                        </h2>
                        <p
                          dir="ltr"
                          className="mt-1 truncate text-right font-mono text-[10px] text-muted-foreground"
                        >
                          {customer.id}
                        </p>
                      </div>
                    </div>
                    {roleBadge(customer)}
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="space-y-2.5">
                    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-background p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Mail className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground">
                          {t("admin.customers.email")}
                        </p>
                        <p
                          dir="ltr"
                          className="mt-0.5 truncate text-right font-mono text-xs font-semibold text-foreground"
                          title={customer.email}
                        >
                          {customer.email || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-background p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Phone className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground">
                          {t("admin.customers.phone")}
                        </p>
                        <p
                          dir="ltr"
                          className="mt-0.5 truncate text-right font-mono text-xs font-semibold text-foreground"
                        >
                          {customer.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="rounded-2xl bg-muted/60 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-[10px] font-bold text-muted-foreground">
                        {t("admin.customers.ordersCount")}
                      </p>
                      <p className="mt-1 text-sm font-black text-foreground">
                        {customer.ordersCount} طلبات
                      </p>
                    </div>

                    <div className="rounded-2xl bg-brand/10 p-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-background text-brand shadow-sm">
                        <WalletCards className="h-4 w-4" />
                      </div>
                      <p className="mt-3 text-[10px] font-bold text-muted-foreground">
                        {t("admin.customers.totalSpent")}
                      </p>
                      <p className="mt-1 truncate text-sm font-black text-brand">
                        {formatPrice(customer.totalSpent, locale)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-border pt-3 text-xs">
                    <span className="font-semibold text-muted-foreground">
                      {t("admin.customers.registeredAt")}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(customer.createdAt).toLocaleDateString("ar-EG")}
                    </span>
                  </div>

                  {customerActions(customer, true)}
                </div>
              </article>
            ))}
          </section>
        </>
      )}

      {/* Role Confirmation Dialog */}
      <RoleConfirmDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={pendingAction?.mode || "promote"}
        userName={
          customers.find((c) => c.id === pendingAction?.userId)?.name || ""
        }
        onConfirm={confirmRoleChange}
      >
        {pendingAction && <div className="hidden">{pendingAction.userId}</div>}
      </RoleConfirmDialog>
    </div>
  );
}
