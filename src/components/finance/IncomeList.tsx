import { ArrowUpIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getIncomes } from "../../services/api";

type Income = {
  id: number;
  description: string;
  amount: number;
  source: number;
  source_name?: string;
  date: string;
};

type IncomeListProps = {
  filter: string;
  incomeSources: { id: number; name: string }[];
};

export default function IncomeList({ filter, incomeSources }: IncomeListProps) {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchIncomes() {
      try {
        setIsLoading(true);
        const res = await getIncomes();
        // Backend returns {data: [...]} wrapper
        const incomeData = Array.isArray(res) ? res : (res.data || []);
        setIncomes(incomeData);
      } catch (err) {
        console.error("Failed to load incomes", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchIncomes();
  }, [filter, incomeSources]);

  // Build source map for display
  const sourceMap: Record<number, string> = {};
  incomeSources.forEach((s) => {
    sourceMap[s.id] = s.name;
  });

  const filteredIncomes =
    filter.toLowerCase() === "all"
      ? incomes
      : incomes.filter((income) => {
          const srcName = sourceMap[income.source] || "";
          return srcName.toLowerCase() === filter.toLowerCase();
        });

  // Sort by date descending (newest first)
  const sortedIncomes = [...filteredIncomes].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateB - dateA;
  });

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden p-8 text-center text-text-muted">
        Loading incomes...
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h2 className="font-medium">Recent Income</h2>
        <span className="text-sm text-text-muted">{sortedIncomes.length} records</span>
      </div>

      {sortedIncomes.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {sortedIncomes.map((income) => (
            <li key={income.id} className="p-4 hover:bg-background/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <ArrowUpIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{income.description || "No description"}</p>
                    <p className="text-xs text-text-muted capitalize">
                      {sourceMap[income.source] || "uncategorized"} •{" "}
                      {(() => {
                        try {
                          const date = new Date(income.date);
                          return isNaN(date.getTime()) ? 'Invalid date' : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
                        } catch {
                          return 'Invalid date';
                        }
                      })()}
                    </p>
                  </div>
                </div>
                <p className="text-green-600 font-medium">+৳{Number(income.amount).toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-text-muted">
          No income found {filter !== "All" ? `from ${filter}` : ""}
        </div>
      )}
    </div>
  );
}