import { ChevronDownIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

const ExpenseTable = ({ month }: { month: string }) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Mock data - replace with API call
  const data = {
    columns: [
      { key: "category", name: "Category", width: 180 },
      { key: "date", name: "Date", width: 120 },
      { key: "day", name: "Day", width: 100 },
      { key: "description", name: "Description", width: 200 },
      { key: "amount", name: "Amount", width: 120, align: "right" },
    ],
    rows: [
      {
        id: 1,
        date: "2023-06-05",
        day: "Monday",
        description: "Grocery Shopping",
        amount: 85.32,
        category: "Food",
      },
      {
        id: 2,
        date: "2023-06-07",
        day: "Wednesday",
        description: "Dinner with friends",
        amount: 64.5,
        category: "Food",
      },
      {
        id: 3,
        date: "2023-06-10",
        day: "Saturday",
        description: "Electricity Bill",
        amount: 120.0,
        category: "Utilities",
      },
      {
        id: 4,
        date: "2023-06-15",
        day: "Thursday",
        description: "Internet Subscription",
        amount: 49.99,
        category: "Utilities",
      },
      {
        id: 5,
        date: "2023-06-20",
        day: "Tuesday",
        description: "Gasoline",
        amount: 45.75,
        category: "Transportation",
      },
    ],
  };

  // Group by category
  const groupedData = data.rows.reduce((acc, row) => {
    if (!acc[row.category]) {
      acc[row.category] = [];
    }
    acc[row.category].push(row);
    return acc;
  }, {} as Record<string, typeof data.rows>);

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const totalAmount = data.rows.reduce((sum, row) => sum + row.amount, 0);

  return (
    <div className="overflow-auto rounded-lg border border-border shadow-sm">
      {/* Header */}
      <div className="flex bg-surface border-b border-border sticky top-0 z-10">
        <div className="w-10 flex-shrink-0 border-r border-border"></div>
        {data.columns.map((column) => (
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
          const categoryTotal = rows.reduce((sum, row) => sum + row.amount, 0);
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
                  {data.columns.map((column) => (
                    <div
                      key={`header-${column.key}`}
                      className={`flex-shrink-0 px-4 py-2.5 text-sm ${column.align === "right" ? "text-right" : ""}`}
                      style={{ width: column.width }}
                    >
                      {column.key === "category" ? (
                        <span className="font-medium text-text">{category}</span>
                      ) : column.key === "amount" ? (
                        <span className="font-medium text-red-500 dark:text-red-400">
                          {categoryTotal.toLocaleString("en-US", {
                            style: "currency",
                            currency: "USD",
                          })}
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
                    {data.columns.map((column) => (
                      <div
                        key={`${row.id}-${column.key}`}
                        className={`flex-shrink-0 px-4 py-2 text-sm border-r border-border ${
                          column.align === "right" ? "text-right" : ""
                        }`}
                        style={{ width: column.width }}
                      >
                        {column.key === "date" ? (
                          <span className="text-text-muted">{new Date(row.date).toLocaleDateString()}</span>
                        ) : column.key === "amount" ? (
                          <span className="text-red-500 dark:text-red-400">
                            {row.amount.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD",
                            })}
                          </span>
                        ) : column.key === "day" ? (
                          <span className="text-text-muted">{row.day}</span>
                        ) : column.key === "description" ? (
                          <span className="text-text">{row.description}</span>
                        ) : (
                          <span className="text-text">{row[column.key as keyof typeof row]}</span>
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
        {data.columns.map((column) => (
          <div
            key={`total-${column.key}`}
            className={`flex-shrink-0 px-4 py-3 text-sm ${
              column.key === "description"
                ? "text-text"
                : column.key === "amount"
                ? "text-right text-red-500 dark:text-red-400"
                : "text-text-muted"
            }`}
            style={{ width: column.width }}
          >
            {column.key === "description"
              ? "Total Expenses"
              : column.key === "amount"
              ? totalAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })
              : null}
          </div>
        ))}
      </div>
    </div>
  );
};

const ExpenseByDateTable = ({ month }: { month: string }) => {
  // Mock data - replace with API call
  const data = {
    rows: [
      {
        id: 1,
        date: "2023-06-05",
        amount: 85.32,
      },
      {
        id: 2,
        date: "2023-06-07",
        amount: 64.5,
      },
      {
        id: 3,
        date: "2023-06-10",
        amount: 120.0,
      },
      {
        id: 4,
        date: "2023-06-15",
        amount: 49.99,
      },
      {
        id: 5,
        date: "2023-06-20",
        amount: 45.75,
      },
    ],
  };

  // Group by date and sum amounts
  const groupedByDate = data.rows.reduce((acc, row) => {
    const dateStr = new Date(row.date).toLocaleDateString();
    if (!acc[dateStr]) {
      acc[dateStr] = 0;
    }
    acc[dateStr] += row.amount;
    return acc;
  }, {} as Record<string, number>);

  const totalAmount = data.rows.reduce((sum, row) => sum + row.amount, 0);

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
            <div className="w-1/2 px-4 py-2 text-sm text-right text-red-500 dark:text-red-400">
              {amount.toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Total Row */}
      <div className="flex bg-surface border-t-2 border-border font-medium">
        <div className="w-1/2 px-4 py-3 text-sm text-text">Total</div>
        <div className="w-1/2 px-4 py-3 text-sm text-right text-red-500 dark:text-red-400">
          {totalAmount.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </div>
      </div>
    </div>
  );
};

const ExpenseTables = ({ month }: { month: string }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="col-span-2 bg-surface rounded-2xl shadow-sm p-5 h-fit">
        <h2 className="text-xl font-semibold mb-4 text-text">Expense Summary</h2>
        <ExpenseTable month={month} />
      </div>

      <div className="col-span-1 bg-surface rounded-2xl shadow-sm p-5 h-fit">
        <h2 className="text-xl font-semibold mb-4 text-text">Expenses by Date</h2>
        <ExpenseByDateTable month={month} />
      </div>
    </div>
  );
};

export default ExpenseTables;
