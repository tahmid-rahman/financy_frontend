import { useState, useEffect } from "react";
import IncomeTable from "../components/reports/IncomeTable";
import ExpenseTable from "../components/reports/ExpenseTable";
import { ArrowDownTrayIcon, ListBulletIcon, RectangleStackIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";
import { Footer } from "../components/nav";
import { getIncomes, getExpenses, getCategories, getIncomeSources } from "../services/api";

export default function Reports() {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");
  const [viewMode, setViewMode] = useState<"table" | "category">("table");
  const [isExporting, setIsExporting] = useState(false);

  // Generate year options (last 5 years)
  const getYearOptions = () => {
    const years = [];
    const now = new Date();
    for (let i = 0; i < 5; i++) {
      years.push(now.getFullYear() - i);
    }
    return years;
  };

  // Generate month options
  const getMonthOptions = () => {
    const months = [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ];
    return months;
  };

  const selectedMonthStr = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (activeTab === "income") {
        const [incomesRes, sourcesRes] = await Promise.all([getIncomes(), getIncomeSources()]);
        const incomes = incomesRes.data || [];
        const sources: Record<number, string> = {};
        (sourcesRes.data || []).forEach((s: { id: number; name: string }) => {
          sources[s.id] = s.name;
        });

        // Filter by selected month and year
        const filtered = incomes.filter((income: { date: string }) => {
          const incomeDate = new Date(income.date);
          return incomeDate.getFullYear() === selectedYear && incomeDate.getMonth() + 1 === selectedMonth;
        });

        // Create CSV content
        const headers = ["Date", "Source", "Description", "Amount"];
        const rows = filtered.map((income: { date: string; source: number; description: string; amount: number }) => [
          new Date(income.date).toLocaleDateString(),
          sources[income.source] || "Unknown",
          income.description || "-",
          income.amount.toString(),
        ]);

        downloadCSV([headers, ...rows], `income-report-${selectedMonthStr}.csv`);
      } else {
        const [expensesRes, categoriesRes] = await Promise.all([getExpenses(), getCategories()]);
        const expenses = expensesRes.data || [];
        const categories: Record<number, string> = {};
        (categoriesRes.data || []).forEach((c: { id: number; name: string }) => {
          categories[c.id] = c.name;
        });

        // Filter by selected month and year
        const filtered = expenses.filter((expense: { date: string }) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === selectedYear && expenseDate.getMonth() + 1 === selectedMonth;
        });

        // Create CSV content
        const headers = ["Date", "Category", "Description", "Amount"];
        const rows = filtered.map((expense: { date: string; category: number; description: string; amount: number }) => [
          new Date(expense.date).toLocaleDateString(),
          categories[expense.category] || "Unknown",
          expense.description || "-",
          expense.amount.toString(),
        ]);

        downloadCSV([headers, ...rows], `expense-report-${selectedMonthStr}.csv`);
      }
    } catch (err) {
      console.error("Export failed", err);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadCSV = (data: string[][], filename: string) => {
    const csvContent = data.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="min-h-screen bg-background  text-text">
      <Helmet>
        <title>Reports | Financy</title>
      </Helmet>
      {/* Header with Tabs */}
      <Navbar />
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <h1 className="text-2xl font-bold text-text">Financial Reports</h1>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Year Selector */}
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-surface text-text appearance-none cursor-pointer"
                >
                  {getYearOptions().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Month Selector */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-surface text-text appearance-none cursor-pointer"
                >
                  {getMonthOptions().map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center border border-border rounded-md overflow-hidden">
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-2 ${viewMode === "table" ? "bg-primary text-white" : "bg-surface text-text-muted hover:bg-background"}`}
                  title="Table View"
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode("category")}
                  className={`p-2 ${viewMode === "category" ? "bg-primary text-white" : "bg-surface text-text-muted hover:bg-background"}`}
                  title="Category View"
                >
                  <RectangleStackIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Export Button */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowDownTrayIcon className="-ml-1 mr-2 h-4 w-4" />
                {isExporting ? "Exporting..." : "Export"}
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => { setActiveTab("income"); setViewMode("table"); }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "income"
                  ? "border-green-500 text-green-500"
                  : "border-transparent text-text-muted hover:text-text hover:border-border"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => { setActiveTab("expense"); setViewMode("table"); }}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "expense"
                  ? "border-red-500 text-red-500"
                  : "border-transparent text-text-muted hover:text-text hover:border-border"
              }`}
            >
              Expenses
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 sm:mb-0">
        <div className="">
          {activeTab === "income" ? (
            viewMode === "category" ? (
              <IncomeByCategoryView month={selectedMonthStr} />
            ) : (
              <IncomeTable month={selectedMonthStr} />
            )
          ) : (
            viewMode === "category" ? (
              <ExpenseByCategoryView month={selectedMonthStr} />
            ) : (
              <ExpenseTable month={selectedMonthStr} />
            )
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Income by Category View Component
function IncomeByCategoryView({ month }: { month: string }) {
  const [data, setData] = useState<{ categories: { name: string; total: number; count: number }[]; grandTotal: number }>({
    categories: [],
    grandTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await getIncomes();
        const incomes = res.data || [];

        // Filter by month
        const [year, monthNum] = month.split("-").map(Number);
        const filtered = incomes.filter((income: { date: string }) => {
          const incomeDate = new Date(income.date);
          return incomeDate.getFullYear() === year && incomeDate.getMonth() + 1 === monthNum;
        });

        // Group by source - use source_name from API response
        const grouped: Record<string, { total: number; count: number }> = {};
        filtered.forEach((income: { source: number; source_name?: string; amount: number }) => {
          const sourceName = income.source_name || "Unknown";
          if (!grouped[sourceName]) grouped[sourceName] = { total: 0, count: 0 };
          grouped[sourceName].total += Number(income.amount);
          grouped[sourceName].count += 1;
        });

        const categories = Object.entries(grouped)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.total - a.total);

        const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

        setData({ categories, grandTotal });
      } catch (err) {
        console.error("Failed to fetch income data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [month]);

  if (isLoading) {
    return <div className="animate-pulse p-8 text-center">Loading...</div>;
  }

  return (
    <div className="bg-surface rounded-lg border border-border/50 p-6">
      <h2 className="text-xl font-semibold mb-4">Income by Source</h2>
      {data.categories.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-text-muted">{cat.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-500">৳{cat.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-text-muted">{((cat.total / data.grandTotal) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-semibold">Total Income</span>
            <span className="font-bold text-green-500 text-xl">৳{data.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </>
      ) : (
        <p className="text-center text-text-muted py-8">No income data for this month</p>
      )}
    </div>
  );
}

// Expense by Category View Component
function ExpenseByCategoryView({ month }: { month: string }) {
  const [data, setData] = useState<{ categories: { name: string; total: number; count: number }[]; grandTotal: number }>({
    categories: [],
    grandTotal: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await getExpenses();
        const expenses = res.data || [];

        // Filter by month
        const [year, monthNum] = month.split("-").map(Number);
        const filtered = expenses.filter((expense: { date: string }) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.getFullYear() === year && expenseDate.getMonth() + 1 === monthNum;
        });

        // Group by category - use category_name from API response
        const grouped: Record<string, { total: number; count: number }> = {};
        filtered.forEach((expense: { category: number; category_name?: string; amount: number }) => {
          const catName = expense.category_name || "Unknown";
          if (!grouped[catName]) grouped[catName] = { total: 0, count: 0 };
          grouped[catName].total += Number(expense.amount);
          grouped[catName].count += 1;
        });

        const categories_data = Object.entries(grouped)
          .map(([name, stats]) => ({ name, ...stats }))
          .sort((a, b) => b.total - a.total);

        const grandTotal = categories_data.reduce((sum, c) => sum + c.total, 0);

        setData({ categories: categories_data, grandTotal });
      } catch (err) {
        console.error("Failed to fetch expense data", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [month]);

  if (isLoading) {
    return <div className="animate-pulse p-8 text-center">Loading...</div>;
  }

  return (
    <div className="bg-surface rounded-lg border border-border/50 p-6">
      <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
      {data.categories.length > 0 ? (
        <>
          <div className="space-y-3">
            {data.categories.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-sm text-text-muted">{cat.count} transactions</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-500">৳{cat.total.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  <p className="text-sm text-text-muted">{((cat.total / data.grandTotal) * 100).toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
            <span className="font-semibold">Total Expenses</span>
            <span className="font-bold text-red-500 text-xl">৳{data.grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
          </div>
        </>
      ) : (
        <p className="text-center text-text-muted py-8">No expense data for this month</p>
      )}
    </div>
  );
}