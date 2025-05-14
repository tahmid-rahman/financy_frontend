import { useState } from "react";
import TaskList from "../components/tasks/TaskList";
import CalendarView from "../components/tasks/CalendarView";
import AddTaskModal from "../components/tasks/AddTaskModal";
import Button from "../components/ui/Button";
import { Tabs } from "../components/ui/Tabs";
import Navbar from "../components/nav/Navbar";

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");

  return (
    <div className="min-h-screen bg-background text-text">
      <Navbar />
      {/* Header */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="bg-surface border-b border-border/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Tasks & Schedule</h1>
              <p className="text-sm text-text-muted">Manage your daily activities</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <Tabs
          tabs={[
            { id: "list", label: "List View" },
            { id: "calendar", label: "Calendar" },
          ]}
          activeTab={activeView}
          onTabChange={(tabId) => setActiveView(tabId as "list" | "calendar")}
        />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">{activeView === "list" ? <TaskList /> : <CalendarView />}</main>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
