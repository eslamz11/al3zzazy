import { useState, useEffect, useCallback } from "react";
import { X, Download, Smartphone, Wifi, Bell, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/locale";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const STORAGE_KEY = "sleephigh-pwa-dismissed";
const SHOW_DELAY_MS = 2 * 60 * 1000; // 2 minutes

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const t = useT();

  useEffect(() => {
    // Don't show if already dismissed or installed
    if (
      localStorage.getItem(STORAGE_KEY) ||
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true
    )
      return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Show after 2 minutes
    const timer = setTimeout(() => {
      setShow(true);
    }, SHOW_DELAY_MS);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timer);
    };
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      // Fallback: show instructions
      setInstalling(true);
      setTimeout(() => setInstalling(false), 2000);
      return;
    }
    setInstalling(true);
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setTimeout(() => setShow(false), 2000);
    } else {
      setInstalling(false);
    }
    setDeferredPrompt(null);
  }, [deferredPrompt]);

  const handleDismiss = useCallback(() => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "1");
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-0 right-0 z-[9998] flex justify-center px-4 animate-in slide-in-from-bottom-8 fade-in duration-500">
      <div
        className={cn(
          "relative w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl",
          "border border-white/10",
        )}
        style={{
          background: "linear-gradient(135deg, #1a0a0b 0%, #2d0d12 40%, #1c0a0d 100%)",
        }}
      >
        {/* Glowing background circles */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-[#C8102E]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-[#C8102E]/10 blur-2xl pointer-events-none" />

        {/* Top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#C8102E] via-[#ff4d6d] to-[#C8102E]" />

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 left-3 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white/70 hover:text-white z-10"
          aria-label={t("common.close")}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-5 pt-4 space-y-4">
          {/* Header */}
          <div className="flex items-center gap-3 pt-1">
            {/* Icon */}
            <div className="h-12 w-12 rounded-2xl bg-[#C8102E] flex items-center justify-center shrink-0 shadow-lg shadow-[#C8102E]/40">
              <span className="text-white font-black text-sm leading-none">SH</span>
            </div>
            <div>
               <p className="text-[10px] font-bold text-[#C8102E] tracking-widest uppercase mb-0.5">
                 {t("pwa.eyebrow")}
               </p>
               <h3 className="text-white font-black text-base leading-tight">
                 {t("pwa.title")}
               </h3>
               <p className="text-white/50 text-xs">{t("pwa.brand")}</p>
            </div>
          </div>

          {/* Features */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Wifi, label: t("pwa.offline") },
              { icon: Bell, label: t("pwa.notifications") },
              { icon: Star, label: t("pwa.faster") },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/5 p-2.5 text-center border border-white/5"
              >
                <div className="h-7 w-7 rounded-full bg-[#C8102E]/20 flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-[#C8102E]" />
                </div>
                <span className="text-[10px] text-white/70 leading-tight font-medium">{label}</span>
              </div>
            ))}
          </div>

          {/* Stars rating */}
          <div className="flex items-center gap-1.5 justify-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="h-3 w-3 fill-[#f1c100] text-[#f1c100]" />
            ))}
            <span className="text-white/50 text-xs mr-1">{t("pwa.rating")}</span>
          </div>

          {/* Install button */}
          {installed ? (
            <div className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-green-500/20 border border-green-500/30">
               <span className="text-green-400 font-bold text-sm">✓ {t("pwa.installed")}</span>
            </div>
          ) : (
            <button
              onClick={handleInstall}
              disabled={installing}
              className={cn(
                "relative w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl",
                "font-black text-sm text-white transition-all duration-300",
                "bg-gradient-to-r from-[#C8102E] to-[#e52237]",
                "shadow-lg shadow-[#C8102E]/40",
                "hover:shadow-[#C8102E]/60 hover:scale-[1.02]",
                "active:scale-[0.98]",
                "disabled:opacity-70",
              )}
            >
              {installing ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                   {t("pwa.installing")}
                </span>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  {t("pwa.install")}
                  <Smartphone className="h-4 w-4 opacity-70" />
                </>
              )}
            </button>
          )}

          {/* Skip */}
          <button
            onClick={handleDismiss}
            className="w-full text-center text-[11px] text-white/30 hover:text-white/50 transition-colors pb-1"
          >
            {t("pwa.dismiss")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook to register the service worker
export function usePWA() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.error("[PWA] Service Worker registration failed:", err));
    });
  }, []);
}
