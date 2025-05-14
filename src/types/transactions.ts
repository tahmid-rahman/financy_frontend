export interface TransactionFilters {
  type: "all" | "income" | "expense";
  category: string;
  dateRange: string;
  searchQuery: string;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
}

export interface TransactionSummaryProps {
  income: number;
  expenses: number;
  net: number;
}
