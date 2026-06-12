import { useState } from "react";
import { format, getDaysInMonth, startOfMonth } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useLeave } from "@/context/LeaveContext";
import type { LeaveRow } from "@/context/LeaveContext";
import {
  Clock,
  Calendar as CalendarIcon,
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
} from "lucide-react";

// ── MiniCalendar ─────────────────────────────────────────────────────────────

interface MiniCalendarProps {
  month: number;
  year: number;
  leaveHistory: LeaveRow[];
  onMonthChange: (month: number, year: number) => void;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const MiniCalendar = ({ month, year, leaveHistory, onMonthChange }: MiniCalendarProps) => {
  const leaveDays = new Map<number, "Full" | "Half">();
  leaveHistory.forEach((r) => {
    const d = new Date(r.leaveDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      leaveDays.set(d.getDate(), r.leaveType);
    }
  });

  const totalDays = getDaysInMonth(new Date(year, month, 1));
  const rawDay = startOfMonth(new Date(year, month, 1)).getDay();
  const offset = rawDay === 0 ? 6 : rawDay - 1;

  const days: (number | null)[] = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let d = 1; d <= totalDays; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const handlePrev = () => {
    if (month === 0) onMonthChange(11, year - 1);
    else onMonthChange(month - 1, year);
  };

  const handleNext = () => {
    if (month === 11) onMonthChange(0, year + 1);
    else onMonthChange(month + 1, year);
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={handlePrev} className="rounded p-1 hover:bg-muted transition">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <p className="text-sm font-semibold text-foreground">
            {MONTH_NAMES[month]} {year}
          </p>
          <button type="button" onClick={handleNext} className="rounded p-1 hover:bg-muted transition">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-muted-foreground">
          {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
            <div key={i} className="py-1">{d}</div>
          ))}
        </div>

        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-xs">
          {days.map((d, i) => (
            <div
              key={i}
              className={`flex h-8 items-center justify-center rounded ${
                d && leaveDays.has(d)
                  ? leaveDays.get(d) === "Full"
                    ? "bg-red-100 text-red-600 border border-red-200 font-medium"
                    : "bg-yellow-100 text-yellow-600 border border-yellow-200 font-medium"
                  : d
                  ? "text-foreground hover:bg-muted"
                  : ""
              }`}
            >
              {d ?? ""}
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-red-400" /> Full day
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-yellow-400" /> Half day
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// ── MyLeaves page ─────────────────────────────────────────────────────────────

const MyLeaves = () => {
  const { toast } = useToast();
  const {
    leaveHistory,
    loading,
    calMonth,
    calYear,
    setCalMonth,
    setCalYear,
    fetchLeaveHistory,
    submitLeave,
    deleteLeave,
  } = useLeave();

  // Form state (UI-only, stays in the component)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<"Full" | "Half">("Full");
  const [dateError, setDateError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCalMonthChange = (month: number, year: number) => {
    setCalMonth(month);
    setCalYear(year);
    const firstDay = format(new Date(year, month, 1), "yyyy-MM-dd");
    fetchLeaveHistory("month", firstDay);
  };

  const handleSubmit = async () => {
    if (!selectedDate) {
      setDateError("Please select a leave date.");
      return;
    }
    setDateError("");
    setIsSubmitting(true);
    try {
      await submitLeave(format(selectedDate, "yyyy-MM-dd"), leaveType);
      toast({
        title: "Leave request submitted!",
        description: `Your ${leaveType} leave on ${format(selectedDate, "MMM dd, yyyy")} has been sent for approval.`,
      });
      setSelectedDate(undefined);
      setLeaveType("Full");
    } catch {
      toast({
        title: "Submission failed",
        description: "Failed to submit leave request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteLeave(deleteId);
      toast({
        title: "Leave deleted",
        description: "The leave entry has been permanently removed.",
      });
      setDeleteId(null);
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete the leave entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 mb-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Leaves</h1>
        <p className="text-sm text-muted-foreground">Apply for leave and track your requests</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Left column */}
        <div className="space-y-6">
          <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-base font-semibold text-foreground">Apply for Leave</p>
                <p className="text-xs text-muted-foreground">Submit a new leave request to your manager</p>
              </div>

              {/* Date picker */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Leave Date *</label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition
                        ${dateError ? "border-red-400" : "border-border"}
                        ${selectedDate ? "text-foreground" : "text-muted-foreground"}
                        bg-background hover:bg-muted/40`}
                    >
                      <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Pick a date"}
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setDateError("");
                        setCalendarOpen(false);
                      }}
                      disabled={(date) => date.getDay() === 0 || date.getDay() === 6}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {dateError && <p className="mt-1 text-[11px] text-red-500">{dateError}</p>}
              </div>

              {/* Leave type */}
              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType("Full")}
                    className={`relative rounded-md border p-3 text-left transition ${
                      leaveType === "Full" ? "border-primary bg-primary/5" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarIcon className="h-4 w-4 text-primary" /> Full Day
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">8.5 hours deducted</p>
                    {leaveType === "Full" && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType("Half")}
                    className={`relative rounded-md border p-3 text-left transition ${
                      leaveType === "Half" ? "border-primary bg-primary/5" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-muted-foreground" /> Half Day
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">4.25 hours deducted</p>
                    {leaveType === "Half" && <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />}
                  </button>
                </div>
              </div>

              <Button className="w-full gap-1.5" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : (
                  <><Plus className="h-4 w-4" /> Submit Leave Request</>
                )}
              </Button>
            </CardContent>
          </Card>

          <MiniCalendar
            month={calMonth}
            year={calYear}
            leaveHistory={leaveHistory}
            onMonthChange={handleCalMonthChange}
          />
        </div>

        {/* Right column — Leave History */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-4">
              <p className="text-sm font-semibold text-foreground">Leave History</p>
              <p className="text-xs text-muted-foreground">{leaveHistory.length} records</p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Loading leave history...</span>
              </div>
            )}

            {!loading && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="py-2 pr-3">Leave Date</th>
                      <th className="py-2 pr-3">Type</th>
                      <th className="py-2 pr-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-sm text-muted-foreground">
                          No leave records found.
                        </td>
                      </tr>
                    ) : (
                      leaveHistory.map((r) => (
                        <tr key={r.leaveId} className="border-b border-border last:border-0">
                          <td className="py-3 pr-3 font-medium text-foreground">{r.leaveDate}</td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
                                r.leaveType === "Full"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {r.leaveType === "Full" ? (
                                <CalendarIcon className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {r.leaveType}
                            </span>
                          </td>
                          <td className="py-3 pr-3">
                            <Trash2
                              className="h-4 w-4 stroke-red-400 cursor-pointer hover:stroke-red-600 transition-colors"
                              onClick={() => setDeleteId(r.leaveId)}
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && !deleting && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this leave entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The leave entry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyLeaves;