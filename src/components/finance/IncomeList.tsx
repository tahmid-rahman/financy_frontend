import { ArrowUpIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getIncomes, deleteIncome } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";
import Button from "../ui/Button";
import ConfirmDialog from "../ui/ConfirmDialog";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

type Income = {
  id: number;
  description: string;
  amount: number;
  source: number;
  source_name?: string;
  date: string;
};

type IncomeSource = {
  id: number;
  name: string;
};

type IncomeListProps = {
  filter: string;
  incomeSources: IncomeSource[];
  onEdit: (income: Income) => void;
  onSuccess: () => void;
};

const ITEMS_PER_PAGE = 5;

export default function IncomeList({ filter, incomeSources, onEdit, onSuccess }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Income | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchIncomes() {
      try {
        setIsLoading(true);
        const res = await getIncomes();
        const incomeData = Array.isArray(res) ? res : (res.data || []);
        setIncomes(incomeData);
      } catch (err) {
        console.error("Failed to load incomes", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIncomes();
  }, []);

  // Build source map for display
  const sourceMap: Record<number, string> = {};
  incomeSources.forEach((s) => {
    sourceMap[s.id] = s.name;
  });

  // Get current month dates
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Filter incomes for current month
  const currentMonthIncomes = incomes.filter((income) => {
    const incDate = new Date(income.date);
    return incDate >= monthStart && incDate <= monthEnd;
  });

  // Apply source filter
  const filteredIncomes = filter.toLowerCase() === "all"
    ? currentMonthIncomes
    : currentMonthIncomes.filter((income) => {
        const srcName = sourceMap[income.source] || "";
        return srcName.toLowerCase() === filter.toLowerCase();
      });

  // Sort by date descending
  const sortedIncomes = [...filteredIncomes].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  // Get historical incomes (not current month)
  const historicalIncomes = incomes.filter((income) => {
    const incDate = new Date(income.date);
    return incDate < monthStart;
  });

  // Group historical by month
  const groupByMonth = (items: Income[]) => {
    const grouped: Record<string, Income[]> = {};
    items.forEach((item) => {
      const date = new Date(item.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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

  const historicalByMonth = groupByMonth(historicalIncomes);

  const handleDelete = async () => {
    if (!confirmDelete) return;

    setDeletingId(confirmDelete.id);
    try {
      await deleteIncome(confirmDelete.id);
      showToast({ message: "Income deleted successfully!", type: "success" });
      onSuccess();
    } catch (err) {
      showToast({ message: "Failed to delete income", type: "error" });
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

  const displayedIncomes = sortedIncomes.slice(0, ITEMS_PER_PAGE);
  const hasMore = sortedIncomes.length > ITEMS_PER_PAGE;

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden p-8 text-center text-text-muted">
        Loading incomes...
      </div>
    );
  }

  return (
    <>
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-border/50 flex justify-between items-center">
          <h2 className="font-medium text-primary">Current Month Income</h2>
          <span className="text-sm text-text-muted">{sortedIncomes.length} transactions</span>
        </div>

        {sortedIncomes.length > 0 ? (
          <ul className="divide-y divide-border/50">
            {displayedIncomes.map((income) => (
              <li key={income.id} className="p-4 hover:bg-background/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <ArrowUpIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-text dark:text-gray-100">{income.description || "No description"}</p>
                      <p className="text-xs text-text-muted capitalize">
                        {sourceMap[income.source] || "uncategorized"} • {formatDate(income.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-primary font-medium">+৳{Number(income.amount).toFixed(2)}</p>
                    <div className="flex gap-1">
                      <button
                        onClick={() => onEdit(income)}
                        className="p-1.5 rounded hover:bg-background text-text-muted hover:text-primary transition-colors"
                        title="Edit income"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(income)}
                        disabled={deletingId === income.id}
                        className="p-1.5 rounded hover:bg-background text-text-muted hover:text-red-500 transition-colors disabled:opacity-50"
                        title="Delete income"
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
            No income found for this month
          </div>
        )}

        {/* View More / View All Button */}
        <div className="p-4 border-t border-border/50 flex justify-between items-center">
          {hasMore ? (
            <span className="text-sm text-text-muted">
              Showing {displayedIncomes.length} of {sortedIncomes.length}
            </span>
          ) : (
            <span className="text-sm text-text-muted">
              {sortedIncomes.length} transactions
            </span>
          )}
          <div className="flex gap-2">
            {historicalIncomes.length > 0 && (
              <Button
                variant="ghost"
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
        title="Delete Income"
        message={`Are you sure you want to delete "${confirmDelete?.description || 'this income'}"? This action cannot be undone.`}
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
                      Income History
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
                          {items.map((income) => (
                            <li key={income.id} className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                  <ArrowUpIcon className="h-3 w-3" />
                                </div>
                                <div>
                                  <p className="text-sm text-text dark:text-gray-200">{income.description || "No description"}</p>
                                  <p className="text-xs text-text-muted">
                                    {sourceMap[income.source] || "uncategorized"} • {formatDate(income.date)}
                                  </p>
                                </div>
                              </div>
                              <span className="text-primary font-medium text-sm">+৳{Number(income.amount).toFixed(2)}</span>
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