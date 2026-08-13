import { useState, useEffect, type ReactNode, createContext, useContext, useCallback } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminGuard } from "./AdminGuard";
import { ToastContainer } from "./Toast";
import { useDir } from "@/lib/locale";

interface Toast {
  id: string;
  type: "success" | "error" | "warning" | "info" | "loading";
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: Toast["type"], message: string, duration?: number) => string;
  dismissToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  loading: (message: string) => string;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within AdminLayout");
  return ctx;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dir = useDir();
  const isRTL = dir === "rtl";

  const dismissToast = useCallback((id: string): void => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: Toast["type"], message: string, duration = 3000): string => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 11);
      setToasts((prev) => [...prev, { id, type, message, duration }]);

      if (type !== "loading" && duration > 0) {
        setTimeout(() => dismissToast(id), duration);
      }
      return id;
    },
    [dismissToast],
  );

  const toastValue: ToastContextValue = {
    toasts,
    addToast,
    dismissToast,
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message, 5000),
    warning: (message: string) => addToast("warning", message, 4000),
    info: (message: string) => addToast("info", message),
    loading: (message: string): string => addToast("loading", message, 0),
  };

  return (
    <ToastContext.Provider value={toastValue}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
          backgroundColor: "#fdfbf7",
          color: "#1a1c1c",
          isolation: "isolate",
        }}
        dir={dir}
      >
        {/* ── DESKTOP SIDEBAR (Sticky, Pure CSS responsive block) ── */}
        <div
          className="hidden lg:block shrink-0 h-screen sticky top-0 z-40"
          style={{
            height: "100vh",
            position: "sticky",
            top: 0,
            zIndex: 40,
          }}
        >
          <AdminSidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((v) => !v)}
          />
        </div>

        {/* ── MOBILE DRAWER ── */}
        {mobileOpen && (
          <div
            className="lg:hidden"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99999,
              display: "flex",
            }}
          >
            {/* Backdrop with blur */}
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(10, 12, 14, 0.75)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                zIndex: 1,
              }}
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer Panel */}
            <div
              style={{
                position: "relative",
                zIndex: 2,
                height: "100%",
                maxWidth: "85vw",
                boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
                ...(isRTL ? { marginRight: 0 } : { marginLeft: 0 }),
              }}
            >
              <AdminSidebar onCloseMobile={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        {/* ── MAIN CONTENT AREA ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            minHeight: "100vh",
            overflowX: "hidden",
          }}
        >
          <AdminHeader onToggleMobileMenu={() => setMobileOpen(true)} />
          <main
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px",
            }}
            className="p-4 md:p-6 lg:p-8"
          >
            <div style={{ maxWidth: 1340, margin: "0 auto" }}>{children}</div>
          </main>
          <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
      </div>
    </ToastContext.Provider>
  );
}
