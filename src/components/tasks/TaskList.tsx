import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useCallback, useMemo } from "react";
import EditTaskModal from "./EditTaskModal";
import { getTasks, updateTask, deleteTask } from "../../services/api";
import { useToast } from "../../contexts/ToastContext";

type Task = {
  id: number;
  title: string;
  due_date: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
  start_time?: string | null;
  end_time?: string | null;
  all_day?: boolean;
};

const TASKS_PER_PAGE = 10;

export default function TaskList() {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [displayedTasks, setDisplayedTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "pending" | "completed">("all");
  const [sortBy, setSortBy] = useState<"due_date" | "priority" | "created">("due_date");
  const [isViewAllModalOpen, setIsViewAllModalOpen] = useState(false);
  const { showToast } = useToast();

  // Fetch all tasks once
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getTasks();
      // Backend returns { message: "...", data: [...] }
      const rawData = response?.data;
      const tasks: Task[] = rawData?.data || rawData || [];
      setAllTasks(tasks);
    } catch (error) {
      showToast({
        message: "Failed to fetch tasks",
        type: "error",
      });
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // Run on mount

  // Filter and sort tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = [...allTasks];

    // Filter
    if (activeFilter === "pending") {
      filtered = filtered.filter((t) => !t.completed);
    } else if (activeFilter === "completed") {
      filtered = filtered.filter((t) => t.completed);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "priority") {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      } else if (sortBy === "due_date") {
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      return b.id - a.id; // created - newest first
    });

    return filtered;
  }, [allTasks, activeFilter, sortBy]);

  // Update displayed tasks when filter/sort changes
  useEffect(() => {
    setDisplayedTasks(filteredAndSortedTasks.slice(0, TASKS_PER_PAGE));
  }, [filteredAndSortedTasks]);

  const hasMoreTasks = filteredAndSortedTasks.length > TASKS_PER_PAGE;

  const loadMoreTasks = () => {
    const nextBatch = filteredAndSortedTasks.slice(
      displayedTasks.length,
      displayedTasks.length + TASKS_PER_PAGE
    );
    setDisplayedTasks([...displayedTasks, ...nextBatch]);
  };

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const taskToUpdate = allTasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const response = await updateTask(taskId, {
        completed: !taskToUpdate.completed,
      });

      // Backend returns { message: "...", data: {...} }
      const updatedTask = response?.data || response;

      setAllTasks(allTasks.map((task) => (task.id === taskId ? updatedTask : task)));

      showToast({
        message: `Task marked as ${updatedTask.completed ? "completed" : "incomplete"}`,
        type: "success",
      });
    } catch (error) {
      showToast({
        message: "Failed to update task",
        type: "error",
      });
      console.error("Error updating task:", error);
    }
  };

  const handleEditTask = async (updatedTask: Task) => {
    try {
      const { id, ...updates } = updatedTask;
      const response = await updateTask(id, updates);

      // Backend returns { message: "...", data: {...} }
      const savedTask = response?.data || response;

      setAllTasks(allTasks.map((task) => (task.id === id ? savedTask : task)));

      setEditingTask(null);
      showToast({
        message: "Task updated successfully",
        type: "success",
      });
    } catch (error) {
      showToast({
        message: "Failed to update task",
        type: "error",
      });
      console.error("Error updating task:", error);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteTask(taskId);
      setAllTasks(allTasks.filter((task) => task.id !== taskId));
      setEditingTask(null);
      showToast({
        message: "Task deleted successfully",
        type: "success",
      });
    } catch (error) {
      showToast({
        message: "Failed to delete task",
        type: "error",
      });
      console.error("Error deleting task:", error);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-1">
            <ExclamationTriangleIcon className="h-3 w-3" />
            High
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
            Medium
          </span>
        );
      case "low":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400">
            Low
          </span>
        );
      default:
        return null;
    }
  };

  const formatDueDate = (dueDate: string | null) => {
    if (!dueDate) return "No due date";
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly.getTime() === today.getTime()) return "Today";
    if (dateOnly.getTime() === tomorrow.getTime()) return "Tomorrow";
    if (dateOnly < today) return `Overdue (${date.toLocaleDateString()})`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDueDateColor = (dueDate: string | null) => {
    if (!dueDate) return "text-text-muted";
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    if (dateOnly < today) return "text-red-500 font-medium";
    if (dateOnly.getTime() === today.getTime()) return "text-yellow-500 font-medium";
    return "text-text-muted";
  };

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="text-text-muted mt-2">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-surface border border-border/50 rounded-lg p-4">
        {/* Filter by status */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Status:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {(["all", "pending", "completed"] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                  activeFilter === filter
                    ? "bg-primary text-white"
                    : "bg-surface text-text-muted hover:bg-background"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Sort by */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-text-muted">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="due_date">Due Date</option>
            <option value="priority">Priority</option>
            <option value="created">Recently Added</option>
          </select>
        </div>

        {/* Task count */}
        <div className="ml-auto text-sm text-text-muted">
          {filteredAndSortedTasks.length} task{filteredAndSortedTasks.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
        {displayedTasks.length > 0 ? (
          <ul className="divide-y divide-border/50">
            {displayedTasks.map((task) => (
              <li
                key={task.id}
                className={`group p-4 hover:bg-background/50 transition-all cursor-pointer ${
                  task.completed ? "opacity-60" : ""
                }`}
                onClick={() => setEditingTask(task)}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleTaskCompletion(task.id);
                    }}
                    className={`mt-1 flex-shrink-0 transition-colors ${
                      task.completed
                        ? "text-green-500"
                        : "text-border hover:text-primary"
                    }`}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className={`font-medium text-sm truncate ${
                          task.completed ? "line-through text-text-muted" : ""
                        }`}
                      >
                        {task.title}
                      </p>
                      {getPriorityBadge(task.priority)}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-xs">
                      <span className={`flex items-center gap-1 ${getDueDateColor(task.due_date)}`}>
                        <ClockIcon className="h-3 w-3" />
                        {formatDueDate(task.due_date)}
                      </span>
                      {task.all_day && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                          All Day
                        </span>
                      )}
                      {task.start_time && (
                        <span className="text-text-muted">
                          {task.start_time}
                          {task.end_time && ` - ${task.end_time}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTask(task);
                      }}
                      className="p-1.5 text-text-muted hover:text-accent hover:bg-accent/10 rounded transition-colors"
                    >
                      <PencilSquareIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTask(task.id);
                      }}
                      className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-text-muted">
            <ClockIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No tasks found.</p>
            <p className="text-sm mt-1">Create your first task to get started!</p>
          </div>
        )}

        {/* Load More / View All */}
        {hasMoreTasks && (
          <div className="p-4 text-center border-t border-border/50">
            {displayedTasks.length < filteredAndSortedTasks.length ? (
              <button
                onClick={loadMoreTasks}
                className="text-sm text-primary hover:underline"
              >
                Load more ({filteredAndSortedTasks.length - displayedTasks.length} remaining)
              </button>
            ) : (
              <button
                onClick={() => setIsViewAllModalOpen(true)}
                className="text-sm text-primary hover:underline"
              >
                View all {filteredAndSortedTasks.length} tasks
              </button>
            )}
          </div>
        )}

        {/* View All Button when not loading more */}
        {!hasMoreTasks && filteredAndSortedTasks.length > TASKS_PER_PAGE && (
          <div className="p-4 text-center border-t border-border/50">
            <button
              onClick={() => setIsViewAllModalOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              View all {filteredAndSortedTasks.length} tasks
            </button>
          </div>
        )}
      </div>

      {/* View All Modal */}
      <Transition appear show={isViewAllModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsViewAllModalOpen(false)}>
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
                <Dialog.Panel className="w-full max-w-3xl max-h-[85vh] transform overflow-hidden rounded-xl bg-surface border border-border/50 p-6 text-left align-middle shadow-xl transition-all flex flex-col">
                  <div className="flex justify-between items-center mb-4">
                    <Dialog.Title as="h3" className="text-lg font-medium">
                      All Tasks ({filteredAndSortedTasks.length})
                    </Dialog.Title>
                    <button
                      onClick={() => setIsViewAllModalOpen(false)}
                      className="text-text-muted hover:text-text"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Filters in modal */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex rounded-lg border border-border overflow-hidden">
                      {(["all", "pending", "completed"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setActiveFilter(filter)}
                          className={`px-3 py-1.5 text-sm capitalize transition-colors ${
                            activeFilter === filter
                              ? "bg-primary text-white"
                              : "bg-background text-text-muted hover:bg-background/80"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                      className="px-3 py-1.5 text-sm bg-background border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="due_date">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="created">Recently Added</option>
                    </select>
                  </div>

                  {/* Tasks List in Modal */}
                  <div className="flex-1 overflow-y-auto">
                    {filteredAndSortedTasks.length > 0 ? (
                      <ul className="divide-y divide-border/50 -mx-2">
                        {filteredAndSortedTasks.map((task) => (
                          <li
                            key={task.id}
                            className={`group p-3 hover:bg-background/50 transition-all cursor-pointer ${
                              task.completed ? "opacity-60" : ""
                            }`}
                            onClick={() => {
                              setIsViewAllModalOpen(false);
                              setEditingTask(task);
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskCompletion(task.id);
                                }}
                                className={`mt-0.5 flex-shrink-0 transition-colors ${
                                  task.completed ? "text-green-500" : "text-border hover:text-primary"
                                }`}
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p
                                    className={`font-medium text-sm truncate ${
                                      task.completed ? "line-through text-text-muted" : ""
                                    }`}
                                  >
                                    {task.title}
                                  </p>
                                  {getPriorityBadge(task.priority)}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-xs">
                                  <span className={`flex items-center gap-1 ${getDueDateColor(task.due_date)}`}>
                                    <ClockIcon className="h-3 w-3" />
                                    {formatDueDate(task.due_date)}
                                  </span>
                                  {task.all_day && (
                                    <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                      All Day
                                    </span>
                                  )}
                                  {task.start_time && (
                                    <span className="text-text-muted">
                                      {task.start_time}
                                      {task.end_time && ` - ${task.end_time}`}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsViewAllModalOpen(false);
                                    setEditingTask(task);
                                  }}
                                  className="p-1 text-text-muted hover:text-accent"
                                >
                                  <PencilSquareIcon className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="p-8 text-center text-text-muted">
                        No tasks found.
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
                    <span className="text-text-muted">
                      {filteredAndSortedTasks.filter(t => !t.completed).length} pending • {filteredAndSortedTasks.filter(t => t.completed).length} completed
                    </span>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onSave={handleEditTask}
          onDelete={handleDeleteTask}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}