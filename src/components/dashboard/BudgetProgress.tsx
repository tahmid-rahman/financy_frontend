import { ChartPieIcon } from "@heroicons/react/24/outline";

const budgets = [
  { category: "Food", spent: 320, limit: 500, color: "bg-primary" },
  { category: "Entertainment", spent: 120, limit: 200, color: "bg-accent" },
  { category: "Transport", spent: 85, limit: 150, color: "bg-purple-500" },
];

export default function BudgetProgress() {
  return (
    <div className="bg-surface rounded-lg border border-border/50 p-5">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium">Budget Overview</h2>
        <ChartPieIcon className="h-5 w-5 text-text-muted" />
      </div>

      <div className="space-y-4">
        {budgets.map((budget) => {
          const percentage = Math.round((budget.spent / budget.limit) * 100);

          return (
            <div key={budget.category} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{budget.category}</span>
                <span className="text-text-muted">
                  ${budget.spent} of ${budget.limit}
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2">
                <div
                  className={`${budget.color} h-2 rounded-full`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-text-muted text-right">{percentage}% spent</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
