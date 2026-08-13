import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Edit, Trash2, Copy, Eye, Star, CheckCircle, XCircle } from "lucide-react";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/lib/locale";
import type { Product } from "@/lib/types";

interface ProductTableProps {
  products: Product[];
  onToggleActive?: (id: string, active: boolean) => void;
  onToggleFeatured?: (id: string, featured: boolean) => void;
  onDuplicate?: (product: Product) => void;
  onDelete?: (product: Product) => void;
}

export function ProductTable({
  products,
  onToggleActive,
  onToggleFeatured,
  onDuplicate,
  onDelete,
}: ProductTableProps) {
  const locale = useLocale();

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        لا توجد منتجات مطابقة لنتائج البحث.
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Desktop Table view (Hidden on small mobile screens) */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
        <table className="w-full text-right text-xs text-foreground border-collapse">
          <thead className="bg-muted/50 text-muted-foreground font-bold border-b border-border">
            <tr>
              <th className="py-3.5 px-4">صورة</th>
              <th className="py-3.5 px-4">المنتج</th>
              <th className="py-3.5 px-4">الفئة</th>
              <th className="py-3.5 px-4">السعر</th>
              <th className="py-3.5 px-4">المخزون</th>
              <th className="py-3.5 px-4">الحالة</th>
              <th className="py-3.5 px-4">التاريخ</th>
              <th className="py-3.5 px-4 text-left">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => {
              const primaryImg = p.images[0]?.src || "https://placehold.co/100x100?text=No+Image";
              return (
                <tr key={p.id} className="hover:bg-accent/40 transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={primaryImg}
                      alt={p.name.ar}
                      className="h-10 w-10 rounded-lg object-cover border border-border bg-muted"
                    />
                  </td>

                  <td className="py-3 px-4 font-bold">
                    <Link
                      to={`/admin/products/$id`}
                      params={{ id: p.id }}
                      className="hover:text-brand transition-colors"
                    >
                      {p.name.ar}
                    </Link>
                    <span className="block text-[11px] text-muted-foreground font-mono font-normal mt-0.5">
                      SKU: {p.sku}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-muted-foreground font-medium">{p.category}</td>

                  <td className="py-3 px-4 font-bold">
                    {formatPrice(p.price, locale)}
                    {p.compareAtPrice && (
                      <span className="block text-[10px] text-muted-foreground line-through font-normal">
                        {formatPrice(p.compareAtPrice, locale)}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.stock <= 0
                          ? "bg-destructive/15 text-destructive"
                          : p.stock <= (p.lowStockThreshold || 5)
                            ? "bg-warning/15 text-warning-foreground"
                            : "bg-success/15 text-success"
                      }`}
                    >
                      {p.stock <= 0 ? "نفد المخزون" : `${p.stock} قطعة`}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onToggleActive?.(p.id, !(p.active !== false))}
                      className={`inline-flex items-center space-x-1 space-x-reverse rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors min-h-[32px] ${
                        p.active !== false
                          ? "bg-success/15 text-success hover:bg-success/25"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {p.active !== false ? (
                        <CheckCircle className="h-3 w-3" />
                      ) : (
                        <XCircle className="h-3 w-3" />
                      )}
                      <span>{p.active !== false ? "نشط" : "معطل"}</span>
                    </button>
                  </td>

                  <td className="py-3 px-4 text-muted-foreground text-[11px]">
                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("ar-EG") : "—"}
                  </td>

                  <td className="py-3 px-4 text-left">
                    <div className="flex items-center justify-end space-x-1 space-x-reverse">
                      <button
                        type="button"
                        onClick={() => onToggleFeatured?.(p.id, !p.featured)}
                        title={p.featured ? "إزالة من المميزة" : "تمييز المنتج"}
                        className={`rounded-lg p-2 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${
                          p.featured
                            ? "text-warning hover:bg-warning/10"
                            : "text-muted-foreground hover:bg-accent"
                        }`}
                      >
                        <Star className={`h-4 w-4 ${p.featured ? "fill-warning" : ""}`} />
                      </button>

                      <Link
                        to={`/admin/products/$id`}
                        params={{ id: p.id }}
                        title="تعديل المنتج"
                        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        onClick={() => onDuplicate?.(p)}
                        title="تكرار المنتج"
                        className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Copy className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete?.(p)}
                        title="حذف المنتج"
                        className="rounded-lg p-2 text-destructive hover:bg-destructive/10 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card view (Shown on small screens) */}
      <div className="grid gap-3 md:hidden">
        {products.map((p) => {
          const primaryImg = p.images[0]?.src || "https://placehold.co/100x100?text=No+Image";
          return (
            <div
              key={p.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-xs space-y-3"
            >
              <div className="flex space-x-3 space-x-reverse">
                <img
                  src={primaryImg}
                  alt={p.name.ar}
                  className="h-16 w-16 rounded-xl object-cover border border-border bg-muted shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">{p.category}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        p.active !== false
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {p.active !== false ? "نشط" : "معطل"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-foreground truncate mt-0.5">{p.name.ar}</h3>
                  <p className="text-[11px] text-muted-foreground font-mono">SKU: {p.sku}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs">
                <div>
                  <span className="font-bold text-foreground">{formatPrice(p.price, locale)}</span>
                  <span className="text-[11px] text-muted-foreground block font-semibold">
                    المخزون: {p.stock}
                  </span>
                </div>

                <div className="flex items-center space-x-2 space-x-reverse">
                  <Link
                    to={`/admin/products/$id`}
                    params={{ id: p.id }}
                    className="rounded-lg border border-input bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent min-h-[44px] flex items-center"
                  >
                    تعديل
                  </Link>

                  <button
                    type="button"
                    onClick={() => onDelete?.(p)}
                    className="rounded-lg bg-destructive/10 p-2.5 text-destructive hover:bg-destructive/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
