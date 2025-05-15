import { useMemo, useState, useEffect } from "react";
import { ChevronDownIcon, ChevronRightIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";

type Column = {
  key: string;
  name: string;
  width?: number;
  minWidth?: number;
  frozen?: boolean;
  formatter?: (value: any) => React.ReactNode;
  headerClass?: string;
  cellClass?: string;
  align?: "left" | "center" | "right";
};

type ExcelLikeTableProps = {
  data: {
    columns: Column[];
    rows: Record<string, any>[];
    summary: {
      total: number;
      byCategory: Record<string, number>;
    };
  };
  type: "income" | "expense";
};

export default function ExcelLikeTable({ data, type }: ExcelLikeTableProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Process data with responsive adjustments
  const { groupedRows, sortedRows } = useMemo(() => {
    // Apply sorting
    let sorted = [...data.rows];
    if (sortConfig) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === "asc" ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    // Group by category
    const groups = sorted.reduce((acc, row) => {
      if (!acc[row.category]) acc[row.category] = [];
      acc[row.category].push(row);
      return acc;
    }, {} as Record<string, typeof sorted>);

    return {
      groupedRows: Object.entries(groups).sort(([a], [b]) => a.localeCompare(b)),
      sortedRows: sorted,
    };
  }, [data.rows, sortConfig]);

  // Responsive column configuration
  const visibleColumns = useMemo(() => {
    if (isMobile) {
      return data.columns.filter((col) => col.key === "date" || col.key === "description" || col.key === "amount");
    }
    return data.columns;
  }, [data.columns, isMobile]);

  const requestSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev?.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  // Format amount with consistent decimals
  const formatAmount = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="relative overflow-auto rounded-lg border border-gray-200 bg-white shadow-xs">
      {/* Table Container */}
      <div className="min-w-full">
        {/* Header Row */}
        <div className="sticky top-0 z-10 flex border-b border-gray-200 bg-gray-50">
          {/* Category Toggle Spacer */}
          <div className="w-10 flex-shrink-0 border-r border-gray-200 md:w-12"></div>

          {visibleColumns.map((column) => (
            <div
              key={column.key}
              className={`flex-shrink-0 px-3 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 ${
                column.frozen ? "sticky left-10 bg-gray-50 z-20 shadow-right md:left-12" : ""
              } ${column.headerClass || ""} ${
                column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"
              }`}
              style={{
                width: isMobile ? column.minWidth || 100 : column.width || 150,
                minWidth: column.minWidth || 100,
              }}
              onClick={() => requestSort(column.key)}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="truncate">{column.name}</span>
                {sortConfig?.key === column.key ? (
                  <span className="text-gray-400 ml-1">{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                ) : (
                  <ArrowsUpDownIcon className="h-3 w-3 text-gray-300" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Data Rows */}
        <div className="divide-y divide-gray-200">
          {groupedRows.map(([category, rows]) => (
            <div key={category} className="bg-white hover:bg-gray-50 transition-colors">
              {/* Category Summary Row */}
              <div className="flex items-center cursor-pointer" onClick={() => toggleCategory(category)}>
                <div className="w-10 flex-shrink-0 flex items-center justify-center py-3 text-gray-400 border-r border-gray-200 md:w-12">
                  {expandedCategories[category] ? (
                    <ChevronDownIcon className="h-4 w-4" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4" />
                  )}
                </div>
                {visibleColumns.map((column) => (
                  <div
                    key={`${category}-${column.key}`}
                    className={`flex-shrink-0 px-3 py-2 text-sm border-r border-gray-200 ${
                      column.frozen ? "sticky left-10 bg-white z-10 shadow-right md:left-12" : ""
                    } ${column.cellClass || ""} ${
                      column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"
                    }`}
                    style={{
                      width: isMobile ? column.minWidth || 100 : column.width || 150,
                      minWidth: column.minWidth || 100,
                    }}
                  >
                    {column.key === "category" ? (
                      <span className="font-medium text-gray-900 truncate">{category}</span>
                    ) : column.key === "amount" ? (
                      <span className={`font-medium ${type === "income" ? "text-green-600" : "text-red-600"}`}>
                        {formatAmount(data.summary.byCategory[category])}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Expanded Rows */}
              {expandedCategories[category] &&
                rows.map((row: Record<string, any>, rowIndex: number) => (
                  <div key={rowIndex} className="flex hover:bg-gray-50/50">
                    <div className="w-10 flex-shrink-0 border-r border-gray-200 md:w-12"></div>
                    {visibleColumns.map((column) => (
                      <div
                        key={`${rowIndex}-${column.key}`}
                        className={`flex-shrink-0 px-3 py-2 text-sm border-r border-gray-200 ${
                          column.frozen ? "sticky left-10 bg-white z-10 shadow-right md:left-12" : ""
                        } ${column.cellClass || ""} ${
                          column.align === "right"
                            ? "text-right"
                            : column.align === "center"
                            ? "text-center"
                            : "text-left"
                        }`}
                        style={{
                          width: isMobile ? column.minWidth || 100 : column.width || 150,
                          minWidth: column.minWidth || 100,
                        }}
                      >
                        {column.formatter ? (
                          column.formatter(row[column.key])
                        ) : (
                          <span className="truncate block">
                            {column.key === "amount" ? (
                              <span
                                className={`inline-flex items-center ${
                                  type === "income" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {type === "income" ? (
                                  <ArrowUpIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                ) : (
                                  <ArrowDownIcon className="h-3 w-3 mr-1 flex-shrink-0" />
                                )}
                                {formatAmount(row[column.key])}
                              </span>
                            ) : (
                              row[column.key]
                            )}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          ))}
        </div>

        {/* Grand Total Row */}
        <div className="sticky bottom-0 flex border-t-2 border-gray-300 bg-gray-50 font-medium">
          <div className="w-10 flex-shrink-0 border-r border-gray-200 md:w-12"></div>
          {visibleColumns.map((column, colIndex) => (
            <div
              key={`total-${colIndex}`}
              className={`flex-shrink-0 px-3 py-3 text-sm border-r border-gray-200 ${
                column.frozen ? "sticky left-10 bg-gray-50 z-10 shadow-right md:left-12" : ""
              } ${column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : "text-left"}`}
              style={{
                width: isMobile ? column.minWidth || 100 : column.width || 150,
                minWidth: column.minWidth || 100,
              }}
            >
              {column.key === "description" ? (
                <span className="text-gray-700">Grand Total</span>
              ) : column.key === "amount" ? (
                <span className={type === "income" ? "text-green-600" : "text-red-600"}>
                  {formatAmount(data.summary.total)}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {/* Responsive Notice */}
      {isMobile && (
        <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-200">
          Scroll horizontally to view all columns
        </div>
      )}
    </div>
  );
}

function ArrowUpIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  );
}

function ArrowDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}
