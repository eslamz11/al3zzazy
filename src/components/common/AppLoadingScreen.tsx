import { useDir, useT } from "@/lib/locale";

/**
 * Full-page branded preloader shown during the initial application load.
 *
 * Design goals: instant (no network requests — the brandmark is inline SVG),
 * premium & minimal, and faithful to the SleepHigh identity (brand red, the
 * crescent-moon motif, and the bilingual "SLEEP HIGH / سليب هاي" wordmark).
 *
 * Visibility and removal are owned by <InitialLoadProvider>; this component is
 * purely presentational. Animations are pure CSS (see styles.css) so they run
 * before hydration and are disabled under `prefers-reduced-motion`.
 */
export function AppLoadingScreen({ leaving = false }: { leaving?: boolean }) {
  const t = useT();
  const dir = useDir();

  return (
    <div
      className={`shg-splash${leaving ? " shg-splash--leaving" : ""}`}
      dir={dir}
      role="status"
      aria-live="polite"
      aria-label={t("common.loading")}
    >
      <div className="flex flex-col items-center text-center">
        {/* Brandmark: crescent moon inside a soft pulsing glow */}
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="shg-splash__glow absolute h-28 w-28 rounded-full bg-brand/25 blur-2xl sm:h-32 sm:w-32"
          />
          <div className="shg-splash__mark relative" style={{ color: "var(--brand)" }}>
            <svg
              viewBox="0 0 64 64"
              className="h-16 w-16 sm:h-20 sm:w-20 drop-shadow-sm"
              role="img"
              aria-label={t("brand.name")}
            >
              <defs>
                <mask id="shg-moon-mask">
                  <rect width="64" height="64" fill="black" />
                  <circle cx="30" cy="32" r="21" fill="white" />
                  <circle cx="41" cy="25" r="17" fill="black" />
                </mask>
              </defs>
              <circle
                cx="30"
                cy="32"
                r="21"
                fill="currentColor"
                mask="url(#shg-moon-mask)"
              />
              <circle cx="45" cy="18" r="2.4" fill="currentColor" />
              <circle cx="52" cy="27" r="1.5" fill="currentColor" opacity="0.7" />
            </svg>
          </div>
        </div>

        {/* Bilingual wordmark */}
        <div className="mt-6 flex flex-col items-center gap-1">
          <span className="text-xl sm:text-2xl font-black tracking-[0.28em] text-foreground pl-[0.28em]">
            SLEEP&nbsp;HIGH
          </span>
          <span className="text-sm sm:text-base font-bold text-brand tracking-wide">
            {t("brand.name")}
          </span>
        </div>

        {/* Indeterminate progress bar */}
        <div className="shg-splash__track mt-7 h-1 w-32 bg-border/70 sm:w-40">
          <div className="shg-splash__bar" />
        </div>

        {/* Subtle localized label */}
        <p className="mt-4 text-xs sm:text-sm font-medium text-muted-foreground">
          {t("loader.subtitle")}
        </p>
      </div>
    </div>
  );
}
