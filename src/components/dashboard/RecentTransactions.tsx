import { ArrowDownIcon, ArrowUpIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getExpenses, getIncomes, getCategories, getIncomeSources } from "../../services/api";

type Transaction = {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_or_source: string;
  date: string;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        setIsLoading(true);

        const [expensesRes, incomesRes, categoriesRes, sourcesRes] = await Promise.all([
          getExpenses(),
          getIncomes(),
          getCategories(),
          getIncomeSources(),
        ]);

        const expenses = expensesRes.data || [];
        const incomes = incomesRes.data || [];
        const categories: Record<number, string> = {};
        const sources: Record<number, string> = {};

        (categoriesRes.data || []).forEach((c: { id: number; name: string }) => {
          categories[c.id] = c.name;
        });
        (sourcesRes.data || []).forEach((s: { id: number; name: string }) => {
          sources[s.id] = s.name;
        });

        // Combine and sort by date
        const combined: Transaction[] = [
          ...expenses.map((e: any) => ({
            id: e.id,
            description: e.description || "Expense",
            amount: parseFloat(e.amount),
            type: "expense" as const,
            category_or_source: categories[e.category] || "Unknown",
            date: e.date,
          })),
          ...incomes.map((i: any) => ({
            id: i.id,
            description: i.description || "Income",
            amount: parseFloat(i.amount),
            type: "income" as const,
            category_or_source: sources[i.source] || "Unknown",
            date: i.date,
          })),
        ];

        // Sort by date descending and take top 5
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setTransactions(combined.slice(0, 5));
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTransactions();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-lg border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <div className="h-6 bg-border/50 rounded w-40 animate-pulse"></div>
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 bg-border/50 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-border/50 rounded w-32 mb-2"></div>
                <div className="h-3 bg-border/50 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-lg border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="font-medium">Recent Transactions</h2>
      </div>

      {transactions.length > 0 ? (
        <>
          <div className="divide-y divide-border/50">
            {transactions.map((txn) => (
              <div key={`${txn.type}-${txn.id}`} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        txn.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-accent"
                      }`}
                    >
                      {txn.type === "income" ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{txn.description}</p>
                      <p className="text-xs text-text-muted">
                        {txn.category_or_source} • {formatDate(txn.date)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${txn.type === "income" ? "text-green-600" : "text-accent"}`}>
                      {txn.type === "income" ? "+" : "-"}৳{Math.abs(txn.amount).toFixed(2)}
                    </span>
                    <button className="text-text-muted hover:text-text">
                      <EllipsisHorizontalIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 text-center border-t border-border/50">
            <a href="/reports" className="text-sm text-primary font-medium hover:underline">
              View All Transactions
            </a>
          </div>
        </>
      ) : (
        <div className="p-8 text-center text-text-muted">
          No transactions yet. Start by adding income or expenses!
        </div>
      )}
    </div>
  );
}