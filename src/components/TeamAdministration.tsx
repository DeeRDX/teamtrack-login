import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Boxes,
  UsersRound,
  Plus,
  Loader2,
  Trash2,
  Clock,
} from "lucide-react";
 
interface AdminTeam {
  teamId: number;
  teamName: string;
  assetId?: number | null;
  assetName?: string | null;
  tdhUserId?: number | null;
  tdhUserName?: string | null;
  dailyHours?: number | null;
  memberCount?: number;
}
 
interface AssetOption {
  assetId: number;
  assetName: string;
}
 
interface UserOption {
  userId: number;
  fullName: string;
}
 
interface TeamForm {
  assetId: string;
  teamName: string;
  dailyHours: string;
  tdhUserId: string;
}
 
const EMPTY_FORM: TeamForm = {
  assetId: "",
  teamName: "",
  dailyHours: "8.5",
  tdhUserId: "",
};
 
const TeamAdministration = () => {
  const [teams, setTeams] = useState<AdminTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [assetFilter, setAssetFilter] = useState<string>("all");
 
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<TeamForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<TeamForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
 
  const [assets, setAssets] = useState<AssetOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
 
  const fetchTeams = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get<AdminTeam[]>("/admin/teams");
      setTeams(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch teams:", err);
    } finally {
      setLoading(false);
    }
  };
 
  const fetchAssets = async () => {
    try {
      const { data } = await axiosInstance.get<any[]>("/admin/assets");
      setAssets(
        (Array.isArray(data) ? data : []).map((a: any) => ({
          assetId: a.assetId,
          assetName: a.assetName,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    }
  };
 
  useEffect(() => {
    fetchTeams();
    fetchAssets();
  }, []);
 
  const openAddTeamModal = async () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError(null);
    setModalOpen(true);
 
    if (users.length && assets.length) return;
 
    setDropdownLoading(true);
    try {
      const requests: Promise<any>[] = [axiosInstance.get<UserOption[]>("/admin/allusers")];
      if (!assets.length) requests.push(fetchAssets());
      const [usersRes] = await Promise.all(requests);
      setUsers(
        (Array.isArray(usersRes?.data) ? usersRes.data : []).map((u: any) => ({
          userId: u.userId,
          fullName: u.fullName,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch form options:", err);
    } finally {
      setDropdownLoading(false);
    }
  };
 
  const setField = (field: keyof TeamForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };
 
  const validate = () => {
    const errors: Partial<TeamForm> = {};
    if (!form.assetId) errors.assetId = "Please select an asset.";
    if (!form.teamName.trim()) errors.teamName = "Team name is required.";
    const hours = Number(form.dailyHours);
    if (!form.dailyHours.trim() || Number.isNaN(hours) || hours <= 0 || hours > 24)
      errors.dailyHours = "Enter valid daily hours (0-24).";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
 
  const handleCreateTeam = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
 
    const payload = {
      assetId: Number(form.assetId),
      teamName: form.teamName.trim(),
      dailyHours: Number(form.dailyHours),
      tdhUserId: form.tdhUserId ? Number(form.tdhUserId) : null,
    };
 
    try {
      await axiosInstance.post("/admin/teams", payload);
      await fetchTeams();
      setModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to create team. Please try again.";
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };
 
  // Note: no DELETE /api/admin/teams/{id} endpoint exists on the backend yet —
  // this only removes the row locally. Let me know if you want that endpoint added.
  const removeTeam = (teamId: number) =>
    setTeams((prev) => prev.filter((t) => t.teamId !== teamId));
 
  const filtered = useMemo(
    () =>
      teams.filter((t) => {
        const matchesQuery = [t.teamName, t.assetName, t.tdhUserName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        const matchesAsset =
          assetFilter === "all" || String(t.assetId ?? "") === assetFilter;
        return matchesQuery && matchesAsset;
      }),
    [teams, query, assetFilter],
  );
 
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin <span className="mx-1">›</span> Team Management
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Team Administration</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Create and manage teams under each asset, and assign a Team Department Head (TDH).
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openAddTeamModal}>
            <Plus className="h-4 w-4" /> Add Team
          </Button>
        </div>
      </div>
 
      {/* Filter / stat cards */}
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
                placeholder="Search teams..."
                className="h-7 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
          </CardContent>
        </Card>
 
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
              <Boxes className="h-5 w-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Filter by Asset
              </p>
              <Select value={assetFilter} onValueChange={setAssetFilter}>
                <SelectTrigger className="h-7 border-0 px-0 text-sm shadow-none focus:ring-0">
                  <SelectValue placeholder="All assets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All assets</SelectItem>
                  {assets.map((a) => (
                    <SelectItem key={a.assetId} value={String(a.assetId)}>
                      {a.assetName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
 
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <UsersRound className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Teams
              </p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "—" : teams.length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
 
      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-[10px] uppercase tracking-wider">Team</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Asset</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">TDH</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Daily Hours</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Members</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading teams...
                    </div>
                  </TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No teams found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((t) => (
                  <TableRow key={t.teamId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <UsersRound className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">{t.teamName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Boxes className="h-3.5 w-3.5" />
                        {t.assetName || "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.tdhUserName || "—"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {t.dailyHours != null ? `${t.dailyHours}h` : "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {t.memberCount ?? 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTeam(t.teamId)}
                        title="Remove team"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
 
      {/* ── Add Team Modal ──────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => !submitting && setModalOpen(open)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Team
            </DialogTitle>
          </DialogHeader>
 
          {dropdownLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading form options...
            </div>
          ) : (
            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Asset <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.assetId}
                  onValueChange={(val) => setField("assetId", val)}
                >
                  <SelectTrigger className={formErrors.assetId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.assetId} value={String(a.assetId)}>
                        {a.assetName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.assetId && (
                  <p className="text-[11px] text-destructive">{formErrors.assetId}</p>
                )}
              </div>
 
              <div className="space-y-1.5">
                <Label htmlFor="teamName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="teamName"
                  placeholder="e.g. MR_IFRS19 Team"
                  value={form.teamName}
                  onChange={(e) => setField("teamName", e.target.value)}
                  className={formErrors.teamName ? "border-destructive" : ""}
                />
                {formErrors.teamName && (
                  <p className="text-[11px] text-destructive">{formErrors.teamName}</p>
                )}
              </div>
 
              <div className="space-y-1.5">
                <Label htmlFor="dailyHours" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Daily Hours <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="dailyHours"
                  type="number"
                  step="0.5"
                  min="0"
                  max="24"
                  placeholder="8.5"
                  value={form.dailyHours}
                  onChange={(e) => setField("dailyHours", e.target.value)}
                  className={formErrors.dailyHours ? "border-destructive" : ""}
                />
                {formErrors.dailyHours && (
                  <p className="text-[11px] text-destructive">{formErrors.dailyHours}</p>
                )}
              </div>
 
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Team Department Head (TDH)
                </Label>
                <Select value={form.tdhUserId} onValueChange={(val) => setField("tdhUserId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select TDH (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.userId} value={String(u.userId)}>
                        {u.fullName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
 
              {submitError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {submitError}
                </div>
              )}
            </div>
          )}
 
          <DialogFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateTeam}
              disabled={submitting || dropdownLoading}
              className="gap-1.5"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Team
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
 
export default TeamAdministration;