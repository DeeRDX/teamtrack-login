import React, { createContext, useContext, useState, useCallback } from "react";

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
  addTask: (task: Omit<Task, "id">) => void;
  updateTask: (id: string, task: Omit<Task, "id">) => void;
  deleteTask: (id: string) => void;
}

const TasksContext = createContext<TasksContextType | null>(null);

const seedTasks: Task[] = [
  {
    id: "t1",
    mainId: "45877",
    taskRefId: "145266",
    taskDescription: "API integration for user module",
    inProduction: false,
    complexity: "Medium",
    classification: "CR",
    logDate: "2025-04-14",
    planStartDate: "2025-04-14",
    planEndDate: "2025-04-15",
    actualStartDate: "2025-04-14",
    actualEndDate: "2025-04-15",
    plannedHours: 4,
    hoursLogged: 4.5,
  },
  {
    id: "t2",
    mainId: "45901",
    taskRefId: "145288",
    taskDescription: "Fix production bug in login flow",
    inProduction: true,
    complexity: "High",
    classification: "Bug",
    logDate: "2025-04-15",
    planStartDate: "2025-04-15",
    planEndDate: "2025-04-15",
    actualStartDate: "2025-04-15",
    actualEndDate: "2025-04-15",
    plannedHours: 2,
    hoursLogged: 3,
  },
  {
    id: "t3",
    mainId: "45920",
    taskRefId: "145299",
    taskDescription: "Code review for dashboard PR",
    inProduction: false,
    complexity: "Low",
    classification: "Support",
    logDate: "2025-04-16",
    planStartDate: "2025-04-16",
    planEndDate: "2025-04-16",
    actualStartDate: "2025-04-16",
    actualEndDate: "2025-04-16",
    plannedHours: 1,
    hoursLogged: 1.5,
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
