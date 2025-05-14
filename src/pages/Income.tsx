import { useState } from "react";
import IncomeList from "../components/finance/IncomeList";
import AddIncomeModal from "../components/finance/AddIncomeModal";
import AddIncomeSourceModal from "../components/finance/AddIncomeSourceModal";
import Button from "../components/ui/Button";
import FilterDropdown from "../components/ui/FilterDropdown";
import Navbar from "../components/nav/Navbar";

export default function Income() {
  const [isIncomeModalOpen, setIsIncomeModalOpen] = useState(false);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [incomeSources, setIncomeSources] = useState(["Salary", "Freelance", "Investments", "Gifts"]);

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      {/* Header */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-surface border border-border/50 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Income</h1>
              <p className="text-sm text-text-muted">Track and manage your earnings</p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <FilterDropdown
                options={["All", ...incomeSources]}
                activeOption={activeFilter}
                onSelect={setActiveFilter}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghostAccent"
                  size="sm"
                  onClick={() => setIsSourceModalOpen(true)}
                  className="flex items-center border border-accent"
                >
                  + Source
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  onClick={() => setIsIncomeModalOpen(true)}
                  className="flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Add Income
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Income List (2/3 width) */}
          <div className="lg:col-span-2">
            <IncomeList filter={activeFilter} incomeSources={incomeSources} />
          </div>

          {/* Summary Card (1/3 width) */}
          <div className="bg-surface border border-border/50 rounded-lg p-5 h-fit sticky top-6">
            <h2 className="font-medium mb-4">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Income</span>
                <span className="font-medium">৳4,245.60</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Primary Source</span>
                <span className="font-medium">Salary (62%)</span>
              </div>
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-text-muted">Projected Monthly</span>
                  <span className="text-sm font-medium">৳4,800.00</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "88%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <AddIncomeModal
        isOpen={isIncomeModalOpen}
        onClose={() => setIsIncomeModalOpen(false)}
        incomeSources={incomeSources}
      />

      <AddIncomeSourceModal
        isOpen={isSourceModalOpen}
        onClose={() => setIsSourceModalOpen(false)}
        onAddSource={(newSource) => {
          if (!incomeSources.includes(newSource)) {
            setIncomeSources([...incomeSources, newSource]);
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
