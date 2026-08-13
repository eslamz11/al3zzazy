import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface OrderStatusChartProps {
  data?: Array<{ name: string; value: number; color: string }>;
}

const defaultData = [
  { name: "جديد", value: 14, color: "#3b82f6" },
  { name: "تم التأكيد", value: 28, color: "#06b6d4" },
  { name: "قيد التجهيز", value: 19, color: "#f59e0b" },
  { name: "تم الشحن", value: 35, color: "#8b5cf6" },
  { name: "تم التسليم", value: 142, color: "#10b981" },
  { name: "ملغي", value: 6, color: "#ef4444" },
];

export function OrderStatusChart({ data = defaultData }: OrderStatusChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              borderColor: "oklch(0.9 0.011 82)",
              borderRadius: "0.5rem",
              fontSize: "12px",
              direction: "rtl",
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value: string) => (
              <span className="text-xs text-foreground font-medium">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
