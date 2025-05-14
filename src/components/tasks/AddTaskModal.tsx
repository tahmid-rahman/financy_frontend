import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import Button from "../ui/Button";

export default function AddTaskModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

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
                  Add New Task
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Task Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                      placeholder="What needs to be done?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-text-muted mb-1">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none dark:[&::-webkit-calendar-picker-indicator]:invert"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-text-muted mb-1">Start Time</label>
                      <input
                        type="time"
                        onChange={(e) => {
                          // Handle time input
                        }}
                        className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none dark:[&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-text-muted mb-1">End Time</label>
                      <input
                        type="time"
                        onChange={(e) => {
                          // Handle time input
                        }}
                        className="w-full px-4 py-2 bg-background border text-text border-border/50 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none dark:[&::-webkit-calendar-picker-indicator]:invert"
                      />
                    </div>
                  </div>

                  {/* <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allDay"
                      className="rounded border-border/50 text-primary focus:ring-primary/50"
                    />
                    <label htmlFor="allDay" className="text-sm text-text-muted">
                      All-day event
                    </label>
                  </div> */}
                  <div>
                    <label className="block text-sm text-text-muted mb-1">Priority</label>
                    <div className="flex gap-3">
                      {(["low", "medium", "high"] as const).map((level) => (
                        <button
                          key={level}
                          onClick={() => setPriority(level)}
                          className={`px-3 py-1.5 text-sm rounded-md border ${
                            priority === level
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border text-text-muted hover:bg-background"
                          }`}
                        >
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 text-text flex justify-end gap-3">
                    <Button variant="secondary" size="md" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      size="md"
                      onClick={() => {
                        // Handle save logic
                        onClose();
                      }}
                    >
                      Add Task
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
