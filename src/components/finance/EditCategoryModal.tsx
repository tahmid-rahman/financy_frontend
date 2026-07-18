import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";
import { FaTrash } from "react-icons/fa";
import { addCategory, updateCategory, deleteCategory } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

type Category = {
  id: number;
  name: string;
};

type Mode = "select" | "add" | "edit";

export default function EditCategoryModal({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
}: {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  onEditCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("select");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const resetForm = () => {
    setMode("select");
    setSelectedCategory(null);
    setCategoryName("");
    setError("");
  };

  const handleSubmit = async () => {
    const trimmed = categoryName.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (mode === "edit" && selectedCategory) {
        await updateCategory(selectedCategory.id, trimmed);
        showToast({ message: "Category updated successfully!", type: "success" });
        onEditCategory(selectedCategory.name, trimmed);
      } else if (mode === "add") {
        await addCategory(trimmed);
        onAddCategory(trimmed);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.errors || err?.message || `Failed to ${mode === "add" ? "add" : "update"} category`;
      showToast({ message: errorMsg, type: "error" });
      setError(typeof errorMsg === "string" ? errorMsg : "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) {
      setError("Please select a category");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await deleteCategory(selectedCategory.id);
      showToast({ message: "Category deleted successfully!", type: "success" });
      onDeleteCategory(selectedCategory.name);
      resetForm();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.errors || err?.message || "Failed to delete category";
      showToast({ message: errorMsg, type: "error" });
      setError(typeof errorMsg === "string" ? errorMsg : "Failed to delete category");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (cat: Category) => {
    setSelectedCategory(cat);
    setCategoryName(cat.name);
    setError("");
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg text-text font-medium mb-4">
                  {mode === "select" ? "Category Management" : mode === "add" ? "Add New Category" : "Edit Category"}
                </Dialog.Title>

                {mode === "select" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Button variant="accent" onClick={() => setMode("add")} className="w-full justify-center" isLoading={isLoading}>
                        Add New Category
                      </Button>
                      {categories.length > 0 && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => setMode("edit")}
                            className="w-full justify-center text-text-muted"
                            isLoading={isLoading}
                          >
                            Edit Existing Category
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button variant="ghostAccent" onClick={onClose} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mode === "edit" && (
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Select Category</label>
                        <select
                          value={selectedCategory?.id || ""}
                          onChange={(e) => {
                            const cat = categories.find((c) => c.id === Number(e.target.value));
                            if (cat) handleCategorySelect(cat);
                          }}
                          className="w-full px-4 py-2 text-text bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
                        >
                          <option value="">Select a category</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-text-muted mb-1">
                        {mode === "add" ? "Category Name" : "New Name"}
                      </label>
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => {
                          setCategoryName(e.target.value);
                          setError("");
                        }}
                        className="w-full px-4 py-2 text-text bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-accent/50 focus:border-accent outline-none"
                        placeholder={`e.g. ${mode === "add" ? "Utilities" : "Enter new name"}`}
                      />
                      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <div>
                        {mode === "edit" && selectedCategory && (
                          <Button variant="delete" onClick={handleDelete} isLoading={isLoading}>
                            <FaTrash className="inline mr-1" />
                            Delete
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="ghostAccent"
                          onClick={() => {
                            if (mode === "edit" && !selectedCategory) {
                              setMode("select");
                            } else {
                              resetForm();
                            }
                          }}
                          disabled={isLoading}
                        >
                          Back
                        </Button>
                        <Button
                          variant="accent"
                          onClick={handleSubmit}
                          isLoading={isLoading}
                          disabled={!categoryName.trim()}
                        >
                          {mode === "add" ? "Add Category" : "Save Changes"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}