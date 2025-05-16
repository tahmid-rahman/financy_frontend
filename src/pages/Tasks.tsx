import { useState } from "react";
import TaskList from "../components/tasks/TaskList";
import CalendarView from "../components/tasks/CalendarView";
import AddTaskModal from "../components/tasks/AddTaskModal";
import Button from "../components/ui/Button";
import { Tabs } from "../components/ui/Tabs";
import Navbar from "../components/nav/Navbar";
import { Helmet } from "react-helmet";
import { Footer } from "../components/nav";

export default function Tasks() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"list" | "calendar">("list");

  return (
    <div className="min-h-screen bg-background text-text">
      <Helmet>
        <title>Schedule | Financy</title>
      </Helmet>
      <Navbar />
      {/* Header */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 ">
        <div className="bg-surface border-b border-border/50 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Tasks & Schedule</h1>
              <p className="text-sm text-text-muted">Manage your daily activities</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2">
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
      <main className="max-w-7xl mx-auto p-4 sm:p-6 mb-16 sm:mb-0">
        {activeView === "list" ? <TaskList /> : <CalendarView />}
      </main>

      {/* Add Task Modal */}
      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <Footer />
    </div>
  );
}
