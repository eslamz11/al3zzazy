import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useLocalized,
  useDir,
  useHref,
  useT,
  useFormatters,
} from "@/lib/locale";
import type { Order } from "@/lib/types";
import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CreditCard,
  Hash,
  Package,
  Printer,
  ReceiptText,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/$locale/checkout/confirmation")({
  component: ConfirmationPage,
});

export interface PageCopyProps {
  storeName: string;
  invoice: string;
  printInvoice: string;
  orderReceived: string;
  invoiceNumber: string;
  product: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  paymentDetails: string;
  shippingDetails: string;
  shippingNote: string;
  secureOrder: string;
  thankYou: string;
  invoiceNote: string;
  orderDate: string;
  customerDetails: string;
  noOrder: string;
  noOrderHint: string;
  loading: string;
}

const getPageCopy = (dir: "rtl" | "ltr"): PageCopyProps =>
  dir === "rtl"
    ? {
      storeName: "مول العزازي",
      invoice: "فاتورة شراء",
      printInvoice: "طباعة الفاتورة",
      orderReceived: "تم استلام الطلب",
      invoiceNumber: "رقم الفاتورة",
      product: "المنتج",
      quantity: "الكمية",
      unitPrice: "سعر الوحدة",
      lineTotal: "الإجمالي",
      paymentDetails: "تفاصيل الدفع",
      shippingDetails: "الشحن والتوصيل",
      shippingNote: "سيتم تحديثك عند بدء تجهيز وشحن الطلب.",
      secureOrder: "طلبك مسجل بأمان",
      thankYou: "شكراً لتسوقك معنا",
      invoiceNote: "احتفظ بهذه الفاتورة للرجوع إليها عند الحاجة.",
      orderDate: "تاريخ الطلب",
      customerDetails: "تفاصيل العميل",
      noOrder: "تعذر العثور على بيانات الطلب",
      noOrderHint:
        "ربما تم فتح الصفحة مباشرة أو انتهت جلسة الطلب. ارجع إلى المتجر وحاول مرة أخرى.",
      loading: "جارٍ تحميل بيانات الطلب...",
    }
    : {
      storeName: "Al3azzazy",
      invoice: "Purchase invoice",
      printInvoice: "Print invoice",
      orderReceived: "Order received",
      invoiceNumber: "Invoice number",
      product: "Product",
      quantity: "Qty",
      unitPrice: "Unit price",
      lineTotal: "Total",
      paymentDetails: "Payment details",
      shippingDetails: "Shipping & delivery",
      shippingNote: "We will update you once your order is prepared and shipped.",
      secureOrder: "Your order is securely registered",
      thankYou: "Thank you for shopping with us",
      invoiceNote: "Keep this invoice for future reference.",
      orderDate: "Order date",
      customerDetails: "Customer details",
      noOrder: "Order details could not be found",
      noOrderHint:
        "The page may have been opened directly or the checkout session has expired. Return to the store and try again.",
      loading: "Loading order details...",
    };

