import { useEffect, useState } from "react";
import axiosInstance from "@/api/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Download, ArrowRight, X, Loader2, ShieldOff } from "lucide-react";

// ── Types (match backend TdhTeamRosterDto / UserDetailDto) ───────────────────

interface RecentTask {
  taskId: number;
  mainId: string | null;
  taskRefId: string | null;
  taskDescription: string;
  complexity: string;
  classification: string | null;
  hoursLogged: number;
  logDate: string;
}

interface TeamMember {
  userId: number;
  fullName: string;
  roleName: string;
  taskSummary?: {
    recentTasks: RecentTask[];
  };
  hoursSummary?: {
    hoursLoggedThisWeek: number;
    hoursExpectedThisWeek: number;
    hoursLoggedThisMonth: number;
    hoursExpectedThisMonth: number;
  };
}

interface TdhTeamRoster {
  teamId: number;
  teamName: string;
  dailyHours: number;
  totalMembers: number;
  members: TeamMember[];
}

const categoryStyles: Record<string, string> = {
  CR: "bg-red-50 text-red-600 border-red-200",
  MEETING: "bg-blue-50 text-blue-600 border-blue-200",
  BAU: "bg-amber-50 text-amber-600 border-amber-200",
};

// hoursExpected already factors in leave days (Full/Half) — computed server-side,
// so no extra leave math is needed here. Just pick the right range's fields.
const loggedHoursFor = (m: TeamMember, range: "week" | "month") =>
  range === "week"
    ? m.hoursSummary?.hoursLoggedThisWeek ?? 0
    : m.hoursSummary?.hoursLoggedThisMonth ?? 0;

const expectedHoursFor = (m: TeamMember, range: "week" | "month") =>
  range === "week"
    ? m.hoursSummary?.hoursExpectedThisWeek ?? 0
    : m.hoursSummary?.hoursExpectedThisMonth ?? 0;

const utilization = (m: TeamMember, range: "week" | "month") => {
  const logged = loggedHoursFor(m, range);
  const expected = expectedHoursFor(m, range);
  if (!expected) return 0;
  return Math.round((logged / expected) * 100);
};

const initialsOf = (name: string) =>
  name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

const utilColor = (v: number) => {
  if (v < 70) return "bg-red-500";
  if (v <= 90) return "bg-blue-300";
  return "bg-primary";
};

const MyTeam = () => {
  const [teams, setTeams] = useState<TdhTeamRoster[]>([]);
  const [activeTeamIdx, setActiveTeamIdx] = useState(0);
  const [selected, setSelected] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [notTdh, setNotTdh] = useState(false);
  const [range, setRange] = useState<"week" | "month">("week");

  useEffect(() => {
    const fetchTdhTeams = async () => {
      setLoading(true);
      setNotTdh(false);
      try {
        const { data } = await axiosInstance.get<TdhTeamRoster[]>("/users/tdh-team", {
          params: { range },
        });
        setTeams(data);
        setSelected((prev) => {
          // Try to keep the same member selected across a range change
          const sameTeam = data[activeTeamIdx] ?? data[0];
          const match = prev
            ? sameTeam?.members.find((m) => m.userId === prev.userId)
            : undefined;
          return match ?? sameTeam?.members[0] ?? null;
        });
      } catch (err: any) {
        if (err?.response?.status === 403) {
          setNotTdh(true);
        } else {
          console.error("Failed to fetch TDH team roster:", err);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTdhTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your team...
        </CardContent>
      </Card>
    );
  }

  if (notTdh) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-2 p-12 text-center">
          <ShieldOff className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">Not a Team Department Head</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            You aren't currently assigned as the TDH for any team, so there's no team roster to
            show here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const team = teams[activeTeamIdx];
  const members = team?.members ?? [];
  const totalHours = selected
    ? (selected.taskSummary?.recentTasks ?? []).reduce((sum, t) => sum + (t.hoursLogged ?? 0), 0)
    : 0;

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Team Utilization</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-mono">{team?.teamName ?? "—"}</span> ·{" "}
              {range === "week" ? "THIS WEEK" : "THIS MONTH"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {teams.length > 1 && (
              <div className="flex gap-1">
                {teams.map((t, i) => (
                  <button
                    key={t.teamId}
                    onClick={() => {
                      setActiveTeamIdx(i);
                      setSelected(t.members[0] ?? null);
                    }}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                      i === activeTeamIdx
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {t.teamName}
                  </button>
                ))}
              </div>
            )}
            <Select value={range} onValueChange={(v) => setRange(v as "week" | "month")}>
              <SelectTrigger className="h-9 w-32 gap-1.5 text-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Utilization Overview */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Utilization Overview</h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> &lt;70%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-300" /> 70-90%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> &gt;90%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {members.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No members in this team yet.
              </p>
            ) : (
              members.map((m) => {
                const util = utilization(m, range);
                const loggedH = loggedHoursFor(m, range);
                const expectedH = expectedHoursFor(m, range);
                return (
                  <div key={m.userId} className="flex items-center gap-4">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-muted text-xs font-semibold">
                        {initialsOf(m.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-32">
                      <p className="text-sm font-semibold text-foreground">{m.fullName}</p>
                      <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                        {m.roleName}
                      </p>
                    </div>
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${utilColor(util)}`}
                          style={{ width: `${Math.min(util, 100)}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {loggedH.toFixed(1)}h logged / {expectedH.toFixed(1)}h expected
                      </p>
                    </div>
                    <div className="w-12 text-right text-sm font-semibold text-foreground">
                      {util}%
                    </div>
                    <button
                      onClick={() => setSelected(m)}
                      className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      View Tasks <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Task Details */}
        {selected && (
          <div className="mt-5 rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Task Details: {selected.fullName}
                </h3>
                <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-secondary-foreground">
                  {selected.roleName}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Task ID</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Description</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Category</TableHead>
                    <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selected.taskSummary?.recentTasks ?? []).length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No tasks logged recently.
                      </TableCell>
                    </TableRow>
                  ) : (
                    (selected.taskSummary?.recentTasks ?? []).map((t) => (
                      <TableRow key={t.taskId}>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(t.logDate).toLocaleDateString("en-US", { month: "short", day: "2-digit" })}
                        </TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {t.taskRefId ?? t.mainId ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{t.taskDescription}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              categoryStyles[t.classification ?? ""] ||
                              "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {t.classification ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-foreground">
                          {t.hoursLogged.toFixed(1)}h
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {(selected.taskSummary?.recentTasks ?? []).length > 0 && (
                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total for {range === "week" ? "week" : "month"}
                  </span>
                  <span className="text-sm font-bold text-foreground">{totalHours.toFixed(1)}h</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyTeam;