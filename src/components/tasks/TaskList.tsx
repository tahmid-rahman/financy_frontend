import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PencilSquareIcon,
  EllipsisHorizontalIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import EditTaskModal from "./EditTaskModal";

type Task = {
  id: number;
  title: string;
  dueDate: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
};

const mockTasks: Task[] = [
  {
    id: 1,
    title: "Complete project proposal",
    dueDate: "2023-06-20",
    priority: "high",
    completed: false,
  },
  {
    id: 2,
    title: "Complete project proposal the second time",
    dueDate: "2023-06-22",
    priority: "medium",
    completed: true,
  },
  // ...other tasks
];

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const toggleTaskCompletion = (taskId: number) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)));
  };

  const handleEditTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks(tasks.filter((task) => task.id !== taskId));
    setEditingTask(null);
  };

  return (
    <div className="bg-surface border border-border/50 rounded-lg overflow-hidden">
      {/* ...existing header code... */}

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
                    <span className="text-xs text-text-muted">Due {new Date(task.dueDate).toLocaleDateString()}</span>
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
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTask(task);
                    }}
                    className="text-text-muted hover:text-primary"
                  >
                    <PencilSquareIcon className="h-5 w-5" />
                  </button> */}
                  {/* <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTask(task.id);
                    }}
                    className="text-text-muted hover:text-accent"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button> */}
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
