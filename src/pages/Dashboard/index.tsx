import axiosInstance from "@/api/axios";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import LogTaskModal from "@/components/LogTaskModal";
import TaskEntriesTable from "@/components/TaskEntriesTable";
import MyTeam from "@/components/MyTeam";
import MyLeaves from "@/components/MyLeaves";
import UserAdministration from "@/components/UserAdministration";
import AssetAdministration from "@/components/AssetAdministration";
import TeamAdministration from "@/components/TeamAdministration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  LogOut,
  LayoutDashboard,
  Clock,
  FileText,
  CalendarDays,
  BarChart3,
  Bell,
  Plus,
  ChevronDown,
  CheckCircle2,
  Moon,
  Sun,
  UsersRound,
  ShieldCheck,
  CalendarCheck,
  Loader2,
  Download,
  Upload,
  Boxes,
} from "lucide-react";


const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: Clock, label: "Timesheet", key: "timesheet" },
  { icon: FileText, label: "Summary", key: "summary" },
  { icon: UsersRound, label: "My Team", key: "myteam" },
  { icon: CalendarDays, label: "My Leaves", key: "myleaves" },
  { icon: BarChart3, label: "Reports", key: "reports" },
  { icon: ShieldCheck, label: "Admin", key: "admin" },
  { icon: Boxes, label: "Asset Admin", key: "assetadmin" },
  { icon: UsersRound, label: "Team Admin", key: "teamadmin" },
];

interface WeekDayBreakdown {
  date: string;
  dayName: string;
  hoursLogged: number;
  hoursExpected: number;
  isLeaveDay: boolean;
  leaveType: string | null;
}

interface UserStats {
  managerName: string | null;
  assetName: string;
  assetFunction: string;
  dailyHours: number;

  hoursLoggedToday: number;

  hoursLoggedThisWeek: number;
  hoursExpectedThisWeek: number;
  hoursLoggedThisMonth: number;
  hoursExpectedThisMonth: number;

  totalTasksThisMonth: number;
  totalTasksToday: number;

