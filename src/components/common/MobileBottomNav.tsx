import { Link } from "@tanstack/react-router";
import { Home, Search, LayoutGrid, User, ShoppingCart } from "lucide-react";
import { useHref, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";

export function MobileBottomNav() {
  const href = useHref();
  const t = useT();
  const { cartCount, cartOpen, setCartOpen, user } = useStore();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden shadow-lg dir-rtl">
      <div className="grid grid-cols-5 py-2 px-1 text-[11px] font-bold text-gray-600">
        {/* 1. Home */}
        <Link
          to={href("/")}
          activeOptions={{ exact: true }}
          className="flex flex-col items-center justify-center space-y-1 hover:text-[#C8102E] transition-colors"
          activeProps={{ className: "text-[#C8102E] font-black" }}
        >
          <Home className="h-5 w-5 stroke-[1.8]" />
          <span>{t("nav.home")}</span>
        </Link>

        {/* 2. Search */}
        <Link
          to={href("/search")}
          className="flex flex-col items-center justify-center space-y-1 hover:text-[#C8102E] transition-colors"
          activeProps={{ className: "text-[#C8102E] font-black" }}
        >
          <Search className="h-5 w-5 stroke-[1.8]" />
          <span>{t("header.searchShort")}</span>
        </Link>

        {/* 3. Collections */}
        <Link
          to={href("/collections")}
          className="flex flex-col items-center justify-center space-y-1 hover:text-[#C8102E] transition-colors"
          activeProps={{ className: "text-[#C8102E] font-black" }}
        >
          <LayoutGrid className="h-5 w-5 stroke-[1.8]" />
          <span>{t("nav.collectionsShort")}</span>
        </Link>

        {/* 4. Account */}
        <Link
          to={user ? href("/account") : href("/account/login")}
          className="flex flex-col items-center justify-center space-y-1 hover:text-[#C8102E] transition-colors"
          activeProps={{ className: "text-[#C8102E] font-black" }}
        >
          <User className="h-5 w-5 stroke-[1.8]" />
          <span>{t("header.account")}</span>
        </Link>

        {/* 5. Cart */}
        <button
          onClick={() => setCartOpen(!cartOpen)}
          className="flex flex-col items-center justify-center space-y-1 relative hover:text-[#C8102E] transition-colors"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5 stroke-[1.8]" />
            <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#C8102E] text-[9px] font-black text-white shadow-xs">
              {cartCount}
            </span>
          </div>
          <span>{t("header.cart")}</span>
        </button>
      </div>
    </div>
  );
}
