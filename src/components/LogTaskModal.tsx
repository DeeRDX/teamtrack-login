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
<<<<<<< Updated upstream
import { useTasks, type Task } from "@/context/TasksContext";
=======
import CreatableSelect from "react-select/creatable";
>>>>>>> Stashed changes

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

  const options = [
    { label: "Daily Standup", value: "daily-standup" },
    { label: "Project Meeting", value: "project-meeting" },
  ];

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

<<<<<<< Updated upstream
  const handleSave = () => {
    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    onOpenChange(false);
=======
  const handleSave = async () => {
    try {
      const response = await fetch("http://localhost:3000/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          plannedHrs: Number(formData.plannedHrs),
          loggedHrs: Number(formData.loggedHrs),
        }),
      });

      const data = await response.json();
      console.log("Saved to API:", data);

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving task:", error);
    }
>>>>>>> Stashed changes
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
              <CreatableSelect
                options={options}
                value={
                  formData.mainId
                    ? { label: formData.mainId, value: formData.mainId }
                    : null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    mainId: selected?.value || "",
                  }));
                }}
                onInputChange={(inputValue, actionMeta) => {
                  if (actionMeta.action === "input-change") {
                    setFormData((prev) => ({
                      ...prev,
                      mainId: inputValue,
                    }));
                  }
                }}
                placeholder="Select or type Main ID"
                isClearable
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Task Ref
              </Label>
              <CreatableSelect
                options={options}
                value={
                  formData.mainId
                    ? { label: formData.mainId, value: formData.mainId }
                    : null
                }
                onChange={(selected) => {
                  setFormData((prev) => ({
                    ...prev,
                    mainId: selected?.value || "",
                  }));
                }}
                onInputChange={(inputValue, actionMeta) => {
                  if (actionMeta.action === "input-change") {
                    setFormData((prev) => ({
                      ...prev,
                      mainId: inputValue,
                    }));
                  }
                }}
                placeholder="Select or type Main ID"
                isClearable
                className="text-sm"
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
