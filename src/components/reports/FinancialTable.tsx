import { ArrowDownIcon, ArrowUpIcon } from "@heroicons/react/24/outline";

type FinancialEntry = {
  date: string;
  day: string;
  description: string;
  amount: number;
  category: string;
};

type FinancialTableProps = {
  data: FinancialEntry[];
  type: "income" | "expense";
};

export default function FinancialTable({ data, type }: FinancialTableProps) {
  // Group by category for summary row
  const categorySummary = data.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = 0;
    }
    acc[entry.category] += entry.amount;
    return acc;
  }, {} as Record<string, number>);

  return (
    <table className="min-w-full divide-y divide-border/50">
      <thead className="bg-background">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Date</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Day</th>
          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">
            Description
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">Category</th>
          <th className="px-6 py-3 text-right text-xs font-medium text-text-muted uppercase tracking-wider">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border/50">
        {data.map((entry, idx) => (
          <tr key={idx} className="hover:bg-background/50">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text">
              {new Date(entry.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{entry.day}</td>
            <td className="px-6 py-4 text-sm text-text max-w-xs truncate">{entry.description}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-text-muted">{entry.category}</td>
            <td
              className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                type === "income" ? "text-green-600" : "text-accent"
              }`}
            >
              <div className="flex items-center justify-end gap-1">
                {type === "income" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                {type === "income" ? "+" : "-"}
                {entry.amount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}
              </div>
            </td>
          </tr>
        ))}

        {/* Category Summary */}
        <tr className="bg-background font-medium">
          <td colSpan={4} className="px-6 py-4 text-right text-sm text-text-muted">
            Total by Categories:
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-text">
            <div className="space-y-2">
              {Object.entries(categorySummary).map(([category, total]) => (
                <div key={category} className="flex justify-between items-center">
                  <span className="text-text-muted text-xs">{category}:</span>
                  <span className={`${type === "income" ? "text-green-600" : "text-accent"}`}>
                    {type === "income" ? "+" : "-"}
                    {total.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                </div>
              ))}
            </div>
          </td>
        </tr>

        {/* Grand Total */}
        <tr className="bg-surface border-t-2 border-border">
          <td colSpan={4} className="px-6 py-4 text-right text-sm font-medium text-text">
            Grand Total:
          </td>
          <td
            className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
              type === "income" ? "text-green-600" : "text-accent"
            }`}
          >
            {type === "income" ? "+" : "-"}
            {data
              .reduce((sum, entry) => sum + entry.amount, 0)
              .toLocaleString("en-US", {
                style: "currency",
                currency: "USD",
              })}
          </td>
        </tr>
      </tbody>
    </table>
  );
}
