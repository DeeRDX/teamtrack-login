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
}

interface TasksContextType {
  tasks: Task[];
  loading: boolean;
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
  refetchTasks: () => void;
}

const TasksContext = createContext<TasksContextType | null>(null);

const mapApiTask = (apiTask: any): Task => ({
  id: String(apiTask.taskId),
  mainId: apiTask.mainId ?? "—",
  taskRefId: apiTask.taskRefId ?? "—",
  taskDescription: apiTask.taskDescription ?? "",
  inProduction: false,
  complexity: apiTask.complexity ?? "Low",
  classification: apiTask.classification ?? "—",
  logDate: apiTask.logDate ?? "",
  planStartDate: apiTask.logDate ?? "",
  planEndDate: apiTask.logDate ?? "",
  actualStartDate: apiTask.logDate ?? "",
  actualEndDate: apiTask.logDate ?? "",
  plannedHours: apiTask.hoursLogged ?? 0,
  hoursLogged: apiTask.hoursLogged ?? 0,
});

export const TasksProvider: React.FC<{
  children: React.ReactNode;
  userId: number | string | null;
}> = ({ children, userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!userId) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No auth token found in localStorage.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.get(`https://localhost:44352/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("data", data);
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
  }, [userId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback((task: Omit<Task, "id">) => {
    setTasks((prev) => [{ ...task, id: `t${Date.now()}` }, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, task: Omit<Task, "id">) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...task, id } : t)));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <TasksContext.Provider value={{ tasks, loading, addTask, updateTask, deleteTask, refetchTasks: fetchTasks }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
};