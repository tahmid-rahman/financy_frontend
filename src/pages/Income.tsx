import { useEffect, useState } from "react";
import IncomeList from "../components/finance/IncomeList";
import AddIncomeModal from "../components/finance/AddIncomeModal";
import EditIncomeModal from "../components/finance/EditIncomeModal";
import AddIncomeSourceModal from "../components/finance/AddIncomeSourceModal";
import Button from "../components/ui/Button";
import FilterDropdown from "../components/ui/FilterDropdown";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";
import { Footer } from "../components/nav";
import { getIncomeSources, getIncomes } from "../services/api";

type IncomeItem = {
  id: number;
  description: string;
  amount: number;
  source: number;
  date: string;
};

type IncomeSummary = {
  totalIncome: number;
  projectedMonthly: number;
  primarySource: string;
  incomeCount: number;
  avgPerTransaction: number;
  vsLastMonth: number;
};

export default function Income() {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isEditIncomeModalOpen, setIsEditIncomeModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [incomeSources, setIncomeSources] = useState<{ id: number; name: string }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedIncome, setSelectedIncome] = useState<IncomeItem | null>(null);
  const [summary, setSummary] = useState<IncomeSummary>({
    totalIncome: 0,
    projectedMonthly: 0,
    primarySource: "-",
    incomeCount: 0,
    avgPerTransaction: 0,
    vsLastMonth: 0,
  });
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [sourcesData, incomesData] = await Promise.all([
          getIncomeSources(),
          getIncomes(),
        ]);

        // Sources
        const sources = Array.isArray(sourcesData) ? sourcesData : (sourcesData.data || []);
        setIncomeSources(sources);

        // Incomes
        const incomes = Array.isArray(incomesData) ? incomesData : (incomesData.data || []);

        // Calculate current month stats
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthIncomes = incomes.filter((i: { date: string }) => {
          const incDate = new Date(i.date);
          return incDate >= monthStart;
        });

        const totalIncome = monthIncomes.reduce((sum: number, i: { amount: number }) => sum + Number(i.amount), 0);
        const incomeCount = monthIncomes.length;
        const avgPerTransaction = incomeCount > 0 ? totalIncome / incomeCount : 0;

        // Calculate vs last month
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastMonthIncomes = incomes.filter((i: { date: string }) => {
          const incDate = new Date(i.date);
          return incDate >= lastMonthStart && incDate <= lastMonthEnd;
        });
        const lastMonthTotal = lastMonthIncomes.reduce((sum: number, i: { amount: number }) => sum + Number(i.amount), 0);
        const vsLastMonth = lastMonthTotal > 0 ? ((totalIncome - lastMonthTotal) / lastMonthTotal) * 100 : 0;

        // Days elapsed vs days in month for projection
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const projectedMonthly = dayOfMonth > 0 ? (totalIncome / dayOfMonth) * daysInMonth : 0;

        // Primary source
        const sourceTotals: Record<number, number> = {};
        monthIncomes.forEach((i: { source: number; amount: number }) => {
          sourceTotals[i.source] = (sourceTotals[i.source] || 0) + Number(i.amount);
        });

        let primarySource = "-";
        let maxAmount = 0;
        Object.entries(sourceTotals).forEach(([srcId, amount]) => {
          if (amount > maxAmount) {
            maxAmount = amount;
            primarySource = sources.find((s: { id: number }) => s.id === Number(srcId))?.name || "Unknown";
          }
        });

        setSummary({
          totalIncome,
          projectedMonthly,
          primarySource,
          incomeCount,
          avgPerTransaction,
          vsLastMonth,
        });
      } catch (err) {
        console.error("Failed to load income data", err);
      } finally {
        setIsLoadingSummary(false);
      }
    }
    fetchData();
  }, [refreshKey]);

  const sourceNames = incomeSources.map((s) => s.name);

  const handleIncomeSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleEditIncome = (income: IncomeItem) => {
    setSelectedIncome(income);
    setIsEditIncomeModalOpen(true);
  };

  const handleAddSource = (newSource: string) => {
    if (!sourceNames.includes(newSource)) {
      setIncomeSources([...incomeSources, { id: Date.now(), name: newSource }]);
    }
  };

  const handleEditSource = (oldName: string, newName: string) => {
    setIncomeSources(incomeSources.map((src) => (src.name === oldName ? { ...src, name: newName } : src)));
  };

  const handleDeleteSource = (name: string) => {
    setIncomeSources(incomeSources.filter((src) => src.name !== name));
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <Helmet>
        <title>Income | Financy</title>
      </Helmet>
      <Navbar />
      {/* Header */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-surface border border-border/50 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Income</h1>
              <p className="text-sm text-text-muted">Track and manage your earnings</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <FilterDropdown
                options={["All", ...sourceNames]}
                activeOption={activeFilter}
                onSelect={setActiveFilter}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSourceModalOpen(true)}
                  className="flex items-center border border-border"
                >
                  Edit Source
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  Add Income
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income List (2/3 width) */}
          <div className="lg:col-span-2">
            <IncomeList
              key={refreshKey}
              filter={activeFilter}
              incomeSources={incomeSources}
              onEdit={handleEditIncome}
              onSuccess={handleIncomeSuccess}
            />
          </div>

          {/* Summary Card (1/3 width) */}
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
                  <span className="text-text-muted">Total Income</span>
                  <div className="text-right">
                    <span className="font-medium text-green-500">৳{summary.totalIncome.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    {summary.vsLastMonth !== 0 && (
                      <span className={`text-xs ml-2 ${summary.vsLastMonth > 0 ? "text-green-500" : "text-red-500"}`}>
                        ({summary.vsLastMonth > 0 ? "+" : ""}{summary.vsLastMonth.toFixed(0)}% vs last month)
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Transactions</span>
                  <span className="font-medium">{summary.incomeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Primary Source</span>
                  <span className="font-medium">{summary.primarySource}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Avg per Transaction</span>
                  <span className="font-medium text-green-500">৳{summary.avgPerTransaction.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="pt-4 border-t border-border/50">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-text-muted">Projected Monthly</span>
                    <span className="text-sm font-medium text-green-500">৳{summary.projectedMonthly.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">Based on {new Date().getDate()} days of data</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      {/* Modals */}
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        incomeSources={incomeSources}
        onSuccess={handleIncomeSuccess}
      />

      <EditIncomeModal
        isOpen={isEditIncomeModalOpen}
        onClose={() => {
          setIsEditIncomeModalOpen(false);
          setSelectedIncome(null);
        }}
        income={selectedIncome}
        incomeSources={incomeSources}
        onSuccess={handleIncomeSuccess}
      />

      <AddIncomeSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        sources={incomeSources}
        onAddSource={handleAddSource}
        onEditSource={handleEditSource}
        onDeleteSource={handleDeleteSource}
      />
    </div>
  );
}