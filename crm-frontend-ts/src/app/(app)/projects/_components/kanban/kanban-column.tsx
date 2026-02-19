"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ProjectTask } from "@/types/project";
import { KanbanCard } from "./kanban-card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function SortableKanbanCard({ task }: { task: ProjectTask }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: String(task.taskId) });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none group"
        >
            <KanbanCard task={task} />
        </div>
    );
}

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
                "flex flex-col bg-muted/40 rounded-lg border transition-colors min-h-[200px] sm:min-h-[250px] lg:min-h-0 lg:h-full",
                isOver && "bg-muted/60 ring-2 ring-primary/20"
            )}
        >
            <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b bg-muted/20 rounded-t-lg sticky top-0 backdrop-blur-sm z-10">
                <h3 className="font-semibold text-xs sm:text-sm tracking-tight">{title}</h3>
                <Badge variant="secondary" className="text-[10px] sm:text-xs font-normal">
                    {tasks.length}
                </Badge>
            </div>

            <div
                ref={setNodeRef}
                className="flex-1 p-2 sm:p-3 space-y-2 sm:space-y-3 overflow-y-auto custom-scrollbar min-h-[120px] sm:min-h-[150px]"
            >
                <SortableContext
                    id={id}
                    items={tasks.map((t) => String(t.taskId))}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <SortableKanbanCard key={task.taskId} task={task} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-full flex items-center justify-center text-[11px] sm:text-xs text-muted-foreground/50 italic py-6 sm:py-8 border-2 border-dashed rounded-lg border-muted">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
}
