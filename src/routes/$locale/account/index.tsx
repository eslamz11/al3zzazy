import { createFileRoute, Link } from "@tanstack/react-router";
import { useHref, useT, useFormatters } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { Package } from "lucide-react";
import { AccountLayout } from "@/components/account/AccountLayout";

export const Route = createFileRoute("/$locale/account/")({
  component: AccountDashboardPage,
});

function AccountDashboardPage() {
  const { orders } = useStore();
  const href = useHref();
  const t = useT();
  const { price } = useFormatters();

  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <AccountLayout activeTab="dashboard">
      <div className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-center">
             <p className="text-sm text-muted-foreground font-bold mb-1">{t("account.totalOrders")}</p>
            <p className="text-3xl font-black text-brand">{orders.length}</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm flex flex-col justify-center">
             <p className="text-sm text-muted-foreground font-bold mb-1">{t("account.totalSpent")}</p>
             <p className="text-3xl font-black text-brand">
               {price(totalSpent)}
             </p>
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-brand" />
               <span>{t("account.recentOrders")}</span>
            </h3>
            {orders.length > 0 && (
              <Link
                to={href("/account/orders")}
                className="text-sm font-bold text-brand hover:underline"
              >
                عرض الكل
              </Link>
            )}
          </div>

          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-4">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto" />
               <p className="font-bold text-muted-foreground">{t("account.noOrdersYet")}</p>
              <Link
                to={href("/collections")}
                className="inline-block mt-4 rounded-xl bg-brand px-6 py-2 font-bold text-brand-foreground hover:bg-brand-hover"
              >
                ابدأ التسوق
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  to={href(`/account/orders/${order.id}`)}
                  className="block rounded-2xl border border-border p-4 hover:border-brand/50 transition-colors group"
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-muted-foreground">طلب #{order.number}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div className="text-end">
                      <p className="font-bold text-brand">
                        {order.total.toLocaleString("ar-EG")} ج.م
                      </p>
                      <span className="inline-block mt-1 rounded-md bg-muted px-2 py-0.5 text-[10px] font-bold">
                        {order.status === "pending"
                          ? "قيد المراجعة"
                          : order.status === "processing"
                            ? "جاري التجهيز"
                            : order.status === "shipped"
                              ? "تم الشحن"
                              : order.status === "delivered"
                                ? "تم التوصيل"
                                : "ملغي"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AccountLayout>
  );
}
