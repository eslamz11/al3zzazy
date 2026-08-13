import { X } from "lucide-react";
import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

const toastStyles: Record<ToastType, { bg: string; text: string; border: string }> = {
  success: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
  },
  error: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
  warning: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  info: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  loading: {
    bg: "bg-gray-50",
    text: "text-gray-800",
    border: "border-gray-200",
  },
};

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-4 left-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-sm ${toastStyles[toast.type].bg} ${toastStyles[toast.type].text} ${toastStyles[toast.type].border}`}
        >
          <div className="flex-1 text-sm font-medium">{toast.message}</div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="shrink-0 hover:opacity-70 transition-opacity"
            aria-label="إغلاق"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: ToastType, message: string, duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).slice(0, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (type !== "loading" && duration > 0) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return id;
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const dismissAll = () => {
    setToasts([]);
  };

  return {
    toasts,
    addToast,
    dismissToast,
    dismissAll,
    success: (message: string) => addToast("success", message),
    error: (message: string) => addToast("error", message, 5000),
    warning: (message: string) => addToast("warning", message, 4000),
    info: (message: string) => addToast("info", message),
    loading: (message: string) => addToast("loading", message, 0),
  };
}
