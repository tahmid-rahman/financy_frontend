import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";
import { addSource, updateIncomeSource, deleteIncomeSource } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

type IncomeSource = {
  id: number;
  name: string;
};

type Mode = "select" | "add" | "edit";

export default function SourceManagementModal({
  isOpen,
  onClose,
  sources,
  onAddSource,
  onEditSource,
  onDeleteSource,
}: {
  isOpen: boolean;
  onClose: () => void;
  sources: IncomeSource[];
  onAddSource: (sourceName: string) => void;
  onEditSource: (oldName: string, newName: string) => void;
  onDeleteSource: (name: string) => void;
}) {
  const [mode, setMode] = useState<Mode>("select");
  const [selectedSource, setSelectedSource] = useState<IncomeSource | null>(null);
  const [sourceName, setSourceName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToast();

  const resetForm = () => {
    setMode("select");
    setSelectedSource(null);
    setSourceName("");
    setError("");
  };

  const handleSubmit = async () => {
    const trimmed = sourceName.trim();
    if (!trimmed) {
      setError("Source name is required");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      if (mode === "add") {
        await addSource(trimmed);
        showToast({ message: "Source added successfully!", type: "success" });
        onAddSource(trimmed);
      } else if (mode === "edit" && selectedSource) {
        await updateIncomeSource(selectedSource.id, trimmed);
        showToast({ message: "Source updated successfully!", type: "success" });
        onEditSource(selectedSource.name, trimmed);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.errors || err?.message || `Failed to ${mode === "add" ? "add" : "update"} source`;
      showToast({ message: errorMsg, type: "error" });
      setError(typeof errorMsg === "string" ? errorMsg : "Operation failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSource) {
      setError("Please select a source");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await deleteIncomeSource(selectedSource.id);
      showToast({ message: "Source deleted successfully!", type: "success" });
      onDeleteSource(selectedSource.name);
      resetForm();
      onClose();
    } catch (err: any) {
      const errorMsg = err?.errors || err?.message || "Failed to delete source";
      showToast({ message: errorMsg, type: "error" });
      setError(typeof errorMsg === "string" ? errorMsg : "Failed to delete source");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSourceSelect = (src: IncomeSource) => {
    setSelectedSource(src);
    setSourceName(src.name);
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
                  {mode === "select" ? "Manage Income Sources" : mode === "add" ? "Add New Source" : "Edit Source"}
                </Dialog.Title>

                {mode === "select" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        onClick={() => setMode("add")}
                        className="w-full justify-center"
                        isLoading={isLoading}
                      >
                        Add New Source
                      </Button>
                      {sources.length > 0 && (
                        <Button
                          variant="secondary"
                          onClick={() => setMode("edit")}
                          className="w-full justify-center text-text-muted"
                          isLoading={isLoading}
                        >
                          Edit Existing Source
                        </Button>
                      )}
                    </div>
                    <div className="pt-2 flex justify-end">
                      <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mode === "edit" && (
                      <div>
                        <label className="block text-sm text-text-muted mb-1">Select Source</label>
                        <select
                          value={selectedSource?.id || ""}
                          onChange={(e) => {
                            const src = sources.find((s) => s.id === Number(e.target.value));
                            if (src) handleSourceSelect(src);
                          }}
                          className="w-full px-4 py-2 text-text bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                        >
                          <option value="">Select a source</option>
                          {sources.map((source) => (
                            <option key={source.id} value={source.id}>
                              {source.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-sm text-text-muted mb-1">
                        {mode === "add" ? "Source Name" : "New Name"}
                      </label>
                      <input
                        type="text"
                        value={sourceName}
                        onChange={(e) => {
                          setSourceName(e.target.value);
                          setError("");
                        }}
                        className="w-full px-4 py-2 text-text bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                        placeholder={`e.g. ${mode === "add" ? "Freelance Income" : "Enter new name"}`}
                      />
                      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
                    </div>

                    <div className="pt-4 flex justify-between">
                      <div>
                        {mode === "edit" && selectedSource && (
                          <Button variant="delete" onClick={handleDelete} isLoading={isLoading}>
                            Delete Source
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            if (mode === "edit" && !selectedSource) {
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
                          onClick={handleSubmit}
                          variant="primary"
                          isLoading={isLoading}
                          disabled={!sourceName.trim()}
                        >
                          {mode === "add" ? "Add Source" : "Save Changes"}
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