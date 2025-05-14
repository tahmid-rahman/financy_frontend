import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";

export default function AddIncomeSourceModal({
  isOpen,
  onClose,
  onAddSource,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddSource: (source: string) => void;
}) {
  const [newSource, setNewSource] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!newSource.trim()) {
      setError("Income source is required");
      return;
    }
    onAddSource(newSource);
    setNewSource("");
    onClose();
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
                  Add New Income Source
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Source Name</label>
                    <input
                      type="text"
                      value={newSource}
                      onChange={(e) => {
                        setNewSource(e.target.value);
                        setError("");
                      }}
                      className="w-full px-4 py-2 text-text bg-background border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      placeholder="e.g. Rental Income"
                    />
                    {error && <p className="mt-1 text-sm text-accent">{error}</p>}
                  </div>

                  <div className="pt-4 flex text-text justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button variant="accent" onClick={handleSubmit}>
                      Add Source
                    </Button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
