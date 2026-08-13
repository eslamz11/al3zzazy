import { useState, type ReactNode } from "react";
import { AlertTriangle, Shield, ShieldOff, X, Loader2 } from "lucide-react";
import { useLocale, useT } from "@/lib/locale";

interface RoleConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "promote" | "demote";
  userName: string;
  onConfirm: () => Promise<void>;
  children?: ReactNode;
}

export function RoleConfirmDialog({
  open,
  onOpenChange,
  mode,
  userName,
  onConfirm,
}: RoleConfirmDialogProps) {
  const t = useT();
  const locale = useLocale();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const isPromote = mode === "promote";

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${
        open ? "visible" : "hidden"
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !loading && onOpenChange(false)}
      />

      {/* Dialog */}
      <div
        className={`relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl ${
          locale === "ar" ? "text-right" : "text-left"
        }`}
      >
        {/* Close button */}
        <button
          onClick={() => !loading && onOpenChange(false)}
          disabled={loading}
          className="absolute left-4 top-4 rounded-lg p-1.5 hover:bg-accent disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            isPromote ? "bg-brand/15 text-brand" : "bg-amber-500/15 text-amber-600"
          }`}
        >
          {isPromote ? (
            <Shield className="h-7 w-7" />
          ) : (
            <ShieldOff className="h-7 w-7" />
          )}
        </div>

        {/* Title */}
        <h3 className="mb-2 text-center text-lg font-bold">
          {isPromote ? t("admin.role.confirmPromote") : t("admin.role.confirmDemote")}
        </h3>

        {/* User name */}
        <p className="mb-4 text-center text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{userName}</span>
        </p>

        {/* Warning message */}
        <div
          className={`mb-6 rounded-xl ${
            isPromote ? "bg-brand/10" : "bg-amber-500/10"
          } p-4 ${locale === "ar" ? "text-right" : "text-left"}`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`mt-0.5 h-5 w-5 shrink-0 ${isPromote ? "text-brand" : "text-amber-600"}`}
            />
            <p className="text-xs leading-relaxed">
              {isPromote
                ? t("admin.role.confirmPromoteMessage")
                : t("admin.role.confirmDemoteMessage")}
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="flex-1 rounded-xl border border-input bg-background py-2.5 text-xs font-semibold hover:bg-accent disabled:opacity-50"
          >
            {t("admin.role.cancelButton")}
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl py-2.5 text-xs font-semibold text-white ${
              isPromote
                ? "bg-brand hover:bg-brand-hover"
                : "bg-amber-600 hover:bg-amber-700"
            } disabled:opacity-50`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {t("admin.role.changing")}
              </span>
            ) : (
              t("admin.role.confirmButton")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}