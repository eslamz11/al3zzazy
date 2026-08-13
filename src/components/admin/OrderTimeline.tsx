import { CheckCircle2, Clock, Truck, PackageCheck, XCircle, RotateCcw } from "lucide-react";
import type { OrderStatusHistoryEntry } from "@/lib/types";

interface OrderTimelineProps {
  history: OrderStatusHistoryEntry[];
}

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle2; color: string }> = {
  pending: {
    label: "تم إنشاء الطلب (جديد)",
    icon: Clock,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  confirmed: {
    label: "تم تأكيد الطلب",
    icon: CheckCircle2,
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
  },
  processing: {
    label: "تم تجهيز الطلب",
    icon: Clock,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  shipped: {
    label: "تم شحن الطلب",
    icon: Truck,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  delivered: {
    label: "تم تسليم الطلب",
    icon: PackageCheck,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  cancelled: {
    label: "تم إلغاء الطلب",
    icon: XCircle,
    color: "text-rose-500 bg-rose-500/10 border-rose-500/30",
  },
  returned: {
    label: "تم إرجاع الطلب",
    icon: RotateCcw,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/30",
  },
};

export function OrderTimeline({ history }: OrderTimelineProps) {
  if (!history || history.length === 0) {
    return <p className="text-xs text-muted-foreground">لا يوجد سجل حالات متاح.</p>;
  }

  return (
    <div className="space-y-4 dir-rtl">
      <h4 className="text-xs font-bold text-foreground border-b border-border pb-2">
        سجل تتبع حالة الطلب
      </h4>

      <div className="relative pl-4 pr-6 space-y-6 before:absolute before:right-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {history.map((entry, idx) => {
          const cfg = statusConfig[entry.status] || {
            label: entry.status,
            icon: Clock,
            color: "text-muted-foreground bg-muted border-border",
          };
          const Icon = cfg.icon;

          return (
            <div key={idx} className="relative flex items-start space-x-3 space-x-reverse">
              {/* Icon Marker */}
              <div
                className={`absolute -right-6 flex h-7 w-7 items-center justify-center rounded-full border ${cfg.color}`}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>

              {/* Status details */}
              <div className="flex-1 rounded-xl border border-border bg-card p-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-foreground">{cfg.label}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {new Date(entry.timestamp).toLocaleString("ar-EG", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>

                {entry.note && (
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed bg-accent/30 p-2 rounded-lg">
                    ملاحظة: {entry.note}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
