import { Link } from "@tanstack/react-router";
import { Home, Search, LayoutGrid, User, ShoppingCart } from "lucide-react";
import { useHref, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";

const navItemClass =
  "group relative flex flex-col items-center justify-center gap-1 py-1.5 text-slate-500 transition-colors duration-300";

const activeIndicatorClass =
  "pointer-events-none absolute inset-x-1.5 -top-0.5 bottom-0.5 rounded-2xl bg-sky-50 opacity-0 scale-90 transition-all duration-300 ease-out group-data-[status=active]:opacity-100 group-data-[status=active]:scale-100";

export function MobileBottomNav() {
  const href = useHref();
  const t = useT();
  const { cartCount, cartOpen, setCartOpen, user } = useStore();

  return (
    <nav
      dir="rtl"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden"
    >
      <div className="relative mx-auto flex max-w-md items-stretch justify-between rounded-[28px] border border-slate-200/70 bg-white/85 px-1.5 py-1.5 shadow-[0_10px_35px_-8px_rgba(15,23,42,0.18)] backdrop-blur-xl">
        <Link
          to={href("/")}
          activeOptions={{ exact: true }}
          className={`${navItemClass} flex-1`}
          activeProps={{ "data-status": "active" }}
        >
          <span className={activeIndicatorClass} />
          <Home className="relative z-10 h-5 w-5 stroke-[1.8] transition-transform duration-300 group-data-[status=active]:scale-110 group-data-[status=active]:text-sky-600" />
          <span className="relative z-10 text-[10.5px] font-semibold tracking-tight transition-colors duration-300 group-data-[status=active]:text-sky-600 group-data-[status=active]:font-black">
            {t("nav.home")}
          </span>
        </Link>

        <Link
          to={href("/search")}
          className={`${navItemClass} flex-1`}
          activeProps={{ "data-status": "active" }}
        >
          <span className={activeIndicatorClass} />
          <Search className="relative z-10 h-5 w-5 stroke-[1.8] transition-transform duration-300 group-data-[status=active]:scale-110 group-data-[status=active]:text-sky-600" />
          <span className="relative z-10 text-[10.5px] font-semibold tracking-tight transition-colors duration-300 group-data-[status=active]:text-sky-600 group-data-[status=active]:font-black">
            {t("header.searchShort")}
          </span>
        </Link>

        {/* Cart sits raised above the bar as the tab's one bold move */}
        <div className="flex flex-1 items-start justify-center">
          <button
            onClick={() => setCartOpen(!cartOpen)}
            aria-label={t("header.cart")}
            aria-pressed={cartOpen}
            className="group relative -mt-6 flex flex-col items-center gap-1"
          >
            <span
              className={`relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-b from-sky-500 to-sky-600 shadow-lg shadow-sky-600/35 ring-4 ring-white transition-transform duration-300 ${cartOpen ? "scale-95" : "group-active:scale-95"
                }`}
            >
              <ShoppingCart className="h-5 w-5 stroke-[2] text-white" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -left-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[10px] font-black leading-none text-white shadow-sm">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </span>
            <span className="text-[10.5px] font-semibold tracking-tight text-slate-500 transition-colors duration-300 group-hover:text-sky-600">
              {t("header.cart")}
            </span>
          </button>
        </div>

        <Link
          to={user ? href("/account") : href("/account/login")}
          className={`${navItemClass} flex-1`}
          activeProps={{ "data-status": "active" }}
        >
          <span className={activeIndicatorClass} />
          <User className="relative z-10 h-5 w-5 stroke-[1.8] transition-transform duration-300 group-data-[status=active]:scale-110 group-data-[status=active]:text-sky-600" />
          <span className="relative z-10 text-[10.5px] font-semibold tracking-tight transition-colors duration-300 group-data-[status=active]:text-sky-600 group-data-[status=active]:font-black">
            {t("header.account")}
          </span>
        </Link>

        <Link
          to={href("/collections")}
          className={`${navItemClass} flex-1`}
          activeProps={{ "data-status": "active" }}
        >
          <span className={activeIndicatorClass} />
          <LayoutGrid className="relative z-10 h-5 w-5 stroke-[1.8] transition-transform duration-300 group-data-[status=active]:scale-110 group-data-[status=active]:text-sky-600" />
          <span className="relative z-10 text-[10.5px] font-semibold tracking-tight transition-colors duration-300 group-data-[status=active]:text-sky-600 group-data-[status=active]:font-black">
            {t("nav.collectionsShort")}
          </span>
        </Link>
      </div>
    </nav>
  );
}