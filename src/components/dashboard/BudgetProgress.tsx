import { ChartPieIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getBudgets } from "../../services/api";

type Budget = {
  id: number;
  category: number;
  category_name: string;
  limit: number;
  spent: number;
  month: string;
};

export default function BudgetProgress() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBudgets() {
      try {
        setIsLoading(true);
        const res = await getBudgets();
        const budgetData = res.data || [];
        // Filter to current month budgets
        const now = new Date();
        const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const currentBudgets = budgetData.filter((b: Budget) =>
          b.month.startsWith(currentMonth)
        );
        setBudgets(currentBudgets);
      } catch (err) {
        console.error("Failed to fetch budgets", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchBudgets();
  }, []);

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-primary";
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border/50 p-5 animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="h-5 bg-border/50 rounded w-32"></div>
          <div className="h-5 w-5 bg-border/50 rounded"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="h-4 bg-border/50 rounded w-20 mb-2"></div>
              <div className="h-2 bg-border/50 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border/50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Budget Overview</h2>
        <ChartPieIcon className="h-5 w-5 text-text-muted" />
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-4">
          {budgets.map((budget) => {
            const percentage = Math.round((budget.spent / budget.limit) * 100);
            const remaining = budget.limit - budget.spent;

            return (
              <div key={budget.id} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{budget.category_name}</span>
                  <span className="text-text-muted">
                    ৳{budget.spent.toFixed(0)} of ৳{budget.limit.toFixed(0)}
                  </span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div
                    className={`${getProgressColor(budget.spent, budget.limit)} h-2 rounded-full transition-all`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-text-muted">
                  <span>{percentage}% spent</span>
                  <span className={remaining < 0 ? "text-red-500" : ""}>
                    {remaining >= 0 ? `৳${remaining.toFixed(0)} left` : `৳${Math.abs(remaining).toFixed(0)} over`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center text-text-muted py-4">
          <p className="text-sm">No budgets set for this month</p>
          <p className="text-xs mt-1">Set budgets in Settings to track spending</p>
        </div>
      )}
    </div>
  );
}