function ConfirmationPage() {
  const L = useLocalized();
  const dir = useDir();
  const href = useHref();
  const t = useT();
  const { price, dateTime } = useFormatters();
  const copy = getPageCopy(dir);

  const [order, setOrder] = useState<Order | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lastOrder");
      if (raw) setOrder(JSON.parse(raw) as Order);

      // لا نحذف الطلب هنا حتى تظل الفاتورة متاحة بعد تحديث الصفحة
      // وسيتم حذف البيانات تلقائياً عند إغلاق جلسة المتصفح.
    } catch {
      setOrder(null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const handlePrint = () => {
    if (!order) return;
    window.print();
  };

  // Professional invoice data for print
  const invoiceData = order
    ? {
        invoiceNumber: `INV-${order.number}`,
        invoiceDate: dateTime(order.createdAt),
        customerName: order.address.fullName || "—",
        customerPhone: order.address.phone || "—",
        customerEmail: order.address.email || "—",
        shippingAddress: [
          order.address.governorate,
          order.address.city,
          order.address.street,
        ]
          .filter(Boolean)
          .join(", "),
        notes: order.address.notes || "—",
      }
    : null;

  return (
    <main
      dir={dir}
      className={cn(
        "relative min-h-screen overflow-hidden bg-background",
        dir === "rtl" ? "dir-rtl" : "dir-ltr",
      )}
    >
      {/* Professional Print Layout - Hidden on screen, visible when printing */}
      {!isHydrated ? null : (
        <div
          id="print-only-invoice"
          className="hidden print:block print:fixed print:inset-0 print:m-0 print:p-6 print:!w-[210mm] print:!h-[297mm] print:!max-w-none print:!overflow-visible"
        >
          <div className="print:flex print:flex-col print:gap-6 print:items-start print:w-full print:font-sans">
            {/* Header */}
            <div className="print:flex print:justify-between print:items-start print:pb-4 print:border-b print:border-gray-300 print:mb-6">
              <div className="print:flex print:items-center print:gap-4">
                <div className="print:h-12 print:w-12 print:shrink-0 print:items-center print:justify-center print:rounded-2xl print:bg-brand print:text-brand-foreground print:shadow-sm">
                  <ShoppingBag className="print:h-6 print:w-6" />
                </div>
                <div>
                  <p className="print:text-lg print:font-black print:text-foreground">
                    {copy.storeName}
                  </p>
                  <p className="print:text-xs print:font-medium print:text-muted-foreground">
                    {copy.thankYou}
                  </p>
                </div>
              </div>
              <div className="print:text-end print:space-y-1">
                <p className="print:text-xs print:font-bold print:uppercase print:tracking-[0.18em] print:text-muted-foreground">
                  {copy.invoice}
                </p>
                <p
                  dir="ltr"
                  className="print:mt-1 print:font-mono print:text-lg print:font-black print:text-foreground"
                >
                  INV-{order?.number}
                </p>
                <p className="print:text-xs print:font-bold print:text-muted-foreground">
                  {copy.orderDate}
                </p>
                <p className="print:mt-0.5 print:font-bold print:text-foreground">
                  {dateTime(order?.createdAt ?? "")}
                </p>
              </div>
            </div>

            {/* Customer Info */}
            <div className="print:grid print:grid-cols-2 print:gap-4 print:mb-6">
              <div>
                <p className="print:text-xs print:font-semibold print:text-muted-foreground print:mb-1">
                  {t("confirm.orderNumber")} ({copy.invoice})
                </p>
                <p className="print:break-all print:font-mono print:text-base print:font-black print:text-foreground">
                  #{order?.number}
                </p>
              </div>
              <div className="print:text-end">
                <p className="print:text-xs print:font-semibold print:text-muted-foreground print:mb-1">
                  {copy.customerDetails}
                </p>
                <div className="print:space-y-1">
                  <p className="print:break-all print:text-sm print:font-bold print:text-foreground">
                    {order?.address.fullName ?? "—"}
                  </p>
                  <p className="print:break-all print:text-sm print:text-muted-foreground">
                    {order?.address.phone ?? "—"}
                  </p>
                  {order?.address.email && (
                    <p className="print:break-all print:text-sm print:text-muted-foreground">
                      {order?.address.email}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="print:mb-6">
              <p className="print:text-xs print:font-semibold print:text-muted-foreground print:mb-1">
                {copy.shippingDetails}
              </p>
              <div className="print:space-y-1">
                <p className="print:break-all print:text-sm print:text-muted-foreground">
                  {[
                    order?.address.governorate,
                    order?.address.city,
                    order?.address.street,
                  ]
                    .filter(Boolean)
                    .join(", ") ?? "—"}
                </p>
                {order?.address.notes && (
                  <p className="print:break-all print:text-sm print:text-muted-foreground print:mt-1">
                    <span className="print:font-semibold">
                      {t("checkout.notes")}:
                    </span>
                    {order?.address.notes}
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="print:mb-6">
              <h2 className="print:flex print:items-center print:gap-2 print:text-base print:font-black print:text-foreground print:sm:text-lg print:mb-4">
                <Package className="print:h-5 print:w-5 print:text-brand" />
                <span>{t("confirm.products", { count: order?.lines.length ?? 0 })}</span>
              </h2>
              <div className="print:overflow-hidden print:rounded-2xl print:border print:border-border">
                <div className="print:grid print:grid-cols-[minmax(0,1fr)_72px_110px_110px_110px] print:gap-4 print:bg-muted/60 print:px-4 print:py-3 print:text-xs print:font-bold print:text-muted-foreground">
                  <span>{copy.product}</span>
                  <span className="print:text-center">{copy.quantity}</span>
                  <span className="print:text-end">{copy.unitPrice}</span>
                  <span className="print:text-end">{copy.lineTotal}</span>
                </div>
                <div className="print:divide-y print:divide-border">
                  {order?.lines.map((line, index) => {
                    const options = Object.values(line.options ?? {})
                      .filter(Boolean)
                      .map(String)
                      .join(" • ");

                    return (
                      <div
                        key={`${line.name}-${index}`}
                        className="print:invoice-line print:grid print:grid-cols-[minmax(0,1fr)_72px_110px_110px_110px] print:items-center print:gap-4 print:px-4 print:py-4"
                      >
                        <div className="print:flex print:min-w-0 print:items-center print:gap-3">
                          <img
                            src={line.image}
                            alt={L(line.name)}
                            className="print:h-14 print:w-14 print:shrink-0 print:rounded-xl print:border print:border-border print:bg-muted print:object-cover"
                          />
                          <div className="print:min-w-0">
                            <h3 className="print:truncate print:text-sm print:font-bold print:text-foreground">
                              {L(line.name)}
                            </h3>
                            {options && (
                              <p className="print:mt-1 print:truncate print:text-xs print:text-muted-foreground">
                                {options}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="print:text-center print:text-sm print:font-bold print:text-foreground">
                          {line.quantity}
                        </span>
                        <span className="print:text-end print:text-sm print:font-semibold print:text-muted-foreground">
                          {price(line.unitPrice)}
                        </span>
                        <span className="print:text-end print:text-sm print:font-black print:text-foreground">
                          {price(line.unitPrice * line.quantity)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="print:mb-6 print:space-y-3 print:text-sm">
              <div className="print:flex print:items-center print:justify-between print:gap-4 print:text-muted-foreground">
                <span>{t("confirm.subtotal")}</span>
                <span className="print:font-bold print:text-foreground">
                  {price(order?.subtotal ?? 0)}
                </span>
              </div>
              <div className="print:flex print:items-center print:justify-between print:gap-4 print:text-muted-foreground">
                <span>{t("confirm.shipping")}</span>
                <span
                  className={cn(
                    "print:font-bold",
                    order?.shipping === 0 ? "print:text-success" : "print:text-foreground",
                  )}
                >
                  {order?.shipping === 0
                    ? t("confirm.freeShipping")
                    : price(order?.shipping ?? 0)}
                </span>
              </div>
              <div className="print:mt-4 print:flex print:items-end print:justify-between print:gap-4 print:border-t print:border-border print:pt-4">
                <span className="print:text-base print:font-black print:text-foreground">
                  {t("confirm.total")}
                </span>
                <span className="print:text-2xl print:font-black print:tracking-tight print:text-brand">
                  {price(order?.total ?? 0)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="print:mt-8 print:flex print:flex-col print:gap-2 print:border-t print:border-dashed print:border-border print:pt-5 print:text-center">
              <p className="print:text-sm print:font-bold print:text-foreground">
                {copy.thankYou}
              </p>
              <p className="print:text-xs print:text-muted-foreground">
                {copy.invoiceNote}
              </p>
              <p className="print:mt-1 print:inline-flex print:items-center print:justify-center print:gap-1.5 print:text-[11px] print:font-semibold print:text-success">
                <ShieldCheck className="print:h-3.5 print:w-3.5" />
                {copy.secureOrder}
              </p>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          html,
          body {
            background: #ffffff !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          #invoice-print-area,
          #invoice-print-area * {
            visibility: visible !important;
          }

          #invoice-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }

          #invoice-print-area .invoice-desktop-table {
            display: block !important;
          }

          #invoice-print-area .invoice-mobile-list,
          #invoice-print-area .print-hide {
            display: none !important;
          }

          #invoice-print-area .invoice-line,
          #invoice-print-area .invoice-summary,
          #invoice-print-area img {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[440px] bg-gradient-to-b from-brand/10 via-brand/5 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -start-24 top-20 h-72 w-72 rounded-full bg-brand/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -end-24 top-52 h-64 w-64 rounded-full bg-success/10 blur-3xl"
      />

      <div className="container-page relative z-10 mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:py-16">
        <section className="print-hide mb-6 overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 px-5 py-8 text-center shadow-[0_20px_70px_-35px_rgba(0,0,0,0.25)] backdrop-blur sm:mb-8 sm:px-10 sm:py-10">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-success/10 ring-8 ring-success/5 sm:h-24 sm:w-24">
            <CheckCircle2 className="h-10 w-10 text-success sm:h-12 sm:w-12" />
          </div>

          <div className="mx-auto max-w-2xl space-y-3">
            <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-success/20 bg-success/10 px-3 py-1.5 text-xs font-bold text-success sm:text-sm">
              <ShieldCheck className="h-4 w-4" />
              <span>{copy.orderReceived}</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-4xl">
              {t("confirm.title")}
            </h1>
            <p className="text-sm leading-7 text-muted-foreground sm:text-lg">
              {t("confirm.text")}
            </p>
          </div>

          {order && (
            <div className="mx-auto mt-7 grid max-w-2xl grid-cols-1 gap-3 text-start sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <Hash className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("confirm.orderNumber")}
                  </p>
                  <p
                    dir="ltr"
                    className="mt-0.5 truncate text-start font-mono text-base font-black text-foreground"
                  >
                    #{order.number}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("confirm.orderDate")}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                    {dateTime(order.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>

        {!isHydrated ? (
          <div className="rounded-[2rem] border border-border bg-card p-8 text-center shadow-sm">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-2xl bg-muted" />
            <p className="mt-4 text-sm font-semibold text-muted-foreground">
              {copy.loading}
            </p>
          </div>
        ) : order ? (
          <article
            id="invoice-print-area"
            aria-label={copy.invoice}
            className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-[0_24px_80px_-40px_rgba(0,0,0,0.28)]"
          >
            <header className="border-b border-border bg-muted/30 px-5 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-sm">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-foreground">
                      {copy.storeName}
                    </p>
                    <p className="text-xs font-medium text-muted-foreground">
                      {copy.thankYou}
                    </p>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 sm:flex-col sm:text-end">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {copy.invoice}
                    </p>
                    <p
                      dir="ltr"
                      className="mt-1 font-mono text-lg font-black text-foreground"
                    >
                      INV-{order.number}
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-bold text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {copy.orderReceived}
                  </span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 border-t border-border pt-5 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("confirm.orderNumber")}
                  </p>
                  <p dir="ltr" className="mt-1 text-start font-mono font-bold text-foreground">
                    #{order.number}
                  </p>
                </div>
                <div className="sm:text-end">
                  <p className="text-xs font-semibold text-muted-foreground">
                    {t("confirm.orderDate")}
                  </p>
                  <p className="mt-1 font-bold text-foreground">
                    {dateTime(order.createdAt)}
                  </p>
                </div>
              </div>
            </header>

            <div className="px-5 py-6 sm:px-8 sm:py-8">
              <section aria-labelledby="invoice-products-title">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <h2
                    id="invoice-products-title"
                    className="flex items-center gap-2 text-base font-black text-foreground sm:text-lg"
                  >
                    <Package className="h-5 w-5 text-brand" />
                    <span>{t("confirm.products", { count: order.lines.length })}</span>
                  </h2>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground">
                    {order.lines.reduce((sum, line) => sum + line.quantity, 0)} {copy.quantity}
                  </span>
                </div>

                {/* جدول سطح المكتب والطباعة */}
                <div className="invoice-desktop-table hidden overflow-hidden rounded-2xl border border-border sm:block">
                  <div className="grid grid-cols-[minmax(0,1fr)_72px_110px_110px] gap-4 bg-muted/60 px-4 py-3 text-xs font-bold text-muted-foreground">
                    <span>{copy.product}</span>
                    <span className="text-center">{copy.quantity}</span>
                    <span className="text-end">{copy.unitPrice}</span>
                    <span className="text-end">{copy.lineTotal}</span>
                  </div>

                  <div className="divide-y divide-border">
                    {order.lines.map((line, index) => {
                      const options = Object.values(line.options ?? {})
                        .filter(Boolean)
                        .map(String)
                        .join(" • ");

                      return (
                        <div
                          key={`${line.name}-${index}`}
                          className="invoice-line grid grid-cols-[minmax(0,1fr)_72px_110px_110px] items-center gap-4 px-4 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <img
                              src={line.image}
                              alt={L(line.name)}
                              className="h-14 w-14 shrink-0 rounded-xl border border-border bg-muted object-cover"
                            />
                            <div className="min-w-0">
                              <h3 className="truncate text-sm font-bold text-foreground">
                                {L(line.name)}
                              </h3>
                              {options && (
                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                  {options}
                                </p>
                              )}
                            </div>
                          </div>
                          <span className="text-center text-sm font-bold text-foreground">
                            {line.quantity}
                          </span>
                          <span className="text-end text-sm font-semibold text-muted-foreground">
                            {price(line.unitPrice)}
                          </span>
                          <span className="text-end text-sm font-black text-foreground">
                            {price(line.unitPrice * line.quantity)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* بطاقات مناسبة لشاشات الهاتف */}
                <div className="invoice-mobile-list space-y-3 sm:hidden">
                  {order.lines.map((line, index) => {
                    const options = Object.values(line.options ?? {})
                      .filter(Boolean)
                      .map(String)
                      .join(" • ");

                    return (
                      <div
                        key={`${line.name}-mobile-${index}`}
                        className="rounded-2xl border border-border p-4"
                      >
                        <div className="flex gap-3">
                          <img
                            src={line.image}
                            alt={L(line.name)}
                            className="h-16 w-16 shrink-0 rounded-xl border border-border bg-muted object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="line-clamp-2 text-sm font-bold leading-6 text-foreground">
                                {L(line.name)}
                              </h3>
                              <span className="shrink-0 rounded-lg bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">
                                × {line.quantity}
                              </span>
                            </div>
                            {options && (
                              <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                                {options}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
                          <div>
                            <p className="text-[11px] font-semibold text-muted-foreground">
                              {copy.unitPrice}
                            </p>
                            <p className="mt-0.5 text-xs font-bold text-foreground">
                              {price(line.unitPrice)}
                            </p>
                          </div>
                          <div className="text-end">
                            <p className="text-[11px] font-semibold text-muted-foreground">
                              {copy.lineTotal}
                            </p>
                            <p className="mt-0.5 text-base font-black text-brand">
                              {price(line.unitPrice * line.quantity)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  <section className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <CreditCard className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-sm font-black text-foreground">
                          {copy.paymentDetails}
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-muted-foreground">
                          {order.paymentMethod === "cod"
                            ? t("payment.cod")
                            : t("payment.card")}
                        </p>
                        {order.paymentMethod === "cod" && (
                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            {t("confirm.codNote")}
                          </p>
                        )}
                      </div>
                    </div>
                  </section>

                  <section className="rounded-2xl border border-border bg-muted/20 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Truck className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-sm font-black text-foreground">
                          {copy.shippingDetails}
                        </h2>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {copy.shippingNote}
                        </p>
                      </div>
                    </div>
                  </section>
                </div>

                <section className="invoice-summary h-fit rounded-2xl border border-border bg-muted/30 p-5 sm:p-6">
                  <div className="mb-5 flex items-center gap-2">
                    <ReceiptText className="h-5 w-5 text-brand" />
                    <h2 className="text-base font-black text-foreground">
                      {t("confirm.costSummary")}
                    </h2>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span>{t("confirm.subtotal")}</span>
                      <span className="font-bold text-foreground">
                        {price(order.subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4 text-muted-foreground">
                      <span>{t("confirm.shipping")}</span>
                      <span
                        className={cn(
                          "font-bold",
                          order.shipping === 0 ? "text-success" : "text-foreground",
                        )}
                      >
                        {order.shipping === 0
                          ? t("confirm.freeShipping")
                          : price(order.shipping)}
                      </span>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4 border-t border-border pt-4">
                      <span className="text-base font-black text-foreground">
                        {t("confirm.total")}
                      </span>
                      <span className="text-2xl font-black tracking-tight text-brand">
                        {price(order.total)}
                      </span>
                    </div>
                  </div>
                </section>
              </div>

              <footer className="mt-8 flex flex-col gap-2 border-t border-dashed border-border pt-5 text-center">
                <p className="text-sm font-bold text-foreground">{copy.thankYou}</p>
                <p className="text-xs text-muted-foreground">{copy.invoiceNote}</p>
                <p className="mt-1 inline-flex items-center justify-center gap-1.5 text-[11px] font-semibold text-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {copy.secureOrder}
                </p>
              </footer>
            </div>
          </article>
        ) : (
          <section className="rounded-[2rem] border border-border bg-card p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
              <CircleAlert className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-xl font-black text-foreground">
              {copy.noOrder}
            </h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-7 text-muted-foreground">
              {copy.noOrderHint}
            </p>
          </section>
        )}

        <nav
          aria-label="Order confirmation actions"
          className="print-hide mt-6 grid grid-cols-1 gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:items-center sm:justify-center"
        >
          {order && (
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background shadow-lg shadow-foreground/10 transition duration-200 hover:-translate-y-0.5 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto"
            >
              <Printer className="h-5 w-5" />
              <span>{copy.printInvoice}</span>
            </button>
          )}

          {order?.userId && (
            <Link
              to={href("/account/orders")}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-bold text-foreground transition duration-200 hover:-translate-y-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto"
            >
              <Package className="h-5 w-5" />
              <span>{t("confirm.trackOrder")}</span>
            </Link>
          )}

          <Link
            to={href("/")}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-brand/20 bg-brand/10 px-6 py-3 text-sm font-bold text-brand transition duration-200 hover:-translate-y-0.5 hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:w-auto"
          >
            <span>{t("confirm.backToStore")}</span>
            {dir === "rtl" ? (
              <ChevronLeft className="h-5 w-5" />
            ) : (
              <ChevronRight className="h-5 w-5" />
            )}
          </Link>
        </nav>
      </div>
    </main>
  );
}
