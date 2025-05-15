import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, WalletIcon } from "@heroicons/react/24/outline";

const metrics = [
  {
    name: "Total Balance",
    value: "$8,245.20",
    change: "+12%",
    trend: "up",
    icon: <WalletIcon className="h-5 w-5 text-primary" />,
  },
  {
    name: "Income",
    value: "$3,500.00",
    change: "+5.4%",
    trend: "up",
    icon: <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />,
  },
  {
    name: "Expenses",
    value: "$1,254.80",
    change: "-2.3%",
    trend: "down",
    icon: <ArrowTrendingDownIcon className="h-5 w-5 text-accent" />,
  },
];

export default function FinancialSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.name}
          className="bg-surface rounded-lg border border-border/50 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-muted">{metric.name}</span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                metric.trend === "up" ? "bg-green-100 text-green-600" : "bg-red-100 text-accent"
              }`}
            >
              {metric.change}
            </span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl font-semibold">{metric.value}</p>
            <div className="p-2 rounded-lg bg-background">{metric.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
