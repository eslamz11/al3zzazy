import type { LucideIcon } from "lucide-react";

type CardColor = "brand" | "success" | "warning" | "destructive" | "neutral";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: CardColor;
}

const colorClasses: Record<CardColor, { iconBg: string; iconText: string }> = {
  brand: { iconBg: "bg-red-50", iconText: "text-red-600" },
  success: { iconBg: "bg-emerald-50", iconText: "text-emerald-600" },
  warning: { iconBg: "bg-amber-50", iconText: "text-amber-600" },
  destructive: { iconBg: "bg-red-50", iconText: "text-red-600" },
  neutral: { iconBg: "bg-gray-50", iconText: "text-gray-600" },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "neutral",
}: StatsCardProps) {
  const { iconBg, iconText } = colorClasses[color];

  return (
    <div className="rounded-lg border border-[#e5dfd7] bg-white p-4 transition-colors hover:border-[#d0c8be]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-600 truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-md ${iconBg} ${iconText} shrink-0`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="text-xl font-bold text-[#1a1c1c] mt-2 tracking-tight">{value}</p>
    </div>
  );
}
