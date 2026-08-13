import { Link } from "@tanstack/react-router";
import { X, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { useStore } from "@/lib/store";
import { useHref, useLocalized, useT, useFormatters } from "@/lib/locale";

export function CartDrawer() {
  const {
    cartOpen,
    setCartOpen,
    cartLines,
    subtotal,
    shipping,
    total,
    updateQuantity,
    removeLine,
  } = useStore();
  const href = useHref();
  const L = useLocalized();
  const t = useT();
  const { price } = useFormatters();

  if (!cartOpen) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex justify-end dir-rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs"
        onClick={() => setCartOpen(false)}
      />

      {/* Drawer Card */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-card shadow-2xl text-foreground">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
             <div className="flex items-center space-x-2 space-x-reverse font-bold text-base">
             <ShoppingBag className="h-5 w-5 text-brand" />
             <span>{t("cartDrawer.title", { count: cartLines.length })}</span>
           </div>
          <button
            onClick={() => setCartOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cartLines.length === 0 ? (
            <div className="py-20 text-center space-y-3">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground/40" />
               <p className="text-sm font-bold text-muted-foreground">{t("cartDrawer.empty")}</p>
               <button
                 onClick={() => setCartOpen(false)}
                 className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-brand-foreground"
               >
                 {t("cartDrawer.browse")}
               </button>
            </div>
          ) : (
            cartLines.map((line) => (
              <div
                key={line.id}
                className="flex space-x-3 space-x-reverse border-b border-border pb-3"
              >
                <img
                  src={line.product.images[0]?.src || ""}
                  alt={L(line.product.name)}
                  className="h-16 w-16 rounded-xl object-cover border border-border bg-muted shrink-0"
                />

                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {L(line.product.name)}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {Object.entries(line.variant.options)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" | ")}
                  </p>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center border border-border rounded-lg bg-background">
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity - 1)}
                        className="px-2 py-0.5 hover:bg-accent font-bold"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold">{line.quantity}</span>
                      <button
                        onClick={() => updateQuantity(line.id, line.quantity + 1)}
                        className="px-2 py-0.5 hover:bg-accent font-bold"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-brand">
                      {price(line.lineTotal)}
                    </span>

                    <button
                      onClick={() => removeLine(line.id)}
                      className="text-destructive hover:bg-destructive/10 p-1 rounded-md"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout CTA */}
        {cartLines.length > 0 && (
          <div className="border-t border-border p-4 space-y-3 bg-muted/20">
              <div className="flex justify-between text-xs font-bold text-foreground">
                <span>{t("cartDrawer.subtotal")}</span>
                <span className="text-brand text-sm">{price(subtotal)}</span>
              </div>

            <Link
              to={href("/checkout")}
              onClick={() => setCartOpen(false)}
              className="flex w-full items-center justify-center space-x-2 space-x-reverse rounded-xl bg-brand py-3 text-xs font-bold text-brand-foreground hover:bg-brand-hover shadow-md"
            >
               <span>{t("cartDrawer.checkout")}</span>
               <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
