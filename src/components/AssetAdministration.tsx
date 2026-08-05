import { useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Boxes,
  Plus,
  Loader2,
  Users,
  Briefcase,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminAsset {
  assetId: number;
  assetName: string;
  function: string | null;
  description: string | null;
  amUserId: number | null;
  amUserName: string | null;
  dmUserId: number | null;
  dmUserName: string | null;
  dhUserId: number | null;
  dhUserName: string | null;
  userCount: number;
  taskCount: number;
}

interface FunctionOption {
  funcId: number;
  funcName: string;
}

interface UserOption {
  userId: number;
  fullName: string;
}

interface AddAssetForm {
  assetName: string;
  description: string;
  functionId: string;
  amUserId: string;
  dmUserId: string;
  dhUserId: string;
}

const EMPTY_FORM: AddAssetForm = {
  assetName: "",
  description: "",
  functionId: "",
  amUserId: "",
  dmUserId: "",
  dhUserId: "",
};

const PAGE_SIZE = 10;

// ── Component ────────────────────────────────────────────────────────────────

const AssetAdministration = () => {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AddAssetForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<AddAssetForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Dropdown options
  const [functions, setFunctions] = useState<FunctionOption[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // ── Fetch all assets ───────────────────────────────────────────────────────
  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get<AdminAsset[]>("/admin/assets");
      setAssets(data);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // ── Fetch dropdown options when modal opens ───────────────────────────────
  const openAddAssetModal = async () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError(null);
    setModalOpen(true);

    if (functions.length && users.length) return; // already fetched

    setDropdownLoading(true);
    try {
      const [functionsRes, usersRes] = await Promise.all([
        axiosInstance.get<FunctionOption[]>("/admin/functions"),
        axiosInstance.get<UserOption[]>("/admin/allusers"),
      ]);
      setFunctions(functionsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch dropdown options:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  // ── Form field helpers ─────────────────────────────────────────────────────
  const setField = (field: keyof AddAssetForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  const validate = (): boolean => {
    const errors: Partial<AddAssetForm> = {};
    if (!form.assetName.trim()) errors.assetName = "Asset name is required.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleAddAsset = async () => {
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      assetName: form.assetName.trim(),
      description: form.description.trim() || null,
      functionId: form.functionId ? Number(form.functionId) : null,
      amUserId: form.amUserId ? Number(form.amUserId) : null,
      dmUserId: form.dmUserId ? Number(form.dmUserId) : null,
      dhUserId: form.dhUserId ? Number(form.dhUserId) : null,
    };

    try {
      await axiosInstance.post("/admin/assets", payload);
      await fetchAssets();
      setModalOpen(false);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.title ||
        "Failed to create asset. Please try again.";
      setSubmitError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSubmitting(false);
    }
  };

  // ── Search + pagination ────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      assets.filter((a) =>
        [a.assetName, a.function, a.description]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [assets, query],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Admin <span className="mx-1">›</span> Asset Management
        </p>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Asset Administration</h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Manage assets, their function, and assigned account/delivery leadership.
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openAddAssetModal}>
            <Plus className="h-4 w-4" /> Add Asset
          </Button>
        </div>
      </div>

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
              placeholder="Search by asset name, function or description..."
              className="h-7 border-0 px-0 text-sm shadow-none focus-visible:ring-0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-[10px] uppercase tracking-wider">Asset</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Function</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Leadership (AM / DM / DH)</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Users</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Tasks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12">
                    <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading assets...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No assets found.
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((a) => (
                  <TableRow key={a.assetId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <Boxes className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{a.assetName}</p>
                          <p className="max-w-xs truncate text-xs text-muted-foreground">
                            {a.description ?? "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="h-3.5 w-3.5" />
                        {a.function ?? "—"}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <p><span className="font-medium text-foreground">AM:</span> {a.amUserName ?? "—"}</p>
                      <p><span className="font-medium text-foreground">DM:</span> {a.dmUserName ?? "—"}</p>
                      <p><span className="font-medium text-foreground">DH:</span> {a.dhUserName ?? "—"}</p>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {a.userCount}
                      </div>
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">{a.taskCount}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} assets
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                Prev
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
                className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:bg-muted disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Add Asset Modal ─────────────────────────────────────────────────── */}
      <Dialog open={modalOpen} onOpenChange={(open) => !submitting && setModalOpen(open)}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Asset
            </DialogTitle>
          </DialogHeader>

          {dropdownLoading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading form options...
            </div>
          ) : (
            <div className="grid gap-4 py-2">
              {/* Asset Name */}
              <div className="space-y-1.5">
                <Label htmlFor="assetName" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Asset Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="assetName"
                  placeholder="e.g. MR_IFRS19"
                  value={form.assetName}
                  onChange={(e) => setField("assetName", e.target.value)}
                  className={formErrors.assetName ? "border-destructive" : ""}
                />
                {formErrors.assetName && (
                  <p className="text-[11px] text-destructive">{formErrors.assetName}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="e.g. IFRS 19 regulatory project"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                  rows={2}
                />
              </div>

              {/* Function */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Function
                </Label>
                <Select value={form.functionId} onValueChange={(val) => setField("functionId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    {functions.map((f) => (
                      <SelectItem key={f.funcId} value={String(f.funcId)}>
                        {f.funcName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Divider */}
              <div className="border-t border-border pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Leadership
                </p>
              </div>

              {/* Account Manager */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Account Manager
                </Label>
                <Select value={form.amUserId} onValueChange={(val) => setField("amUserId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account manager" />
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

              {/* Delivery Manager */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Manager
                </Label>
                <Select value={form.dmUserId} onValueChange={(val) => setField("dmUserId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery manager" />
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

              {/* Delivery Head */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Delivery Head
                </Label>
                <Select value={form.dhUserId} onValueChange={(val) => setField("dhUserId", val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select delivery head" />
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

              {/* API error banner */}
              {submitError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {submitError}
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setModalOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddAsset} disabled={submitting || dropdownLoading} className="gap-1.5">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Asset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetAdministration;