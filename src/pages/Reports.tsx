import { useState } from "react";
import IncomeTable from "../components/reports/IncomeTable";
import ExpenseTable from "../components/reports/ExpenseTable";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";

export default function Reports() {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM format
  );
  const [activeTab, setActiveTab] = useState<"income" | "expense">("income");

  return (
    <div className="min-h-screen bg-background  text-text">
      <Helmet>
        <title>Reports | Financy</title>
      </Helmet>
      {/* Header with Tabs */}
      <Navbar />
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4">
            <h1 className="text-2xl font-bold text-text">Financial Reports</h1>

            <div className="flex items-center gap-4 w-full sm:w-auto">
              {/* Month Selector */}
              <div className="relative flex-1 sm:flex-none min-w-[200px]">
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-border focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-surface text-text"
                >
                  {Array.from({ length: 12 }, (_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    return (
                      <option key={date.toISOString()} value={date.toISOString().slice(0, 7)}>
                        {date.toLocaleDateString("default", { month: "long", year: "numeric" })}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Export Button */}
              <button className="inline-flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                <ArrowDownTrayIcon className="-ml-1 mr-2 h-4 w-4" />
                Export
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("income")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "income"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text hover:border-border"
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setActiveTab("expense")}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "expense"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-muted hover:text-text hover:border-border"
              }`}
            >
              Expenses
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="">
          {activeTab === "income" ? <IncomeTable month={selectedMonth} /> : <ExpenseTable month={selectedMonth} />}
        </div>
      </main>
    </div>
  );
}
