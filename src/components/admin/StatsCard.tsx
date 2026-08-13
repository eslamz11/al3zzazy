import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type CardColor = "brand" | "success" | "warning" | "destructive" | "neutral";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: CardColor;
}

const palette: Record<CardColor, { bg: string; iconColor: string; border: string }> = {
  brand: {
    bg: "#fde8ea",
    iconColor: "#c8102e",
    border: "#f8cfd4",
  },
  success: {
    bg: "#ecfdf5",
    iconColor: "#059669",
    border: "#a7f3d0",
  },
  warning: {
    bg: "#fffbeb",
    iconColor: "#d97706",
    border: "#fde68a",
  },
  destructive: {
    bg: "#fef2f2",
    iconColor: "#dc2626",
    border: "#fecaca",
  },
  neutral: {
    bg: "#f3f4f6",
    iconColor: "#4b5563",
    border: "#e5e7eb",
  },
};

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "neutral",
}: StatsCardProps) {
  const currentPalette = palette[color] ?? palette.neutral;
  const { bg, iconColor, border } = currentPalette;

  return (
    <div
      dir="rtl"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 14,
        padding: "18px 20px",
        borderRadius: "14px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5dfd7",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#6b7280" }}>{title}</p>
          {subtitle && (
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "#9ca3af" }}>{subtitle}</p>
          )}
        </div>

        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            backgroundColor: bg,
            border: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon style={{ width: 19, height: 19, color: iconColor }} />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 800,
            color: "#1a1c1c",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {value}
        </p>

        {trend && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "2px 8px",
              borderRadius: 9999,
              fontSize: 11,
              fontWeight: 700,
              backgroundColor: trend.positive ? "#ecfdf5" : "#fef2f2",
              color: trend.positive ? "#047857" : "#b91c1c",
              border: `1px solid ${trend.positive ? "#a7f3d0" : "#fecaca"}`,
            }}
          >
            {trend.positive ? (
              <TrendingUp style={{ width: 12, height: 12 }} />
            ) : (
              <TrendingDown style={{ width: 12, height: 12 }} />
            )}
            <span>{trend.value}</span>
          </span>
        )}
      </div>
    </div>
  );
}
