import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";

export default function AddIncomeModal({
  isOpen,
  onClose,
  incomeSources,
}: {
  isOpen: boolean;
  onClose: () => void;
  incomeSources: string[];
}) {
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState(incomeSources[0] || "");
  const [description, setDescription] = useState("");

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
                  Add New Income
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Description</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      placeholder="Income source description"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-muted">৳</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-4 py-2 bg-background text-text border border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    >
                      {incomeSources.map((src) => (
                        <option key={src} value={src}>
                          {src}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 flex text-text justify-end gap-3">
                    <Button variant="secondary" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      variant="accent"
                      onClick={() => {
                        // Handle save logic
                        onClose();
                      }}
                    >
                      Add Income
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
