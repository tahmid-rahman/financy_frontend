import { ArrowDownIcon } from "@heroicons/react/24/outline";

type Expense = {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
};

type ExpenseListProps = {
  filter: string;
  categories: string[];
};

const mockExpenses: Expense[] = [
  {
    id: 1,
    description: "Grocery Shopping",
    amount: 85.32,
    category: "food",
    date: "Today, 10:45 AM",
  },
  {
    id: 2,
    description: "Electric Bill",
    amount: 65.5,
    category: "bills",
    date: "Jun 12",
  },
  {
    id: 3,
    description: "Uber Ride",
    amount: 22.4,
    category: "transport",
    date: "Jun 10",
  },
];

export default function ExpenseList({ filter, categories }: ExpenseListProps) {
  const filteredExpenses =
    filter.toLowerCase() === "all"
      ? mockExpenses
      : mockExpenses.filter((exp) =>
          categories.some((cat) => cat.toLowerCase() === filter.toLowerCase() && exp.category === filter.toLowerCase())
        );

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-border/50 flex justify-between items-center">
        <h2 className="font-medium">Recent Expenses</h2>
        <span className="text-sm text-text-muted">{filteredExpenses.length} records</span>
      </div>

      {filteredExpenses.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {filteredExpenses.map((expense) => (
            <li key={expense.id} className="p-4 hover:bg-background/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-red-100 text-accent">
                    <ArrowDownIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{expense.description}</p>
                    <p className="text-xs text-text-muted capitalize">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                </div>
                <p className="text-accent font-medium">-৳{expense.amount.toFixed(2)}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-text-muted">
          No expenses found {filter !== "All" ? `for ${filter}` : ""}
        </div>
      )}
    </div>
  );
}
