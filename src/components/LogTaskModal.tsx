import { useState } from "react";
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

interface LogTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const LogTaskModal = ({ open, onOpenChange }: LogTaskModalProps) => {
  const [formData, setFormData] = useState({
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
  });

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log("Task saved:", formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-xl font-bold text-foreground">
            Add New Task
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-5">
          {/* Row 1: Main ID, Task Ref, Complexity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Main ID
              </Label>
              <Input
                placeholder="e.g. 45877"
                value={formData.mainId}
                onChange={(e) => handleChange("mainId", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Task Ref
              </Label>
              <Input
                placeholder="e.g. 145266"
                value={formData.taskRef}
                onChange={(e) => handleChange("taskRef", e.target.value)}
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

          {/* Description */}
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

          {/* Row 2: Classification, Planned Hrs, Logged Hrs */}
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

          {/* Row 3: In Production toggle, Start Date, End Date */}
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
          <Button onClick={handleSave}>Save Task</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LogTaskModal;
