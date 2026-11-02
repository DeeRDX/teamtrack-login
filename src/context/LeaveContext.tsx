import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { format } from "date-fns";
import axiosInstance from "@/api/axios";

export interface LeaveRow {
  leaveId: string;
  leaveDate: string;
  leaveType: "Full" | "Half";
}

export interface HolidayRow {
  holidayDate: string;
  holidayName: string;
}

export interface HolidayImportSummary {
  totalRows: number;
  importedCount: number;
  updatedCount: number;
  failureCount: number;
  rows: {
    rowNumber: number;
    holidayName: string;
    success: boolean;
    message: string;
  }[];
}

interface LeaveContextType {
  leaveHistory: LeaveRow[];
  holidays: HolidayRow[];
  loading: boolean;
  calMonth: number;
  calYear: number;
  setCalMonth: (month: number) => void;
  setCalYear: (year: number) => void;
  fetchLeaveHistory: (type?: string, date?: string) => Promise<void>;
  fetchHolidays: () => Promise<void>;
  importHolidays: (file: File) => Promise<HolidayImportSummary>;
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
  const [leaveHistory, setLeaveHistory] = useState<LeaveRow[]>([]);
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());

  const fetchLeaveHistory = useCallback(
    async (type = "month", date = format(new Date(), "yyyy-MM-dd")) => {
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

  const fetchHolidays = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get<HolidayRow[]>("/leave/holidays");
      setHolidays(data);
    } catch (err) {
      console.error("Failed to fetch company holidays:", err);
      setHolidays([]);
    }
  }, []);

  const importHolidays = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await axiosInstance.post<HolidayImportSummary>(
      "/leave/holidays/import",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    await fetchHolidays();
    return data;
  }, [fetchHolidays]);

  // Initial load for the current month
  useEffect(() => {
    fetchLeaveHistory();
  }, [fetchLeaveHistory]);

  useEffect(() => {
    fetchHolidays();
  }, [fetchHolidays]);

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
      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.message ?? `HTTP ${res.status}`);
      }
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
        holidays,
        loading,
        calMonth,
        calYear,
        setCalMonth,
        setCalYear,
        fetchLeaveHistory,
        fetchHolidays,
        importHolidays,
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