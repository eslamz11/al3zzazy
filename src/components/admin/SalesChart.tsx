import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface SalesChartProps {
  data?: Array<{ date: string; sales: number; orders: number }>;
}

const defaultData = [
  { date: "السبت", sales: 12400, orders: 12 },
  { date: "الأحد", sales: 18500, orders: 18 },
  { date: "الإثنين", sales: 15200, orders: 15 },
  { date: "الثلاثاء", sales: 24100, orders: 22 },
  { date: "الأربعاء", sales: 19800, orders: 19 },
  { date: "الخميس", sales: 32000, orders: 31 },
  { date: "الجمعة", sales: 28400, orders: 27 },
];

export function SalesChart({ data = defaultData }: SalesChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.55 0.072 52)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="oklch(0.55 0.072 52)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.9 0.011 82)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "oklch(0.505 0.013 70)" }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "oklch(0.505 0.013 70)" }}
            tickFormatter={(val) => `${val / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(1 0 0)",
              borderColor: "oklch(0.9 0.011 82)",
              borderRadius: "0.5rem",
              fontSize: "12px",
              direction: "rtl",
            }}
            formatter={(value: number) => [`${value.toLocaleString("ar-EG")} ج.م`, "المبيعات"]}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="oklch(0.55 0.072 52)"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#salesGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
