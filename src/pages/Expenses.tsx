import { useState } from "react";
import ExpenseList from "../components/finance/ExpenseList";
import AddExpenseModal from "../components/finance/AddExpenseModal";
import AddCategoryModal from "../components/finance/AddCategoryModal";
import Button from "../components/ui/Button";
import FilterDropdown from "../components/ui/FilterDropdown";
import Navbar from "../components/nav/Navbar";

export default function Expenses() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categories, setCategories] = useState(["Food", "Bills", "Transport", "Shopping"]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      {/* Header */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-surface border border-border/50 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Expenses</h1>
              <p className="text-sm text-text-muted">Track and manage your spending</p>
            </div>
            <div className="flex overflow:flex-col gap-3 w-full sm:w-auto">
              <FilterDropdown options={["All", ...categories]} activeOption={activeFilter} onSelect={setActiveFilter} />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCategoryModalOpen(true)}
                  className="flex items-center gap-2 border border-primary"
                >
                  + Category
                </Button>
                <Button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2">
                  <PlusIcon className="h-4 w-4" />
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Expense List (2/3 width) */}
          <div className="lg:col-span-2">
            <ExpenseList filter={activeFilter} categories={categories} />
          </div>

          {/* Summary Card (1/3 width) */}
          <div className="bg-surface border border-border/50 rounded-lg p-5 h-fit sticky top-6">
            <h2 className="font-medium mb-4">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Spent</span>
                <span className="font-medium">৳1,245.60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Daily Average</span>
                <span className="font-medium">৳41.52</span>
              </div>
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-text-muted">Budget Remaining</span>
                  <span className="text-sm font-medium">৳754.40</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "62%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={categories}
      />

      <AddCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onAddCategory={(newCategory) => {
          if (!categories.includes(newCategory)) {
            setCategories([...categories, newCategory]);
          }
        }}
      />
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
    </svg>
  );
}
