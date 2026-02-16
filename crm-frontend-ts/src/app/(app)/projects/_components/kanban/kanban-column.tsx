"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { ProjectTask } from "@/types/project";
import { KanbanCard } from "./kanban-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
    id: string;
    title: string;
    tasks: ProjectTask[];
}

export function KanbanColumn({ id, title, tasks }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({ id });

    return (
        <div
            className={cn(
                "flex flex-col h-full bg-muted/40 rounded-lg border w-[calc(100vw-40px)] sm:w-80 md:w-full md:flex-1 shrink-0 md:shrink transition-colors snap-center",
                isOver && "bg-muted/60 ring-2 ring-primary/20"
            )}
        >
            <div className="p-4 py-3 flex items-center justify-between border-b bg-muted/20 rounded-t-lg sticky top-0 backdrop-blur-sm z-10">
                <h3 className="font-semibold text-sm tracking-tight">{title}</h3>
                <Badge variant="secondary" className="text-xs font-normal">
                    {tasks.length}
                </Badge>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar min-h-[150px]"
            >
                <SortableContext
                    id={id}
                    items={tasks.map((t) => t.taskId)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <KanbanCard key={task.taskId} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-xs text-muted-foreground/50 italic py-8 border-2 border-dashed rounded-lg border-muted">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
}
