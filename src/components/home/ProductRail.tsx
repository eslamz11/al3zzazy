import { Reveal } from "@/components/common/Reveal";
import { ProductCard } from "@/components/shop/ProductCard";
import type { Product } from "@/lib/types";

/**
 * Responsive product rail:
 * - Mobile: horizontal snap-scroll (touch friendly, no layout overflow).
 * - Desktop: staggered reveal grid.
 * Renders the shared storefront ProductCard so cards stay consistent everywhere.
 */
export function ProductRail({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <div>
      {/* Mobile: snap rail */}
      <div className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-1 scrollbar-hide md:hidden">
        {products.map((product) => (
          <div key={product.id} className="w-[62vw] max-w-[240px] shrink-0 snap-start">
            <ProductCard product={product} />
          </div>
        ))}
        <div className="w-px shrink-0" aria-hidden="true" />
      </div>

      {/* Desktop: reveal grid */}
      <div className="hidden gap-6 md:grid md:grid-cols-3 xl:grid-cols-4">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={i * 70}>
            <ProductCard product={product} priority={i < 2} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
