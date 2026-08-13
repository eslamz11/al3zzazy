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

  // Debug: Log user state
  useEffect(() => {
    console.log('[Header] User state:', user);
    console.log('[Header] User role:', user?.role);
    console.log('[Header] Is admin check:', user && user.role === "admin");
  }, [user]);

  useEffect(() => {
    setMounted(true);
    setCurrentPath(window.location.pathname);
  }, [locale]);

  // Lock body scroll when mobile menu is open
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

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileMenuOpen]);

  // Auto-focus search input when expanded
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
    { to: href("/collections/mattresses"), label: t("nav.mattresses") },
    { to: href("/collections/pillows"), label: t("nav.pillows") },
    { to: href("/about"), label: t("nav.about") },
    { to: href("/contact"), label: t("nav.contact") },
  ];

  const ChevronIcon = isRTL ? ChevronLeft : ChevronRight;

  const mobileDrawerMarkup = (
    <div
      className={`fixed inset-0 z-[100000] lg:hidden transition-all duration-300 ${
        mobileMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
      }`}
      aria-modal="true"
      role="dialog"
      aria-hidden={!mobileMenuOpen}
    >
      {/* Dim backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ${
          mobileMenuOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Drawer Panel — slides from start edge */}
      <div
        className={`
          fixed top-0 bottom-0 z-10 w-[82vw] max-w-[340px] h-full h-[100dvh] bg-white shadow-2xl
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
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 shrink-0 bg-gray-50/50">
          <Link to={href("/")} onClick={() => setMobileMenuOpen(false)}>
             <img
               src="https://sleephigh-eg.myshopify.com/cdn/shop/files/h_logo_250x.png?v=1697100417"
               alt={t("brand.logoAlt")}
               className="h-12 w-auto object-contain"
             />
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-500 hover:bg-white hover:text-gray-800 rounded-xl transition-all border border-transparent hover:border-gray-200"
             aria-label={t("nav.closeMenu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Nav Links */}
          <nav className="px-3 py-3 space-y-0.5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">
               {isRTL ? t("nav.navigation") : "Navigation"}
            </p>
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                activeOptions={{ exact: !!link.exact }}
                onClick={() => setMobileMenuOpen(false)}
                activeProps={{
                  className: "bg-red-50 text-[#C8102E] font-black border-[#C8102E]/20",
                }}
                inactiveProps={{
                  className:
                    "text-gray-800 hover:bg-gray-50 hover:text-[#C8102E] border-transparent",
                }}
                className="flex items-center justify-between py-3 px-4 rounded-xl transition-all text-sm font-bold border"
              >
                <span>{link.label}</span>
                <ChevronIcon className="h-4 w-4 opacity-40 shrink-0" />
              </Link>
            ))}
          </nav>

          {/* Divider */}
          <div className="mx-4 my-1 border-t border-gray-100" />

          {/* Account section */}
          <div className="px-3 py-3 space-y-0.5">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 mb-2">
              {isRTL ? "الحساب" : "Account"}
            </p>

            {/* Account */}
            <Link
              to={user ? href("/account") : href("/account/login")}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 py-3 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#C8102E] rounded-xl transition-all"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 shrink-0">
                <User className="h-4 w-4 text-[#C8102E]" />
              </span>
               <span>{user ? t("header.account") : t("nav.signIn")}</span>
            </Link>

            {/* Admin (Mobile) */}
            {user && user.role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 py-3 px-4 text-sm font-bold text-gray-700 hover:bg-red-50 hover:text-[#C8102E] rounded-xl transition-all"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-[#C8102E]" />
                </span>
                 <span>{t("nav.adminDashboard")}</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              to={href("/wishlist")}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-3 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#C8102E] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 shrink-0">
                  <Heart className="h-4 w-4 text-[#C8102E]" />
                </span>
                <span>{t("header.wishlist")}</span>
              </div>
              {wishlist.length > 0 && (
                <span className="bg-[#C8102E] text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCartOpen(!cartOpen);
              }}
              className="w-full flex items-center justify-between py-3 px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 hover:text-[#C8102E] rounded-xl transition-all"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 shrink-0">
                  <ShoppingBag className="h-4 w-4 text-[#C8102E]" />
                </span>
                <span>{t("header.cart")}</span>
              </div>
              {cartCount > 0 && (
                <span className="bg-[#C8102E] text-white px-2 py-0.5 rounded-full text-[10px] font-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Language Switcher — pinned at bottom */}
        <div className="border-t border-gray-100 px-3 py-3 shrink-0 bg-gray-50/50">
          <a
            href={swapLocaleInPath(currentPath, otherLocale)}
            className="flex items-center justify-between w-full py-3 px-4 bg-white hover:bg-red-50 text-sm font-bold text-gray-800 rounded-xl border border-gray-200 hover:border-red-200 transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Globe className="h-4 w-4 text-[#C8102E]" />
              <span>{t("nav.language")}</span>
            </div>
            <span className="text-[#C8102E] text-xs font-black bg-red-50 px-2.5 py-1 rounded-lg">
              {isRTL ? "English" : "العربية"}
            </span>
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <header className="w-full bg-white/97 backdrop-blur-md border-b border-gray-200/80 shadow-sm relative z-30">
      {/* ─── MAIN BAR ─── */}
      <div
        className="w-full px-3 sm:px-5 lg:px-8 h-[58px] sm:h-[66px] lg:h-20 flex items-center justify-between"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* ── START SIDE: Hamburger (mobile only) + Logo ── */}
        <div className="flex items-center gap-1">
          {/* Mobile Hamburger — left of logo on mobile */}
          <button
            onClick={() => {
              setMobileMenuOpen(!mobileMenuOpen);
              setSearchOpenMobile(false);
            }}
            className={`lg:hidden p-2 rounded-xl transition-all shrink-0 ${
              mobileMenuOpen ? "bg-red-50 text-[#C8102E]" : "text-gray-700 hover:bg-gray-100"
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

          {/* LOGO */}
          <Link to={href("/")} className="flex items-center shrink-0 group py-1 px-1">
             <img
               src="https://sleephigh-eg.myshopify.com/cdn/shop/files/h_logo_250x.png?v=1697100417"
               alt={t("brand.logoAlt")}
               className="h-12 sm:h-14 lg:h-[60px] w-auto object-contain transition-transform duration-300 group-hover:scale-105"
             />
          </Link>
        </div>

        {/* ── CENTER: Desktop Nav Links ── */}
        <nav className="hidden lg:flex items-center gap-5 xl:gap-7 font-bold text-xs xl:text-sm text-gray-800">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              activeOptions={{ exact: !!link.exact }}
              activeProps={{
                className:
                  "text-[#C8102E] font-black relative after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:bg-[#C8102E] after:rounded-full",
              }}
              inactiveProps={{ className: "hover:text-[#C8102E] transition-colors" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ── END SIDE: Action Icons ── */}
        <div className="flex items-center gap-0.5 sm:gap-1.5">
          {/* Desktop Search Bar */}
          <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isRTL ? "بحث عن منتج..." : "Search products..."}
              className="w-40 xl:w-52 py-2 px-3.5 text-xs bg-gray-100/80 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#C8102E] focus:ring-2 focus:ring-red-100 transition-all placeholder:text-gray-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute ltr:right-8 rtl:left-8 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
            <button
              type="submit"
              className="absolute ltr:right-2.5 rtl:left-2.5 text-gray-400 hover:text-[#C8102E] transition-colors"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* Language Switcher — desktop only */}
          <a
            href={swapLocaleInPath(currentPath, otherLocale)}
            className="hidden lg:flex items-center gap-1.5 text-xs font-bold text-gray-700 hover:text-[#C8102E] bg-gray-100/80 hover:bg-red-50 border border-gray-200 hover:border-red-200 px-3 py-2 rounded-xl transition-all"
            title={t("nav.switchLanguage")}
          >
            <Globe className="h-4 w-4 text-[#C8102E]" />
            <span>{isRTL ? "English" : "العربية"}</span>
          </a>

          {/* Account — desktop + tablet */}
          <Link
            to={user ? href("/account") : href("/account/login")}
            preload="intent"
            className="hidden sm:flex p-2 text-gray-700 hover:text-[#C8102E] hover:bg-gray-100 rounded-xl transition-all"
            title={t("header.account")}
          >
            <User className="h-5 w-5 stroke-[2]" />
          </Link>

          {/* Admin — desktop + tablet */}
          {user && user.role === "admin" && (
            <Link
              to="/admin"
              preload="intent"
              className="hidden sm:flex p-2 text-[#C8102E] bg-red-50 hover:bg-[#C8102E] hover:text-white rounded-xl transition-all shadow-sm"
               title={t("nav.adminDashboard")}
            >
              <ShieldCheck className="h-5 w-5 stroke-[2]" />
            </Link>
          )}

          {/* Wishlist — desktop + tablet */}
          <Link
            to={href("/wishlist")}
            preload="intent"
            className="relative p-2 text-gray-700 hover:text-[#C8102E] hover:bg-gray-100 rounded-xl transition-all hidden sm:flex"
            title={t("header.wishlist")}
          >
            <Heart className="h-5 w-5 stroke-[2]" />
            {wishlist.length > 0 && (
              <span className="absolute top-0.5 ltr:right-0.5 rtl:left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C8102E] text-[10px] font-black text-white shadow-sm">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Mobile Search Toggle */}
          <button
            onClick={() => {
              setSearchOpenMobile(!searchOpenMobile);
              setMobileMenuOpen(false);
            }}
            className={`p-2 rounded-xl transition-all lg:hidden ${
              searchOpenMobile ? "bg-red-50 text-[#C8102E]" : "text-gray-700 hover:bg-gray-100"
            }`}
            aria-label={t("header.search")}
          >
            <Search className="h-5 w-5 stroke-[2]" />
          </button>

          {/* Cart Button — always visible */}
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative p-2 text-gray-700 hover:text-[#C8102E] hover:bg-gray-100 rounded-xl transition-all"
            title={t("header.cart")}
          >
            <ShoppingBag className="h-5 w-5 stroke-[2]" />
            {cartCount > 0 && (
              <span className="absolute top-0.5 ltr:right-0.5 rtl:left-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C8102E] text-[10px] font-black text-white shadow-sm">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ─── MOBILE SEARCH BAR (smooth height expansion) ─── */}
      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${
          searchOpenMobile ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-3 pb-3 pt-2 border-t border-gray-100 bg-white">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
               placeholder={t("header.searchPlaceholderMobile")}
              className="w-full py-2.5 ltr:pl-4 ltr:pr-10 rtl:pr-4 rtl:pl-10 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:bg-white focus:border-[#C8102E] focus:ring-2 focus:ring-red-100 transition-all"
            />
            <button
              type="submit"
              className="absolute ltr:right-3 rtl:left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C8102E] transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* ─── MOBILE DRAWER OVERLAY (PORTALED TO DOCUMENT.BODY) ─── */}
      {mounted ? createPortal(mobileDrawerMarkup, document.body) : null}
    </header>
  );
}
