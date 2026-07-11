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
        const expenseData = res.data || [];
        setExpenses(expenseData);
      } catch (err) {
        console.error("Failed to load expenses", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchExpenses();
  }, []);

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
        <span className="text-sm text-text-muted">{filteredExpenses.length} records</span>
      </div>

      {filteredExpenses.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {filteredExpenses.map((expense) => (
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
                      {new Date(expense.date).toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
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