import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/locale";
import { useStore } from "@/lib/store";
import {
  initGis,
  promptOneTap,
  renderGoogleButton,
  cancelOneTap,
  GOOGLE_CLIENT_ID,
  type GsiContext,
} from "@/lib/google-identity";

const GoogleIcon = () => (
  <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface Props {
  /** "signin" for login page, "signup" for register page. */
  context: GsiContext;
  /** Called after a successful sign-in (navigate to the account page here). */
  onSuccess: () => void;
  /** Called with a localized message when sign-in fails. */
  onError: (message: string) => void;
  /** Disable interaction while another auth flow (email/password) is running. */
  disabled?: boolean;
}

/**
 * Google sign-in surface used by both the login and register pages.
 *
 * Primary path: Google Identity Services renders the official button and shows
 * One Tap when eligible; the returned credential is exchanged for a Firebase
 * session via the store. This is reliable on mobile (no popup / cross-domain
 * cookies). Fallback path (GIS blocked or no client ID): a styled button that
 * uses popup on desktop and redirect on mobile.
 */
export function GoogleSignInPanel({ context, onSuccess, onError, disabled }: Props) {
  const { user, loginWithGoogle, loginWithGoogleCredential } = useStore();
  const locale = useLocale();
  const buttonRef = useRef<HTMLDivElement>(null);
  // gisReady: official button rendered. false → show the fallback button.
  const [gisReady, setGisReady] = useState(false);
  const [loading, setLoading] = useState(false);

  const t = (ar: string, en: string) => (locale === "ar" ? ar : en);

  const failMessage = (code?: string) => {
    if (code === "redirecting") return ""; // page is navigating away — no error
    if (code === "popup_closed" || code === "cancelled")
      return t("تم إغلاق نافذة الدخول بجوجل.", "Google Sign-In was cancelled.");
    if (code === "popup_blocked")
      return t("تم حظر النافذة المنبثقة من المتصفح.", "Popup blocked by browser.");
    return t("فشل تسجيل الدخول بواسطة جوجل.", "Failed to sign in with Google.");
  };

  // Initialize GIS, render the official button, and attempt One Tap.
  useEffect(() => {
    // Skip entirely when already authenticated (page will redirect away).
    if (user) return;
    let cancelled = false;

    const handleCredential = async (idToken: string) => {
      setLoading(true);
      onError("");
      const res = await loginWithGoogleCredential(idToken);
      setLoading(false);
      if (res.ok) onSuccess();
      else onError(failMessage(res.error));
    };

    (async () => {
      const id = await initGis(handleCredential, context);
      if (cancelled) return;
      if (id && buttonRef.current) {
        const rendered = renderGoogleButton(buttonRef.current, {
          locale: locale === "ar" ? "ar" : "en",
          text: context === "signup" ? "signup_with" : "signin_with",
        });
        setGisReady(rendered);
        if (rendered) promptOneTap();
      } else {
        setGisReady(false);
      }
    })();

    return () => {
      cancelled = true;
      cancelOneTap();
    };
    // Re-run when locale changes so the official button re-renders in the right language.
  }, [context, locale, user, loginWithGoogleCredential, onSuccess, onError]);

  // Fallback button (popup on desktop, redirect on mobile) when GIS is unavailable.
  const handleFallback = async () => {
    setLoading(true);
    onError("");
    const res = await loginWithGoogle();
    if (res.ok) {
      setLoading(false);
      onSuccess();
    } else {
      // "redirecting" leaves the page loading while the browser navigates away.
      if (res.error !== "redirecting") setLoading(false);
      onError(failMessage(res.error));
    }
  };

  const showFallback = !GOOGLE_CLIENT_ID || !gisReady;

  return (
    <div className="space-y-3">
      {/* Official Google button (GIS) — rendered here when available. */}
      <div
        ref={buttonRef}
        className={cnHidden(GOOGLE_CLIENT_ID && gisReady)}
        style={{ minHeight: gisReady ? undefined : 0, colorScheme: "light" }}
        aria-label="Google Sign-In"
      >
        <div className="flex justify-center" />
      </div>

      {/* Fallback button — visible only when the official button is unavailable. */}
      {showFallback && (
        <button
          type="button"
          onClick={handleFallback}
          disabled={loading || disabled}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 px-4 py-3.5 text-sm font-bold text-gray-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50 cursor-pointer"
        >
          <GoogleIcon />
          <span>
            {loading
              ? t("جاري الاتصال بجوجل...", "Connecting to Google...")
              : context === "signup"
                ? t("التسجيل باستخدام حساب جوجل", "Sign up with Google")
                : t("تسجيل الدخول باستخدام جوجل", "Sign in with Google")}
          </span>
        </button>
      )}

      {loading && gisReady && (
        <p className="text-center text-xs font-bold text-muted-foreground">
          {t("جاري تسجيل الدخول...", "Signing in...")}
        </p>
      )}
    </div>
  );
}

function cnHidden(visible: boolean | undefined | string) {
  return visible ? "flex justify-center [color-scheme:light]" : "hidden";
}
