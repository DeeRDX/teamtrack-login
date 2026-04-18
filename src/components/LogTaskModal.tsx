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
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTask?: Task | null;
}

const emptyForm = {
  mainId: "",
  taskRef: "",
  complexity: "Low",
  description: "",
  classification: "CR",
  plannedHrs: "0.0",
  loggedHrs: "0.0",
  inProduction: false,
  startDate: "",
  endDate: "",
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
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (editingTask) {
      const { id, ...rest } = editingTask;
      setFormData(rest);
    } else {
      setFormData(emptyForm);
    }
  }, [editingTask, open]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            {editingTask ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Main ID
              </Label>
              <CreatableCombobox
                value={formData.mainId}
                onChange={(v) => handleChange("mainId", v)}
                options={PRESET_OPTIONS}
                placeholder="Select or type"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Task Ref
              </Label>
              <CreatableCombobox
                value={formData.taskRef}
                onChange={(v) => handleChange("taskRef", v)}
                options={PRESET_OPTIONS}
                placeholder="Select or type"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Complexity
              </Label>
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
            <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Description
            </Label>
            <Textarea
              placeholder="Describe your progress..."
              className="min-h-[80px] resize-y"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Classification
              </Label>
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
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Planned Hrs
              </Label>
              <Input
                type="number"
                step="0.5"
                value={formData.plannedHrs}
                onChange={(e) => handleChange("plannedHrs", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Logged Hrs
              </Label>
              <Input
                type="number"
                step="0.5"
                value={formData.loggedHrs}
                onChange={(e) => handleChange("loggedHrs", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 items-end">
            <div className="flex items-center gap-3 pb-1">
              <Switch
                checked={formData.inProduction}
                onCheckedChange={(v) => handleChange("inProduction", v)}
              />
              <Label className="text-sm font-medium text-foreground">
                In Production
              </Label>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Start Date
              </Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                End Date
              </Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
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
