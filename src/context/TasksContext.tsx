import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import axios from "axios";

export interface Task {
  id: string;
  mainId: string;
  taskRefId: string;
  taskDescription: string;
  inProduction: boolean;
  complexity: "Low" | "Medium" | "High" | string;
  classification: string;
  logDate: string;
  planStartDate: string;
  planEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  plannedHours: number;
  hoursLogged: number;
  devResponsibility?: string | null;
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  setTaskRange: (range: "week" | "month") => void;
  addTask: (task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => Promise<void>;
  refetchTasks: () => Promise<void>;
}

const TasksContext = createContext<TasksContextType | null>(null);

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44352/api").replace(/\/api$/, "");

const  getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const mapApiTask = (apiTask: any): Task => ({
  id: String(apiTask.taskId),
  mainId: apiTask.mainId ?? "—",
  taskRefId: apiTask.taskRefId ?? "—",
  taskDescription: apiTask.taskDescription ?? "",
  inProduction: apiTask.inProduction ?? false,
  complexity: apiTask.complexity ?? "Low",
  classification: apiTask.classification ?? "—",
  logDate: apiTask.logDate ?? "",
  planStartDate: apiTask.planStartDate ?? apiTask.logDate ?? "",
  planEndDate: apiTask.planEndDate ?? apiTask.logDate ?? "",
  actualStartDate: apiTask.actualStartDate ?? apiTask.logDate ?? "",
  actualEndDate: apiTask.actualEndDate ?? apiTask.logDate ?? "",
  plannedHours: apiTask.plannedHours ?? apiTask.hoursLogged ?? 0,
  hoursLogged: apiTask.hoursLogged ?? 0,
  devResponsibility: apiTask.devResponsibility ?? "",
});

export const TasksProvider: React.FC<{
  children: React.ReactNode;
  userId: number | string | null;
}> = ({ children, userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [taskRange, setTaskRange] = useState<"week" | "month">("week");

  const fetchTasks = useCallback(async () => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found in localStorage.");
      return;
    }
    setLoading(true);
    try {
     const { data } = await axios.get(
  `${BASE_URL}/api/users/${userId}?range=${taskRange}`,
  {
    headers: getAuthHeaders(),
  }
);

      const recentTasks: Task[] = (data?.taskSummary?.recentTasks ?? []).map(mapApiTask);
      setTasks(recentTasks);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("API error:", err.response?.status, err.response?.data);
      } else {
        console.error("Failed to fetch tasks:", err);
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
}, [userId, taskRange]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks((prev) => [{ ...task, id: `t${Date.now()}` }, ...prev]);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      await axios.delete(`${BASE_URL}/api/tasks/${id}`, {
        headers: getAuthHeaders(),
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error("Delete failed:", err.response?.status, err.response?.data);
      } else {
        console.error("Delete failed:", err);
      }
      throw err; 
    }
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, loading, setTaskRange, addTask, deleteTask, refetchTasks: fetchTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
};