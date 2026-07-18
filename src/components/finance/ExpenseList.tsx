import { ArrowDownIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getExpenses, deleteExpense } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Expense = {
  id: number;
  description: string;
  amount: number;
  category: number;
  category_name?: string;
  date: string;
};

type Category = {
  id: number;
  name: string;
};

type ExpenseListProps = {
  filter: string;
  categories: Category[];
  onEdit: (expense: Expense) => void;
  onSuccess: () => void;
};

const ITEMS_PER_PAGE = 5;

export default function ExpenseList({ filter, categories, onEdit, onSuccess }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Expense | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchExpenses() {
      try {
        setIsLoading(true);
        const res = await getExpenses();
        const expenseData = Array.isArray(res) ? res : (res.data || []);
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

  // Get current month dates
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter((expense) => {
    const expDate = new Date(expense.date);
    return expDate >= monthStart && expDate <= monthEnd;
  });

  // Apply category filter
  const filteredExpenses = filter.toLowerCase() === "all"
    ? currentMonthExpenses
    : currentMonthExpenses.filter((expense) => {
        const catName = categoryMap[expense.category] || "";
        return catName.toLowerCase() === filter.toLowerCase();
      });

  // Sort by date descending
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Get historical expenses (not current month)
  const historicalExpenses = expenses.filter((expense) => {
    const expDate = new Date(expense.date);
    return expDate < monthStart;
  });

  // Group historical by month
  const groupByMonth = (items: Expense[]) => {
    const grouped: Record<string, Expense[]> = {};
    items.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      const monthLabel = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
      if (!grouped[monthKey]) {
        grouped[monthKey] = [];
      }
      grouped[monthKey].push(item);
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, items]) => {
        const date = new Date(key + "-01");
        const label = date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        return { key, label, items };
      });
  };

  const historicalByMonth = groupByMonth(historicalExpenses);

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setDeletingId(confirmDelete.id);
    try {
      await deleteExpense(confirmDelete.id);
      showToast({ message: "Expense deleted successfully!", type: "success" });
      onSuccess();
    } catch (err) {
      showToast({ message: "Failed to delete expense", type: "error" });
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const displayedExpenses = sortedExpenses.slice(0, ITEMS_PER_PAGE);
  const hasMore = sortedExpenses.length > ITEMS_PER_PAGE;

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden p-8 text-center text-text-muted">
        Loading expenses...
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border/50 flex justify-between items-center">
          <h2 className="font-medium text-accent">Current Month Expenses</h2>
          <span className="text-sm text-text-muted">{sortedExpenses.length} transactions</span>
        </div>

        {sortedExpenses.length > 0 ? (
          <ul className="divide-y divide-border/50">
            {displayedExpenses.map((expense) => (
              <li key={expense.id} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-accent/10 text-accent">
                      <ArrowDownIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text dark:text-gray-100">{expense.description || "No description"}</p>
                      <p className="text-xs text-text-muted capitalize">
                        {categoryMap[expense.category] || "uncategorized"} • {formatDate(expense.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-accent font-medium">-৳{Number(expense.amount).toFixed(2)}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 rounded hover:bg-background text-text-muted hover:text-accent transition-colors"
                        title="Edit expense"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(expense)}
                        disabled={deletingId === expense.id}
                        className="p-1.5 rounded hover:bg-background text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete expense"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-text-muted">
            No expenses found for this month
          </div>
        )}

        {/* View More / View All Button */}
        <div className="p-4 border-t border-border/50 flex justify-between items-center">
          {hasMore ? (
            <span className="text-sm text-text-muted">
              Showing {displayedExpenses.length} of {sortedExpenses.length}
            </span>
          ) : (
            <span className="text-sm text-text-muted">
              {sortedExpenses.length} transactions
            </span>
          )}
          <div className="flex gap-2">
            {historicalExpenses.length > 0 && (
              <Button
                variant="ghostAccent"
                size="sm"
                onClick={() => setIsHistoryModalOpen(true)}
              >
                View All History
              </Button>
            )}
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete !== null}
        title="Delete Expense"
        message={`Are you sure you want to delete "${confirmDelete?.description || 'this expense'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deletingId !== null}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* History Modal */}
      <Transition appear show={isHistoryModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsHistoryModalOpen(false)}>
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
                    <Dialog.Title as="h3" className="text-lg font-medium text-text">
                      Expense History
                    </Dialog.Title>
                    <button
                      onClick={() => setIsHistoryModalOpen(false)}
                      className="text-text-muted hover:text-text p-1"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4">
                    {historicalByMonth.map(({ key, label, items }) => (
                      <div key={key} className="border border-border/50 rounded-lg overflow-hidden">
                        <div className="p-3 bg-background/50 border-b border-border/50">
                          <h4 className="font-medium text-sm text-text">{label}</h4>
                          <p className="text-xs text-text-muted">{items.length} transactions</p>
                        </div>
                        <ul className="divide-y divide-border/30">
                          {items.map((expense) => (
                            <li key={expense.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-accent/10 text-accent">
                                  <ArrowDownIcon className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="text-sm text-text dark:text-gray-200">{expense.description || "No description"}</p>
                                  <p className="text-xs text-text-muted">
                                    {categoryMap[expense.category] || "uncategorized"} • {formatDate(expense.date)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-accent font-medium text-sm">-৳{Number(expense.amount).toFixed(2)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" onClick={() => setIsHistoryModalOpen(false)}>
                      Close
                    </Button>
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