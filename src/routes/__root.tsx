import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { usePWA } from "@/components/common/PWAInstallPrompt";
import { useLocale, useT } from "@/lib/locale";
import { InitialLoadProvider } from "@/lib/initial-load";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SpeedInsights } from "@vercel/speed-insights/react";

/** Brand logo used across the storefront header — preloaded so it is ready the
 *  moment the preloader lifts. */
const SITE_LOGO_URL =
  "https://sleephigh-eg.myshopify.com/cdn/shop/files/h_logo_250x.png?v=1697100417";

export function NotFoundComponent() {
  const locale = useLocale();
  const t = useT();
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4 dir-rtl font-sans"
      dir="rtl"
    >
      <div className="max-w-md text-center space-y-3">
        <p className="text-8xl font-black text-brand">404</p>
        <h1 className="text-2xl font-bold text-foreground">{t("common.notFound")}</h1>
        <p className="text-sm text-muted-foreground">{t("common.notFoundHint")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-brand px-6 py-2.5 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            {t("common.backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const locale = useLocale();
  const t = useT();
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div
      className="flex min-h-screen items-center justify-center bg-background px-4 dir-rtl font-sans"
      dir="rtl"
    >
      <div className="max-w-md text-center space-y-3">
        <p className="text-6xl">⚠️</p>
        <h1 className="text-xl font-bold text-foreground">{t("common.errorTitle")}</h1>
        <p className="text-sm text-muted-foreground">
          {t("common.errorHint")}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-brand-foreground transition-colors hover:bg-brand-hover"
          >
            {t("common.tryAgain")}
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-xl border border-input bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            {t("common.backHome")}
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "SleepHigh Egypt — Mattresses & Pillows | سليب هاي مصر" },
      {
        name: "description",
        content:
          "اكتشف مراتب، وسائد، ومراتب تطرية مصممة لأفضل تجربة نوم | Discover mattresses, pillows and toppers for the best sleep experience.",
      },
      { name: "author", content: "SleepHigh Egypt" },
      { name: "theme-color", content: "#C8102E" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "apple-mobile-web-app-title", content: "سليب هاي" },
      { property: "og:title", content: "SleepHigh Egypt — سليب هاي مصر" },
      {
        property: "og:description",
        content:
          "تسوق أفضل المراتب الطبية والوسائد ومستلزمات النوم الفاخرة مع ضمان حقيقي وتوصيل لجميع المحافظات | Shop medical mattresses, pillows and premium sleep essentials with genuine warranty and delivery across Egypt.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "SleepHigh Egypt" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@SleepHighEG" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "apple-touch-icon", href: "/icons/icon-192.svg" },
      // Warm up connections to the external image CDNs so critical imagery
      // (hero, logo, products) starts downloading sooner.
      { rel: "preconnect", href: "https://sleephigh-eg.myshopify.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://lh3.googleusercontent.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://images.unsplash.com", crossOrigin: "anonymous" },
      // Preload the storefront logo so it appears the instant the loader lifts.
      { rel: "preload", as: "image", href: SITE_LOGO_URL, fetchPriority: "high" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <InitialLoadProvider>
        <Outlet />
      </InitialLoadProvider>
      <SpeedInsights />
    </QueryClientProvider>
  );
}
