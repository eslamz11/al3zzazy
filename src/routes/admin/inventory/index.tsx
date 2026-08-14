import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  Boxes,
  Hash,
  Layers3,
  PackageCheck,
  PackageOpen,
  PackageX,
  RefreshCw,
  TriangleAlert,
  Warehouse,
} from "lucide-react";
import {
  getLowStockItems,
  updateStock,
  type InventoryItem,
} from "@/lib/services/firebase/inventoryService";
import { adminListProducts } from "@/lib/services/firebase/productService";

export const Route = createFileRoute("/admin/inventory/")({
  component: AdminInventoryPage,
});

function InventoryStatusBadge({ status }: { status: InventoryItem["status"] }) {
  if (status === "in_stock") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-2.5 py-1 text-[10px] font-bold text-success sm:text-[11px]">
        <PackageCheck className="h-3.5 w-3.5" />
        متوفر
      </span>
    );
  }

  if (status === "low_stock") {
    return (
      <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-warning/25 bg-warning/10 px-2.5 py-1 text-[10px] font-bold text-warning-foreground sm:text-[11px]">
        <TriangleAlert className="h-3.5 w-3.5" />
        مخزون منخفض
      </span>
    );
  }

  return (
    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-destructive/20 bg-destructive/10 px-2.5 py-1 text-[10px] font-bold text-destructive sm:text-[11px]">
      <PackageX className="h-3.5 w-3.5" />
      نفد المخزون
    </span>
  );
}

