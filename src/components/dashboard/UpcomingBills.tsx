import { CalendarIcon } from "@heroicons/react/24/outline";

const bills = [
  { name: "Rent Payment", amount: 1200, dueDate: "2023-06-20" },
  { name: "Internet Bill", amount: 65, dueDate: "2023-06-22" },
  { name: "Netflix Subscription", amount: 15.99, dueDate: "2023-06-25" },
];

export default function UpcomingBills() {
  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold mb-4">Upcoming Bills</h2>
      <div className="space-y-4">
        {bills.map((bill, index) => (
          <div
            key={index}
            className="flex justify-between items-center p-3 hover:bg-background rounded-lg transition-colors"
          >
            <div>
              <p className="font-medium">{bill.name}</p>
              <p className="text-sm text-text-muted flex items-center gap-1">
                <CalendarIcon className="h-3 w-3" />
                Due {bill.dueDate}
              </p>
            </div>
            <p className="font-medium text-accent">-${bill.amount.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
