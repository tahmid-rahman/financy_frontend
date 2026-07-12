import { ArrowDownIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getExpenses } from "../../services/api";

type Expense = {
  id: number;
  description: string;
  amount: number;
  category: number;
  category_name?: string;
  date: string;
};

type ExpenseListProps = {
  filter: string;
  categories: { id: number; name: string }[];
};

export default function ExpenseList({ filter, categories }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setIsLoading(true);
        const res = await getExpenses();
        // Backend returns {data: [...]} wrapper
        const expenseData = Array.isArray(res) ? res : (res.data || []);
        setExpenses(expenseData);
      } catch (err) {
        console.error("Failed to load expenses", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpenses();
  }, [filter, categories]);

  // Build category map for display
  const categoryMap: Record<number, string> = {};
  categories.forEach((c) => {
    categoryMap[c.id] = c.name;
  });

  const filteredExpenses =
    filter.toLowerCase() === "all"
      ? expenses
      : expenses.filter((exp) => {
          const catName = categoryMap[exp.category] || "";
          return catName.toLowerCase() === filter.toLowerCase();
        });

  // Sort by date descending (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden p-8 text-center text-text-muted">
        Loading expenses...
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h2 className="font-medium">Recent Expenses</h2>
        <span className="text-sm text-text-muted">{sortedExpenses.length} records</span>
      </div>

      {sortedExpenses.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {sortedExpenses.map((expense) => (
            <li key={expense.id} className="p-4 hover:bg-background/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 text-accent">
                    <ArrowDownIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expense.description || "No description"}</p>
                    <p className="text-xs text-text-muted capitalize">
                      {categoryMap[expense.category] || "uncategorized"} •{" "}
                      {(() => {
                        try {
                          const date = new Date(expense.date);
                          return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
                        } catch {
                          return 'Invalid date';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <p className="text-accent font-medium">-৳{Number(expense.amount).toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-text-muted">
          No expenses found {filter !== "All" ? `for ${filter}` : ""}
        </div>
      )}
    </div>
  );
}