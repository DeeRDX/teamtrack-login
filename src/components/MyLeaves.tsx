import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  Hourglass,
  CalendarDays,
  BarChart3,
  Clock,
  Calendar as CalendarIcon,
  Info,
  Plus,
  FileText,
  Check,
  X,
} from "lucide-react";

type LeaveStatus = "Approved" | "Pending" | "Rejected";
interface LeaveRow {
  id: string;
  date: string;
  type: "Full Day" | "Half Day";
  hours: number;
  reason: string;
  appliedOn: string;
  status: LeaveStatus;
}

const HISTORY: LeaveRow[] = [
  { id: "1", date: "2026-12-05", type: "Full Day", hours: 8.5, reason: "Personal", appliedOn: "2026-12-01", status: "Approved" },
  { id: "2", date: "2026-12-08", type: "Half Day", hours: 4.25, reason: "Medical checkup", appliedOn: "2026-12-03", status: "Approved" },
  { id: "3", date: "2026-12-15", type: "Full Day", hours: 8.5, reason: "Family function", appliedOn: "2026-12-07", status: "Pending" },
  { id: "4", date: "2026-11-20", type: "Full Day", hours: 8.5, reason: "Personal", appliedOn: "2026-11-15", status: "Approved" },
  { id: "5", date: "2026-11-18", type: "Half Day", hours: 4.25, reason: "No reason", appliedOn: "2026-11-06", status: "Rejected" },
];

const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  value,
  label,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  value: React.ReactNode;
  label: string;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </CardContent>
  </Card>
);

const statusBadge = (s: LeaveStatus) => {
  if (s === "Approved")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
        <Check className="h-3 w-3" /> Approved
      </span>
    );
  if (s === "Pending")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">
        <Hourglass className="h-3 w-3" /> Pending
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
      <X className="h-3 w-3" /> Rejected
    </span>
  );
};

// December 2026 starts on Tuesday
const DEC_2026_LEAVES: Record<number, "Approved" | "Pending" | "Rejected"> = {
  5: "Approved",
  8: "Approved",
  15: "Pending",
};

