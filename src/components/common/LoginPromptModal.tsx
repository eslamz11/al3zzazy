import { Link } from "@tanstack/react-router";
import { useHref, useT } from "@/lib/locale";
import { X, LogIn, UserPlus, ShoppingBag, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

interface LoginPromptModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginPromptModal({ open, onClose }: LoginPromptModalProps) {
  const href = useHref();
  const t = useT();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div
        className={cn(
          "relative z-10 w-full sm:max-w-md mx-4 sm:mx-auto",
          "bg-card border border-border rounded-t-3xl sm:rounded-3xl shadow-2xl",
          "animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-300",
          "overflow-hidden",
        )}
      >
        {/* Top gradient strip */}
        <div className="h-1.5 w-full bg-gradient-to-r from-brand via-brand/70 to-brand/40" />

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label={t("common.close")}
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-brand/10 flex items-center justify-center">
              <Lock className="h-8 w-8 text-brand" />
            </div>
          </div>

          {/* Text */}
          <div className="text-center space-y-2">
             <h2 className="text-xl font-black text-foreground">{t("loginPrompt.title")}</h2>
             <p className="text-sm text-muted-foreground leading-relaxed">
               {t("loginPrompt.text")}
             </p>
          </div>

          {/* Features hint */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs text-muted-foreground">
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-brand" />
              </div>
               <span>{t("loginPrompt.cart")}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-brand text-sm">♡</span>
              </div>
               <span>{t("loginPrompt.wishlist")}</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-brand text-sm">📦</span>
              </div>
               <span>{t("loginPrompt.tracking")}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Link
              to={href("/account/login")}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-2xl bg-brand px-6 py-3.5 font-bold text-brand-foreground hover:bg-brand-hover transition-colors"
            >
               <LogIn className="h-5 w-5" />
               {t("loginPrompt.login")}
            </Link>
            <Link
              to={href("/account/register")}
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full rounded-2xl border border-border bg-card px-6 py-3.5 font-bold text-foreground hover:bg-muted transition-colors"
            >
               <UserPlus className="h-5 w-5" />
               {t("loginPrompt.register")}
            </Link>
          </div>

          {/* Skip */}
          <button
            onClick={onClose}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("loginPrompt.skip")}
          </button>
        </div>
      </div>
    </div>
  );
}
