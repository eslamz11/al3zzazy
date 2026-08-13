import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { useDir, useLocalized, useHref, useT, useFormatters } from "@/lib/locale";
import { useStore } from "@/lib/store";
import type { Order } from "@/lib/types";
import { ArrowLeft, ArrowRight, Package, MapPin, CreditCard, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/$locale/account/orders/$id")({
  component: OrderDetailsPage,
});

function OrderDetailsPage() {
  const { id } = useParams({ from: "/$locale/account/orders/$id" });
  const { user, hydrated, getOrder } = useStore();
  const dir = useDir();
  const L = useLocalized();
  const href = useHref();
  const t = useT();
  const { price, dateTime } = useFormatters();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (hydrated && !user) {
      navigate({ to: href("/account/login") });
      return;
    }
    if (hydrated && user) {
      const found = getOrder(id);
      if (found) setOrder(found);
    }
  }, [hydrated, user, navigate, href, id, getOrder]);

  if (!hydrated || !user) {
    return (
         <div className="py-24 text-center text-muted-foreground font-bold">
           {t("common.loading")}
         </div>
    );
  }

  if (!order) {
    return (
      <div className="py-24 text-center space-y-4">
         <h1 className="text-2xl font-bold">{t("orderDetails.notFound")}</h1>
         <p className="text-muted-foreground">{t("orderDetails.notFoundHint")}</p>
         <Link
           to={href("/account/orders")}
           className="inline-block mt-4 text-brand hover:underline font-bold"
         >
           {t("orderDetails.backToOrders")}
         </Link>
      </div>
    );
  }

  const statusText =
    order.status === "pending"
      ? "قيد المراجعة"
      : order.status === "processing"
        ? "جاري التجهيز"
        : order.status === "shipped"
          ? "تم الشحن"
          : order.status === "delivered"
            ? "تم التوصيل"
            : order.status === "returned"
              ? "تم الاسترجاع"
              : "ملغي";

  const statusColor =
    order.status === "pending"
      ? "bg-warning/20 text-warning-foreground border-warning/30"
      : order.status === "delivered"
        ? "bg-success/20 text-success border-success/30"
        : order.status === "cancelled"
          ? "bg-destructive/20 text-destructive border-destructive/30"
          : "bg-brand/10 text-brand border-brand/20";

  return (
    <div className={cn("container-page py-12 space-y-8", dir === "rtl" ? "dir-rtl" : "dir-ltr")}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link
            to={href("/account/orders")}
            className="p-2 rounded-xl bg-card border border-border hover:bg-muted transition-colors"
          >
            {dir === "rtl" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
          </Link>
          <div>
            <h1 className="fluid-h3 font-bold text-foreground">طلب #{order.number}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
        <div
          className={cn("px-4 py-2 rounded-xl border font-bold text-sm text-center", statusColor)}
        >
          {statusText}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Items */}
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-4">
              <Package className="h-5 w-5 text-brand" />
               <span>{t("orderDetails.items", { count: order.lines.length })}</span>
            </h2>

            <div className="space-y-4">
              {order.lines.map((line, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="relative h-20 w-20 shrink-0 rounded-2xl border border-border overflow-hidden bg-background">
                    <img
                      src={line.image}
                      alt={L(line.name)}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute -top-2 -right-2 bg-foreground text-background text-[10px] font-bold h-6 w-6 flex items-center justify-center rounded-full z-10 border-2 border-background">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold truncate">{L(line.name)}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {Object.values(line.options).join(" - ")}
                    </p>
                  </div>
                  <div className="text-end">
                    <p className="font-bold text-sm text-brand">
                      {(line.unitPrice * line.quantity).toLocaleString("ar-EG")} ج.م
                    </p>
                       <p className="text-xs text-muted-foreground mt-1">
                         {line.unitPrice.toLocaleString("ar-EG")} ج.م {t("orderDetails.unitPrice")}
                       </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-4">
                <Clock className="h-5 w-5 text-brand" />
                 <span>{t("orderDetails.timeline")}</span>
              </h2>

              <div className="space-y-6 relative before:absolute before:inset-y-0 before:start-2.5 before:w-0.5 before:bg-border">
                {order.statusHistory.map((history, idx) => (
                  <div key={idx} className="relative flex gap-4">
                    <div className="relative z-10 mt-1.5 h-5 w-5 shrink-0 rounded-full bg-brand border-4 border-card" />
                    <div>
                      <p className="font-bold text-sm">
                        {history.status === "pending"
                          ? "تم استلام الطلب"
                          : history.status === "processing"
                            ? "جاري التجهيز"
                            : history.status === "shipped"
                              ? "في الطريق إليك"
                              : history.status === "delivered"
                                ? "تم التوصيل بنجاح"
                                : history.status === "cancelled"
                                  ? "تم إلغاء الطلب"
                                  : "تم الاسترجاع"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(history.timestamp).toLocaleString("ar-EG")}
                      </p>
                      {history.note && (
                        <p className="text-sm mt-2 text-foreground">{history.note}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-4">
              <CreditCard className="h-5 w-5 text-brand" />
                 <span>{t("orderDetails.costSummary")}</span>
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                 <span>{t("orderDetails.subtotal")}</span>
                 <span className="font-bold text-foreground">
                   {price(order.subtotal)}
                 </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                 <span>{t("orderDetails.shipping")}</span>
                 <span className="font-bold text-foreground">
                   {order.shipping === 0 ? t("orderDetails.freeShipping") : price(order.shipping)}
                 </span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-success">
                   <span>{t("orderDetails.discount")}</span>
                   <span className="font-bold">-{price(order.discount)}</span>
                </div>
              )}
            </div>

            <div className="border-t border-border pt-4 flex justify-between items-end">
               <span className="font-bold text-base">{t("orderDetails.total")}</span>
               <span className="text-2xl font-black text-brand">
                 {price(order.total)}
               </span>
            </div>

            <div className="border-t border-border pt-4 mt-4">
               <p className="text-sm font-bold text-muted-foreground mb-1">{t("orderDetails.paymentMethod")}</p>
              <p className="font-bold text-sm text-foreground">
                 {order.paymentMethod === "cod" ? t("payment.codLong") : t("payment.cardLong")}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-4">
              <MapPin className="h-5 w-5 text-brand" />
               <span>{t("orderDetails.deliveryAddress")}</span>
            </h2>

            <div className="space-y-2 text-sm">
              <p className="font-bold text-foreground">{order.address.fullName}</p>
              <p className="text-muted-foreground dir-ltr text-end">{order.address.phone}</p>
              <p className="text-muted-foreground">{order.address.street}</p>
              <p className="text-muted-foreground">
                {order.address.city}، {order.address.governorate}
              </p>

              {order.address.notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">ملاحظة: </span>
                  {order.address.notes}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
