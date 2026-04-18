import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import LogTaskModal from "@/components/LogTaskModal";
import TaskEntriesTable from "@/components/TaskEntriesTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Settings,
  Code2,
  Layers,
  Download,
} from "lucide-react";

const recentEntries = [
  { icon: Users, title: "Daily Stand-up", project: "INTERNAL OPS", hours: "1.0h" },
  { icon: Settings, title: "API Bug Fix", project: "SKYNET PROJECT", hours: "4.5h" },
  { icon: Code2, title: "Code Review", project: "MAIN REPO", hours: "2.0h" },
  { icon: Layers, title: "React Bug", project: "UI KIT", hours: "3.5h" },
];

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: true },
  { icon: Clock, label: "Timesheet", active: false },
  { icon: FileText, label: "Summary", active: false },
  { icon: CalendarDays, label: "Leaves", active: false },
  { icon: BarChart3, label: "Reports", active: false },
];

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const userAny = user as unknown as Record<string, string> | null;
  const userName = userAny?.fullName || userAny?.name || "John";
  const uRole = userAny?.roleName || userAny?.role || "Member";
  const [logTaskOpen, setLogTaskOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-border bg-card">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Users className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">TeamTrack</span>
        </div>

        {/* Nav */}
        <nav className="mt-4 flex-1 px-3">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Main Menu
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <button
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    item.active
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

        {/* User */}
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
        {/* Header */}
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
            <button className="relative ml-1 rounded-lg p-2 text-muted-foreground hover:bg-secondary hover:text-foreground">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            {/* Today Logged */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                    +12%
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Today Logged</p>
                <p className="text-2xl font-bold text-foreground">7.5 hours</p>
              </CardContent>
            </Card>

            {/* Weekly Logged */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-500">
                    -4%
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Weekly Logged</p>
                <p className="text-2xl font-bold text-foreground">32.0 hours</p>
              </CardContent>
            </Card>

            {/* Remaining Weekly */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                    <FileText className="h-5 w-5 text-orange-500" />
                  </div>
                  <span className="rounded-full border border-border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                    Target 40H
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Remaining Weekly</p>
                <p className="text-2xl font-bold text-foreground">8.0 hours</p>
              </CardContent>
            </Card>

            {/* Tasks Worked */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-600">
                    +2 Today
                  </span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Tasks Worked</p>
                <p className="text-2xl font-bold text-foreground">
                  14 <span className="text-base font-normal text-muted-foreground">completed</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Task Entries Table + Recent Entries */}
          <div className="mb-6">
            <div className="col-span-2">
              <TaskEntriesTable />
            </div>

            
          </div>

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
                    <p className="text-sm font-bold text-foreground">MR_IFRS19</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Division
                  </p>
                  <p className="text-sm font-bold text-foreground">Corporate</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Utilization
                  </p>
                  <p className="text-sm font-bold text-foreground">8.5h/day</p>
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
