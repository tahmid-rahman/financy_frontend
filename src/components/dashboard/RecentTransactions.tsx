import { ArrowUpIcon, ArrowDownIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState, useMemo } from "react";
import { getExpenses, getIncomes, getCategories, getIncomeSources } from "../../services/api";

// Safe date parsing utility
const safeParseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

const formatDate = (dateStr: string | null | undefined): string => {
  const date = safeParseDate(dateStr);
  if (!date) return "Unknown date";
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

type Transaction = {
  id: number;
  description: string;
  amount: number;
  type: "income" | "expense";
  category_or_source: string;
  date: string;
};

type MonthGroup = {
  month: string;
  monthLabel: string;
  transactions: Transaction[];
  totalIncome: number;
  totalExpense: number;
};

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

  useEffect(() => {
    let cancelled = false;

    async function fetchTransactions() {
      try {
        setIsLoading(true);

        const [expensesRes, incomesRes, categoriesRes, sourcesRes] = await Promise.all([
          getExpenses(),
          getIncomes(),
          getCategories(),
          getIncomeSources(),
        ]);

        if (cancelled) return;

        // Backend returns { message: "...", data: [...] }
        const expenses = expensesRes?.data?.data || expensesRes?.data || expensesRes || [];
        const incomes = incomesRes?.data?.data || incomesRes?.data || incomesRes || [];

        const cats: Record<number, string> = {};
        (categoriesRes?.data?.data || categoriesRes?.data || []).forEach((c: { id: number; name: string }) => {
          cats[c.id] = c.name;
        });
        const srcs: Record<number, string> = {};
        (sourcesRes?.data?.data || sourcesRes?.data || []).forEach((s: { id: number; name: string }) => {
          srcs[s.id] = s.name;
        });

        // Combine and sort by date
        const combined: Transaction[] = [];

        for (const e of expenses) {
          const parsedDate = safeParseDate(e.date);
          if (parsedDate) {
            combined.push({
              id: e.id,
              description: e.description || "Expense",
              amount: parseFloat(e.amount) || 0,
              type: "expense" as const,
              category_or_source: cats[e.category] || "Unknown",
              date: e.date,
            });
          }
        }

        for (const i of incomes) {
          const parsedDate = safeParseDate(i.date);
          if (parsedDate) {
            combined.push({
              id: i.id,
              description: i.description || "Income",
              amount: parseFloat(i.amount) || 0,
              type: "income" as const,
              category_or_source: srcs[i.source] || "Unknown",
              date: i.date,
            });
          }
        }

        // Sort by date descending (safe parsing)
        combined.sort((a, b) => {
          const dateA = safeParseDate(a.date);
          const dateB = safeParseDate(b.date);
          if (!dateA && !dateB) return 0;
          if (!dateA) return 1;
          if (!dateB) return -1;
          return dateB.getTime() - dateA.getTime();
        });

        setTransactions(combined.slice(0, 10));
        setAllTransactions(combined);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchTransactions();

    return () => {
      cancelled = true;
    };
  }, []);

  // Group transactions by month
  const groupedByMonth = useMemo(() => {
    const filtered = filterType === "all"
      ? allTransactions
      : allTransactions.filter(t => t.type === filterType);

    const groups: Record<string, Transaction[]> = {};

    filtered.forEach(txn => {
      const date = safeParseDate(txn.date);
      if (!date) return; // Skip transactions with invalid dates

      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(txn);
    });

    const monthGroups: MonthGroup[] = Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 3)
      .map(([month, txns]) => {
        const [year, monthNum] = month.split("-");
        const date = new Date(parseInt(year), parseInt(monthNum) - 1);
        return {
          month,
          monthLabel: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
          transactions: txns.slice(0, 5),
          totalIncome: txns.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0),
          totalExpense: txns.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0),
        };
      });

    return monthGroups;
  }, [allTransactions, filterType]);

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
    <>
      <div className="bg-surface rounded-lg border border-border/50 overflow-hidden">
        <div className="p-5 border-b border-border/50">
          <h2 className="font-medium">Recent Transactions</h2>
        </div>

        {groupedByMonth.length > 0 ? (
          <div className="divide-y divide-border/50">
            {groupedByMonth.map((monthGroup) => (
              <div key={monthGroup.month}>
                {/* Month Header */}
                <div className="px-4 py-3 bg-background/50 border-b border-border/30">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-muted">{monthGroup.monthLabel}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-primary">+৳{monthGroup.totalIncome.toLocaleString()}</span>
                      <span className="text-accent">-৳{monthGroup.totalExpense.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Transactions for this month */}
                {monthGroup.transactions.map((txn) => (
                  <div key={`${txn.type}-${txn.id}`} className="p-4 hover:bg-background/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-full ${
                            txn.type === "income" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
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
                        <span className={`text-sm font-medium ${txn.type === "income" ? "text-primary" : "text-accent"}`}>
                          {txn.type === "income" ? "+" : "-"}৳{Math.abs(txn.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-text-muted">
            No transactions yet. Start by adding income or expenses!
          </div>
        )}

        {allTransactions.length > 0 && (
          <div className="p-3 text-center border-t border-border/50">
            <button
              onClick={() => setIsModalOpen(true)}
              className="text-sm text-primary font-medium hover:underline"
            >
              View All Transactions
            </button>
          </div>
        )}
      </div>

      {/* View All Transactions Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-2xl max-h-[80vh] transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium">
                      All Transactions
                    </Dialog.Title>
                    <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Filter Buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setFilterType("all")}
                      className={`px-3 py-1.5 rounded-full text-sm ${
                        filterType === "all" ? "bg-primary text-white" : "bg-background text-text-muted"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType("income")}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                        filterType === "income" ? "bg-primary text-white" : "bg-background text-text-muted"
                      }`}
                    >
                      <ArrowUpIcon className="h-4 w-4" /> Income
                    </button>
                    <button
                      onClick={() => setFilterType("expense")}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                        filterType === "expense" ? "bg-accent text-white" : "bg-background text-text-muted"
                      }`}
                    >
                      <ArrowDownIcon className="h-4 w-4" /> Expense
                    </button>
                  </div>

                  {/* Transaction List - Grouped by Month */}
                  <div className="flex-1 overflow-y-auto space-y-4">
                    {groupedByMonth.map((monthGroup) => (
                      <div key={monthGroup.month}>
                        <div className="sticky top-0 bg-surface py-2 border-b border-border/30">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-text-muted">{monthGroup.monthLabel}</span>
                            <div className="flex items-center gap-3 text-xs">
                              <span className="text-primary">+৳{monthGroup.totalIncome.toLocaleString()}</span>
                              <span className="text-accent">-৳{monthGroup.totalExpense.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2 mt-2">
                          {monthGroup.transactions.map((txn) => (
                            <div key={`${txn.type}-${txn.id}`} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
                              <div className="flex items-center gap-3">
                                <div
                                  className={`p-2 rounded-full ${
                                    txn.type === "income" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
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
                                    {txn.category_or_source} • {safeParseDate(txn.date)?.toLocaleDateString() || "Unknown"}
                                  </p>
                                </div>
                              </div>
                              <span className={`font-medium ${txn.type === "income" ? "text-primary" : "text-accent"}`}>
                                {txn.type === "income" ? "+" : "-"}৳{Math.abs(txn.amount).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {groupedByMonth.length === 0 && (
                      <div className="text-center py-8 text-text-muted">
                        No transactions found
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <span className="text-text-muted">Total: {allTransactions.length} transactions</span>
                    <span className={`font-medium ${
                      allTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0) >= 0
                        ? "text-primary"
                        : "text-accent"
                    }`}>
                      Net: ৳{allTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0).toFixed(2)}
                    </span>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}