  totalLeavesThisMonth: number;
  weekBreakdown: WeekDayBreakdown[];
}

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const userAny = user as unknown as Record<string, string> | null;
  const userId = userAny?.userId || null;
  const userName = userAny?.fullName || userAny?.name || "John";
  const uRole = userAny?.roleName || userAny?.role || "Member";

  const [logTaskOpen, setLogTaskOpen] = useState(false);
  const [activeView, setActiveView] = useState<string>("dashboard");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [exportType, setExportType] = useState<"week" | "month">("week");
  const [exporting, setExporting] = useState(false);

  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    totalRows: number;
    successCount: number;
    failureCount: number;
    rows: { rowNumber: number; success: boolean; taskDescription: string; message: string }[];
  } | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setStatsLoading(true);
    try {
      const { data } = await axiosInstance.get(`/users/${userId}?range=${exportType}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setStats({
        managerName: data?.managerName ?? null,
        assetName: data?.assetName ?? "—",
        assetFunction: data?.assetFunction ?? "—",
        dailyHours: data?.dailyHours ?? 0,
        hoursLoggedToday: data?.hoursSummary?.hoursLoggedToday ?? 0,
        hoursLoggedThisWeek: data?.hoursSummary?.hoursLoggedThisWeek ?? 0,
        hoursExpectedThisWeek: data?.hoursSummary?.hoursExpectedThisWeek ?? 0,
        hoursLoggedThisMonth: data?.hoursSummary?.hoursLoggedThisMonth ?? 0,
        hoursExpectedThisMonth: data?.hoursSummary?.hoursExpectedThisMonth ?? 0,
        totalTasksThisMonth: data?.taskSummary?.totalTasksThisMonth ?? 0,
        totalTasksToday: data?.taskSummary?.totalTasksToday ?? 0,
        totalLeavesThisMonth: data?.leaveSummary?.totalLeavesThisMonth ?? 0,
        weekBreakdown: data?.hoursSummary?.weekBreakdown ?? [],
      });
    } catch (err) {
      console.error("Failed to fetch user stats:", err);
    } finally {
      setStatsLoading(false);
    }
  }, [userId, exportType]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);


  const handleExport = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setExporting(true);
    try {
      const response = await axiosInstance.get(
  `/tasks/download?type=${exportType}`,
  {
    headers: { Authorization: `Bearer ${token}` },
    responseType: "blob",
  }
);

      // Derive filename from Content-Disposition header, or use a default
      const disposition = response.headers["content-disposition"];
      let filename = `tasks-${exportType}.xlsx`;
      if (disposition) {
        const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (match?.[1]) filename = match[1].replace(/['"]/g, "");
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const openImportModal = () => {
    setImportFile(null);
    setImportResult(null);
    setImportModalOpen(true);
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;
    setImportFile(file);
    setImportResult(null);
  };

  const handleConfirmImport = async () => {
    if (!importFile) return;
    const token = localStorage.getItem("token");
    if (!token) return;

    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", importFile);

      const { data } = await axiosInstance.post("/tasks/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setImportResult(data);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Import failed. Please check the file and try again.";
      setImportResult({
        totalRows: 0,
        successCount: 0,
        failureCount: 1,
        rows: [{ rowNumber: 0, success: false, taskDescription: "", message: msg }],
      });
    } finally {
      setImporting(false);
    }
  };

  const isWeek = exportType === "week";

  const currentLogged = stats
    ? isWeek
      ? stats.hoursLoggedThisWeek
      : stats.hoursLoggedThisMonth
    : 0;
  const currentExpected = stats
    ? isWeek
      ? stats.hoursExpectedThisWeek
      : stats.hoursExpectedThisMonth
    : 0;
  const remainingCurrent = Math.max(0, currentExpected - currentLogged);

  // Week: count leave days from the week breakdown (Half day = 0.5)
  const leavesThisWeek = (stats?.weekBreakdown ?? []).reduce(
    (sum, d) => sum + (d.isLeaveDay ? (d.leaveType === "Half" ? 0.5 : 1) : 0),
    0,
  );
  const currentLeaves = isWeek ? leavesThisWeek : stats?.totalLeavesThisMonth ?? 0;

  const StatCard = ({
    icon: Icon,
    iconBg,
    iconColor,
    badge,
    badgeClass,
    label,
    value,
  }: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    badge: string;
    badgeClass: string;
    label: string;
    value: React.ReactNode;
  }) => (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className={`flex h-10 w-10 items-center justify-center rounded-full ${iconBg}`}>
            <Icon className={`h-5 w-5 ${iconColor}`} />
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badgeClass}`}>
            {badge}
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{label}</p>
        {statsLoading ? (
          <div className="mt-1 flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Loading...</span>
          </div>
        ) : (
          <p className="text-2xl font-bold text-foreground">{value}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border bg-card">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Users className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">TeamTrack</span>
        </div>

        <nav className="mt-4 flex-1 px-3">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => setActiveView(item.key)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    activeView === item.key
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
              {userName.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{userName}</p>
              <p className="text-xs text-muted-foreground">{uRole}</p>
            </div>
            <button onClick={logout} className="text-muted-foreground hover:text-destructive" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {(stats?.managerName || stats?.assetName) && (
            <div className="mt-3 space-y-1 border-t border-border pt-3">
              {stats?.managerName && (
                <p className="truncate text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Manager:</span> {stats.managerName}
                </p>
              )}
              {stats?.assetName && stats.assetName !== "—" && (
                <p className="truncate text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">Asset:</span> {stats.assetName}
                </p>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-auto">
        <header className="flex items-center justify-between border-b border-border bg-card px-8 py-5">
          <div>
            <h1 className="text-xl font-bold text-foreground">Productivity Overview</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {userName}. Here's your activity for this week.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" className="gap-1.5" onClick={() => setLogTaskOpen(true)}>
              <Plus className="h-4 w-4" /> Log Task
            </Button>

            {/* Export controls — only shown on the dashboard view */}
            {activeView === "dashboard" && (
              <>
                <Select
                  value={exportType}
                  onValueChange={(val) => setExportType(val as "week" | "month")}
                >
                  <SelectTrigger className="h-9 w-36 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  onClick={handleExport}
                  disabled={exporting}
                  title={`Export ${exportType === "week" ? "this week's" : "this month's"} tasks`}
                >
                  {exporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {exporting ? "Exporting..." : "Export"}
                </Button>

                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5"
                  title="Import tasks from an Excel file (same format as Export)"
                  onClick={openImportModal}
                >
                  <Upload className="h-4 w-4" />
                  Import
                </Button>
              </>
            )}

            <button
              onClick={toggleTheme}
              className="relative ml-1 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button className="relative rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="flex-1 p-8">
          {activeView === "myteam" ? (
            <MyTeam onTaskSaved={fetchStats} />
          ) : activeView === "myleaves" ? (
            <MyLeaves />
          ) : activeView === "admin" ? (
            <UserAdministration />
          ) : activeView === "assetadmin" ? (
            <AssetAdministration />
          ) : activeView === "teamadmin" ? (
            <TeamAdministration />

          ) : (
            <>
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-5 gap-4">
                <StatCard
                  icon={Clock}
                  iconBg="bg-primary/10"
                  iconColor="text-primary"
                  label="Today Logged"
                  value={`${stats?.hoursLoggedToday ?? 0} hours`}
                  badge={stats?.hoursLoggedToday ?? 0 > 0 ? "Logged" : "None yet"}
                  badgeClass={
                    (stats?.hoursLoggedToday ?? 0) > 0
                      ? "bg-green-50 text-green-600"
                      : "bg-muted text-muted-foreground"
                  }
                />

                <StatCard
                  icon={CalendarDays}
                  iconBg="bg-muted"
                  iconColor="text-muted-foreground"
                  label={isWeek ? "Weekly Logged" : "Monthly Logged"}
                  value={`${currentLogged} hours`}
                  badge={`Target ${currentExpected}h`}
                  badgeClass="border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wide"
                />

                <StatCard
                  icon={FileText}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-500"
                  label={isWeek ? "Remaining Weekly" : "Remaining Monthly"}
                  value={`${remainingCurrent} hours`}
                  badge={`Target ${currentExpected}h`}
                  badgeClass="border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wide"
                />

                <StatCard
                  icon={CheckCircle2}
                  iconBg="bg-green-50"
                  iconColor="text-green-500"
                  label="Tasks Worked"
                  value={
                    <>
                      {stats?.totalTasksThisMonth ?? 0}{" "}
                      <span className="text-base font-normal text-muted-foreground">this month</span>
                    </>
                  }
                  badge={`+${stats?.totalTasksToday ?? 0} Today`}
                  badgeClass="bg-green-50 text-green-600"
                />

                <StatCard
                  icon={CalendarCheck}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-500"
                  label={isWeek ? "Leaves This Week" : "Leaves This Month"}
                  value={
                    <>
                      {currentLeaves}{" "}
                      <span className="text-base font-normal text-muted-foreground">
                        {currentLeaves === 1 ? "day" : "days"}
                      </span>
                    </>
                  }
                  badge={isWeek ? "This Week" : "This Month"}
                  badgeClass="bg-purple-50 text-purple-600"
                />
              </div>

              <div className="mb-6">
             <TaskEntriesTable range={exportType} onTaskSaved={fetchStats} />
              </div>
            </>
          )}
        </main>
      </div>

      <LogTaskModal open={logTaskOpen} onOpenChange={setLogTaskOpen} onSaved={fetchStats} />

      {/* ── Import Modal ─────────────────────────────────────────────────── */}
      <Dialog
        open={importModalOpen}
        onOpenChange={(open) => {
          if (!importing) setImportModalOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import Tasks from Excel
            </DialogTitle>
          </DialogHeader>

          {!importResult ? (
            <div className="space-y-4 py-2">
              <p className="text-sm text-muted-foreground">
                Select the same Excel file format produced by <strong>Export</strong>. Each row
                becomes a task, using <strong>Actual Start Date</strong> as the log date.
              </p>

              <input
                type="file"
                id="import-file-input"
                accept=".xlsx"
                className="hidden"
                onChange={handleFilePicked}
              />

              <div
                onClick={() => document.getElementById("import-file-input")?.click()}
                className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-8 text-center hover:bg-muted/40"
              >
                <Upload className="h-6 w-6 text-muted-foreground" />
                {importFile ? (
                  <p className="text-sm font-medium text-foreground">{importFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-foreground">Click to choose a file</p>
                    <p className="text-xs text-muted-foreground">.xlsx only</p>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImportModalOpen(false)}
                  disabled={importing}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5"
                  onClick={handleConfirmImport}
                  disabled={!importFile || importing}
                >
                  {importing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4" />
                      Import
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-muted-foreground">
                  Total rows: <span className="font-semibold text-foreground">{importResult.totalRows}</span>
                </span>
                <span className="text-green-600">
                  Imported: <span className="font-semibold">{importResult.successCount}</span>
                </span>
                <span className="text-destructive">
                  Failed: <span className="font-semibold">{importResult.failureCount}</span>
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto rounded-md border border-border">
                {importResult.rows.map((r, i) => (
                  <div
                    key={i}
                    className={`border-b border-border px-3 py-2 text-xs last:border-b-0 ${
                      r.success ? "bg-green-50" : "bg-destructive/5"
                    }`}
                  >
                    <p className="font-medium text-foreground">
                      Row {r.rowNumber || "—"}
                      {r.taskDescription ? ` — ${r.taskDescription}` : ""}
                    </p>
                    <p className={r.success ? "text-green-700" : "text-destructive"}>{r.message}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setImportFile(null);
                    setImportResult(null);
                  }}
                >
                  Import Another File
                </Button>
                <Button size="sm" onClick={() => setImportModalOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardPage;