import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTasks, type Task } from "@/context/TasksContext";
import LogTaskModal from "./LogTaskModal";
import { toast } from "sonner";

const complexityStyles: Record<string, string> = {
  Low: "bg-green-50 text-green-600 border-green-200",
  Medium: "bg-amber-50 text-amber-600 border-amber-200",
  High: "bg-red-50 text-red-600 border-red-200",
};

const TaskEntriesTable = () => {
  const { tasks, deleteTask, loading } = useTasks();
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleEdit = (task: Task) => {
    setEditTask(task);
    setEditOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteTask(deleteId);
      toast.success("Task deleted successfully.");
    } catch {
      toast.error("Failed to delete task. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="text-base font-bold">Task Log Entries</CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              All tasks logged this week — click edit or delete to manage entries.
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            {tasks.length} {tasks.length === 1 ? "Entry" : "Entries"}
          </span>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Main ID</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Task Ref</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Description</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Class</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Complexity</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Planned</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Logged</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-10">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading tasks...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : tasks.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                      No tasks logged yet. Click "Log Task" to add your first entry.
                    </TableCell>
                  </TableRow>
                ) : (
                  tasks.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-mono text-xs font-semibold text-foreground">
                        {task.mainId || "—"}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {task.taskRefId || "—"}
                      </TableCell>
                      <TableCell className="max-w-[220px] truncate text-sm text-foreground">
                        {task.taskDescription || "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                          {task.classification}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                            complexityStyles[task.complexity] || "bg-muted text-muted-foreground border-border"
                          }`}
                        >
                          {task.complexity}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {task.plannedHours}h
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold text-foreground">
                        {task.hoursLogged}h
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {task.logDate || "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEdit(task)}
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteId(task.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <LogTaskModal
        open={editOpen}
        onOpenChange={(o) => {
          setEditOpen(o);
          if (!o) setEditTask(null);
        }}
        editingTask={editTask}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && !deleting && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this task entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The task log entry will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TaskEntriesTable;