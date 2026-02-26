"use client";

import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Search, LayoutList, LayoutGrid, CheckSquare, Edit, Trash2, Calendar, Loader2, Clock, UserCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Task } from "@/components/tasks/data/schema";
import { useTasks } from "@/components/tasks/context/tasks-context";

type SortField = "taskName" | "deadlineTimestamp" | "priority" | "status";

// Utilities
function avatarGradient(name: string) {
  const gradients = [
    "from-violet-500 to-purple-600",
    "from-sky-500 to-blue-600",
    "from-emerald-500 to-teal-600",
    "from-rose-500 to-pink-600",
    "from-amber-500 to-orange-600",
    "from-indigo-500 to-blue-600",
    "from-cyan-500 to-teal-600",
    "from-fuchsia-500 to-pink-600",
  ];
  if (!name) return gradients[0];
  const idx = name.charCodeAt(0) % gradients.length;
  return gradients[idx];
}

function formatDeadline(dateStr?: string) {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const today = new Date().setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const day = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric" });
  const month = date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", month: "short" });
  const time = date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  });

  const dateStart = new Date(date);
  dateStart.setHours(0, 0, 0, 0);

  let prefix = `${day} ${month}`;
  if (dateStart.getTime() === today) prefix = "Today";
  else if (dateStart.getTime() === tomorrow.getTime()) prefix = "Tomorrow";

  return `${prefix}, ${time}`;
}

function getAssignedByLabel(value?: number) {
  if (value === 1) return "Admin";
  if (value === 2) return "HR";
  if (value) return "Project Lead";
  return "Unknown";
}

const STATUS_COLORS: Record<string, string> = {
  "open": "text-blue-500 bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 focus:ring-blue-500/30",
  "pending": "text-amber-500 bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 focus:ring-amber-500/30",
  "closed": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 focus:ring-emerald-500/30"
};

const PRIORITY_COLORS: Record<string, string> = {
  "high": "text-rose-500 bg-rose-500/10 border-rose-500/20 font-medium",
  "medium": "text-amber-500 bg-amber-500/10 border-amber-500/20",
  "low": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
};

