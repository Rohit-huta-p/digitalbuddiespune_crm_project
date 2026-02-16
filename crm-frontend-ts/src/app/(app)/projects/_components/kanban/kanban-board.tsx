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
        const task = tasks.find((t) => t.taskId === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            setActiveTask(null);
            return;
        }

        const activeId = active.id;
        const overId = over.id;

        const activeTask = tasks.find((t) => t.taskId === activeId);
        if (!activeTask) {
            setActiveTask(null);
            return;
        }

        let newStatus = overId as string;

        // Check if overId is a column
        const isOverColumn = COLUMNS.some((col) => col.id === overId);

        if (!isOverColumn) {
            // Dropped over another task, find its status
            const overTask = tasks.find((t) => t.taskId === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (activeTask.status === newStatus) {
            setActiveTask(null);
            return;
        }

        // Optimistic Update
        const previousTasks = [...tasks];
        const updatedTasks = tasks.map((t) =>
            t.taskId === activeId ? { ...t, status: newStatus } : t
        );
        setTasks(updatedTasks);
        setActiveTask(null);

        // API Call
        try {
            await axios.patch("/api/project-group/tasks/update-status", {
                taskId: activeId,
                status: newStatus,
                companyId: companyId,
            });
            toast.success("Task updated");
            // onTaskUpdate(); // Optional: trigger full refresh
        } catch (error) {
            console.error(error);
            setTasks(previousTasks); // Revert
            toast.error("Failed to update status");
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full w-full gap-4 p-4 overflow-x-auto pb-10 snap-x snap-mandatory">
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
                {activeTask ? <KanbanCard task={activeTask} /> : null}
            </DragOverlay>
        </DndContext>
    );
}
