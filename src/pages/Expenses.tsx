import { useEffect, useState } from "react";
import ExpenseList from "../components/finance/ExpenseList";
import AddExpenseModal from "../components/finance/AddExpenseModal";
import EditCategoryModal from "../components/finance/EditCategoryModal";
import Button from "../components/ui/Button";
import FilterDropdown from "../components/ui/FilterDropdown";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";
import { Footer } from "../components/nav";
import { getCategories, getExpenses, getBudgets } from "../services/api";

type ExpenseSummary = {
  totalSpent: number;
  dailyAverage: number;
  budgetLimit: number;
  budgetRemaining: number;
  budgetUsedPercent: number;
  topCategory: string;
  transactionCount: number;
  vsLastMonth: number; // percentage change vs last month
};

export default function Expenses() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState<ExpenseSummary>({
    totalSpent: 0,
    dailyAverage: 0,
    budgetLimit: 0,
    budgetRemaining: 0,
    budgetUsedPercent: 0,
    topCategory: "-",
    transactionCount: 0,
    vsLastMonth: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catsData, expensesData, budgetsData] = await Promise.all([
          getCategories(),
          getExpenses(),
          getBudgets(),
        ]);

        // Categories
        const cats = Array.isArray(catsData) ? catsData : (catsData.data || []);
        setCategories(cats);

        // Expenses
        const expenses = Array.isArray(expensesData) ? expensesData : (expensesData.data || []);

        // Calculate current month stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthExpenses = expenses.filter((e: { date: string }) => {
          const expDate = new Date(e.date);
          return expDate >= monthStart;
        });

        const totalSpent = monthExpenses.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0);
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayOfMonth = now.getDate();
        const dailyAverage = dayOfMonth > 0 ? totalSpent / dayOfMonth : 0;
        const transactionCount = monthExpenses.length;

        // Calculate vs last month
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthExpenses = expenses.filter((e: { date: string }) => {
          const expDate = new Date(e.date);
          return expDate >= lastMonthStart && expDate <= lastMonthEnd;
        });
        const lastMonthTotal = lastMonthExpenses.reduce((sum: number, e: { amount: number }) => sum + Number(e.amount), 0);
        const vsLastMonth = lastMonthTotal > 0 ? ((totalSpent - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        // Budget info
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
        const monthBudget = budgetsData.find((b: { month: string }) => b.month && b.month.startsWith(currentMonthStr));
        const budgetLimit = monthBudget ? Number(monthBudget.limit) : 0;
        const budgetRemaining = budgetLimit > 0 ? Math.max(0, budgetLimit - totalSpent) : 0;
        const budgetUsedPercent = budgetLimit > 0 ? Math.min(100, (totalSpent / budgetLimit) * 100) : 0;

        // Top category
        const categoryTotals: Record<number, number> = {};
        monthExpenses.forEach((e: { category: number; amount: number }) => {
          categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
        });

        let topCategory = "-";
        let maxAmount = 0;
        Object.entries(categoryTotals).forEach(([catId, amount]) => {
          if (amount > maxAmount) {
            maxAmount = amount;
            topCategory = cats.find((c: { id: number }) => c.id === Number(catId))?.name || "Unknown";
          }
        });

        setSummary({
          totalSpent,
          dailyAverage,
          budgetLimit,
          budgetRemaining,
          budgetUsedPercent,
          topCategory,
          transactionCount,
          vsLastMonth,
        });
      } catch (err) {
        console.error("Failed to load expenses data", err);
      } finally {
        setIsLoadingSummary(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  const categoryNames = categories.map((c) => c.name);

  const handleExpenseSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categoryNames.includes(newCategory)) {
      setCategories([...categories, { id: Date.now(), name: newCategory }]);
    }
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.name === oldName ? { ...cat, name: newName } : cat))
    );
  };

  const handleDeleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((cat) => cat.name !== name));
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <Helmet>
        <title>Expenses | Financy</title>
      </Helmet>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-surface border border-border/50 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Expenses</h1>
              <p className="text-sm text-text-muted">Track and manage your spending</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <FilterDropdown
                options={["All", ...categoryNames]}
                activeOption={activeFilter}
                onSelect={setActiveFilter}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditCategoryModalOpen(true)}
                  className="flex items-center gap-2 border border-primary"
                >
                  Edit Category
                </Button>
                <Button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2">
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 mb-16 sm:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpenseList
              key={refreshKey}
              filter={activeFilter}
              categories={categories}
            />
          </div>
          <div className="bg-surface border border-border/50 rounded-lg p-5 h-fit sticky top-6">
            <h2 className="font-medium mb-4">Monthly Summary</h2>
            {isLoadingSummary ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-border/50 rounded w-full"></div>
                <div className="h-4 bg-border/50 rounded w-full"></div>
                <div className="h-4 bg-border/50 rounded w-full"></div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-muted">Total Spent</span>
                  <div className="text-right">
                    <span className="font-medium">৳{summary.totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {summary.vsLastMonth !== 0 && (
                      <span className={`text-xs ml-2 ${summary.vsLastMonth > 0 ? "text-red-500" : "text-green-500"}`}>
                        ({summary.vsLastMonth > 0 ? "+" : ""}{summary.vsLastMonth.toFixed(0)}% vs last month)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Transactions</span>
                  <span className="font-medium">{summary.transactionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Daily Average</span>
                  <span className="font-medium">৳{summary.dailyAverage.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Top Category</span>
                  <span className="font-medium">{summary.topCategory}</span>
                </div>
                {summary.budgetLimit > 0 && (
                  <div className="pt-4 border-t border-border/50">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-text-muted">Budget Remaining</span>
                      <span className="text-sm font-medium">৳{summary.budgetRemaining.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${summary.budgetUsedPercent > 90 ? "bg-red-500" : summary.budgetUsedPercent > 70 ? "bg-yellow-500" : "bg-primary"}`}
                        style={{ width: `${summary.budgetUsedPercent}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted mt-1">{summary.budgetUsedPercent.toFixed(0)}% used of ৳{summary.budgetLimit.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={categories}
        onSuccess={handleExpenseSuccess}
      />
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}