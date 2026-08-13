import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Boxes, Save, RefreshCw } from "lucide-react";
import {
  getLowStockItems,
  updateStock,
  type InventoryItem,
} from "@/lib/services/firebase/inventoryService";
import { adminListProducts } from "@/lib/services/firebase/productService";

export const Route = createFileRoute("/admin/inventory/")({
  component: AdminInventoryPage,
});

function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const lowStock = await getLowStockItems();
    // Fetch products to build full inventory list
    const { products } = await adminListProducts({ limit_: 200 });

    const fullInventory: InventoryItem[] = [];
    products.forEach((p) => {
      const threshold = p.lowStockThreshold || 5;
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v) => {
          const status =
            v.stock <= 0 ? "out_of_stock" : v.stock <= threshold ? "low_stock" : "in_stock";
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
          p.stock <= 0 ? "out_of_stock" : p.stock <= threshold ? "low_stock" : "in_stock";
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

  const handleStockChange = async (item: InventoryItem, newStock: number) => {
    setUpdatingId(item.id);
    await updateStock(item.productId, item.variantId, newStock);
    const threshold = item.lowStockThreshold;
    const newStatus =
      newStock <= 0 ? "out_of_stock" : newStock <= threshold ? "low_stock" : "in_stock";

    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, stock: newStock, status: newStatus } : i)),
    );
    setUpdatingId(null);
  };

  const lowStockCount = items.filter((i) => i.status !== "in_stock").length;

  return (
    <div className="space-y-6 text-foreground dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">
            إدارة المخزون والتنبيهات ({items.length})
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            متابعة الكميات المتاحة وتحديد حدود إعادة التخزين
          </p>
        </div>

        {lowStockCount > 0 && (
          <div className="rounded-xl bg-warning/15 border border-warning/30 px-3.5 py-1.5 text-xs font-bold text-warning-foreground">
            {lowStockCount} منتجات تحتاج إلى إعادة التخزين
          </div>
        )}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-muted-foreground">جاري تحميل المخزون...</div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-right text-xs text-foreground border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
              <tr>
                <th className="py-3.5 px-4">المنتج</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">المتغير</th>
                <th className="py-3.5 px-4">المخزون الحالي</th>
                <th className="py-3.5 px-4">حد التنبيه</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-left">تحديث سريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-3 px-4 font-bold">{item.productNameAr}</td>
                  <td className="py-3 px-4 font-mono text-muted-foreground">{item.sku}</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.variantTitleAr || "—"}</td>
                  <td className="py-3 px-4 font-bold">{item.stock} قطعة</td>
                  <td className="py-3 px-4 text-muted-foreground">{item.lowStockThreshold} قطعة</td>

                  <td className="py-3 px-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.status === "in_stock"
                          ? "bg-success/15 text-success"
                          : item.status === "low_stock"
                            ? "bg-warning/15 text-warning-foreground"
                            : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {item.status === "in_stock"
                        ? "متوفر"
                        : item.status === "low_stock"
                          ? "مخزون منخفض"
                          : "نفد المخزون"}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center justify-end space-x-2 space-x-reverse">
                      <input
                        type="number"
                        min={0}
                        defaultValue={item.stock}
                        onBlur={(e) => {
                          const val = Number(e.target.value);
                          if (val !== item.stock) handleStockChange(item, val);
                        }}
                        className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-xs text-center"
                      />
                      {updatingId === item.id && (
                        <RefreshCw className="h-4 w-4 animate-spin text-brand" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
