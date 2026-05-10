import { useMemo, useState } from "react";
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
} from "lucide-react";

interface AdminUser {
  id: string;
  empNo: string;
  name: string;
  email: string;
  role: "ADMIN" | "MANAGER" | "STAFF" | "JUNIOR";
  team: string;
  ast: string;
  mgr: string;
  active: boolean;
}

const seedUsers: AdminUser[] = [
  { id: "1001", empNo: "EN-0928", name: "Sean Kingston", email: "sean.k@teamarch.com", role: "ADMIN", team: "Core Architecture", ast: "S101", mgr: "0092", active: true },
  { id: "1002", empNo: "EN-0412", name: "Ammy", email: "ammy.v@teamarch.com", role: "MANAGER", team: "Design Systems", ast: "S102", mgr: "0093", active: true },
  { id: "1003", empNo: "EN-0881", name: "John", email: "john@teamarch.com", role: "STAFF", team: "Backend Services", ast: "S103", mgr: "1001", active: true },
  { id: "1004", empNo: "EN-0125", name: "Adam", email: "adam.s@teamarch.com", role: "JUNIOR", team: "Frontend Ops", ast: "S104", mgr: "1002", active: false },
];

const roleStyles: Record<AdminUser["role"], string> = {
  ADMIN: "bg-primary/10 text-primary border-primary/20",
  MANAGER: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  STAFF: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  JUNIOR: "bg-pink-500/10 text-pink-600 border-pink-500/20",
};

const UserAdministration = () => {
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () =>
      users.filter((u) =>
        [u.name, u.email, u.id, u.empNo].join(" ").toLowerCase().includes(query.toLowerCase()),
      ),
    [users, query],
  );

  const toggleActive = (id: string) =>
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));

  const removeUser = (id: string) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const activePct = Math.round(
    (users.filter((u) => u.active).length / Math.max(users.length, 1)) * 100,
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Heading */}
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

      {/* Filter cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, email or ID..."
                className="h-7 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>
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
                <p className="text-lg font-bold text-foreground">1,284</p>
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
                <p className="text-lg font-bold text-foreground">{activePct}%</p>
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
                <TableHead className="text-[10px] uppercase tracking-wider">User ID</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Employee #</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Full Name</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Role / Team</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">IDs (Asset/Mgr)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Status</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium text-primary">#{u.id}</TableCell>
                  <TableCell className="text-muted-foreground">{u.empNo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${roleStyles[u.role]} mb-1 text-[10px] font-bold`}>
                      {u.role}
                    </Badge>
                    <p className="text-xs text-muted-foreground">{u.team}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <p>AST: {u.ast}</p>
                    <p>MGR: {u.mgr}</p>
                  </TableCell>
                  <TableCell>
                    <Switch checked={u.active} onCheckedChange={() => toggleActive(u.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="rounded-md border border-border p-1.5 text-primary hover:bg-primary/10">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => removeUser(u.id)}
                        className="rounded-md border border-border p-1.5 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing 1 to {filtered.length} of 1,284 users
            </p>
            <div className="flex items-center gap-1">
              <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted">
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  className={`h-7 w-7 rounded-md text-xs font-semibold ${
                    n === 1
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button className="rounded-md border border-border p-1.5 text-muted-foreground hover:bg-muted">
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
