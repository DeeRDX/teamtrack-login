import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CalendarDays, Download, ArrowRight, X } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  utilization: number;
  initials: string;
  tasks: { date: string; taskId: string; description: string; category: string; hours: string }[];
}

const TEAM: TeamMember[] = [
  {
    id: "john",
    name: "John",
    role: "Tech Lead",
    utilization: 88,
    initials: "JN",
    tasks: [
      { date: "Dec 07", taskId: "145266", description: "API bug fix for auth endpoint", category: "CR", hours: "4.5h" },
      { date: "Dec 07", taskId: "—", description: "Stand-up & Daily meeting", category: "MEETING", hours: "1.0h" },
      { date: "Dec 06", taskId: "145289", description: "React auth logic refactor", category: "CR", hours: "8.0h" },
      { date: "Dec 05", taskId: "145302", description: "Database migration scripts", category: "BAU", hours: "6.5h" },
    ],
  },
  { id: "adam", name: "Adam", role: "Backend Dev", utilization: 70, initials: "AD", tasks: [] },
  { id: "sara", name: "Sara", role: "QA Engineer", utilization: 100, initials: "SA", tasks: [] },
  { id: "mike", name: "Mike", role: "Lead Architect", utilization: 95, initials: "MK", tasks: [] },
];

const categoryStyles: Record<string, string> = {
  CR: "bg-red-50 text-red-600 border-red-200",
  MEETING: "bg-blue-50 text-blue-600 border-blue-200",
  BAU: "bg-amber-50 text-amber-600 border-amber-200",
};

const utilColor = (v: number) => {
  if (v < 70) return "bg-red-500";
  if (v <= 90) return "bg-blue-300";
  return "bg-primary";
};

const MyTeam = () => {
  const [selected, setSelected] = useState<TeamMember | null>(TEAM[0]);

  const totalHours = selected
    ? selected.tasks.reduce((sum, t) => sum + parseFloat(t.hours), 0)
    : 0;

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground">Team Utilization</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              <span className="font-mono">MR_IFRS19 TEAM</span> · WEEK OF DEC 07, 2026
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Dec 07 - Dec 14, 2026
            </Button>
            <Button size="sm" className="gap-1.5">
              <Download className="h-3.5 w-3.5" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Utilization Overview */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Utilization Overview</h3>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> &lt;70%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-300" /> 70-90%
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> &gt;90%
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {TEAM.map((m) => (
              <div key={m.id} className="flex items-center gap-4">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-muted text-xs font-semibold">
                    {m.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="w-32">
                  <p className="text-sm font-semibold text-foreground">{m.name}</p>
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {m.role}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${utilColor(m.utilization)}`}
                      style={{ width: `${m.utilization}%` }}
                    />
                  </div>
                </div>
                <div className="w-12 text-right text-sm font-semibold text-foreground">
                  {m.utilization}%
                </div>
                <button
                  onClick={() => setSelected(m)}
                  className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  View Tasks <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Task Details */}
        {selected && (
          <div className="mt-5 rounded-lg border border-border bg-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-foreground">
                  Task Details: {selected.name}
                </h3>
                <span className="rounded-md bg-secondary px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-secondary-foreground">
                  {selected.role}
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Date</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Task ID</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Description</TableHead>
                    <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Category</TableHead>
                    <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider">Hours</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selected.tasks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No tasks logged this week.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selected.tasks.map((t, i) => (
                      <TableRow key={i}>
                        <TableCell className="text-xs text-muted-foreground">{t.date}</TableCell>
                        <TableCell className="font-mono text-xs font-semibold text-primary">
                          {t.taskId}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">{t.description}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase ${
                              categoryStyles[t.category] || "bg-muted text-muted-foreground border-border"
                            }`}
                          >
                            {t.category}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold text-foreground">
                          {t.hours}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {selected.tasks.length > 0 && (
                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-4 py-3">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Total for week
                  </span>
                  <span className="text-sm font-bold text-foreground">{totalHours.toFixed(1)}h</span>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyTeam;
