import React, { createContext, useContext, useState, useCallback } from "react";

export interface Task {
  id: string;
  mainId: string;
  taskRef: string;
  complexity: "Low" | "Medium" | "High" | string;
  description: string;
  classification: string;
  plannedHrs: string;
  loggedHrs: string;
  inProduction: boolean;
  startDate: string;
  endDate: string;
}

interface TasksContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
}

const TasksContext = createContext<TasksContextType | null>(null);

const seedTasks: Task[] = [
  {
    id: "t1",
    mainId: "45877",
    taskRef: "145266",
    complexity: "Medium",
    description: "API integration for user module",
    classification: "CR",
    plannedHrs: "4.0",
    loggedHrs: "4.5",
    inProduction: false,
    startDate: "2025-04-14",
    endDate: "2025-04-15",
  },
  {
    id: "t2",
    mainId: "45901",
    taskRef: "145288",
    complexity: "High",
    description: "Fix production bug in login flow",
    classification: "Bug",
    plannedHrs: "2.0",
    loggedHrs: "3.0",
    inProduction: true,
    startDate: "2025-04-15",
    endDate: "2025-04-15",
  },
  {
    id: "t3",
    mainId: "45920",
    taskRef: "145299",
    complexity: "Low",
    description: "Code review for dashboard PR",
    classification: "Support",
    plannedHrs: "1.0",
    loggedHrs: "1.5",
    inProduction: false,
    startDate: "2025-04-16",
    endDate: "2025-04-16",
  },
];

export const TasksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(seedTasks);

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
    <TasksContext.Provider value={{ tasks, addTask, updateTask, deleteTask }}>
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TasksContext);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
};
