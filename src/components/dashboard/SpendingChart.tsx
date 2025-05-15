import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", income: 4000, expenses: 2400 },
  { month: "Feb", income: 3000, expenses: 1398 },
  { month: "Mar", income: 2000, expenses: 1800 },
  { month: "Apr", income: 2780, expenses: 1908 },
  { month: "May", income: 1890, expenses: 1200 },
  { month: "Jun", income: 2390, expenses: 1500 },
];

export default function SpendingChart() {
  // If using theme context
  // const { isDarkMode } = useTheme();

  // Static approach (use this if not using theme context)
  const getComputedStyle = () => {
    if (typeof window === "undefined") return { isDark: false };
    return {
      isDark: document.documentElement.classList.contains("dark"),
    };
  };
  const { isDark } = getComputedStyle();

  // Define colors based on theme
  const colors = {
    primary: isDark ? "rgb(8 145 178)" : "rgb(6 182 212)",
    accent: "rgb(236 72 153)", // Same in both modes
    text: isDark ? "rgb(244 244 245)" : "rgb(24 24 27)",
    textMuted: isDark ? "rgb(161 161 170)" : "rgb(82 82 91)",
    border: isDark ? "rgb(39 39 42)" : "rgb(228 228 231)",
    surface: isDark ? "rgb(24 24 27)" : "rgb(255 255 255)",
  };

  return (
    <div className="bg-surface rounded-lg border border-border/50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-text">Monthly Trends</h2>
        <select className="text-sm bg-background border border-border/50 rounded px-3 py-1">
          <option>Last 30 Days</option>
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="h-64 text-text">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
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
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: colors.textMuted, fontSize: 12 }} />
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
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke={colors.primary}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#incomeGradient)"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke={colors.accent}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#expenseGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
