"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import type { ProjectTask } from "@/types/project";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface KanbanCardProps {
    task: ProjectTask;
}

export function KanbanCard({ task }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.taskId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const priorityColor =
        task.priority === "High"
            ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            : task.priority === "Medium"
                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
            <Card className="cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing">
                <CardHeader className="p-3 pb-2 space-y-0">
                    <div className="flex justify-between items-start">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-[10px] px-1.5 py-0.5 border-0 font-medium",
                                priorityColor
                            )}
                        >
                            {task.priority || "Normal"}
                        </Badge>
                    </div>
                    <CardTitle className="text-sm font-semibold leading-tight mt-2 line-clamp-2">
                        {task.taskName}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 mt-1">
                            {task.description}
                        </p>
                    )}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-2 border-t pt-2">
                        {task.deadlineTimestamp && (
                            <div className="flex items-center gap-1.5">
                                <CalendarDays className="h-3 w-3" />
                                <span>
                                    {format(new Date(task.deadlineTimestamp), "MMM d")}
                                </span>
                            </div>
                        )}
                        {/* 
                          Ideally show assigned user avatars here. 
                          Currently we only have IDs. 
                        */}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
