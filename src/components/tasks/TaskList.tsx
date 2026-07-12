import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
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

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      showToast({
        message: "Failed to fetch tasks",
        type: "error",
      });
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = async (taskId: number) => {
    try {
      const taskToUpdate = tasks.find((task) => task.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = await updateTask(taskId, {
        completed: !taskToUpdate.completed,
      });

      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));

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

      setTasks(tasks.map((task) => (task.id === id ? response : task)));

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
      setTasks(tasks.filter((task) => task.id !== taskId));
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

  if (isLoading) {
    return (
      <div className="bg-surface border border-border/50 rounded-lg overflow-hidden p-8 text-center">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
      {tasks.length > 0 ? (
        <ul className="divide-y divide-border/50">
          {tasks.map((task) => (
            <li key={task.id} className="group p-4 hover:bg-background/50 transition-colors">
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggleTaskCompletion(task.id)}
                  className={`mt-1 flex-shrink-0 ${task.completed ? "text-primary" : "text-border"}`}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                </button>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditingTask(task)}>
                  <p className={`font-medium text-sm truncate ${task.completed ? "line-through text-text-muted" : ""}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <ClockIcon className="h-3 w-3 text-text-muted" />
                    <span className="text-xs text-text-muted">Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No date'}</span>
                    {task.priority === "high" && (
                      <span className="flex items-center gap-1 text-xs text-accent">
                        <ExclamationTriangleIcon className="h-3 w-3" />
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                    }}
                    className="text-text-muted hover:text-primary"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                    }}
                    className="text-text-muted hover:text-primary"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="text-text-muted hover:text-accent"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-8 text-center text-text-muted">No tasks found. Add your first task!</div>
      )}

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
