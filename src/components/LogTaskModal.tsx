import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTasks, type Task } from "@/context/TasksContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { createTask, updateTaskApi } from "@/api/tasks.api";
import { toast } from "@/hooks/use-toast";

interface LogTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

interface FormState {
  mainId: string;
  taskRefId: string;
  taskDescription: string;
  inProduction: boolean;
  complexity: string;
  classification: string;
  logDate: string;
  planStartDate: string;
  planEndDate: string;
  actualStartDate: string;
  actualEndDate: string;
  plannedHours: string;
  hoursLogged: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm: FormState = {
  mainId: "",
  taskRefId: "",
  taskDescription: "",
  inProduction: false,
  complexity: "Low",
  classification: "CR",
  logDate: today(),
  planStartDate: today(),
  planEndDate: today(),
  actualStartDate: today(),
  actualEndDate: today(),
  plannedHours: "0",
  hoursLogged: "0",
};

const PRESET_OPTIONS = [
  { label: "Daily Standup", value: "Daily Standup" },
  { label: "Project Meeting", value: "Project Meeting" },
];

interface CreatableComboboxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  options: { label: string; value: string }[];
}

const CreatableCombobox = ({ value, onChange, placeholder, options }: CreatableComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState(value);

  useEffect(() => {
    setInput(value);
  }, [value]);

  const matches = options.filter((o) =>
    o.label.toLowerCase().includes(input.toLowerCase())
  );
  const showCreate =
    input.trim().length > 0 &&
    !options.some((o) => o.value.toLowerCase() === input.trim().toLowerCase());

  const commit = (val: string) => {
    onChange(val);
    setInput(val);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              onChange(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            placeholder={placeholder}
            className="pr-8"
          />
          <ChevronsUpDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="p-1 w-[--radix-popover-trigger-width]"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="max-h-56 overflow-y-auto">
          {matches.length === 0 && !showCreate && (
            <div className="px-2 py-1.5 text-xs text-muted-foreground">No options</div>
          )}
          {matches.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => commit(opt.value)}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
          {showCreate && (
            <button
              type="button"
              onClick={() => commit(input.trim())}
              className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              + Use "{input.trim()}"
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

const LogTaskModal = ({ open, onOpenChange, editingTask }: LogTaskModalProps) => {
  const { addTask, updateTask } = useTasks();
  const [formData, setFormData] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        mainId: editingTask.mainId ?? "",
        taskRefId: editingTask.taskRefId ?? "",
        taskDescription: editingTask.taskDescription ?? "",
        inProduction: !!editingTask.inProduction,
        complexity: editingTask.complexity ?? "Low",
        classification: editingTask.classification ?? "CR",
        logDate: editingTask.logDate ?? today(),
        planStartDate: editingTask.planStartDate ?? today(),
        planEndDate: editingTask.planEndDate ?? today(),
        actualStartDate: editingTask.actualStartDate ?? today(),
        actualEndDate: editingTask.actualEndDate ?? today(),
        plannedHours: String(editingTask.plannedHours ?? 0),
        hoursLogged: String(editingTask.hoursLogged ?? 0),
      });
    } else {
      setFormData(emptyForm);
    }
  }, [editingTask, open]);

  const handleChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const payload = {
      mainId: formData.mainId,
      taskRefId: formData.taskRefId,
      taskDescription: formData.taskDescription,
      inProduction: formData.inProduction,
      complexity: formData.complexity,
      classification: formData.classification,
      logDate: formData.logDate,
      planStartDate: formData.planStartDate,
      planEndDate: formData.planEndDate,
      actualStartDate: formData.actualStartDate,
      actualEndDate: formData.actualEndDate,
      plannedHours: Number(formData.plannedHours) || 0,
      hoursLogged: Number(formData.hoursLogged) || 0,
    };

    setSaving(true);
    try {
      if (editingTask) {
        await updateTaskApi(editingTask.id, payload);
        updateTask(editingTask.id, payload);
        toast({ title: "Task updated", description: "Changes saved successfully." });
      } else {
        const created = await createTask(payload);
        // Prefer server-issued id when available
        addTask({ ...payload, ...(created?.id ? {} : {}) });
        toast({ title: "Task created", description: "Task saved successfully." });
      }
      onOpenChange(false);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save task. Please try again.";
      toast({
        title: "Save failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const labelClass =
    "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Main ID</Label>
              <CreatableCombobox
                value={formData.mainId}
                onChange={(v) => handleChange("mainId", v)}
                options={PRESET_OPTIONS}
                placeholder="Select or type"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Task Ref ID</Label>
              <CreatableCombobox
                value={formData.taskRefId}
                onChange={(v) => handleChange("taskRefId", v)}
                options={PRESET_OPTIONS}
                placeholder="Select or type"
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Complexity</Label>
              <Select
                value={formData.complexity}
                onValueChange={(v) => handleChange("complexity", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className={labelClass}>Task Description</Label>
            <Textarea
              placeholder="Describe your progress..."
              className="min-h-[80px] resize-y"
              value={formData.taskDescription}
              onChange={(e) => handleChange("taskDescription", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Classification</Label>
              <Select
                value={formData.classification}
                onValueChange={(v) => handleChange("classification", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CR">CR</SelectItem>
                  <SelectItem value="Bug">Bug</SelectItem>
                  <SelectItem value="Feature">Feature</SelectItem>
                  <SelectItem value="Support">Support</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Planned Hours</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.plannedHours}
                onChange={(e) => handleChange("plannedHours", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Hours Logged</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={formData.hoursLogged}
                onChange={(e) => handleChange("hoursLogged", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Log Date</Label>
              <Input
                type="date"
                value={formData.logDate}
                onChange={(e) => handleChange("logDate", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 pb-1 col-span-2 justify-end">
              <Label className="text-sm font-medium text-foreground">
                In Production
              </Label>
              <Switch
                checked={formData.inProduction}
                onCheckedChange={(v) => handleChange("inProduction", v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className={labelClass}>Plan Start Date</Label>
              <Input
                type="date"
                value={formData.planStartDate}
                onChange={(e) => handleChange("planStartDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Plan End Date</Label>
              <Input
                type="date"
                value={formData.planEndDate}
                onChange={(e) => handleChange("planEndDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Actual Start Date</Label>
              <Input
                type="date"
                value={formData.actualStartDate}
                onChange={(e) => handleChange("actualStartDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className={labelClass}>Actual End Date</Label>
              <Input
                type="date"
                value={formData.actualEndDate}
                onChange={(e) => handleChange("actualEndDate", e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t border-border px-6 py-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{editingTask ? "Update Task" : "Save Task"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogTaskModal;
