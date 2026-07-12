import { ArrowDownIcon, ArrowUpIcon, EllipsisHorizontalIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
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
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");

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

        const cats: Record<number, string> = {};
        (categoriesRes.data || []).forEach((c: { id: number; name: string }) => {
          cats[c.id] = c.name;
        });
        const srcs: Record<number, string> = {};
        (sourcesRes.data || []).forEach((s: { id: number; name: string }) => {
          srcs[s.id] = s.name;
        });

        // Combine and sort by date
        const combined: Transaction[] = [
          ...expenses.map((e: any) => ({
            id: e.id,
            description: e.description || "Expense",
            amount: parseFloat(e.amount),
            type: "expense" as const,
            category_or_source: cats[e.category] || "Unknown",
            date: e.date,
          })),
          ...incomes.map((i: any) => ({
            id: i.id,
            description: i.description || "Income",
            amount: parseFloat(i.amount),
            type: "income" as const,
            category_or_source: srcs[i.source] || "Unknown",
            date: i.date,
          })),
        ];

        // Sort by date descending
        combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setTransactions(combined.slice(0, 5));
        setAllTransactions(combined);
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

  const filteredTransactions = filterType === "all"
    ? allTransactions
    : allTransactions.filter(t => t.type === filterType);

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
              <button
                onClick={() => setIsModalOpen(true)}
                className="text-sm text-primary font-medium hover:underline"
              >
                View All Transactions
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-text-muted">
            No transactions yet. Start by adding income or expenses!
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
                        filterType === "income" ? "bg-green-500 text-white" : "bg-background text-text-muted"
                      }`}
                    >
                      <ArrowUpIcon className="h-4 w-4" /> Income
                    </button>
                    <button
                      onClick={() => setFilterType("expense")}
                      className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
                        filterType === "expense" ? "bg-red-500 text-white" : "bg-background text-text-muted"
                      }`}
                    >
                      <ArrowDownIcon className="h-4 w-4" /> Expense
                    </button>
                  </div>

                  {/* Transaction List */}
                  <div className="flex-1 overflow-y-auto space-y-2">
                    {filteredTransactions.length > 0 ? (
                      filteredTransactions.map((txn) => (
                        <div key={`${txn.type}-${txn.id}`} className="flex items-center justify-between p-3 bg-background rounded-lg hover:bg-background/80 transition-colors">
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
                                {txn.category_or_source} • {new Date(txn.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <span className={`font-medium ${txn.type === "income" ? "text-green-600" : "text-accent"}`}>
                            {txn.type === "income" ? "+" : "-"}৳{Math.abs(txn.amount).toFixed(2)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-text-muted">
                        No transactions found
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between">
                    <span className="text-text-muted">Total: {filteredTransactions.length} transactions</span>
                    <span className={`font-medium ${
                      filteredTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0) >= 0
                        ? "text-green-600"
                        : "text-red-500"
                    }`}>
                      Net: ৳{filteredTransactions.reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0).toFixed(2)}
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