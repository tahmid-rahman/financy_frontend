import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect } from "react";
import Button from "../ui/Button";
import { createExpense } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

type Category = {
  id: number;
  name: string;
};

export default function AddExpenseModal({
  isOpen,
  onClose,
  categories,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSuccess?: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<number>(0);
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  // Update categoryId when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && categoryId === 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleSubmit = async () => {
    if (!amount || !categoryId || categoryId === 0) {
      setError("Amount and category are required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      console.log("Creating expense with:", { amount, description, category: categoryId });
      const result = await createExpense({
        amount,
        description,
        category: categoryId,
      });
      console.log("Expense created:", result);
      showToast({ message: "Expense added successfully!", type: "success" });
      // Reset form
      setAmount("");
      setDescription("");
      setCategoryId(categories[0]?.id || 0);
      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.errors || err?.message || "Failed to add expense";
      showToast({ message: errorMsg, type: "error" });
      setError(typeof errorMsg === "string" ? errorMsg : "Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg text-text font-medium mb-4">
                  Add New Expense
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
                      placeholder="What was this expense for?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">৳</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => {
                          setAmount(e.target.value);
                          setError("");
                        }}
                        className="w-full pl-8 pr-4 py-2 bg-background border border-border/50 text-text rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(Number(e.target.value))}
                      className="w-full px-4 py-2 text-text bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
                    >
                      {categories.length === 0 && <option value="">No categories available</option>}
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {error && <p className="text-sm text-accent">{error}</p>}

                  <div className="pt-4 flex text-text justify-end gap-3">
                    <Button variant="ghostAccent" onClick={onClose} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button variant="accent" onClick={handleSubmit} isLoading={isLoading} disabled={!amount || !categoryId}>
                      Save Expense
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}