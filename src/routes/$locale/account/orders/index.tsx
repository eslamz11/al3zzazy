import { createFileRoute, Link } from "@tanstack/react-router";
import { useDir, useHref, useT, useFormatters } from "@/lib/locale";
import { useStore } from "@/lib/store";
import { Package, ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { AccountLayout } from "@/components/account/AccountLayout";

export const Route = createFileRoute("/$locale/account/orders/")({
  component: OrdersPage,
});

function OrdersPage() {
  const { orders } = useStore();
  const dir = useDir();
  const href = useHref();
  const t = useT();
  const { price } = useFormatters();

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-8">
         <h2 className="text-xl font-bold border-b border-border pb-4">{t("orders.title")}</h2>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6 border border-border bg-card rounded-3xl shadow-sm">
            <div className="h-24 w-24 rounded-full bg-brand/10 flex items-center justify-center">
              <Package className="h-12 w-12 text-brand" />
            </div>
            <div className="space-y-2">
             <h2 className="text-xl font-bold text-foreground">{t("account.noOrders")}</h2>
             <p className="text-muted-foreground">{t("account.noOrdersHint")}</p>
            </div>
            <Link
              to={href("/collections")}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 font-bold text-brand-foreground hover:bg-brand-hover transition-colors"
            >
               <span>{t("account.shopNow")}</span>
              {dir === "rtl" ? (
                <ArrowLeft className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden flex flex-col md:flex-row"
              >
                <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-e border-border bg-muted/20 space-y-4">
                  <div>
                     <p className="text-sm font-bold text-muted-foreground">{t("orders.orderNumber")}</p>
                    <p className="text-lg font-black font-mono text-foreground mt-1">
                      #{order.number}
                    </p>
                  </div>
                  <div>
                     <p className="text-sm font-bold text-muted-foreground">{t("orders.orderDate")}</p>
                    <p className="text-sm font-bold text-foreground mt-1">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                     <p className="text-sm font-bold text-muted-foreground">{t("orders.total")}</p>
                    <p className="text-xl font-black text-brand mt-1">
                      {order.total.toLocaleString("ar-EG")} ج.م
                    </p>
                  </div>
                  <div>
                     <p className="text-sm font-bold text-muted-foreground mb-1">{t("orders.status")}</p>
                    <span
                      className={cn(
                        "inline-block px-3 py-1 rounded-md text-xs font-bold",
                        order.status === "pending"
                          ? "bg-warning/20 text-warning-foreground"
                          : order.status === "delivered"
                            ? "bg-success/20 text-success"
                            : order.status === "cancelled"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-brand/10 text-brand",
                      )}
                    >
                      {order.status === "pending"
                        ? "قيد المراجعة"
                        : order.status === "processing"
                          ? "جاري التجهيز"
                          : order.status === "shipped"
                            ? "تم الشحن"
                            : order.status === "delivered"
                              ? "تم التوصيل"
                              : order.status === "returned"
                                ? "تم الاسترجاع"
                                : "ملغي"}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:w-2/3 flex flex-col">
                  <div className="flex-1">
                       <h3 className="font-bold text-foreground mb-4">
                         {t("orders.products", { count: order.lines.length })}
                       </h3>
                    <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2 hide-scrollbar">
                      {order.lines.map((line, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <img
                            src={line.image}
                            alt={""}
                            className="h-16 w-16 rounded-xl object-cover border border-border bg-background shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{line.name.ar}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {Object.values(line.options).join(" - ")} x {line.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-border flex justify-end">
                    <Link
                      to={href(`/account/orders/${order.id}`)}
                      className="flex items-center gap-2 rounded-xl bg-background border border-border px-6 py-2.5 font-bold text-foreground hover:bg-muted transition-colors"
                    >
                       <span>{t("orders.viewDetails")}</span>
                      {dir === "rtl" ? (
                        <ArrowLeft className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountLayout>
  );
}