const MiniCalendar = () => {
  // Dec 1 2026 is Tuesday. M T W T F S S layout.
  // M=0..S=6. Dec1 (Tue) -> index 1. So 1 blank cell at start.
  const days: (number | null)[] = [];
  for (let i = 0; i < 1; i++) days.push(null);
  for (let d = 1; d <= 31; d++) days.push(d);
  while (days.length % 7 !== 0) days.push(null);

  const dot = (status?: "Approved" | "Pending" | "Rejected") => {
    if (status === "Approved") return "bg-green-100 text-green-700 border border-green-200";
    if (status === "Pending") return "bg-amber-100 text-amber-700 border border-amber-200";
    if (status === "Rejected") return "bg-red-100 text-red-700 border border-red-200";
    return "text-foreground hover:bg-muted";
  };

  return (
    <Card>
      <CardContent className="p-5">
        <p className="mb-3 text-sm font-semibold text-foreground">December 2026</p>
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
                d ? dot(DEC_2026_LEAVES[d]) : ""
              }`}
            >
              {d ?? ""}
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-green-500" />Approved</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Pending</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Rejected</span>
        </div>
      </CardContent>
    </Card>
  );
};

const MyLeaves = () => {
  const [leaveDate, setLeaveDate] = useState("");
  const [leaveType, setLeaveType] = useState<"Full Day" | "Half Day">("Full Day");
  const [reason, setReason] = useState("");
  const [tab, setTab] = useState<"guidelines" | "history">("history");
  const [filter, setFilter] = useState<"All" | "Approved" | "Pending">("All");

  const counts = useMemo(
    () => ({
      Approved: HISTORY.filter((r) => r.status === "Approved").length,
      Pending: HISTORY.filter((r) => r.status === "Pending").length,
    }),
    []
  );

  const filtered = HISTORY.filter((r) => (filter === "All" ? true : r.status === filter));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Leaves</h1>
        <p className="text-sm text-muted-foreground">Apply for leave and track your requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={CheckCircle2} iconBg="bg-green-50" iconColor="text-green-600" value="3" label="Approved Leaves" />
        <StatCard icon={Hourglass} iconBg="bg-amber-50" iconColor="text-amber-600" value="1" label="Pending Approval" />
        <StatCard icon={CalendarDays} iconBg="bg-blue-50" iconColor="text-blue-600" value="3" label="Leaves This Month" />
        <StatCard icon={BarChart3} iconBg="bg-purple-50" iconColor="text-purple-600" value="5" label="Total Requests" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Apply for Leave */}
          <Card className="overflow-hidden border-t-4 border-t-primary">
            <CardContent className="space-y-4 p-5">
              <div>
                <p className="text-base font-semibold text-foreground">Apply for Leave</p>
                <p className="text-xs text-muted-foreground">Submit a new leave request to your manager</p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Leave Date *</label>
                <Input type="date" value={leaveDate} onChange={(e) => setLeaveDate(e.target.value)} />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">Leave Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLeaveType("Full Day")}
                    className={`relative rounded-md border p-3 text-left transition ${
                      leaveType === "Full Day" ? "border-primary bg-primary/5" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <CalendarIcon className="h-4 w-4 text-primary" /> Full Day
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">8.5 hours deducted</p>
                    {leaveType === "Full Day" && (
                      <Check className="absolute right-2 top-2 h-3.5 w-3.5 text-primary" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLeaveType("Half Day")}
                    className={`relative rounded-md border p-3 text-left transition ${
                      leaveType === "Half Day" ? "border-primary bg-primary/5" : "border-border bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Clock className="h-4 w-4 text-muted-foreground" /> Half Day
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">4.25 hours deducted</p>
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-foreground">
                  Reason <span className="text-muted-foreground">(optional)</span>
                </label>
                <Textarea
                  value={reason}
                  maxLength={250}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Personal appointment, medical checkup..."
                  rows={3}
                />
                <p className="mt-1 text-right text-[10px] text-muted-foreground">{reason.length}/250</p>
              </div>

              <div className="flex gap-2 rounded-md bg-blue-50 p-3 text-xs text-blue-700">
                <Info className="h-4 w-4 shrink-0" />
                <p>
                  Leave request will be sent to <span className="font-semibold">Ammy (Delivery Manager)</span> for
                  approval. Expected hours for that day will be adjusted automatically upon approval.
                </p>
              </div>

              <Button className="w-full gap-1.5">
                <Plus className="h-4 w-4" /> Submit Leave Request
              </Button>
            </CardContent>
          </Card>

          {/* Leave Balance */}
          <Card>
            <CardContent className="space-y-4 p-5">
              <p className="text-sm font-semibold text-foreground">Leave Balance — 2026</p>

              {[
                { label: "Annual Entitlement", left: "12/20 days left", used: "8 days used", value: 40, color: "bg-primary" },
                { label: "Sick Leave", left: "8/10 days left", used: "2 days used", value: 20, color: "bg-green-500" },
                { label: "Casual Leave", left: "4/5 days left", used: "1 days used", value: 20, color: "bg-purple-500" },
              ].map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">{b.label}</span>
                    <span className="text-muted-foreground">
                      <span className="font-semibold text-foreground">{b.left.split(" ")[0]}</span> days left
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div className={`h-full ${b.color}`} style={{ width: `${b.value}%` }} />
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">{b.used}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <MiniCalendar />
        </div>

        {/* RIGHT */}
        <Card>
          <CardContent className="p-5">
            {/* Tabs */}
            <div className="mb-4 inline-flex rounded-md border border-border bg-muted/40 p-1">
              <button
                onClick={() => setTab("guidelines")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                  tab === "guidelines" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <FileText className="h-3.5 w-3.5" /> Guidelines
              </button>
              <button
                onClick={() => setTab("history")}
                className={`flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition ${
                  tab === "history" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                <CalendarDays className="h-3.5 w-3.5" /> Leave History
              </button>
            </div>

            {tab === "history" ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Leave History</p>
                    <p className="text-xs text-muted-foreground">{HISTORY.length} records</p>
                  </div>
                  <div className="flex gap-2 text-xs">
                    {(["All", "Approved", "Pending"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`rounded-full border px-3 py-1 font-medium transition ${
                          filter === f
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        {f}
                        {f === "Approved" && <span className="ml-1 text-[10px]">{counts.Approved}</span>}
                        {f === "Pending" && <span className="ml-1 text-[10px]">{counts.Pending}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        <th className="py-2 pr-3">Leave Date</th>
                        <th className="py-2 pr-3">Type</th>
                        <th className="py-2 pr-3">Duration</th>
                        <th className="py-2 pr-3">Reason</th>
                        <th className="py-2 pr-3">Applied On</th>
                        <th className="py-2 pr-3">Status</th>
                        <th className="py-2 pr-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((r) => (
                        <tr key={r.id} className="border-b border-border last:border-0">
                          <td className="py-3 pr-3 font-medium text-foreground">{r.date}</td>
                          <td className="py-3 pr-3">
                            <span
                              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium ${
                                r.type === "Full Day"
                                  ? "bg-blue-50 text-blue-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {r.type === "Full Day" ? (
                                <CalendarIcon className="h-3 w-3" />
                              ) : (
                                <Clock className="h-3 w-3" />
                              )}
                              {r.type}
                            </span>
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">{r.hours} hrs</td>
                          <td className="py-3 pr-3 text-muted-foreground">
                            {r.status === "Rejected" ? <span className="italic">{r.reason}</span> : r.reason}
                          </td>
                          <td className="py-3 pr-3 text-muted-foreground">{r.appliedOn}</td>
                          <td className="py-3 pr-3">{statusBadge(r.status)}</td>
                          <td className="py-3 pr-3">
                            {r.status === "Pending" ? (
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-7 px-3 text-xs"
                              >
                                Cancel
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-base font-semibold text-foreground">Leave Guidelines</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>Submit leave requests at least 3 working days in advance.</li>
                  <li>Medical leaves require a certificate for absences over 2 days.</li>
                  <li>Annual leave balance resets every January 1st.</li>
                  <li>Half-day leaves are deducted as 4.25 hours from your timesheet.</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyLeaves;
