import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Users,
  Building2,
  ShieldCheck,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import axios from "axios";

interface AdminUser {
  userId: number;
  enumber: string;
  fullName: string;
  email: string;
  roleName: string;
  hierarchyLevel: number;
  teamName: string;
  dailyHours: number;
  assetName: string;
  managerName: string | null;
  isActive: boolean;
  tasksThisMonth: number;
  hoursThisMonth: number;
}

// Map hierarchy level to a display label + style
const levelStyleMap: Record<number, { label: string; className: string }> = {
  1: { label: "L1 – Director",   className: "bg-primary/10 text-primary border-primary/20" },
  2: { label: "L2 – Manager",    className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  3: { label: "L3 – Senior",     className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  4: { label: "L4 – Staff",      className: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
};

const getLevelStyle = (level: number) =>
  levelStyleMap[level] ?? {
    label: `L${level}`,
    className: "bg-muted text-muted-foreground border-border",
  };

const PAGE_SIZE = 10;

const UserAdministration = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // ── Fetch all users ──────────────────────────────────────────────────────
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      setLoading(true);
      try {
        const { data } = await axios.get("https://localhost:44352/api/admin/allusers", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(data);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // ── Toggle active status locally (wire to API if needed) ─────────────────
  const toggleActive = (userId: number) =>
    setUsers((prev) =>
      prev.map((u) => (u.userId === userId ? { ...u, isActive: !u.isActive } : u)),
    );

  const removeUser = (userId: number) =>
    setUsers((prev) => prev.filter((u) => u.userId !== userId));

  // ── Derived stats ────────────────────────────────────────────────────────
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.isActive).length;
  const activePct = totalUsers > 0 ? Math.round((activeCount / totalUsers) * 100) : 0;

  // ── Search + pagination ──────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      users.filter((u) =>
        [u.fullName, u.email, u.enumber, u.roleName, u.teamName]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [users, query],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1); // reset to first page on search
  };

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin <span className="mx-1">›</span> User Management
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">User Administration</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Manage enterprise access, roles, and organizational hierarchy for the TeamArch
              ecosystem.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-4 w-4" /> Bulk Edit
            </Button>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" /> Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Filter / stat cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Search */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Quick Find
              </p>
              <Input
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                placeholder="Search by name, email or ID..."
                className="h-7 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>

        {/* Department placeholder */}
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Building2 className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Department
              </p>
              <p className="text-sm font-semibold text-foreground">All Departments</p>
            </div>
          </CardContent>
        </Card>

        {/* Total + Active */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Total Users
                </p>
                <p className="text-lg font-bold text-foreground">
                  {loading ? "—" : totalUsers}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <ShieldCheck className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Active
                </p>
                <p className="text-lg font-bold text-foreground">
                  {loading ? "—" : `${activePct}%`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-[10px] uppercase tracking-wider">Employee #</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Full Name</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Role / Team</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Asset / Manager</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">This Month</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading users...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    No users found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((u) => {
                  const level = getLevelStyle(u.hierarchyLevel);
                  return (
                    <TableRow key={u.userId}>
                      {/* Employee # */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {u.enumber}
                      </TableCell>

                      {/* Name + email */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                            {u.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{u.fullName}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role + team */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${level.className} mb-1 text-[10px] font-bold`}
                        >
                          {u.roleName}
                        </Badge>
                        <p className="text-xs text-muted-foreground">{u.teamName}</p>
                      </TableCell>

                      {/* Asset + manager */}
                      <TableCell className="text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">Asset:</span>{" "}
                          {u.assetName ?? "—"}
                        </p>
                        <p>
                          <span className="font-medium text-foreground">Mgr:</span>{" "}
                          {u.managerName ?? "—"}
                        </p>
                      </TableCell>

                      {/* Tasks + hours this month */}
                      <TableCell className="text-xs text-muted-foreground">
                        <p>
                          <span className="font-medium text-foreground">{u.tasksThisMonth}</span>{" "}
                          tasks
                        </p>
                        <p>
                          <span className="font-medium text-foreground">{u.hoursThisMonth}h</span>{" "}
                          logged
                        </p>
                      </TableCell>

                      {/* Active toggle */}
                      <TableCell>
                        <Switch
                          checked={u.isActive}
                          onCheckedChange={() => toggleActive(u.userId)}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex gap-2">
                          <button className="rounded-md border border-border p-1.5 text-primary hover:bg-primary/10">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => removeUser(u.userId)}
                            className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`h-7 w-7 rounded-md text-xs font-semibold ${
                    n === page
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit footer */}
      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <h3 className="text-sm font-bold text-foreground">User Access Audit</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Review system-wide changes to user permissions from the last 24 hours to ensure
              organizational compliance.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {["A", "B", "C"].map((c) => (
                  <div
                    key={c}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground"
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">3 Compliance Officers</p>
                <p className="text-[10px] text-muted-foreground">Reviewing logs now</p>
              </div>
            </div>
          </div>
          <BadgeCheck className="h-16 w-16 text-primary/20" />
        </CardContent>
      </Card>
    </div>
  );
};

export default UserAdministration;