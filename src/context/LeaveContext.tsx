import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { format } from "date-fns";

export interface LeaveRow {
  leaveId: string;
  leaveDate: string;
  leaveType: "Full" | "Half";
}

interface LeaveContextType {
  leaveHistory: LeaveRow[];
  loading: boolean;
  calMonth: number;
  calYear: number;
  setCalMonth: (month: number) => void;
  setCalYear: (year: number) => void;
  fetchLeaveHistory: (type?: string, date?: string) => Promise<void>;
  submitLeave: (leaveDate: string, leaveType: "Full" | "Half") => Promise<void>;
  deleteLeave: (leaveId: string) => Promise<void>;
}

const LeaveContext = createContext<LeaveContextType | null>(null);

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44352/api").replace(/\/api$/, "");

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

export const LeaveProvider: React.FC<{
  children: React.ReactNode;
  userId: number | string | null;
}> = ({ children, userId }) => {
  const today = new Date();

  const [leaveHistory, setLeaveHistory] = useState<LeaveRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [calMonth, setCalMonth] = useState(today.getMonth());
  const [calYear, setCalYear] = useState(today.getFullYear());

  const fetchLeaveHistory = useCallback(
    async (type = "month", date = format(today, "yyyy-MM-dd")) => {
      if (!userId) return;
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No auth token found in localStorage.");
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({ userId: String(userId), type, date });
        const res = await fetch(`${BASE_URL}/api/leave/list?${params.toString()}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "*/*",
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: LeaveRow[] = Array.isArray(json) ? json : json.data ?? [];
        setLeaveHistory(data);
      } catch (err) {
        console.error("Failed to fetch leave history:", err);
        setLeaveHistory([]);
      } finally {
        setLoading(false);
      }
    },
    [userId]
  );

  // Initial load for the current month
  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  const submitLeave = useCallback(
    async (leaveDate: string, leaveType: "Full" | "Half") => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/leave/submit`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ leaveDate, leaveType }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Refresh the currently visible month after submit
      const firstDay = format(new Date(calYear, calMonth, 1), "yyyy-MM-dd");
      await fetchLeaveHistory("month", firstDay);
    },
    [calMonth, calYear, fetchLeaveHistory]
  );

  const deleteLeave = useCallback(
    async (leaveId: string) => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${BASE_URL}/api/leave/${leaveId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          accept: "*/*",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic removal + refresh
      setLeaveHistory((prev) => prev.filter((r) => r.leaveId !== leaveId));
      const firstDay = format(new Date(calYear, calMonth, 1), "yyyy-MM-dd");
      await fetchLeaveHistory("month", firstDay);
    },
    [calMonth, calYear, fetchLeaveHistory]
  );

  return (
    <LeaveContext.Provider
      value={{
        leaveHistory,
        loading,
        calMonth,
        calYear,
        setCalMonth,
        setCalYear,
        fetchLeaveHistory,
        submitLeave,
        deleteLeave,
      }}
    >
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const ctx = useContext(LeaveContext);
  if (!ctx) throw new Error("useLeave must be used within LeaveProvider");
  return ctx;
};