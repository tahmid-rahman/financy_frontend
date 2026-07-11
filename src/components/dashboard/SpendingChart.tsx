import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { getMonthlyTrends } from "../../services/api";

type MonthlyData = {
  month: string;
  income: number;
  expenses: number;
};

export default function SpendingChart() {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"30" | "6m" | "1y">("6m");

  useEffect(() => {
    async function fetchTrends() {
      try {
        setIsLoading(true);
        const res = await getMonthlyTrends();
        setData(res.data || res || []);
      } catch (err) {
        console.error("Failed to fetch monthly trends", err);
        // Fallback to empty data
        setData([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrends();
  }, []);

  // Filter data based on time range
  const filteredData = data.slice(-(timeRange === "30" ? 1 : timeRange === "6m" ? 6 : 12));

  const getComputedStyle = () => {
    if (typeof window === "undefined") return { isDark: false };
    return {
      isDark: document.documentElement.classList.contains("dark"),
    };
  };
  const { isDark } = getComputedStyle();

  const colors = {
    primary: isDark ? "rgb(8 145 178)" : "rgb(6 182 212)",
    accent: "rgb(236 72 153)",
    text: isDark ? "rgb(244 244 245)" : "rgb(24 24 27)",
    textMuted: isDark ? "rgb(161 161 170)" : "rgb(82 82 91)",
    border: isDark ? "rgb(39 39 42)" : "rgb(228 228 231)",
    surface: isDark ? "rgb(24 24 27)" : "rgb(255 255 255)",
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border/50 p-5 animate-pulse">
        <div className="h-6 bg-border/50 rounded w-32 mb-4"></div>
        <div className="h-64 bg-border/50 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border/50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-text">Monthly Trends</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value as "30" | "6m" | "1y")}
          className="text-sm bg-background border border-border/50 rounded px-3 py-1"
        >
          <option value="30">Last 30 Days</option>
          <option value="6m">Last 6 Months</option>
          <option value="1y">This Year</option>
        </select>
      </div>

      {filteredData.length > 0 ? (
        <div className="h-64 text-text">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.primary} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colors.accent} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colors.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={colors.border} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.textMuted, fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: colors.textMuted, fontSize: 12 }}
                tickFormatter={(value) => `৳${value}`}
              />
              <Tooltip
                contentStyle={{
                  background: colors.surface,
                  borderColor: colors.border,
                  borderRadius: 8,
                  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
                  color: colors.text,
                }}
                itemStyle={{ color: colors.text }}
                labelStyle={{ color: colors.text }}
                formatter={(value: number) => [`৳${value.toLocaleString()}`, ""]}
              />
              <Area
                type="monotone"
                dataKey="income"
                stroke={colors.primary}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#incomeGradient)"
                name="Income"
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke={colors.accent}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#expenseGradient)"
                name="Expenses"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-text-muted">
          No data available yet. Start adding income and expenses!
        </div>
      )}
    </div>
  );
}