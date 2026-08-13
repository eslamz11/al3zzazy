import { normalizeOptionValue } from "@/lib/services/catalog";
import { useLocalized, useT } from "@/lib/locale";
import type { Product, ProductVariant, VariantOptionValues } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductOptions({
  product,
  selection,
  onChange,
  compact = false,
}: {
  product: Product;
  selection: VariantOptionValues;
  onChange: (next: VariantOptionValues) => void;
  compact?: boolean;
}) {
  const L = useLocalized();
  const t = useT();

  const variantMatches = (variant: ProductVariant, sel: VariantOptionValues) =>
    Object.entries(sel).every(
      ([k, v]) => normalizeOptionValue(variant.options[k]) === normalizeOptionValue(v),
    );

  // A value is available if an in-stock variant exists for it, enforcing only the
  // options that come *before* this one so each option reflects its own real stock
  // instead of demanding the full current combination exist.
  const isValueAvailable = (optionIndex: number, key: string, value: string) => {
    const locked: VariantOptionValues = {};
    for (let i = 0; i < optionIndex; i++) {
      const k = product.options[i]!.key;
      if (selection[k] != null && selection[k] !== "") locked[k] = selection[k];
    }
    return product.variants.some(
      (v) => v.available && v.stock > 0 && variantMatches(v, { ...locked, [key]: value }),
    );
  };

  // Resolve a real available variant for the chosen value and adopt its full option
  // set, so dependent options (and price/stock) stay consistent after each change.
  const handleSelect = (key: string, value: string) => {
    const withValue = { ...selection, [key]: value };
    let match = product.variants.find((v) => v.available && variantMatches(v, withValue));
    if (!match) {
      match = product.variants.find(
        (v) => v.available && normalizeOptionValue(v.options[key]) === normalizeOptionValue(value),
      );
    }
    onChange(match ? { ...match.options } : withValue);
  };

  return (
    <div className={cn("space-y-4", compact && "space-y-3")}>
      {product.options.map((option, optionIndex) => (
        <fieldset key={option.key}>
          <legend className="mb-2 text-sm font-bold text-gray-800 flex justify-between w-full">
            <span>{L(option.label)}:</span>
          </legend>
          {["length", "width", "height", "size", "الطول", "العرض", "الارتفاع", "المقاس"].includes(
            option.key.toLowerCase(),
          ) || ["الطول", "العرض", "الارتفاع", "المقاس"].includes(L(option.label)) ? (
            <div className="relative">
              <select
                value={selection[option.key] || ""}
                onChange={(e) => handleSelect(option.key, e.target.value)}
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition-colors focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand hover:border-gray-300 pl-10"
              >
                {option.values.map((value) => {
                  const available = isValueAvailable(optionIndex, option.key, value.value);
                  return (
                    <option key={value.value} value={value.value} disabled={!available}>
                       {L(value.label)} {available ? "" : t("product.unavailableOption")}
                    </option>
                  );
                })}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-4 text-gray-500">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {option.values.map((value) => {
                const selected = selection[option.key] === value.value;
                const available = isValueAvailable(optionIndex, option.key, value.value);
                return (
                  <button
                    key={value.value}
                    type="button"
                    onClick={() => handleSelect(option.key, value.value)}
                    aria-pressed={selected}
                    className={cn(
                      "min-h-12 rounded-xl border px-5 text-sm font-bold transition-all",
                      compact && "min-h-10 px-3 text-xs",
                      selected
                        ? "border-black bg-black text-white shadow-md"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                      !available && "opacity-40 cursor-not-allowed",
                    )}
                  >
                    {L(value.label)}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>
      ))}
    </div>
  );
}
