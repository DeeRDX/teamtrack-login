import { useCallback, useEffect, useMemo, useState } from "react";
import axiosInstance from "@/api/axios";
import { AlertCircle, BriefcaseBusiness, Download, Loader2, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeamMember {
  userId: number;
  enumber: string;
  fullName: string;
  roleName: string;
  teamName: string | null;
  assetName: string | null;
  assetFunction: string | null;
  hoursSummary: {
    hoursLoggedThisWeek: number;
    hoursExpectedThisWeek: number;
    hoursLoggedThisMonth: number;
    hoursExpectedThisMonth: number;
    weekBreakdown: {
      isLeaveDay: boolean;
      leaveType: string | null;
    }[];
  } | null;
  leaveSummary: {
    totalLeavesThisMonth: number;
  } | null;
}

interface UserListItem {
  userId: number;
}

type Range = "week" | "month";
type UtilizationFilter = "all" | "below" | "within" | "above";

const loggedHoursFor = (member: TeamMember, range: Range) =>
  range === "week"
    ? member.hoursSummary?.hoursLoggedThisWeek ?? 0
    : member.hoursSummary?.hoursLoggedThisMonth ?? 0;

const expectedHoursFor = (member: TeamMember, range: Range) =>
  range === "week"
    ? member.hoursSummary?.hoursExpectedThisWeek ?? 0
    : member.hoursSummary?.hoursExpectedThisMonth ?? 0;

const leaveDaysFor = (member: TeamMember, range: Range) =>
  range === "week"
    ? (member.hoursSummary?.weekBreakdown ?? []).reduce(
        (days, day) => days + (day.isLeaveDay ? (day.leaveType === "Half" ? 0.5 : 1) : 0),
        0,
      )
    : member.leaveSummary?.totalLeavesThisMonth ?? 0;

const utilizationFor = (member: TeamMember, range: Range) => {
  const expected = expectedHoursFor(member, range);
  return expected > 0 ? Math.round((loggedHoursFor(member, range) / expected) * 100) : 0;
};

const initialsFor = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

const utilizationClass = (utilization: number) => {
  if (utilization < 70) return "bg-red-50 text-red-700";
  if (utilization <= 90) return "bg-amber-50 text-amber-700";
  return "bg-green-50 text-green-700";
};

const DeliveryManagerView = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [range, setRange] = useState<Range>("week");
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [utilizationFilter, setUtilizationFilter] = useState<UtilizationFilter>("all");

  const fetchRoster = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: users } = await axiosInstance.get<UserListItem[]>("/users");
      const memberResponses = await Promise.all(
        users.map(({ userId }) => axiosInstance.get<TeamMember>(`/users/${userId}`)),
      );
      setMembers(memberResponses.map(({ data }) => data));
    } catch (err) {
      console.error("Failed to fetch delivery manager roster:", err);
      setError("We couldn't load your project portfolio. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const assets = useMemo(() => {
    const groups = new Map<string, TeamMember[]>();
    members.forEach((member) => {
      const assetName = member.assetName || "Unassigned";
      groups.set(assetName, [...(groups.get(assetName) ?? []), member]);
    });

    return Array.from(groups, ([name, assetMembers]) => {
      const expected = assetMembers.reduce((sum, member) => sum + expectedHoursFor(member, range), 0);
      const logged = assetMembers.reduce((sum, member) => sum + loggedHoursFor(member, range), 0);
      const teams = new Set(assetMembers.map((member) => member.teamName).filter(Boolean));
      const assetFunction = assetMembers.find((member) => member.assetFunction)?.assetFunction;
      return {
        name,
        members: assetMembers,
        teamCount: teams.size,
        assetFunction,
        utilization: expected > 0 ? Math.round((logged / expected) * 100) : 0,
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [members, range]);

  useEffect(() => {
    if (assets.length === 0) {
      setSelectedAsset(null);
    } else if (!selectedAsset || !assets.some((asset) => asset.name === selectedAsset)) {
      setSelectedAsset(assets[0].name);
    }
  }, [assets, selectedAsset]);

  const selectedProject = assets.find((asset) => asset.name === selectedAsset);
  const projectMembers = selectedProject?.members ?? [];
  const teams = Array.from(
    new Set(projectMembers.map((member) => member.teamName).filter((name): name is string => !!name)),
  ).sort((a, b) => a.localeCompare(b));

  const filteredMembers = projectMembers.filter((member) => {
    const utilization = utilizationFor(member, range);
    const matchesTeam = selectedTeam === "all" || member.teamName === selectedTeam;
    const matchesUtilization =
      utilizationFilter === "all" ||
      (utilizationFilter === "below" && utilization < 70) ||
      (utilizationFilter === "within" && utilization >= 70 && utilization <= 90) ||
      (utilizationFilter === "above" && utilization > 90);
    return matchesTeam && matchesUtilization;
  });

  const totalExpected = members.reduce((sum, member) => sum + expectedHoursFor(member, range), 0);
  const totalLogged = members.reduce((sum, member) => sum + loggedHoursFor(member, range), 0);
  const averageUtilization =
    totalExpected > 0 ? Math.round((totalLogged / totalExpected) * 100) : 0;
  const belowTargetCount = members.filter((member) => utilizationFor(member, range) < 70).length;

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading your project portfolio...
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 p-12 text-center">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={fetchRoster}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground">My projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Delivery portfolio overview · {range === "week" ? "this week" : "this month"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border p-1">
            {(["week", "month"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setRange(value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                  range === value
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                This {value}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Assets" value={assets.length} icon={<BriefcaseBusiness className="h-4 w-4" />} />
        <SummaryCard label="Team members" value={members.length} icon={<Users className="h-4 w-4" />} />
        <SummaryCard label="Avg utilization" value={`${averageUtilization}%`} detail={range === "week" ? "This week" : "This month"} />
        <SummaryCard label="Below 70%" value={belowTargetCount} detail="Team members" />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Your assets</h3>
          <span className="text-xs text-muted-foreground">{assets.length} projects</span>
        </div>
        {assets.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No project members are assigned to your portfolio yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {assets.map((asset) => (
              <button
                key={asset.name}
                onClick={() => {
                  setSelectedAsset(asset.name);
                  setSelectedTeam("all");
                  setUtilizationFilter("all");
                }}
                className={`rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary/50 ${
                  selectedAsset === asset.name ? "border-primary ring-1 ring-primary/20" : "border-border"
                }`}
              >
                <p className="font-mono text-sm font-bold text-foreground">{asset.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {asset.assetFunction || `${asset.teamCount} ${asset.teamCount === 1 ? "team" : "teams"}`}
                  {" · "}{asset.members.length} members
                </p>
                <div className="mt-4 flex items-end justify-between">
                  <span className="text-xs text-muted-foreground">Avg utilization</span>
                  <span className="text-lg font-semibold text-foreground">{asset.utilization}%</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {selectedProject && (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  {selectedProject.name} · team members
                </h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedProject.assetFunction || "Project portfolio"} · this {range}, leave-adjusted expected hours
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <UtilizationLegend color="bg-red-500" label="Below 70%" />
                  <UtilizationLegend color="bg-amber-400" label="70 to 90%" />
                  <UtilizationLegend color="bg-green-500" label="Above 90%" />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="h-9 w-36 text-sm">
                    <SelectValue placeholder="All teams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All teams</SelectItem>
                    {teams.map((team) => <SelectItem key={team} value={team}>{team}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={utilizationFilter} onValueChange={(value) => setUtilizationFilter(value as UtilizationFilter)}>
                  <SelectTrigger className="h-9 w-40 text-sm">
                    <SelectValue placeholder="All utilization" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All utilization</SelectItem>
                    <SelectItem value="below">Below 70%</SelectItem>
                    <SelectItem value="within">70 to 90%</SelectItem>
                    <SelectItem value="above">Above 90%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead>Member</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Hours</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead className="text-right">Leave</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                        No members match these filters.
                      </TableCell>
                    </TableRow>
                  ) : filteredMembers.map((member) => {
                    const utilization = utilizationFor(member, range);
                    return (
                      <TableRow key={member.userId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-muted text-xs font-semibold">
                                {initialsFor(member.fullName)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium text-foreground">{member.fullName}</p>
                              <p className="text-xs text-muted-foreground">{member.roleName}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{member.teamName || "—"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {loggedHoursFor(member, range)}h / {expectedHoursFor(member, range)}h
                        </TableCell>
                        <TableCell>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${utilizationClass(utilization)}`}>
                            {utilization}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {leaveDaysFor(member, range)}d
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <p className="border-t border-border px-5 py-3 text-xs text-muted-foreground">
              Showing {filteredMembers.length} of {projectMembers.length} members in {selectedProject.name}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SummaryCard = ({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  icon?: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-5">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm">{label}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
    </CardContent>
  </Card>
);

const UtilizationLegend = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1.5">
    <span className={`h-2 w-2 rounded-full ${color}`} />
    {label}
  </span>
);

export default DeliveryManagerView;
