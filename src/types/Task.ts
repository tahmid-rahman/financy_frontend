export type Task = {
  id: string; // Changed to string to match EditTaskModal
  title: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
};
