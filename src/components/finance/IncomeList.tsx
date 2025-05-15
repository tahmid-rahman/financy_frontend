import { ArrowUpIcon } from "@heroicons/react/24/outline";

type Income = {
  id: number;
  description: string;
  amount: number;
  source: string;
  date: string;
};

type IncomeListProps = {
  filter: string;
  incomeSources: string[];
};

const mockIncome: Income[] = [
  {
    id: 1,
    description: "Monthly Salary",
    amount: 3500.0,
    source: "Salary",
    date: "Jun 1",
  },
  {
    id: 2,
    description: "Freelance Project",
    amount: 1200.0,
    source: "Freelance",
    date: "Jun 10",
  },
  {
    id: 3,
    description: "Stock Dividends",
    amount: 245.6,
    source: "Investments",
    date: "Jun 15",
  },
];

export default function IncomeList({ filter, incomeSources }: IncomeListProps) {
  const filteredIncome =
    filter.toLowerCase() === "all"
      ? mockIncome
      : mockIncome.filter((income) =>
          incomeSources.some(
            (source) =>
              source.toLowerCase() === filter.toLowerCase() && income.source.toLowerCase() === filter.toLowerCase()
          )
        );

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h2 className="font-medium">Recent Income</h2>
        <span className="text-sm text-text-muted">{filteredIncome.length} records</span>
      </div>

      {filteredIncome.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {filteredIncome.map((income) => (
            <li key={income.id} className="p-4 hover:bg-background/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-green-100 text-green-600">
                    <ArrowUpIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{income.description}</p>
                    <p className="text-xs text-text-muted capitalize">
                      {income.source} • {income.date}
                    </p>
                  </div>
                </div>
                <p className="text-green-600 font-medium">+৳{income.amount.toFixed(2)}</p>
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
