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

  // Check if option is color-related
  const isColorOption = (key: string, label: string) => {
    const lowerKey = key.toLowerCase();
    const lowerLabel = label.toLowerCase();
    return lowerKey.includes("color") || lowerKey.includes("لون") || 
           lowerLabel.includes("color") || lowerLabel.includes("لون");
  };

  // Check if option is size-related
  const isSizeOption = (key: string, label: string) => {
    const lowerKey = key.toLowerCase();
    const lowerLabel = label.toLowerCase();
    return ["length", "width", "height", "size", "الطول", "العرض", "الارتفاع", "المقاس"].includes(lowerKey) ||
           ["الطول", "العرض", "الارتفاع", "المقاس"].includes(lowerLabel) ||
           lowerKey.includes("size") || lowerKey.includes("مقاس");
  };

  return (
    <div className={cn("space-y-5", compact && "space-y-4")}>
      {product.options.map((option, optionIndex) => {
        const optionLabel = L(option.label);
        const isColor = isColorOption(option.key, optionLabel);
        const isSize = isSizeOption(option.key, optionLabel);

        return (
          <fieldset key={option.key}>
            <legend className="mb-3 text-sm font-bold text-foreground">
              {optionLabel}
            </legend>

            {/* Color Selector - Visual buttons with color indication */}
            {isColor ? (
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected = selection[option.key] === value.value;
                  const available = isValueAvailable(optionIndex, option.key, value.value);
                  return (
                    <button
                      key={value.value}
                      type="button"
                      onClick={() => available && handleSelect(option.key, value.value)}
                      disabled={!available}
                      aria-pressed={selected}
                      className={cn(
                        "group relative rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all",
                        compact && "px-3 py-2 text-xs",
                        selected
                          ? "border-brand bg-brand text-brand-foreground shadow-md"
                          : available
                          ? "border-border bg-background text-foreground hover:border-brand/50 hover:bg-brand/5"
                          : "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed line-through",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <span className={cn(
                          "h-4 w-4 rounded-full border border-border/50",
                          selected && "ring-2 ring-brand-foreground ring-offset-2"
                        )} style={{
                          backgroundColor: getColorHex(value.value, L(value.label))
                        }} />
                        {L(value.label)}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : isSize ? (
              /* Size Selector - Clean button grid */
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected = selection[option.key] === value.value;
                  const available = isValueAvailable(optionIndex, option.key, value.value);
                  return (
                    <button
                      key={value.value}
                      type="button"
                      onClick={() => available && handleSelect(option.key, value.value)}
                      disabled={!available}
                      aria-pressed={selected}
                      className={cn(
                        "min-w-[3.5rem] rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all",
                        compact && "min-w-[3rem] px-3 py-2 text-xs",
                        selected
                          ? "border-brand bg-brand text-brand-foreground shadow-md"
                          : available
                          ? "border-border bg-background text-foreground hover:border-brand/50 hover:bg-brand/5"
                          : "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed line-through",
                      )}
                    >
                      {L(value.label)}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Other Options - Default style */
              <div className="flex flex-wrap gap-2">
                {option.values.map((value) => {
                  const selected = selection[option.key] === value.value;
                  const available = isValueAvailable(optionIndex, option.key, value.value);
                  return (
                    <button
                      key={value.value}
                      type="button"
                      onClick={() => available && handleSelect(option.key, value.value)}
                      disabled={!available}
                      aria-pressed={selected}
                      className={cn(
                        "rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all",
                        compact && "px-3 py-2 text-xs",
                        selected
                          ? "border-brand bg-brand text-brand-foreground shadow-md"
                          : available
                          ? "border-border bg-background text-foreground hover:border-brand/50 hover:bg-brand/5"
                          : "border-border bg-muted text-muted-foreground opacity-50 cursor-not-allowed",
                      )}
                    >
                      {L(value.label)}
                    </button>
                  );
                })}
              </div>
            )}
          </fieldset>
        );
      })}
    </div>
  );
}

// Helper function to get color hex from color name
function getColorHex(value: string, label: string): string {
  const colorName = (value + " " + label).toLowerCase();
  
  const colorMap: Record<string, string> = {
    // Arabic colors
    "أبيض": "#FFFFFF",
    "أسود": "#000000",
    "أزرق": "#3B82F6",
    "أحمر": "#EF4444",
    "أخضر": "#10B981",
    "أصفر": "#FCD34D",
    "برتقالي": "#F97316",
    "وردي": "#EC4899",
    "بنفسجي": "#A855F7",
    "بني": "#92400E",
    "رمادي": "#6B7280",
    "بيج": "#D4B896",
    "كحلي": "#1E3A8A",
    "سماوي": "#7DD3FC",
    "زهري": "#F9A8D4",
    "نيلي": "#4F46E5",
    // English colors
    "white": "#FFFFFF",
    "black": "#000000",
    "blue": "#3B82F6",
    "red": "#EF4444",
    "green": "#10B981",
    "yellow": "#FCD34D",
    "orange": "#F97316",
    "pink": "#EC4899",
    "purple": "#A855F7",
    "brown": "#92400E",
    "gray": "#6B7280",
    "grey": "#6B7280",
    "beige": "#D4B896",
    "navy": "#1E3A8A",
    "sky": "#7DD3FC",
    "indigo": "#4F46E5",
  };

  for (const [name, hex] of Object.entries(colorMap)) {
    if (colorName.includes(name)) {
      return hex;
    }
  }

  return "#E5E7EB"; // Default gray
}
