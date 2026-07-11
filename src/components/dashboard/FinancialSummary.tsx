import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, WalletIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getDashboardSummary } from "../../services/api";

type SummaryData = {
  total_income: number;
  total_expense: number;
  balance: number;
};

export default function FinancialSummary() {
  const [data, setData] = useState<SummaryData>({ total_income: 0, total_expense: 0, balance: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchSummary() {
      try {
        setIsLoading(true);
        const res = await getDashboardSummary();
        setData({
          total_income: res.total_income || 0,
          total_expense: res.total_expense || 0,
          balance: res.balance || 0,
        });
      } catch (err) {
        console.error("Failed to fetch dashboard summary", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSummary();
  }, []);

  const metrics = [
    {
      name: "Total Balance",
      value: `৳${data.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: data.balance >= 0 ? "+" : "",
      trend: data.balance >= 0 ? "up" : "down",
      icon: <WalletIcon className="h-5 w-5 text-primary" />,
    },
    {
      name: "Income",
      value: `৳${data.total_income.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "+",
      trend: "up",
      icon: <ArrowTrendingUpIcon className="h-5 w-5 text-green-500" />,
    },
    {
      name: "Expenses",
      value: `৳${data.total_expense.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: "-",
      trend: "down",
      icon: <ArrowTrendingDownIcon className="h-5 w-5 text-accent" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-surface rounded-lg border border-border/50 p-4 animate-pulse"
          >
            <div className="h-4 bg-border/50 rounded w-20 mb-2"></div>
            <div className="h-8 bg-border/50 rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

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