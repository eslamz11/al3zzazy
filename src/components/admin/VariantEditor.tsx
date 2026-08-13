import { useState } from "react";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import type { ProductVariant } from "@/lib/types";

interface VariantEditorProps {
  variants: ProductVariant[];
  basePrice: number;
  skuPrefix: string;
  onChange: (variants: ProductVariant[]) => void;
}

const LENGTHS = ["190", "195", "200"];
const WIDTHS = ["90", "100", "110", "120", "130", "140", "150", "160", "170", "180", "190", "200"];
const HEIGHTS = ["23", "25", "27"];
const UPGRADES = [
  { value: "standard", label: "قياسي" },
  { value: "memory", label: "ترقية ميموري فوم" },
];

export function VariantEditor({ variants, basePrice, skuPrefix, onChange }: VariantEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCustomVariant = () => {
    const prefix = (skuPrefix || "SH-VAR").toUpperCase();
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      sku: `${prefix}-${Date.now().toString().slice(-4)}`,
      options: { length: "190", width: "120", height: "23" },
      price: basePrice || 1000,
      compareAtPrice: basePrice ? Math.round(basePrice * 1.15) : 1150,
      stock: 10,
      available: true,
    };
    onChange([...variants, newVar]);
    setEditingId(newVar.id);
  };

  const handleUpdateVariant = (id: string, updates: Partial<ProductVariant>) => {
    const updated = variants.map((v) => (v.id === id ? { ...v, ...updates } : v));
    onChange(updated);
  };

  const handleDeleteVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-4 dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h4 className="text-xs font-bold text-foreground">متغيرات المنتج ({variants.length})</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            قم بإنشاء مقاسات وارتفاعات وأسعار ومخزون لكل متغير
          </p>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={handleAddCustomVariant}
            className="inline-flex items-center space-x-1.5 space-x-reverse rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة متغير</span>
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
          لا توجد متغيرات حالية. يمكنك إضافة متغير جديد.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {variants.map((v) => {
            const isEditing = editingId === v.id;
            const optionsStr = Object.entries(v.options)
              .map(([k, val]) => `${k}: ${val}`)
              .join(" | ");

            return (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-xs transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-[200px]">
                  <div className="font-bold text-foreground">
                    <span>{optionsStr || "متغير بدون اسم"}</span>
                    <span className="block text-[11px] font-mono font-normal text-muted-foreground mt-0.5">
                      SKU: {v.sku}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      value={v.sku}
                      onChange={(e) => handleUpdateVariant(v.id, { sku: e.target.value })}
                      placeholder="SKU"
                      className="w-24 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    />

                    <input
                      type="number"
                      value={v.price}
                      onChange={(e) => handleUpdateVariant(v.id, { price: Number(e.target.value) })}
                      placeholder="السعر"
                      className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    />

                    <input
                      type="number"
                      value={v.stock}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, {
                          stock: Number(e.target.value),
                          available: Number(e.target.value) > 0,
                        })
                      }
                      placeholder="المخزون"
                      className="w-16 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    />

                    <div className="flex gap-1 items-center bg-muted/30 p-1 rounded-lg">
                      <input
                        type="text"
                        value={v.options["length"] || ""}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, {
                            options: { ...v.options, length: e.target.value },
                          })
                        }
                        placeholder="الطول"
                        className="w-14 rounded border border-input bg-background px-1.5 py-1 text-xs text-center"
                        title="الطول"
                      />
                      <span className="text-muted-foreground text-[10px]">x</span>
                      <input
                        type="text"
                        value={v.options["width"] || ""}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, {
                            options: { ...v.options, width: e.target.value },
                          })
                        }
                        placeholder="العرض"
                        className="w-14 rounded border border-input bg-background px-1.5 py-1 text-xs text-center"
                        title="العرض"
                      />
                      <span className="text-muted-foreground text-[10px]">x</span>
                      <input
                        type="text"
                        value={v.options["height"] || ""}
                        onChange={(e) =>
                          handleUpdateVariant(v.id, {
                            options: { ...v.options, height: e.target.value },
                          })
                        }
                        placeholder="الارتفاع"
                        className="w-14 rounded border border-input bg-background px-1.5 py-1 text-xs text-center"
                        title="الارتفاع"
                      />
                    </div>

                    <input
                      type="text"
                      value={v.options["size"] || ""}
                      onChange={(e) =>
                        handleUpdateVariant(v.id, {
                          options: { ...v.options, size: e.target.value },
                        })
                      }
                      placeholder="المقاس العام"
                      className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg bg-brand p-1 text-brand-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className="text-right">
                      <span className="font-bold text-foreground">
                        {v.price.toLocaleString("ar-EG")} ج.م
                      </span>
                      {v.compareAtPrice && (
                        <span className="block text-[11px] text-muted-foreground line-through">
                          {v.compareAtPrice.toLocaleString("ar-EG")} ج.م
                        </span>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        v.stock > 0
                          ? "bg-success/15 text-success"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      {v.stock > 0 ? `${v.stock} قطعة` : "نفد"}
                    </span>

                    <button
                      type="button"
                      onClick={() => setEditingId(v.id)}
                      className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      className="rounded-md p-1 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
