import Button from "../ui/Button";
import { useState, useEffect } from "react";
import { useToast } from "../../contexts/ToastContext";
import { getExpenses, getIncomes, getCategories, getIncomeSources, getBudgets, createBudget, updateBudget, deleteBudget } from "../../services/api";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { XMarkIcon, PlusIcon, PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";

const themes = [
  { id: "cyan", name: "Cyan", color: "bg-cyan-500" },
  { id: "blue", name: "Blue", color: "bg-blue-500" },
  { id: "green", name: "Green", color: "bg-green-500" },
  { id: "purple", name: "Purple", color: "bg-purple-500" },
  { id: "rose", name: "Rose", color: "bg-rose-500" },
];

const currencies = [
  { code: "BDT", symbol: "৳", name: "Bangladeshi Taka" },
  { code: "USD", symbol: "$", name: "US Dollar" },
];

const languages = [
  { code: "en", name: "English" },
  { code: "bn", name: "বাংলা (Bangla)" },
];

type Category = { id: number; name: string };
type Budget = { id: number; category: number; category_name?: string; limit: number; spent: number; month: string };

export default function SettingsSection() {
  const [currency, setCurrency] = useState("BDT");
  const [language, setLanguage] = useState("en");
  const [currentTheme, setCurrentTheme] = useState("cyan");
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetForm, setBudgetForm] = useState({ categoryId: 0, limit: "", month: "" });
  const [isBudgetSaving, setIsBudgetSaving] = useState(false);
  const [confirmDeleteBudget, setConfirmDeleteBudget] = useState<number | null>(null);
  const { showToast } = useToast();

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem("currency") || "BDT";
    const savedLanguage = localStorage.getItem("language") || "en";
    const savedTheme = localStorage.getItem("theme") || "cyan";

    setCurrency(savedCurrency);
    setLanguage(savedLanguage);
    setCurrentTheme(savedTheme);

    // Apply theme immediately
    if (savedTheme !== "cyan") {
      document.documentElement.classList.add(`theme-${savedTheme}`);
    }

    // Listen for theme changes from other components
    const handleThemeChange = () => {
      const theme = localStorage.getItem("theme") || "cyan";
      setCurrentTheme(theme);
      document.documentElement.className = document.documentElement.className
        .replace(/theme-\w+/g, "")
        .trim();
      if (theme !== "cyan") {
        document.documentElement.classList.add(`theme-${theme}`);
      }
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  // Load categories and budgets
  useEffect(() => {
    async function loadData() {
      try {
        const [catsRes, budgetsRes] = await Promise.all([
          getCategories(),
          getBudgets(),
        ]);
        const catsData = Array.isArray(catsRes) ? catsRes : (catsRes.data || []);
        setCategories(catsData);

        const budgetsData = Array.isArray(budgetsRes) ? budgetsRes : (budgetsRes.data || []);
        // Map category IDs to names and include spent amounts
        const catMap: Record<number, string> = {};
        catsData.forEach((c: Category) => { catMap[c.id] = c.name; });
        const budgetsWithNames = budgetsData.map((b: any) => ({
          ...b,
          category_name: catMap[b.category] || "Unknown",
          spent: b.spent || 0
        }));
        setBudgets(budgetsWithNames);
      } catch (err) {
        console.error("Failed to load settings data", err);
      }
    }
    loadData();
  }, []);

  // Reload budgets after save
  const reloadBudgets = async () => {
    try {
      const budgetsRes = await getBudgets();
      const budgetsData = Array.isArray(budgetsRes) ? budgetsRes : (budgetsRes.data || []);
      const catMap: Record<number, string> = {};
      categories.forEach((c) => { catMap[c.id] = c.name; });
      const budgetsWithNames = budgetsData.map((b: any) => ({
        ...b,
        category_name: catMap[b.category] || "Unknown",
        spent: b.spent || 0
      }));
      setBudgets(budgetsWithNames);
    } catch (err) {
      console.error("Failed to reload budgets", err);
    }
  };

  // Budget management functions
  const openAddBudget = () => {
    const now = new Date();
    setEditingBudget(null);
    setBudgetForm({
      categoryId: categories[0]?.id || 0,
      limit: "",
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
    });
    setIsBudgetModalOpen(true);
  };

  const openEditBudget = (budget: Budget) => {
    setEditingBudget(budget);
    setBudgetForm({
      categoryId: budget.category,
      limit: String(budget.limit),
      month: budget.month
    });
    setIsBudgetModalOpen(true);
  };

  const handleSaveBudget = async () => {
    if (!budgetForm.categoryId || !budgetForm.limit || !budgetForm.month) {
      showToast({ message: "Please fill all fields", type: "error" });
      return;
    }

    setIsBudgetSaving(true);
    try {
      if (editingBudget) {
        await updateBudget(editingBudget.id, { limit: Number(budgetForm.limit) });
        showToast({ message: "Budget updated successfully!", type: "success" });
      } else {
        await createBudget({
          category: budgetForm.categoryId,
          limit: Number(budgetForm.limit),
          month: budgetForm.month
        });
        showToast({ message: "Budget created successfully!", type: "success" });
      }
      // Reload budgets with new spent data
      await reloadBudgets();
      setIsBudgetModalOpen(false);
    } catch (err: any) {
      console.error("Budget save error:", err);
      const errorMsg = err?.errors || err?.message || "Failed to save budget";
      showToast({ message: typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg), type: "error" });
    } finally {
      setIsBudgetSaving(false);
    }
  };

  const handleDeleteBudget = async () => {
    if (!confirmDeleteBudget) return;
    try {
      await deleteBudget(confirmDeleteBudget);
      await reloadBudgets();
      showToast({ message: "Budget deleted", type: "success" });
    } catch (err) {
      showToast({ message: "Failed to delete budget", type: "error" });
    } finally {
      setConfirmDeleteBudget(null);
    }
  };

  const formatMonth = (monthStr: string) => {
    if (!monthStr) return "";
    const parts = monthStr.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const date = new Date(year, month);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  const getProgressColor = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Filter current month budgets
  const now = new Date();
  const currentMonthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentMonthBudgets = budgets.filter(b => b.month && b.month.startsWith(currentMonthPrefix));

  // Calculate totals
  const totalBudget = currentMonthBudgets.reduce((sum, b) => sum + Number(b.limit), 0);
  const totalSpent = currentMonthBudgets.reduce((sum, b) => sum + Number(b.spent || 0), 0);

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("currency", currency);
    localStorage.setItem("language", language);
    localStorage.setItem("theme", currentTheme);

    // Apply theme
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, "")
      .trim();
    if (currentTheme !== "cyan") {
      document.documentElement.classList.add(`theme-${currentTheme}`);
    }

    // Dispatch event
    window.dispatchEvent(new Event("themechange"));

    setTimeout(() => {
      setIsSaving(false);
      showToast({ message: "Settings saved successfully!", type: "success" });
    }, 500);
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    localStorage.setItem("currency", value);
    showToast({ message: `Currency changed to ${value}`, type: "success" });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    localStorage.setItem("language", value);
    const langName = languages.find(l => l.code === value)?.name || value;
    showToast({ message: `Language changed to ${langName}`, type: "success" });
  };

  const handleThemeChange = (themeId: string) => {
    setCurrentTheme(themeId);
    localStorage.setItem("theme", themeId);
    document.documentElement.className = document.documentElement.className
      .replace(/theme-\w+/g, "")
      .trim();
    if (themeId !== "cyan") {
      document.documentElement.classList.add(`theme-${themeId}`);
    }
    window.dispatchEvent(new Event("themechange"));
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const [expensesRes, incomesRes, categoriesRes, sourcesRes] = await Promise.all([
        getExpenses(),
        getIncomes(),
        getCategories(),
        getIncomeSources(),
      ]);

      const expenses = expensesRes.data || [];
      const incomes = incomesRes.data || [];
      const categories: Record<number, string> = {};
      (categoriesRes.data || []).forEach((c: { id: number; name: string }) => {
        categories[c.id] = c.name;
      });
      const sources: Record<number, string> = {};
      (sourcesRes.data || []).forEach((s: { id: number; name: string }) => {
        sources[s.id] = s.name;
      });

      // Get currency symbol for export
      const currencySymbol = currencies.find(c => c.code === currency)?.symbol || "৳";

      // Create expenses CSV
      const expenseHeaders = ["Date", "Category", "Description", "Amount"];
      const expenseRows = expenses.map((e: { date: string; category: number; description: string; amount: number }): string[] => [
        new Date(e.date).toLocaleDateString(),
        categories[e.category] || "Unknown",
        e.description || "-",
        `${currencySymbol}${e.amount}`,
      ]);

      // Create incomes CSV
      const incomeHeaders = ["Date", "Source", "Description", "Amount"];
      const incomeRows = incomes.map((i: { date: string; source: number; description: string; amount: number }): string[] => [
        new Date(i.date).toLocaleDateString(),
        sources[i.source] || "Unknown",
        i.description || "-",
        `${currencySymbol}${i.amount}`,
      ]);

      // Combine into one export
      const csvContent = [
        "=== EXPENSES ===",
        expenseHeaders.map(h => `"${h}"`).join(","),
        ...expenseRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
        "",
        "=== INCOME ===",
        incomeHeaders.map(h => `"${h}"`).join(","),
        ...incomeRows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(",")),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `financy-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);

      showToast({ message: "Data exported successfully!", type: "success" });
    } catch (err) {
      showToast({ message: "Failed to export data", type: "error" });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      showToast({ message: "Account deletion is not implemented yet. Contact support.", type: "info" });
    }
  };

  return (
    <div className="bg-surface border border-border/50 rounded-lg p-6">
      <h2 className="text-lg font-medium mb-6">Application Settings</h2>

      <div className="space-y-6">
        {/* Currency */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Currency</h3>
            <p className="text-sm text-text-muted">Select your preferred currency</p>
          </div>
          <select
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none sm:w-48"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.code} - {curr.name}
              </option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Language</h3>
            <p className="text-sm text-text-muted">Select your preferred language</p>
          </div>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="px-4 py-2 bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none sm:w-48"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        {/* Theme */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h3 className="font-medium">Theme Color</h3>
            <p className="text-sm text-text-muted">Choose your accent color</p>
          </div>
          <div className="flex gap-3 items-center">
            {themes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeChange(theme.id)}
                className={`w-9 h-9 rounded-full ${theme.color} ${
                  currentTheme === theme.id ? "ring-2 ring-offset-2 ring-primary scale-110" : ""
                } hover:scale-110 transition-all`}
                title={theme.name}
              />
            ))}
          </div>
        </div>

        {/* Budget Settings */}
        <div className="pt-6 border-t border-border/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-medium">Monthly Budgets</h3>
              <p className="text-sm text-text-muted">Set spending limits per category</p>
            </div>
            <Button variant="secondary" size="sm" onClick={openAddBudget} className="flex items-center gap-1">
              <PlusIcon className="h-4 w-4" />
              Add Budget
            </Button>
          </div>
          {currentMonthBudgets.length > 0 ? (
            <div className="space-y-2">
              {currentMonthBudgets.map((budget) => (
                <div key={budget.id} className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{budget.category_name}</p>
                    <p className="text-xs text-text-muted">{formatMonth(budget.month)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-accent">৳{Number(budget.limit).toLocaleString()}</span>
                    <button
                      onClick={() => openEditBudget(budget)}
                      className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-accent"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteBudget(budget.id)}
                      className="p-1.5 rounded hover:bg-surface text-text-muted hover:text-red-500"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-4">No budgets set for {formatMonth(currentMonthPrefix)}</p>
          )}
        </div>

        {/* Data Management */}
        <div className="pt-6 border-t border-border/50">
          <h3 className="font-medium mb-4">Data Management</h3>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={handleExportCSV} isLoading={isExporting}>
              Export Data (CSV)
            </Button>
            <Button variant="ghost" className="text-red-500" onClick={handleDeleteAccount}>
              Delete Account
            </Button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6 border-t border-border/50">
          <Button onClick={handleSave} isLoading={isSaving} className="w-full sm:w-auto">
            Save Settings
          </Button>
        </div>
      </div>

      {/* Budget Modal */}
      <Transition appear show={isBudgetModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsBudgetModalOpen(false)}>
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
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium text-text">
                      {editingBudget ? "Edit Budget" : "Add Budget"}
                    </Dialog.Title>
                    <button onClick={() => setIsBudgetModalOpen(false)} className="text-text-muted hover:text-text">
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Category</label>
                      <select
                        value={budgetForm.categoryId}
                        onChange={(e) => setBudgetForm({ ...budgetForm, categoryId: Number(e.target.value) })}
                        disabled={!!editingBudget}
                        className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 outline-none disabled:opacity-50"
                      >
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm text-text-muted mb-1">Budget Limit (৳)</label>
                      <input
                        type="number"
                        value={budgetForm.limit}
                        onChange={(e) => setBudgetForm({ ...budgetForm, limit: e.target.value })}
                        className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 outline-none"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm text-text-muted mb-1">Month</label>
                      <input
                        type="month"
                        value={budgetForm.month}
                        onChange={(e) => setBudgetForm({ ...budgetForm, month: e.target.value })}
                        disabled={!!editingBudget}
                        className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <Button variant="ghostAccent" onClick={() => setIsBudgetModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button variant="accent" onClick={handleSaveBudget} isLoading={isBudgetSaving}>
                      {editingBudget ? "Update" : "Create"}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Delete Budget Confirmation */}
      <Transition appear show={confirmDeleteBudget !== null} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setConfirmDeleteBudget(null)}>
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
                <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium text-text">
                    Delete Budget
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-text-muted">
                    Are you sure you want to delete this budget? This action cannot be undone.
                  </p>
                  <div className="mt-4 flex justify-end gap-3">
                    <Button variant="ghost" onClick={() => setConfirmDeleteBudget(null)}>
                      Cancel
                    </Button>
                    <Button variant="accent" className="bg-red-500 hover:bg-red-600" onClick={handleDeleteBudget}>
                      Delete
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}