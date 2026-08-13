import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  Heart,
  User,
  Search,
  Menu,
  X,
  Globe,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useLocale, useHref, swapLocaleInPath, useT } from "@/lib/locale";
import { useStore } from "@/lib/store";

export function Header() {
  const locale = useLocale();
  const href = useHref();
  const t = useT();
  const navigate = useNavigate();
  const { cartCount, wishlist, cartOpen, setCartOpen, user } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpenMobile, setSearchOpenMobile] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  const isRTL = locale === "ar";
  const otherLocale = isRTL ? "en" : "ar";
  const [currentPath, setCurrentPath] = useState(`/${locale}`);

  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, [locale]);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (searchOpenMobile && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpenMobile]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({ to: href(`/search`), search: { q: searchQuery.trim() } });
      setSearchOpenMobile(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { to: href("/"), label: t("nav.home"), exact: true },
    { to: href("/collections/children-clothing"), label: t("nav.childrenClothing") },
    { to: href("/collections/school-supplies"), label: t("nav.schoolSupplies") },
    { to: href("/about"), label: t("nav.about") },
    { to: href("/contact"), label: t("nav.contact") },
  ];

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;
  const storeLogo = "https://i.ibb.co/Z5Sxv6K/Chat-GPT-Image-Aug-13-2026-06-46-12-PM.png";

  const mobileDrawerMarkup = (
    <div
      className={`fixed inset-0 z-[100000] lg:hidden transition-all duration-300 ${
        mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-modal="true"
      role="dialog"
      aria-hidden={!mobileMenuOpen}
    >
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={`
          fixed top-0 bottom-0 z-10 w-[82vw] max-w-[340px] h-full bg-white shadow-2xl
          flex flex-col overflow-hidden
          transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]
          ${
            isRTL
              ? `right-0 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`
              : `left-0 ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`
          }
        `}
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-sky-100 shrink-0 bg-sky-50/50">
          <Link to={href("/")} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-2">
            <img
              src={storeLogo}
              alt={t("brand.logoAlt")}
              className="h-11 w-auto object-contain"
            />
            <span className="font-bold text-sky-800 text-sm">{t("brand.name")}</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-slate-500 hover:bg-white hover:text-slate-800 rounded-xl transition-all border border-transparent hover:border-sky-100"
            aria-label={t("nav.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <nav className="px-3 py-3 space-y-0.5">
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest px-4 mb-2">
              {isRTL ? t("nav.navigation") : "Navigation"}
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: !!link.exact }}
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{
                  className: "bg-sky-50 text-sky-700 font-bold border-sky-200",
                }}
                inactiveProps={{
                  className:
                    "text-slate-700 hover:bg-sky-50/50 hover:text-sky-600 border-transparent",
                }}
                className="flex items-center justify-between py-3 px-4 rounded-xl transition-all text-sm font-bold border"
              >
                <span>{link.label}</span>
                <ChevronIcon className="h-4 w-4 opacity-40 shrink-0" />
              </Link>
            ))}
          </nav>

          <div className="mx-4 my-1 border-t border-sky-100" />

          <div className="px-3 py-3 space-y-0.5">
            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest px-4 mb-2">
              {isRTL ? "الحساب" : "Account"}
            </p>

            <Link
              to={user ? href("/account") : href("/account/login")}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-all"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 shrink-0">
                <User className="h-4 w-4 text-sky-700" />
              </span>
              <span>{user ? t("header.account") : t("nav.signIn")}</span>
            </Link>

            {user && user.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 text-sm font-bold text-slate-700 hover:bg-amber-50 hover:text-amber-700 rounded-xl transition-all"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                </span>
                <span>{t("nav.adminDashboard")}</span>
              </Link>
            )}

            <Link
              to={href("/wishlist")}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-4 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 shrink-0">
                  <Heart className="h-4 w-4 text-sky-700" />
                </span>
                <span>{t("header.wishlist")}</span>
              </div>
              {wishlist.length > 0 && (
                <span className="bg-amber-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                  {wishlist.length}
                </span>
              )}
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCartOpen(!cartOpen);
              }}
              className="w-full flex items-center justify-between py-3 px-4 text-sm font-bold text-slate-700 hover:bg-sky-50 hover:text-sky-700 rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 shrink-0">
                  <ShoppingBag className="h-4 w-4 text-sky-700" />
                </span>
                <span>{t("header.cart")}</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-sky-600 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="border-t border-sky-100 px-3 py-3 shrink-0 bg-sky-50/50">
          <a
            href={swapLocaleInPath(currentPath, otherLocale)}
            className="flex items-center justify-between w-full py-3 px-4 bg-white hover:bg-sky-50 text-sm font-bold text-slate-800 rounded-xl border border-sky-100 hover:border-sky-200 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-sky-600" />
              <span>{t("nav.language")}</span>
            </div>
            <span className="text-sky-700 text-xs font-black bg-sky-100 px-2.5 py-1 rounded-lg">
              {isRTL ? "English" : "العربية"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs relative z-30">
      <div
        className="w-full px-3 sm:px-5 lg:px-8 h-[60px] sm:h-[68px] lg:h-20 flex items-center justify-between"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpenMobile(false);
            }}
            className={`lg:hidden p-2 rounded-xl transition-all shrink-0 ${
              mobileMenuOpen ? "bg-sky-100 text-sky-700" : "text-slate-700 hover:bg-sky-50"
            }`}
            aria-label={t("nav.menu")}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 stroke-[2.2]" />
            ) : (
              <Menu className="h-5 w-5 stroke-[2.2]" />
            )}
          </button>

          <Link to={href("/")} className="flex items-center gap-2.5 shrink-0 group py-1 px-1">
            <img
              src={storeLogo}
              alt={t("brand.logoAlt")}
              className="h-10 sm:h-12 lg:h-[52px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
            <span className="font-extrabold text-sky-900 text-base sm:text-lg hidden sm:inline-block">
              {t("brand.name")}
            </span>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 font-bold text-sm text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: !!link.exact }}
              activeProps={{
                className:
                  "text-sky-600 font-black relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-sky-500 after:rounded-full",
              }}
              inactiveProps={{ className: "hover:text-sky-600 transition-colors" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "بحث في المتجر..." : "Search store..."}
              className="w-44 xl:w-56 py-2 px-3.5 text-xs bg-sky-50/60 border border-sky-100 rounded-xl focus:bg-white focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute ltr:right-8 rtl:left-8 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="absolute ltr:right-2.5 rtl:left-2.5 text-sky-500 hover:text-sky-700 transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          <a
            href={swapLocaleInPath(currentPath, otherLocale)}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 bg-sky-50 hover:bg-sky-100/70 border border-sky-100 px-3 py-2 rounded-xl transition-all"
            title={t("nav.switchLanguage")}
          >
            <Globe className="h-4 w-4 text-sky-600" />
            <span>{isRTL ? "English" : "العربية"}</span>
          </a>

          <Link
            to={user ? href("/account") : href("/account/login")}
            preload="intent"
            className="hidden sm:flex p-2 text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
            title={t("header.account")}
          >
            <User className="h-5 w-5 stroke-[2]" />
          </Link>

          {user && user.role === "admin" && (
            <Link
              to="/admin"
              preload="intent"
              className="hidden sm:flex p-2 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all shadow-xs"
              title={t("nav.adminDashboard")}
            >
              <ShieldCheck className="h-5 w-5 stroke-[2]" />
            </Link>
          )}

          <Link
            to={href("/wishlist")}
            preload="intent"
            className="relative p-2 text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all hidden sm:flex"
            title={t("header.wishlist")}
          >
            <Heart className="h-5 w-5 stroke-[2]" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 ltr:right-0.5 rtl:left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-xs">
                {wishlist.length}
              </span>
            )}
          </Link>

          <button
            onClick={() => {
              setSearchOpenMobile(!searchOpenMobile);
              setMobileMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition-all lg:hidden ${
              searchOpenMobile ? "bg-sky-100 text-sky-700" : "text-slate-700 hover:bg-sky-50"
            }`}
            aria-label={t("header.search")}
          >
            <Search className="h-5 w-5 stroke-[2]" />
          </button>

          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative p-2 text-slate-700 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-all"
            title={t("header.cart")}
          >
            <ShoppingBag className="h-5 w-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 ltr:right-0.5 rtl:left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-sky-600 text-[10px] font-black text-white shadow-xs">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          searchOpenMobile ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 pt-2 border-t border-sky-100 bg-white">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("header.searchPlaceholderMobile")}
              className="w-full py-2.5 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 text-sm bg-sky-50/50 border border-sky-100 rounded-xl focus:outline-none focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
            />
            <button
              type="submit"
              className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-sky-500 hover:text-sky-700 transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {mounted ? createPortal(mobileDrawerMarkup, document.body) : null}
    </header>
  );
}