export default function TaskTable({
  tasks,
  loading,
  fetchTasks,
  hideToolbar = false,
  defaultCompact = false
}: {
  tasks: Task[];
  loading?: boolean;
  fetchTasks?: () => void;
  hideToolbar?: boolean;
  defaultCompact?: boolean;
}) {
  const { setOpen, setCurrentRow } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("deadlineTimestamp");
  const [isCompact, setIsCompact] = useState(defaultCompact);
  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null);

  // Sort and Filter logic
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) =>
        `${t.taskName} ${t.description}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        if (sortField === "deadlineTimestamp") {
          const dlA = a.deadline || a.deadlineTimestamp;
          const dlB = b.deadline || b.deadlineTimestamp;
          const timeA = dlA ? new Date(dlA).getTime() : 0;
          const timeB = dlB ? new Date(dlB).getTime() : 0;
          return timeB - timeA; // Descending (nearest first) or flip if needed
        }
        if (sortField === "priority") {
          const priorityScore = { high: 3, medium: 2, low: 1 };
          const scoreA = priorityScore[(a.priority as keyof typeof priorityScore)] || 0;
          const scoreB = priorityScore[(b.priority as keyof typeof priorityScore)] || 0;
          return scoreB - scoreA;
        }
        const valA = String(a[sortField] || "").toLowerCase();
        const valB = String(b[sortField] || "").toLowerCase();
        return valA.localeCompare(valB);
      });
  }, [tasks, searchTerm, sortField]);

  // Handle inline status update
  const handleStatusChange = async (task: Task, newStatus: string) => {
    setUpdatingTaskId(task.id);
    try {
      const res = await axios.post("/api/update-tasks", {
        id: task.id,
        status: newStatus
      });
      if (res.data.error) throw res.data.error;
      toast.success("Task status updated successfully!");
      if (fetchTasks) fetchTasks();
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status");
    } finally {
      setUpdatingTaskId(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* ━━━ Toolbar ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!hideToolbar && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-muted/40 border-transparent focus:bg-background focus:border-input transition-colors rounded-xl"
              disabled={loading}
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <Select
              value={sortField}
              onValueChange={(v) => setSortField(v as SortField)}
              disabled={loading}
            >
              <SelectTrigger className="w-[140px] bg-muted/40 border-transparent rounded-xl">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent rounded-xl>
                <SelectItem value="deadlineTimestamp">Deadline</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="taskName">Alphabetical</SelectItem>
              </SelectContent>
            </Select>

            {/* Compact Toggle */}
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <LayoutList
                className={cn(
                  "h-4 w-4 transition-colors",
                  isCompact
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              />
              <Switch
                id="compact"
                checked={isCompact}
                onCheckedChange={setIsCompact}
                disabled={loading}
              />
              <LayoutGrid
                className={cn(
                  "h-4 w-4 transition-colors",
                  !isCompact
                    ? "text-foreground"
                    : "text-muted-foreground/50"
                )}
              />
            </div>
          </div>
        </div>
      )}

      {/* ━━━ Task List ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className={cn(
                "rounded-xl bg-muted/40 animate-pulse",
                isCompact ? "h-16" : "h-[88px]"
              )}
            />
          ))}
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 border rounded-2xl border-dashed bg-muted/10">
          <div className="h-16 w-16 rounded-2xl bg-muted/60 flex items-center justify-center mb-4">
            <CheckSquare className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="font-medium text-foreground text-lg">
            {tasks.length === 0 ? "You're all caught up!" : "No tasks found"}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1 max-w-sm text-center">
            {tasks.length === 0
              ? "There are no tasks assigned to you right now. Take a breather!"
              : "Try adjusting your search or sort filters to find what you're looking for."}
          </p>
        </div>
      ) : (
        <div className="grid gap-2">
          {filteredTasks.map((task) => {
            const isUpdating = updatingTaskId === task.id;
            return (
              <div
                key={task.id}
                className={cn(
                  "group relative flex items-center gap-4 rounded-xl border border-transparent bg-card shadow-sm border-border/50",
                  "hover:border-border hover:shadow-md cursor-pointer",
                  "transition-all duration-200 ease-out",
                  isCompact ? "p-3" : "p-4"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex-shrink-0 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-semibold shadow-sm",
                    avatarGradient(task.taskName),
                    isCompact ? "h-10 w-10 text-sm" : "h-12 w-12 text-base"
                  )}
                >
                  {task.taskName?.charAt(0).toUpperCase() || "T"}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className={cn(
                        "font-semibold text-foreground truncate",
                        isCompact ? "text-[15px]" : "text-base"
                      )}
                    >
                      {task.taskName}
                    </h3>
                    {task.priority && (
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        PRIORITY_COLORS[task.priority.toLowerCase()] || PRIORITY_COLORS["medium"]
                      )}>
                        {task.priority}
                      </span>
                    )}
                  </div>

                  {!isCompact && task.description && (
                    <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-col xl:flex-row gap-2 xl:gap-4 text-xs text-muted-foreground mt-2 xl:items-center">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>Deadline: <span className="font-medium text-foreground/80">{formatDeadline(task.deadline || task.deadlineTimestamp)}</span></span>
                      </div>

                      {(task.assignedAt || task.assignedTimestamp) && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/60" />
                          <span>Assigned At: <span className="font-medium text-foreground/80">{formatDeadline(task.assignedAt || task.assignedTimestamp)}</span></span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-muted-foreground/60" />
                        <span>Assigned By: <span className="font-medium text-foreground/80">{task.assignedByName || getAssignedByLabel(task.assignedBy)}</span></span>
                      </div>
                    </div>

                    {task.assignedEmployeeDetails && task.assignedEmployeeDetails.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="flex -space-x-1.5">
                          {task.assignedEmployeeDetails.slice(0, 3).map((emp) => (
                            <div key={emp.id} className="h-5 w-5 rounded-full bg-secondary border-2 border-background flex items-center justify-center text-[9px] font-bold text-secondary-foreground" title={emp.name}>
                              {emp.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {task.assignedEmployeeDetails.length > 3 && (
                            <div className="h-5 w-5 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[9px] font-bold text-muted-foreground">
                              +{task.assignedEmployeeDetails.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions / Status */}
                <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                  {/* Status Switcher Component */}
                  <Select
                    value={task.status.toLowerCase()}
                    onValueChange={(val) => handleStatusChange(task, val)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger
                      className={cn(
                        "w-[120px] h-8 text-xs font-semibold rounded-lg border focus:ring-2 focus:ring-offset-1 transition-all",
                        STATUS_COLORS[task.status.toLowerCase()] || STATUS_COLORS["open"]
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {isUpdating && <Loader2 className="h-3 w-3 animate-spin" />}
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent rounded-xl>
                      <SelectItem value="open" className="text-xs font-medium text-blue-600">Open</SelectItem>
                      <SelectItem value="pending" className="text-xs font-medium text-amber-600">Pending</SelectItem>
                      <SelectItem value="closed" className="text-xs font-medium text-emerald-600">Closed</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="h-6 w-px bg-border hidden sm:block mx-1"></div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentRow(task as any);
                        setOpen("update");
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentRow(task as any);
                        setOpen("delete");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ━━━ Footer Stats ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      {!hideToolbar && !loading && tasks.length > 0 && (
        <div className="text-xs text-muted-foreground/60 pt-2 text-center sm:text-left">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      )}
    </div>
  );
}
