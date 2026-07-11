import { CalendarIcon, ClockIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { getTasks } from "../../services/api";

type Task = {
  id: number;
  title: string;
  due_date: string;
  start_time?: string | null;
  end_time?: string | null;
  priority: "low" | "medium" | "high";
  completed: boolean;
};

export default function UpcomingBills() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchTasks() {
      try {
        setIsLoading(true);
        const res = await getTasks();
        const allTasks: Task[] = res.data || [];

        // Filter to incomplete tasks due in the next 7 days
        const now = new Date();
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

        const upcomingTasks = allTasks
          .filter((task) => {
            if (task.completed) return false;
            const dueDate = new Date(task.due_date);
            return dueDate >= now && dueDate <= nextWeek;
          })
          .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
          .slice(0, 3);

        setTasks(upcomingTasks);
      } catch (err) {
        console.error("Failed to fetch upcoming tasks", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchTasks();
  }, []);

  const typeColors = {
    meeting: "bg-blue-500/10 text-blue-500",
    appointment: "bg-green-500/10 text-green-500",
    deadline: "bg-red-500/10 text-red-500",
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500";
      case "medium":
        return "bg-amber-500/10 text-amber-500";
      default:
        return "bg-green-500/10 text-green-500";
    }
  };

  if (isLoading) {
    return (
      <div className="bg-surface rounded-xl border border-border p-6 animate-pulse">
        <h2 className="text-lg font-semibold mb-4 text-text">Upcoming Schedule</h2>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-border/50"></div>
              <div className="flex-1">
                <div className="h-4 bg-border/50 rounded w-24 mb-1"></div>
                <div className="h-3 bg-border/50 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl border border-border p-6">
      <h2 className="text-lg font-semibold mb-4 text-text">Upcoming Schedule</h2>
      {tasks.length > 0 ? (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-3 p-3 hover:bg-background rounded-lg transition-colors">
              <div
                className={`flex-shrink-0 mt-1 w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`}
              ></div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-text truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-text-muted flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    {new Date(task.due_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  {task.start_time && (
                    <p className="text-xs text-text-muted flex items-center gap-1">
                      <ClockIcon className="h-3 w-3" />
                      {task.start_time}
                    </p>
                  )}
                </div>
              </div>
              <div
                className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}
              >
                {task.priority}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-text-muted py-4">
          <p className="text-sm">No upcoming tasks this week</p>
        </div>
      )}
    </div>
  );
}