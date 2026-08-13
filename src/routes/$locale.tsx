import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { StoreProvider } from "@/lib/store";
import { AnnouncementBar } from "@/components/common/AnnouncementBar";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { CartDrawer } from "@/components/common/CartDrawer";
import { MobileBottomNav } from "@/components/common/MobileBottomNav";
import { LoginPromptModal } from "@/components/common/LoginPromptModal";
import { PWAInstallPrompt, usePWA } from "@/components/common/PWAInstallPrompt";
import { useStore } from "@/lib/store";
import { dirFor, isLocale, DEFAULT_LOCALE } from "@/lib/i18n";
import type { Locale } from "@/lib/types";
import { useEffect } from "react";

export const Route = createFileRoute("/$locale")({
  component: StorefrontLayout,
});

function StorefrontLayout() {
  const params = Route.useParams() as { locale?: string };
  const locale: Locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const dir = dirFor(locale);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("sleephigh_locale", locale);
      document.documentElement.lang = locale;
      document.documentElement.dir = dir;
    }
  }, [locale, dir]);

  return (
    <StoreProvider>
      <StorefrontInner locale={locale} dir={dir} />
    </StoreProvider>
  );
}

/** Pages that should show the footer */
function shouldShowFooter(pathname: string): boolean {
  // Homepage: /$locale or /$locale/
  const homepagePattern = /^\/[a-z]{2}\/?$/;
  // Product detail: /$locale/products/$slug
  const productPattern = /^\/[a-z]{2}\/products\/[^/]+\/?$/;
  // Policy pages: /$locale/privacy, /$locale/terms, /$locale/returns
  const policyPattern = /^\/[a-z]{2}\/(privacy|terms|returns)\/?$/;

  return (
    homepagePattern.test(pathname) || productPattern.test(pathname) || policyPattern.test(pathname)
  );
}

function StorefrontInner({ locale, dir }: { locale: Locale; dir: string }) {
  const { showLoginPrompt, setShowLoginPrompt } = useStore();
  const location = useLocation();
  const showFooter = shouldShowFooter(location.pathname);
  usePWA();
  return (
    <>
      <div
        id="site-header"
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 9999 }}
        className={dir === "rtl" ? "dir-rtl" : "dir-ltr"}
      >
        <AnnouncementBar />
        <Header />
      </div>
      <div
        className={`min-h-screen overflow-x-hidden bg-background text-foreground pb-16 lg:pb-0 ${dir === "rtl" ? "dir-rtl" : "dir-ltr"}`}
      >
        <div className="h-24 sm:h-[104px] lg:h-[118px]" aria-hidden="true" />
        <main>
          <Outlet />
        </main>
        {showFooter && <Footer />}
        <CartDrawer />
        <MobileBottomNav />
        <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
        <PWAInstallPrompt />
      </div>
    </>
  );
}
