import { useEffect, useState } from "react";
import ExpenseList from "../components/finance/ExpenseList";
import AddExpenseModal from "../components/finance/AddExpenseModal";
import AddCategoryModal from "../components/finance/AddCategoryModal";
import EditCategoryModal from "../components/finance/EditCategoryModal";
import Button from "../components/ui/Button";
import FilterDropdown from "../components/ui/FilterDropdown";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";
import { Footer } from "../components/nav";
import { getCategories } from "../services/api";

export default function Expenses() {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await getCategories();
        setCategories(data.data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      }
    }
    fetchCategories();
  }, []);

  const categoryNames = categories.map((c) => c.name);

  const handleExpenseSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleAddCategory = (newCategory: string) => {
    if (!categoryNames.includes(newCategory)) {
      setCategories([...categories, { id: Date.now(), name: newCategory }]);
    }
  };

  const handleEditCategory = (oldName: string, newName: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.name === oldName ? { ...cat, name: newName } : cat))
    );
  };

  const handleDeleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((cat) => cat.name !== name));
  };

  return (
    <div className="min-h-screen bg-background text-text">
      <Helmet>
        <title>Expenses | Financy</title>
      </Helmet>
      <Navbar />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-surface border border-border/50 rounded-lg p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Expenses</h1>
              <p className="text-sm text-text-muted">Track and manage your spending</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <FilterDropdown
                options={["All", ...categoryNames]}
                activeOption={activeFilter}
                onSelect={setActiveFilter}
              />
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditCategoryModalOpen(true)}
                  className="flex items-center gap-2 border border-primary"
                >
                  Edit Category
                </Button>
                <Button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2">
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <main className="max-w-7xl mx-auto p-4 sm:p-6 mb-16 sm:mb-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ExpenseList
              key={refreshKey}
              filter={activeFilter}
              categories={categories}
            />
          </div>
          <div className="bg-surface border border-border/50 rounded-lg p-5 h-fit sticky top-6">
            <h2 className="font-medium mb-4">Monthly Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-text-muted">Total Spent</span>
                <span className="font-medium">৳0.00</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Daily Average</span>
                <span className="font-medium">৳0.00</span>
              </div>
              <div className="pt-4 border-t border-border/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-text-muted">Budget Remaining</span>
                  <span className="text-sm font-medium">৳0.00</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "0%" }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        categories={categories}
        onSuccess={handleExpenseSuccess}
      />
      <EditCategoryModal
        isOpen={isEditCategoryModalOpen}
        onClose={() => setIsEditCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onEditCategory={handleEditCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}