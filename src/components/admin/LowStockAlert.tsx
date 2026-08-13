import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { InventoryItem } from "@/lib/services/firebase/inventoryService";

interface LowStockAlertProps {
  items: InventoryItem[];
}

export function LowStockAlert({ items }: LowStockAlertProps) {
  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-warning-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning/20 text-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              تنبيه المخزون ({items.length} منتجات تحتاج إعادة التخزين)
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              توجد منتجات وصلت للحد الأدنى من المخزون أو نفدت بالكامل.
            </p>
          </div>
        </div>

        <Link
          to="/admin/inventory"
          className="hidden sm:flex items-center space-x-1 space-x-reverse rounded-lg bg-card px-3 py-1.5 text-xs font-bold text-foreground border border-border hover:bg-accent transition-colors"
        >
          <span>إدارة المخزون</span>
          <ArrowLeft className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.slice(0, 6).map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-lg bg-card/80 p-2.5 text-xs border border-border/50"
          >
            <div className="truncate pr-2">
              <span className="font-semibold text-foreground block truncate">
                {item.productNameAr}
              </span>
              <span className="text-[11px] text-muted-foreground font-mono">{item.sku}</span>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                item.status === "out_of_stock"
                  ? "bg-destructive/15 text-destructive"
                  : "bg-warning/15 text-warning-foreground"
              }`}
            >
              {item.status === "out_of_stock" ? "نفد" : `${item.stock} متبقي`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
