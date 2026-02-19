import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import type { ProjectTask } from "@/types/project";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface KanbanCardProps {
    task: ProjectTask;
    isOverlay?: boolean;
}

export function KanbanCard({ task, isOverlay }: KanbanCardProps) {
    const priorityColor =
        task.priority === "High"
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            : task.priority === "Medium"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";

    return (
        <Card className={cn(
            "cursor-grab hover:shadow-md transition-all duration-200 active:cursor-grabbing",
            "border border-border/60 bg-card",
            isOverlay && "cursor-grabbing shadow-xl rotate-2 scale-105 border-primary/30"
        )}>
            <CardHeader className="p-2.5 sm:p-3 lg:p-2 xl:p-2.5 pb-1.5 sm:pb-2 lg:pb-1 space-y-0">
                <div className="flex justify-between items-center gap-1.5">
                    <Badge
                        variant="outline"
                        className={cn(
                            "text-[9px] sm:text-[10px] lg:text-[9px] xl:text-[10px] px-1 sm:px-1.5 py-0.5 border-0 font-medium shrink-0",
                            priorityColor
                        )}
                    >
                        {task.priority || "Normal"}
                    </Badge>
                </div>
                <CardTitle className="text-xs sm:text-sm lg:text-xs xl:text-sm font-semibold leading-tight mt-1 sm:mt-1.5 line-clamp-2 break-words">
                    {task.taskName}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-2.5 sm:p-3 lg:p-2 xl:p-2.5 pt-0">
                {task.description && (
                    <p className="text-[11px] sm:text-xs lg:text-[10px] xl:text-xs text-muted-foreground line-clamp-1 lg:line-clamp-2 mb-1.5 sm:mb-2 mt-0.5">
                        {task.description}
                    </p>
                )}
                {task.deadlineTimestamp && (
                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs lg:text-[10px] xl:text-xs text-muted-foreground mt-1.5 sm:mt-2 border-t pt-1.5 sm:pt-2">
                        <CalendarDays className="h-3 w-3 shrink-0" />
                        <span>
                            {format(new Date(task.deadlineTimestamp), "MMM d")}
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
