import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Users,
  Plus,
  Loader2,
  Trash2,
} from "lucide-react";
import axios from "axios";

// ── Types ────────────────────────────────────────────────────────────────────

interface AdminAsset {
  assetId: number;
  assetName: string;
  description?: string | null;
  assetFunction?: string | null;
  accountManagerName?: string | null;
  deliveryManagerName?: string | null;
  deliveryHeadName?: string | null;
  userCount?: number;
}

interface UserOption {
  userId: number;
  fullName: string;
}

interface AssetForm {
  assetName: string;
  description: string;
  assetFunction: string;
  accountManagerId: string;
  deliveryManagerId: string;
  deliveryHeadId: string;
}

const EMPTY_FORM: AssetForm = {
  assetName: "",
  description: "",
  assetFunction: "",
  accountManagerId: "",
  deliveryManagerId: "",
  deliveryHeadId: "",
};

const FUNCTION_OPTIONS = [
  "Regulatory",
  "Finance",
  "Technology",
  "Operations",
  "Risk",
];

const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "https://localhost:44352/api"
).replace(/\/api$/, "");

// ── Component ────────────────────────────────────────────────────────────────

const AssetAdministration = () => {
  const [assets, setAssets] = useState<AdminAsset[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<AssetForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<AssetForm>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [users, setUsers] = useState<UserOption[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const authHeader = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : undefined;
  };

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/admin/assets`, {
        headers: authHeader(),
      });
      setAssets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch assets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const openAddAssetModal = async () => {
    setForm(EMPTY_FORM);
    setFormErrors({});
    setSubmitError(null);
    setModalOpen(true);

    if (users.length) return;

    setDropdownLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/api/admin/allusers`, {
        headers: authHeader(),
      });
      setUsers(
        (Array.isArray(data) ? data : []).map((u: any) => ({
          userId: u.userId,
          fullName: u.fullName,
        })),
      );
    } catch (err) {
      console.error("Failed to fetch leadership options:", err);
    } finally {
      setDropdownLoading(false);
    }
  };

  const setField = (field: keyof AssetForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    setSubmitError(null);
  };

  const validate = () => {
    const errors: Partial<AssetForm> = {};
    if (!form.assetName.trim()) errors.assetName = "Asset name is required.";
    if (!form.assetFunction) errors.assetFunction = "Please select a function.";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAsset = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);

    const payload = {
      assetName: form.assetName.trim(),
      description: form.description.trim(),
      assetFunction: form.assetFunction,
      accountManagerId: form.accountManagerId ? Number(form.accountManagerId) : null,
      deliveryManagerId: form.deliveryManagerId ? Number(form.deliveryManagerId) : null,
      deliveryHeadId: form.deliveryHeadId ? Number(form.deliveryHeadId) : null,
    };

    try {
      await axios.post(`${BASE_URL}/api/admin/assets`, payload, {
        headers: authHeader(),
      });
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

  const removeAsset = (assetId: number) =>
    setAssets((prev) => prev.filter((a) => a.assetId !== assetId));

  const filtered = useMemo(
    () =>
      assets.filter((a) =>
        [a.assetName, a.description, a.assetFunction]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase()),
      ),
    [assets, query],
  );

  const totalUsers = assets.reduce((sum, a) => sum + (a.userCount ?? 0), 0);

  const leadershipLabel = (a: AdminAsset) => {
    const parts = [
      a.accountManagerName ? `AM: ${a.accountManagerName}` : null,
      a.deliveryManagerName ? `DM: ${a.deliveryManagerName}` : null,
      a.deliveryHeadName ? `DH: ${a.deliveryHeadName}` : null,
    ].filter(Boolean);
    return parts.length ? parts.join(" · ") : "—";
  };

  const UserSelect = ({
    label,
    field,
  }: {
    label: string;
    field: keyof AssetForm;
  }) => (
    <div className="space-y-1.5">
      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <Select
        value={form[field] as string}
        onValueChange={(val) => setField(field, val)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select" />
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
  );

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
              Manage assets, their function, and assigned account or delivery leadership.
            </p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={openAddAssetModal}>
            <Plus className="h-4 w-4" /> Add Asset
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
                placeholder="Search by asset, function..."
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
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Total Assets
              </p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "—" : assets.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
              <Users className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Assigned Users
              </p>
              <p className="text-lg font-bold text-foreground">
                {loading ? "—" : totalUsers}
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
                <TableHead className="text-[10px] uppercase tracking-wider">Asset</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Function</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Leadership</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Users</TableHead>
                <TableHead className="text-[10px] uppercase tracking-wider">Actions</TableHead>
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
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No assets found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((a) => (
                  <TableRow key={a.assetId}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                          <Boxes className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{a.assetName}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.description || "—"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {a.assetFunction || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {leadershipLabel(a)}
                    </TableCell>
                    <TableCell className="text-sm text-foreground">
                      {a.userCount ?? 0}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAsset(a.assetId)}
                        title="Remove asset"
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

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Description
                </Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="e.g. IFRS 19 regulatory project"
                  value={form.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Function <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={form.assetFunction}
                  onValueChange={(val) => setField("assetFunction", val)}
                >
                  <SelectTrigger className={formErrors.assetFunction ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select function" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUNCTION_OPTIONS.map((f) => (
                      <SelectItem key={f} value={f}>
                        {f}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.assetFunction && (
                  <p className="text-[11px] text-destructive">{formErrors.assetFunction}</p>
                )}
              </div>

              <div className="border-t border-border pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Leadership
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <UserSelect label="Account Mgr" field="accountManagerId" />
                <UserSelect label="Delivery Mgr" field="deliveryManagerId" />
                <UserSelect label="Delivery Head" field="deliveryHeadId" />
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
              onClick={handleCreateAsset}
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