function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    await getLowStockItems();

    // Fetch products to build full inventory list
    const { products } = await adminListProducts({ limit_: 200 });

    const fullInventory: InventoryItem[] = [];
    products.forEach((p) => {
      const threshold = p.lowStockThreshold || 5;
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const status =
            v.stock <= 0
              ? "out_of_stock"
              : v.stock <= threshold
                ? "low_stock"
                : "in_stock";
          fullInventory.push({
            id: `${p.id}:${v.id}`,
            productId: p.id,
            variantId: v.id,
            productNameAr: p.name.ar,
            productNameEn: p.name.en,
            sku: v.sku,
            variantTitleAr: Object.values(v.options).join(" / "),
            stock: v.stock,
            lowStockThreshold: threshold,
            status,
          });
        });
      } else {
        const status =
          p.stock <= 0
            ? "out_of_stock"
            : p.stock <= threshold
              ? "low_stock"
              : "in_stock";
        fullInventory.push({
          id: p.id,
          productId: p.id,
          productNameAr: p.name.ar,
          productNameEn: p.name.en,
          sku: p.sku,
          stock: p.stock,
          lowStockThreshold: threshold,
          status,
        });
      }
    });

    setItems(fullInventory);
    setLoading(false);
  }

  const handleStockChange = async (
    item: InventoryItem,
    newStock: number,
  ) => {
    setUpdatingId(item.id);
    await updateStock(item.productId, item.variantId, newStock);
    const threshold = item.lowStockThreshold;
    const newStatus =
      newStock <= 0
        ? "out_of_stock"
        : newStock <= threshold
          ? "low_stock"
          : "in_stock";

    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? { ...i, stock: newStock, status: newStatus }
          : i,
      ),
    );
    setUpdatingId(null);
  };

  const lowStockCount = items.filter((i) => i.status !== "in_stock").length;
  const availableCount = items.filter((i) => i.status === "in_stock").length;
  const lowOnlyCount = items.filter((i) => i.status === "low_stock").length;
  const outOfStockCount = items.filter(
    (i) => i.status === "out_of_stock",
  ).length;

  return (
    <div className="dir-rtl space-y-5 text-foreground sm:space-y-6">
      {/* Header */}
      <section className="relative overflow-hidden rounded-3xl border border-border bg-card px-5 py-6 shadow-sm sm:px-7 sm:py-7">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-10 h-48 w-48 rounded-full bg-warning/10 blur-3xl"
        />

        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3.5 sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand text-brand-foreground shadow-lg shadow-brand/20 sm:h-14 sm:w-14">
              <Boxes className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-foreground sm:text-2xl">
                إدارة المخزون والتنبيهات
              </h1>
              <p className="mt-1 max-w-2xl text-xs leading-6 text-muted-foreground sm:text-sm">
                متابعة الكميات المتاحة وتحديد حدود إعادة التخزين
              </p>
            </div>
          </div>

          {!loading && lowStockCount > 0 && (
            <div className="flex w-fit items-center gap-2.5 rounded-2xl border border-warning/25 bg-warning/10 px-4 py-3 text-xs font-bold text-warning-foreground shadow-sm">
              <BellRing className="h-4 w-4 shrink-0" />
              <span>{lowStockCount} منتجات تحتاج إلى إعادة التخزين</span>
            </div>
          )}
        </div>
      </section>

      {/* Inventory summary */}
      {!loading && items.length > 0 && (
        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                <Warehouse className="h-5 w-5" />
              </span>
              <span className="text-2xl font-black text-foreground">
                {items.length}
              </span>
            </div>
            <p className="mt-4 text-xs font-bold text-muted-foreground sm:text-sm">
              إجمالي عناصر المخزون
            </p>
          </div>

          <div className="rounded-2xl border border-success/20 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10 text-success">
                <PackageCheck className="h-5 w-5" />
              </span>
              <span className="text-2xl font-black text-success">
                {availableCount}
              </span>
            </div>
            <p className="mt-4 text-xs font-bold text-muted-foreground sm:text-sm">
              منتجات متوفرة
            </p>
          </div>

          <div className="rounded-2xl border border-warning/20 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10 text-warning-foreground">
                <TriangleAlert className="h-5 w-5" />
              </span>
              <span className="text-2xl font-black text-warning-foreground">
                {lowOnlyCount}
              </span>
            </div>
            <p className="mt-4 text-xs font-bold text-muted-foreground sm:text-sm">
              مخزون منخفض
            </p>
          </div>

          <div className="rounded-2xl border border-destructive/20 bg-card p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <PackageX className="h-5 w-5" />
              </span>
              <span className="text-2xl font-black text-destructive">
                {outOfStockCount}
              </span>
            </div>
            <p className="mt-4 text-xs font-bold text-muted-foreground sm:text-sm">
              نفد من المخزون
            </p>
          </div>
        </section>
      )}

      {loading ? (
        /* Loading state */
        <section className="rounded-3xl border border-border bg-card px-5 py-16 text-center shadow-sm sm:py-20">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <RefreshCw className="h-7 w-7 animate-spin" />
          </div>
          <p className="mt-4 text-sm font-bold text-foreground">
            جاري تحميل المخزون...
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            يتم الآن مزامنة بيانات المنتجات والكميات
          </p>
        </section>
      ) : items.length === 0 ? (
        /* Empty state */
        <section className="rounded-3xl border border-dashed border-border bg-card px-5 py-14 text-center shadow-sm sm:px-10 sm:py-20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground ring-8 ring-muted/50">
            <PackageOpen className="h-8 w-8" />
          </div>
          <h2 className="mt-6 text-base font-black text-foreground sm:text-lg">
            لا توجد عناصر في المخزون
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-muted-foreground sm:text-sm">
            ستظهر المنتجات والكميات المتاحة هنا بعد إضافتها إلى المتجر.
          </p>
        </section>
      ) : (
        <>
          {/* Desktop inventory table */}
          <section className="hidden overflow-hidden rounded-3xl border border-border bg-card shadow-sm lg:block">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-4">
              <div className="flex items-center gap-2">
                <Boxes className="h-4 w-4 text-brand" />
                <span className="text-sm font-black text-foreground">
                  قائمة المخزون
                </span>
              </div>
              <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-black text-muted-foreground">
                {items.length} عنصر
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1020px] border-collapse text-right text-xs text-foreground">
                <thead className="border-b border-border bg-muted/50 font-bold text-muted-foreground">
                  <tr>
                    <th className="whitespace-nowrap px-5 py-4">المنتج</th>
                    <th className="whitespace-nowrap px-4 py-4">SKU</th>
                    <th className="whitespace-nowrap px-4 py-4">المتغير</th>
                    <th className="whitespace-nowrap px-4 py-4">
                      المخزون الحالي
                    </th>
                    <th className="whitespace-nowrap px-4 py-4">حد التنبيه</th>
                    <th className="whitespace-nowrap px-4 py-4">الحالة</th>
                    <th className="whitespace-nowrap px-5 py-4 text-left">
                      تحديث سريع
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {items.map((item) => (
                    <tr
                      key={item.id}
                      className="group transition-colors hover:bg-accent/40"
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-[190px] items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand ring-1 ring-brand/10 transition-transform group-hover:scale-105">
                            <Boxes className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="max-w-[210px] truncate text-sm font-black text-foreground">
                              {item.productNameAr}
                            </p>
                            {item.productNameEn && (
                              <p
                                dir="ltr"
                                className="mt-0.5 max-w-[210px] truncate text-right text-[10px] text-muted-foreground"
                              >
                                {item.productNameEn}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          dir="ltr"
                          className="inline-flex max-w-[145px] items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1.5 font-mono text-[11px] font-bold text-muted-foreground"
                          title={item.sku}
                        >
                          <Hash className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{item.sku || "—"}</span>
                        </span>
                      </td>

                      <td className="px-4 py-4 text-muted-foreground">
                        <span className="block max-w-[170px] truncate">
                          {item.variantTitleAr || "—"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <span
                          className={`text-sm font-black ${item.status === "out_of_stock"
                              ? "text-destructive"
                              : item.status === "low_stock"
                                ? "text-warning-foreground"
                                : "text-foreground"
                            }`}
                        >
                          {item.stock}
                        </span>{" "}
                        <span className="font-medium text-muted-foreground">
                          قطعة
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-4 font-semibold text-muted-foreground">
                        {item.lowStockThreshold} قطعة
                      </td>

                      <td className="whitespace-nowrap px-4 py-4">
                        <InventoryStatusBadge status={item.status} />
                      </td>

                      <td className="px-5 py-4 text-left">
                        <div className="flex min-w-[128px] items-center justify-end gap-2">
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              defaultValue={item.stock}
                              aria-label={`تحديث مخزون ${item.productNameAr}`}
                              onBlur={(e) => {
                                const val = Number(e.target.value);
                                if (val !== item.stock) {
                                  handleStockChange(item, val);
                                }
                              }}
                              className="h-10 w-24 rounded-xl border border-input bg-background px-3 pe-10 text-center text-sm font-black text-foreground outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
                            />
                            <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground">
                              قطعة
                            </span>
                          </div>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                            {updatingId === item.id && (
                              <RefreshCw className="h-4 w-4 animate-spin text-brand" />
                            )}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Mobile and tablet inventory cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:hidden">
            {items.map((item) => (
              <article
                key={`${item.id}-mobile`}
                className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="border-b border-border bg-muted/25 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand/20 to-brand/5 text-brand ring-1 ring-brand/10">
                        <Boxes className="h-6 w-6" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="line-clamp-2 text-sm font-black leading-5 text-foreground">
                          {item.productNameAr}
                        </h2>
                        {item.productNameEn && (
                          <p
                            dir="ltr"
                            className="mt-1 truncate text-right text-[10px] text-muted-foreground"
                          >
                            {item.productNameEn}
                          </p>
                        )}
                      </div>
                    </div>
                    <InventoryStatusBadge status={item.status} />
                  </div>
                </div>

                <div className="space-y-4 p-4">
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-background p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Hash className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground">
                          SKU
                        </p>
                        <p
                          dir="ltr"
                          className="mt-0.5 truncate text-right font-mono text-xs font-bold text-foreground"
                          title={item.sku}
                        >
                          {item.sku || "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-background p-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
                        <Layers3 className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold text-muted-foreground">
                          المتغير
                        </p>
                        <p className="mt-0.5 truncate text-xs font-bold text-foreground">
                          {item.variantTitleAr || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div
                      className={`rounded-2xl p-3 ${item.status === "out_of_stock"
                          ? "bg-destructive/10"
                          : item.status === "low_stock"
                            ? "bg-warning/10"
                            : "bg-success/10"
                        }`}
                    >
                      <p className="text-[10px] font-bold text-muted-foreground">
                        المخزون الحالي
                      </p>
                      <p
                        className={`mt-2 text-xl font-black ${item.status === "out_of_stock"
                            ? "text-destructive"
                            : item.status === "low_stock"
                              ? "text-warning-foreground"
                              : "text-success"
                          }`}
                      >
                        {item.stock}
                        <span className="me-1 text-[10px] font-bold text-muted-foreground">
                          قطعة
                        </span>
                      </p>
                    </div>

                    <div className="rounded-2xl bg-muted/60 p-3">
                      <p className="text-[10px] font-bold text-muted-foreground">
                        حد التنبيه
                      </p>
                      <p className="mt-2 text-xl font-black text-foreground">
                        {item.lowStockThreshold}
                        <span className="me-1 text-[10px] font-bold text-muted-foreground">
                          قطعة
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/20 p-3.5">
                    <div className="mb-2.5 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-black text-foreground">
                          تحديث سريع للمخزون
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted-foreground">
                          يتم الحفظ تلقائياً بعد مغادرة الحقل
                        </p>
                      </div>
                      {updatingId === item.id && (
                        <RefreshCw className="h-4 w-4 animate-spin text-brand" />
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="number"
                        min={0}
                        inputMode="numeric"
                        defaultValue={item.stock}
                        aria-label={`تحديث مخزون ${item.productNameAr}`}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== item.stock) {
                            handleStockChange(item, val);
                          }
                        }}
                        className="min-h-12 w-full rounded-xl border border-input bg-background px-4 pe-14 text-center text-base font-black text-foreground outline-none transition focus:border-brand/50 focus:ring-4 focus:ring-brand/10"
                      />
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                        قطعة
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </>
      )}
    </div>
  );
}
