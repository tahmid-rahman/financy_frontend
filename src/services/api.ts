import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api/";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject(error);
  }
);

// ============================================
// EXPENSES
// ============================================

export const getExpenses = async () => {
  const response = await api.get("/calculation/expenses/");
  return response.data;
};

export const createExpense = async (data: {
  amount: string | number;
  description?: string;
  category: number;
  date?: string;
}) => {
  const response = await api.post("/calculation/expenses/create/", data);
  return response.data;
};

export const updateExpense = async (
  id: number,
  data: {
    amount?: string | number;
    description?: string;
    category?: number;
    date?: string;
  }
) => {
  const response = await api.put(`/calculation/expenses/${id}/update/`, data);
  return response.data;
};

export const deleteExpense = async (id: number) => {
  const response = await api.delete(`/calculation/expenses/${id}/delete/`);
  return response.data;
};

export const restoreExpense = async (id: number) => {
  const response = await api.post(`/calculation/expenses/${id}/restore/`);
  return response.data;
};

export const getDeletedExpenses = async () => {
  const response = await api.get("/calculation/expenses/deleted/");
  return response.data;
};

// ============================================
// EXPENSE CATEGORIES
// ============================================

export const getCategories = async () => {
  const response = await api.get("/calculation/expense-categories/");
  return response.data;
};

export const addCategory = async (name: string) => {
  const response = await api.post("/calculation/expense-categories/create/", { name });
  return response.data;
};

export const updateCategory = async (id: number, name: string) => {
  const response = await api.put(`/calculation/expense-categories/${id}/update/`, { name });
  return response.data;
};

export const deleteCategory = async (id: number) => {
  const response = await api.delete(`/calculation/expense-categories/${id}/delete/`);
  return response.data;
};

export const restoreCategory = async (id: number) => {
  const response = await api.post(`/calculation/expense-categories/${id}/restore/`);
  return response.data;
};

export const getDeletedCategories = async () => {
  const response = await api.get("/calculation/expense-categories/deleted/");
  return response.data;
};

// ============================================
// INCOME SOURCES
// ============================================

export const getIncomeSources = async () => {
  const response = await api.get("/calculation/income-sources/");
  return response.data;
};

export const addSource = async (name: string) => {
  const response = await api.post("/calculation/income-sources/create/", { name });
  return response.data;
};

export const updateIncomeSource = async (id: number, name: string) => {
  const response = await api.put(`/calculation/income-sources/${id}/update/`, { name });
  return response.data;
};

export const deleteIncomeSource = async (id: number) => {
  const response = await api.delete(`/calculation/income-sources/${id}/delete/`);
  return response.data;
};

export const restoreIncomeSource = async (id: number) => {
  const response = await api.post(`/calculation/income-sources/${id}/restore/`);
  return response.data;
};

export const getDeletedIncomeSources = async () => {
  const response = await api.get("/calculation/income-sources/deleted/");
  return response.data;
};

// ============================================
// INCOME
// ============================================

export const getIncomes = async () => {
  const response = await api.get("/calculation/incomes/");
  return response.data;
};

export const createIncome = async (data: {
  amount: string | number;
  description?: string;
  source: number;
  date?: string;
}) => {
  const response = await api.post("/calculation/incomes/create/", data);
  return response.data;
};

export const updateIncome = async (
  id: number,
  data: {
    amount?: string | number;
    description?: string;
    source?: number;
    date?: string;
  }
) => {
  const response = await api.put(`/calculation/incomes/${id}/update/`, data);
  return response.data;
};

export const deleteIncome = async (id: number) => {
  const response = await api.delete(`/calculation/incomes/${id}/delete/`);
  return response.data;
};

export const restoreIncome = async (id: number) => {
  const response = await api.post(`/calculation/incomes/${id}/restore/`);
  return response.data;
};

export const getDeletedIncomes = async () => {
  const response = await api.get("/calculation/incomes/deleted/");
  return response.data;
};

// ============================================
// TASKS
// ============================================

export const createTask = async (task: {
  title: string;
  due_date: string;
  start_time: string | null;
  end_time: string | null;
  all_day: boolean;
  priority: "low" | "medium" | "high";
}) => {
  const response = await api.post("/task/create/", task);
  return response.data;
};

export const getTasks = async () => {
  const response = await api.get("/task/");
  return response.data;
};

export const updateTask = async (
  taskId: number,
  updates: Partial<{
    title: string;
    due_date: string;
    start_time: string | null;
    end_time: string | null;
    all_day: boolean;
    priority: "low" | "medium" | "high";
    completed: boolean;
  }>
) => {
  const response = await api.put(`/task/${taskId}/update/`, updates);
  return response.data;
};

export const deleteTask = async (taskId: number) => {
  const response = await api.delete(`/task/${taskId}/delete/`);
  return response.data;
};

export const taskDetails = async (taskId: number) => {
  const response = await api.get(`/task/${taskId}/`);
  return response.data;
};

export const toggleTaskComplete = async (taskId: number) => {
  const response = await api.put(`/task/${taskId}/complete/`);
  return response.data;
};

export const restoreTask = async (taskId: number) => {
  const response = await api.put(`/task/${taskId}/restore/`);
  return response.data;
};

// ============================================
// USER PROFILE
// ============================================

export const updateProfile = async (data: {
  name?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar?: string;
}) => {
  const response = await api.put("/accounts/user-profile/update/", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get("/accounts/user-profile/");
  return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string) => {
  const response = await api.post("/accounts/change-password/", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return response.data;
};

// ============================================
// USER REGISTRATION
// ============================================

export const registerUser = async (data: {
  email: string;
  name: string;
  phone?: string;
  password: string;
}) => {
  const response = await api.post("/accounts/register/", data);
  return response.data;
};

// ============================================
// DASHBOARD SUMMARY
// ============================================

export const getDashboardSummary = async () => {
  const response = await api.get("/calculation/dashboard-summary/");
  return response.data;
};

export const getMonthlyTrends = async () => {
  const response = await api.get("/calculation/monthly-trends/");
  return response.data;
};

// ============================================
// BUDGETS
// ============================================

export const getBudgets = async () => {
  const response = await api.get("/calculation/budgets/");
  return response.data;
};

export const createBudget = async (data: {
  category: number;
  limit: number;
  month: string;
}) => {
  const response = await api.post("/calculation/budgets/", data);
  return response.data;
};

export const updateBudget = async (
  id: number,
  data: { limit?: number }
) => {
  const response = await api.put(`/calculation/budgets/${id}/`, data);
  return response.data;
};

export const deleteBudget = async (id: number) => {
  const response = await api.delete(`/calculation/budgets/${id}/`);
  return response.data;
};
