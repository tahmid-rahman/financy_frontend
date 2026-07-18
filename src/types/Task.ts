export type Task = {
  id: number;
  title: string;
  dueDate: string;
  startTime?: string;
  endTime?: string;
  priority: "low" | "medium" | "high";
  completed: boolean;
};
