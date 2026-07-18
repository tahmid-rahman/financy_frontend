import { ChartPieIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getBudgets } from "../../services/api";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

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
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;

    async function fetchBudgets() {
      try {
        setIsLoading(true);
        const res = await getBudgets();
        if (cancelled) return;

        // Backend returns { message: "...", data: [...] }
        const budgetData = res?.data?.data || res?.data || [];

        // Filter to current month budgets (handle both "YYYY-MM" and "YYYY-MM-DD" formats)
        const now = new Date();
        const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const currentBudgets = budgetData.filter((b: Budget) =>
          b.month && b.month.startsWith(currentMonthPrefix)
        );
        if (!cancelled) setBudgets(currentBudgets);
      } catch (err) {
        console.error("Failed to fetch budgets", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchBudgets();

    return () => {
      cancelled = true;
    };
  }, []);

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatMonth = (monthStr: string) => {
    // Handle both "YYYY-MM" and "YYYY-MM-DD" formats
    if (!monthStr) return "";
    const parts = monthStr.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const date = new Date(year, month);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
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

  // Calculate totals
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
  const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="bg-surface rounded-lg border border-border/50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Budget Overview</h2>
        <ChartPieIcon className="h-5 w-5 text-text-muted" />
      </div>

      {budgets.length > 0 ? (
        <div className="space-y-5">
          {/* Overall Budget Summary */}
          <div className="p-3 bg-background rounded-lg border border-border/50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Total Budget</span>
              <span className="text-lg font-bold text-green-500">
                ৳{totalBudget.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-text-muted">Total Spent</span>
              <span className={`font-semibold ${totalSpent > totalBudget ? "text-red-500" : "text-green-500"}`}>
                ৳{totalSpent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-text-muted">Remaining</span>
              <span className={`font-semibold ${totalBudget - totalSpent < 0 ? "text-red-500" : "text-green-500"}`}>
                ৳{Math.abs(totalBudget - totalSpent).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                {totalBudget - totalSpent < 0 ? " over" : " left"}
              </span>
            </div>
            <div className="mt-3 w-full bg-surface rounded-full h-3">
              <div
                className={`${getProgressColor(totalSpent, totalBudget)} h-3 rounded-full transition-all`}
                style={{ width: `${Math.min(overallPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5 text-right">
              {overallPercentage.toFixed(0)}% used
            </p>
          </div>

          {/* Individual Budget Categories */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-text-muted">By Category</h3>
            {budgets.map((budget) => {
              const percentage = Math.min(Math.round((budget.spent / budget.limit) * 100), 100);
              const remaining = budget.limit - budget.spent;

              return (
                <div key={budget.id} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">{budget.category_name}</span>
                    <span className="text-text-muted">
                      ৳{budget.spent.toLocaleString()} / ৳{budget.limit.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className={`${getProgressColor(budget.spent, budget.limit)} h-2 rounded-full transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{percentage}% spent</span>
                    <span className={remaining < 0 ? "text-red-500 font-medium" : ""}>
                      {remaining >= 0
                        ? `৳${remaining.toLocaleString()} remaining`
                        : `৳${Math.abs(remaining).toLocaleString()} over budget`
                      }
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Month indicator */}
          <div className="pt-3 border-t border-border/50 text-center">
            <p className="text-xs text-text-muted">
              Budget for {formatMonth(budgets[0]?.month || "")}
            </p>
          </div>
        </div>
      ) : (
        <div className="text-center py-6">
          <ChartPieIcon className="h-10 w-10 mx-auto text-text-muted/50 mb-3" />
          <p className="text-sm text-text-muted">No budgets set for this month</p>
          <p className="text-xs mt-1 text-text-muted/70 mb-3">Set budgets in Settings to track spending</p>
          <Button variant="secondary" size="sm" onClick={() => navigate("/profile")}>
            Set Budget in Settings
          </Button>
        </div>
      )}
    </div>
  );
}