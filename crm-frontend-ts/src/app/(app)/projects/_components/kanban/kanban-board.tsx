"use client";

import { useState, useMemo, useEffect } from "react";

import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    MouseSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { ProjectTask } from "@/types/project";
import { toast } from "sonner";
import axios from "axios";

interface KanbanBoardProps {
    initialTasks: ProjectTask[];
    onTaskUpdate: () => void;
    companyId?: number;
}

const COLUMNS = [
    { id: "pending", title: "Backlog" },
    { id: "in-progress", title: "In Progress" },
    { id: "review", title: "Review" },
    { id: "closed", title: "Completed" },
];

export function KanbanBoard({ initialTasks, onTaskUpdate, companyId }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<ProjectTask | null>(null);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
        useSensor(TouchSensor, {
            activationConstraint: { delay: 250, tolerance: 5 },
        }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const tasksByStatus = useMemo(() => {
        const columns: Record<string, ProjectTask[]> = {
            "pending": [],
            "in-progress": [],
            "review": [],
            "closed": [],
        };
        tasks.forEach((task) => {
            const status = task.status?.toLowerCase() || "pending";
            if (columns[status]) {
                columns[status].push(task);
            } else {
                columns["pending"].push(task);
            }
        });
        return columns;
    }, [tasks]);

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find((t) => String(t.taskId) === String(active.id));
        if (task) setActiveTask(task);
    };

    const handleDragOver = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        // Find the containers
        const activeTask = tasks.find((t) => String(t.taskId) === activeId);
        const overTask = tasks.find((t) => String(t.taskId) === overId);

        if (!activeTask) return;

        const activeStatus = activeTask.status?.toLowerCase() || "pending";
        const overStatus = overTask
            ? (overTask.status?.toLowerCase() || "pending")
            : COLUMNS.find(c => c.id === overId)?.id;

        if (!overStatus || activeStatus === overStatus) return;

        // Clone and update tasks immediately for smooth dragging
        setTasks((prev) => {
            return prev.map((t) => {
                if (String(t.taskId) === activeId) {
                    return { ...t, status: overStatus };
                }
                return t;
            });
        });
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = String(active.id);
        const overId = String(over.id);

        const activeTask = tasks.find((t) => String(t.taskId) === activeId);
        if (!activeTask) return;

        // Determine new status
        let newStatus = activeTask.status; // Default to current (already updated by DragOver)

        const isOverColumn = COLUMNS.some((col) => col.id === overId);
        if (isOverColumn) {
            newStatus = overId;
        } else {
            const overTask = tasks.find((t) => String(t.taskId) === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        // Check if we need to call API (if status changed from initial)
        // Since we optimistic updated in DragOver, we need to compare with *original* state?
        // Actually, just fire the API call based on the final determined status.
        // But wait, accessing `activeTask.status` here gives the UPDATED status from DragOver (since state updated).

        // Ensure API call fires with the correct new status
        try {
            await axios.patch("/api/project-group/tasks/update-status", {
                taskId: activeTask.taskId,
                status: newStatus,
                companyId: companyId,
            });
            toast.success("Task updated");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update status");
            // Revert would be complex here without keeping previous state ref. 
            // For now, onRefresh() will eventually sync.
            onTaskUpdate();
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 h-full w-full gap-2.5 sm:gap-3 lg:gap-4 p-2.5 sm:p-3 lg:p-4">
                {COLUMNS.map((col) => (
                    <KanbanColumn
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={tasksByStatus[col.id]}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeTask ? <KanbanCard task={activeTask} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
