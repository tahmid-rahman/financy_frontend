import { ArrowDownIcon, ArrowUpIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";

const transactions = [
  {
    id: 1,
    description: "Grocery Store",
    amount: -85.32,
    category: "Food",
    date: "Today, 10:45 AM",
    type: "expense",
  },
  {
    id: 2,
    description: "Freelance Payment",
    amount: 1200.0,
    category: "Income",
    date: "Yesterday",
    type: "income",
  },
  {
    id: 3,
    description: "Electric Bill",
    amount: -65.5,
    category: "Utilities",
    date: "Jun 12",
    type: "expense",
  },
];

export default function RecentTransactions() {
  return (
    <div className="bg-surface rounded-lg border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <h2 className="font-medium">Recent Transactions</h2>
      </div>

      <div className="divide-y divide-border/50">
        {transactions.map((txn) => (
          <div key={txn.id} className="p-4 hover:bg-background/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-full ${
                    txn.type === "income" ? "bg-green-100 text-green-600" : "bg-red-100 text-accent"
                  }`}
                >
                  {txn.type === "income" ? <ArrowUpIcon className="h-4 w-4" /> : <ArrowDownIcon className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-medium text-sm">{txn.description}</p>
                  <p className="text-xs text-text-muted">
                    {txn.category} • {txn.date}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-sm ${txn.type === "income" ? "text-green-600" : "text-accent"}`}>
                  {txn.type === "income" ? "+" : ""}${Math.abs(txn.amount).toFixed(2)}
                </span>
                <button className="text-text-muted hover:text-text">
                  <EllipsisHorizontalIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 text-center border-t border-border/50">
        <button className="text-sm text-primary font-medium">View All Transactions</button>
      </div>
    </div>
  );
}
