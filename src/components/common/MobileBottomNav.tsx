import { Link } from "@tanstack/react-router";
import { Home, Search, LayoutGrid, User, ShoppingCart } from "lucide-react";
import { useHref, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";

export function MobileBottomNav() {
  const href = useHref();
  const t = useT();
  const { cartCount, cartOpen, setCartOpen, user } = useStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sky-100 lg:hidden shadow-lg dir-rtl">
      <div className="grid grid-cols-5 py-2 px-1 text-[11px] font-bold text-slate-600">
        <Link
          to={href("/")}
          activeOptions={{ exact: true }}
          className="flex flex-col items-center justify-center space-y-1 hover:text-sky-600 transition-colors"
          activeProps={{ className: "text-sky-600 font-black" }}
        >
          <Home className="h-5 w-5 stroke-[1.8]" />
          <span>{t("nav.home")}</span>
        </Link>

        <Link
          to={href("/search")}
          className="flex flex-col items-center justify-center space-y-1 hover:text-sky-600 transition-colors"
          activeProps={{ className: "text-sky-600 font-black" }}
        >
          <Search className="h-5 w-5 stroke-[1.8]" />
          <span>{t("header.searchShort")}</span>
        </Link>

        <Link
          to={href("/collections")}
          className="flex flex-col items-center justify-center space-y-1 hover:text-sky-600 transition-colors"
          activeProps={{ className: "text-sky-600 font-black" }}
        >
          <LayoutGrid className="h-5 w-5 stroke-[1.8]" />
          <span>{t("nav.collectionsShort")}</span>
        </Link>

        <Link
          to={user ? href("/account") : href("/account/login")}
          className="flex flex-col items-center justify-center space-y-1 hover:text-sky-600 transition-colors"
          activeProps={{ className: "text-sky-600 font-black" }}
        >
          <User className="h-5 w-5 stroke-[1.8]" />
          <span>{t("header.account")}</span>
        </Link>

        <button
          onClick={() => setCartOpen(!cartOpen)}
          className="flex flex-col items-center justify-center space-y-1 relative hover:text-sky-600 transition-colors"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[9px] font-black text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span>{t("header.cart")}</span>
        </button>
      </div>
    </div>
  );
}
