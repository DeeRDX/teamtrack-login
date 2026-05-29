import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import LogTaskModal from "@/components/LogTaskModal";
import TaskEntriesTable from "@/components/TaskEntriesTable";
import MyTeam from "@/components/MyTeam";
import MyLeaves from "@/components/MyLeaves";
import UserAdministration from "@/components/UserAdministration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
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
  Loader2,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", key: "dashboard" },
  { icon: Clock, label: "Timesheet", key: "timesheet" },
  { icon: FileText, label: "Summary", key: "summary" },
  { icon: UsersRound, label: "My Team", key: "myteam" },
  { icon: CalendarDays, label: "Leaves", key: "leaves" },
  { icon: BarChart3, label: "Reports", key: "reports" },
  { icon: ShieldCheck, label: "Admin", key: "admin" },
];

interface UserStats {
  hoursLoggedToday: number;
  hoursLoggedThisWeek: number;
  hoursExpectedThisWeek: number;
  totalTasksThisMonth: number;
  totalTasksToday: number;
  assetName: string;
  assetFunction: string;
  dailyHours: number;
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

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      const token = localStorage.getItem("token");
      if (!token) return;

      setStatsLoading(true);
      try {
        const { data } = await axios.get(`https://localhost:44352/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setStats({
          hoursLoggedToday: data?.hoursSummary?.hoursLoggedToday ?? 0,
          hoursLoggedThisWeek: data?.hoursSummary?.hoursLoggedThisWeek ?? 0,
          hoursExpectedThisWeek: data?.hoursSummary?.hoursExpectedThisWeek ?? 0,
          totalTasksThisMonth: data?.taskSummary?.totalTasksThisMonth ?? 0,
          totalTasksToday: data?.taskSummary?.totalTasksToday ?? 0,
          assetName: data?.assetName ?? "—",
          assetFunction: data?.assetFunction ?? "—",
          dailyHours: data?.dailyHours ?? 0,
        });
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const remainingWeekly = stats
    ? Math.max(0, stats.hoursExpectedThisWeek - stats.hoursLoggedThisWeek)
    : 0;

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
            <Button variant="outline" size="sm" className="gap-1.5">
              This Week <ChevronDown className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => setLogTaskOpen(true)}>
              <Plus className="h-4 w-4" /> Log Task
            </Button>
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
            <MyTeam />
          ) : activeView === "admin" ? (
            <UserAdministration />
          ) : (
            <>
              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-4 gap-4">
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
                  label="Weekly Logged"
                  value={`${stats?.hoursLoggedThisWeek ?? 0} hours`}
                  badge={`Target ${stats?.hoursExpectedThisWeek ?? 0}h`}
                  badgeClass="border border-border text-muted-foreground text-[10px] font-bold uppercase tracking-wide"
                />

                <StatCard
                  icon={FileText}
                  iconBg="bg-orange-50"
                  iconColor="text-orange-500"
                  label="Remaining Weekly"
                  value={`${remainingWeekly} hours`}
                  badge={`Target ${stats?.hoursExpectedThisWeek ?? 0}h`}
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
              </div>

              <div className="mb-6">
                <TaskEntriesTable />
              </div>
            </>
          )}

          {/* Footer Bar */}
          <Card>
            <CardContent className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Active Asset
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {stats?.assetName ?? "—"}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Division
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {stats?.assetFunction ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Utilization
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {stats?.dailyHours ?? "—"}h/day
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                ACTIVE
              </span>
            </CardContent>
          </Card>
        </main>
      </div>

      <LogTaskModal open={logTaskOpen} onOpenChange={setLogTaskOpen} />
    </div>
  );
};

export default DashboardPage;