import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getIncomes } from "../../services/api";

// Safe date parsing utility
const safeParseDate = (dateStr: string | null | undefined): Date | null => {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
};

type Income = {
  id: number;
  description: string;
  amount: number;
  source: number;
  source_name?: string;
  date: string;
};

const IncomeTable = ({ month }: { month: string }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await getIncomes();
        // API now returns data directly
        const incomeData: Income[] = res?.data || res || [];

        // Filter by month with safe date parsing
        const filtered = incomeData.filter((income) => {
          const incomeDate = safeParseDate(income.date);
          if (!incomeDate) return false;
          const [year, monthNum] = month.split("-").map(Number);
          return incomeDate.getFullYear() === year && incomeDate.getMonth() + 1 === monthNum;
        });

        setIncomes(filtered);
      } catch (err) {
        console.error("Failed to fetch income data", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [month]);

  // Group by source
  const groupedData = incomes.reduce((acc, row) => {
    const sourceName = row.source_name || "Unknown";
    if (!acc[sourceName]) {
      acc[sourceName] = [];
    }
    acc[sourceName].push(row);
    return acc;
  }, {} as Record<string, Income[]>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const totalAmount = incomes.reduce((sum, row) => sum + parseFloat(String(row.amount)), 0);

  const columns = [
    { key: "category", name: "Source", width: 180 },
    { key: "date", name: "Date", width: 120 },
    { key: "day", name: "Day", width: 100 },
    { key: "description", name: "Description", width: 200 },
    { key: "amount", name: "Amount", width: 120, align: "right" as const },
  ];

  if (isLoading) {
    return (
      <div className="overflow-auto rounded-lg border border-border shadow-sm animate-pulse">
        <div className="h-12 bg-surface border-b border-border"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-background border-b border-border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="flex bg-surface border-b border-border sticky top-0 z-10">
        <div className="w-10 flex-shrink-0 border-r border-border"></div>
        {columns.map((column) => (
          <div
            key={column.key}
            className={`flex-shrink-0 px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider`}
            style={{ width: column.width }}
          >
            {column.name}
          </div>
        ))}
      </div>

      {/* Data Rows */}
      <div className="divide-y divide-border">
        {Object.entries(groupedData).map(([category, rows]) => {
          const categoryTotal = rows.reduce((sum, row) => sum + parseFloat(String(row.amount)), 0);
          return (
            <div key={category} className="">
              {/* Category Header */}
              <div
                className="flex items-center hover:bg-surface-hover cursor-pointer transition-colors duration-150"
                onClick={() => toggleCategory(category)}
              >
                <div className="w-10 flex-shrink-0 flex items-center justify-center py-3 text-text-muted border-r border-border">
                  {expandedCategories[category] ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </div>
                <div className="flex">
                  {columns.map((column) => (
                    <div
                      key={`header-${column.key}`}
                      className={`flex-shrink-0 px-4 py-2.5 text-sm ${column.align === "right" ? "text-right" : ""}`}
                      style={{ width: column.width }}
                    >
                      {column.key === "category" ? (
                        <span className="font-medium text-text">{category}</span>
                      ) : column.key === "amount" ? (
                        <span className="font-medium text-green-500 dark:text-green-400">
                          ৳{categoryTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              {/* Expanded Rows */}
              {expandedCategories[category] &&
                rows.map((row) => (
                  <div key={row.id} className="flex hover:bg-surface-hover transition-colors duration-150">
                    <div className="w-10 flex-shrink-0 border-r border-border"></div>
                    {columns.map((column) => (
                      <div
                        key={`${row.id}-${column.key}`}
                        className={`flex-shrink-0 px-4 py-2 text-sm border border-border ${
                          column.align === "right" ? "text-right" : ""
                        }`}
                        style={{ width: column.width }}
                      >
                        {column.key === "date" ? (
                          <span className="text-text-muted">{safeParseDate(row.date)?.toLocaleDateString() || "-"}</span>
                        ) : column.key === "amount" ? (
                          <span className="text-green-500 dark:text-green-400">
                            ৳{parseFloat(String(row.amount)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                        ) : column.key === "day" ? (
                          <span className="text-text-muted">
                            {safeParseDate(row.date)?.toLocaleDateString("en-US", { weekday: "long" }) || "-"}
                          </span>
                        ) : column.key === "description" ? (
                          <span className="text-text">{row.description || "-"}</span>
                        ) : (
                          <span className="text-text">{String(row[column.key as keyof Income])}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          );
        })}
      </div>

      {/* Total Row */}
      <div className="flex bg-surface border-t-2 border-border font-medium">
        <div className="w-10 flex-shrink-0 border-r border-border"></div>
        {columns.map((column) => (
          <div
            key={`total-${column.key}`}
            className={`flex-shrink-0 px-4 py-3 text-sm ${
              column.key === "description"
                ? "text-text"
                : column.key === "amount"
                ? "text-right text-green-500 dark:text-green-400"
                : "text-text-muted"
            }`}
            style={{ width: column.width }}
          >
            {column.key === "description"
              ? "Total Income"
              : column.key === "amount"
              ? `৳${totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
              : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const IncomeByDateTable = ({ month }: { month: string }) => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const res = await getIncomes();
        // API now returns data directly
        const incomeData: Income[] = res?.data || res || [];

        // Filter by month with safe date parsing
        const filtered = incomeData.filter((income) => {
          const incomeDate = safeParseDate(income.date);
          if (!incomeDate) return false;
          const [year, monthNum] = month.split("-").map(Number);
          return incomeDate.getFullYear() === year && incomeDate.getMonth() + 1 === monthNum;
        });

        setIncomes(filtered);
      } catch (err) {
        console.error("Failed to fetch income data", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [month]);

  // Group by date and sum amounts with safe date parsing
  const groupedByDate = incomes.reduce((acc, row) => {
    const parsedDate = safeParseDate(row.date);
    if (!parsedDate) return acc;
    const dateStr = parsedDate.toLocaleDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    acc[dateStr] += parseFloat(String(row.amount));
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = incomes.reduce((sum, row) => sum + parseFloat(String(row.amount)), 0);

  if (isLoading) {
    return (
      <div className="overflow-auto rounded-lg border border-border shadow-sm animate-pulse">
        <div className="h-12 bg-surface border-b border-border"></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-10 bg-background border-b border-border"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="flex bg-surface border-b border-border sticky top-0 z-10">
        <div className="flex-shrink-0 px-4 py-3 w-1/2 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
          Date
        </div>
        <div className="flex-shrink-0 px-4 py-3 w-1/2 text-right text-xs font-medium text-text-muted uppercase tracking-wider">
          Amount
        </div>
      </div>

      {/* Data Rows */}
      <div className="divide-y divide-border">
        {Object.entries(groupedByDate).map(([date, amount]) => (
          <div key={date} className="flex hover:bg-surface-hover transition-colors duration-150">
            <div className="w-1/2 px-4 py-2 text-sm text-text">{date}</div>
            <div className="w-1/2 px-4 py-2 text-sm text-right text-green-500 dark:text-green-400">
              ৳{amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          </div>
        ))}
      </div>

      {/* Total Row */}
      <div className="flex bg-surface border-t-2 border-border font-medium">
        <div className="w-1/2 px-4 py-3 text-sm text-text">Total</div>
        <div className="w-1/2 px-4 py-3 text-sm text-right text-green-500 dark:text-green-400">
          ৳{totalAmount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

const IncomeTables = ({ month }: { month: string }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-2xl shadow-sm p-5 h-fit">
        <h2 className="text-xl font-semibold mb-4 text-text">Income Summary</h2>
        <IncomeTable month={month} />
      </div>

      <div className="col-span-1 bg-surface rounded-2xl shadow-sm p-5 h-fit">
        <h2 className="text-xl font-semibold mb-4 text-text">Income by Date</h2>
        <IncomeByDateTable month={month} />
      </div>
    </div>
  );
};

export default IncomeTables;