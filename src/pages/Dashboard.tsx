import { useAuth } from "../contexts/AuthContext";
import {
  FinancialSummary,
  SpendingChart,
  RecentTransactions,
  BudgetProgress,
  UpcomingBills,
} from "../components/dashboard";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";
import { Footer } from "../components/nav";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-text">
      <Helmet>
        <title>Dashboard | Financy</title>
      </Helmet>
      {/* Header */}
      <Navbar />
      <header className="bg-surface border-b border-border/50">
        {/* Welcome back, <span className="font-medium text-primary">{user?.name}</span> */}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-16 sm:mb-0">
        {/* Financial Overview */}
        <section className="mb-8">
          <FinancialSummary />
        </section>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Column */}
          <div className="lg:col-span-2 space-y-6">
            <SpendingChart />
            <RecentTransactions />
          </div>

          {/* Secondary Column */}
          <div className="space-y-6">
            <BudgetProgress />
            <UpcomingBills />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
