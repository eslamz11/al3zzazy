import { useState } from "react";
import { Plus, Trash2, Edit2, Check } from "lucide-react";
import type { ProductVariant } from "@/lib/types";

interface VariantEditorProps {
  variants: ProductVariant[];
  basePrice: number;
  skuPrefix: string;
  onChange: (variants: ProductVariant[]) => void;
}

export const CLOTHING_SIZES = [
  "حديثي ولادة",
  "0-3 شهور",
  "3-6 شهور",
  "6-9 شهور",
  "9-12 شهر",
  "1 سنة",
  "2 سنة",
  "3 سنة",
  "4 سنة",
  "5 سنة",
  "6 سنة",
  "7 سنة",
  "8 سنة",
  "9 سنة",
  "10 سنة",
  "11 سنة",
  "12 سنة",
  "13 سنة",
  "14 سنة",
];

export function VariantEditor({ variants, basePrice, skuPrefix, onChange }: VariantEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddCustomVariant = () => {
    const prefix = (skuPrefix || "AZZ-VAR").toUpperCase();
    const newVar: ProductVariant = {
      id: `var-${Date.now()}`,
      sku: `${prefix}-${Date.now().toString().slice(-4)}`,
      options: { size: "2 سنة", color: "أزرق" },
      price: basePrice || 250,
      compareAtPrice: basePrice ? Math.round(basePrice * 1.2) : 300,
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

  const handleUpdateOption = (id: string, key: string, value: string) => {
    const updated = variants.map((v) => {
      if (v.id !== id) return v;
      const options = { ...v.options, [key]: value };
      if (!value) delete options[key];
      return { ...v, options };
    });
    onChange(updated);
  };

  const handleDeleteVariant = (id: string) => {
    onChange(variants.filter((v) => v.id !== id));
  };

  return (
    <div className="space-y-4 dir-rtl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div>
          <h4 className="text-xs font-bold text-foreground">متغيرات المنتج / المقاسات والألوان ({variants.length})</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            قم بإضافة المقاسات والألوان المتاحة لهذا المنتج مع ضبط السعر والمخزون لكل متغير
          </p>
        </div>

        <div className="flex items-center space-x-2 space-x-reverse">
          <button
            type="button"
            onClick={handleAddCustomVariant}
            className="inline-flex items-center space-x-1.5 space-x-reverse rounded-lg border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-800 hover:bg-sky-100 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>إضافة مقاس/لون</span>
          </button>
        </div>
      </div>

      {variants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-sky-200 p-6 text-center text-xs text-muted-foreground">
          لا توجد مقاسات أو ألوان مضافة حالياً. انقر فوق "إضافة مقاس/لون" لإضافة المتغيرات.
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
          {variants.map((v) => {
            const isEditing = editingId === v.id;
            const sizeVal = v.options["size"] || "";
            const colorVal = v.options["color"] || "";

            return (
              <div
                key={v.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3 text-xs transition-colors"
              >
                <div className="flex items-center space-x-3 space-x-reverse flex-1 min-w-[200px]">
                  <div className="font-bold text-foreground">
                    <span>
                      {sizeVal ? `المقاس: ${sizeVal}` : ""} {colorVal ? `| اللون: ${colorVal}` : ""}
                      {!sizeVal && !colorVal ? "متغير جديد" : ""}
                    </span>
                    <span className="block text-[11px] font-mono font-normal text-muted-foreground mt-0.5">
                      SKU: {v.sku}
                    </span>
                  </div>
                </div>

                {isEditing ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={sizeVal}
                      onChange={(e) => handleUpdateOption(v.id, "size", e.target.value)}
                      className="rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    >
                      <option value="">-- اختر المقاس --</option>
                      {CLOTHING_SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      value={colorVal}
                      onChange={(e) => handleUpdateOption(v.id, "color", e.target.value)}
                      placeholder="اللون (مثال: أزرق)"
                      className="w-28 rounded-lg border border-input bg-background px-2 py-1 text-xs"
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
                      className="w-20 rounded-lg border border-input bg-background px-2 py-1 text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                      title="تم"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="font-bold text-sky-700">{v.price} ج.م</span>
                    <span className="text-muted-foreground font-mono">الكمية: {v.stock}</span>
                    <button
                      type="button"
                      onClick={() => setEditingId(v.id)}
                      className="p-1 text-muted-foreground hover:text-foreground"
                      title="تعديل"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVariant(v.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                      title="حذف"
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
