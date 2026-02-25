"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";
import {
    MultiSelect,
    MultiSelectTrigger,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectList,
    MultiSelectSearch,
    MultiSelectEmpty,
    MultiSelectValue,
} from "@/components/ui/multiselect";
import {
    Popover,
    PopoverTrigger,
    PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Kanban, List } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";

import TasksProvider from "@/components/tasks/context/tasks-context";
import { columns } from "@/components/tasks/components/columns";
import { DataTable } from "@/components/tasks/components/data-table";
import { TasksDialogs } from "@/components/tasks/components/tasks-dialogs";
import { KanbanBoard } from "../kanban/kanban-board";

import type { Project, ProjectTask } from "@/types/project";

interface TasksTabProps {
    project: Project;
    tasks: ProjectTask[];
    loading: boolean;
    onRefresh: () => void;
}

export function TasksTab({
    project,
    tasks,
    loading,
    onRefresh,
}: TasksTabProps) {
    const { user } = useAuth();
    const [openTaskDialog, setOpenTaskDialog] = useState(false);
    const [view, setView] = useState<"board" | "table">("board");
    const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
    const [newTask, setNewTask] = useState({
        taskName: "",
        description: "",
        deadlineTimestamp: "",
        priority: "Medium",
    });

    const formattedTasks = tasks.map((task) => ({
        ...task,
        id: task.taskId,
        assignedToEmployeeId: task.assignedEmployees ?? [],
        email: "unknown@example.com",
    }));

    const handleCreateTask = async () => {
        if (
            !newTask.taskName ||
            !newTask.description ||
            !newTask.deadlineTimestamp ||
            selectedEmployees.length === 0
        ) {
            toast.error("Please fill all required fields.");
            return;
        }

        try {
            const res = await fetch(`/api/project-group/tasks/schedule`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectGroupId: project.id,
                    tasks: [
                        {
                            assignedBy: user?.id,
                            ...newTask,
                            deadlineTimestamp: new Date(newTask.deadlineTimestamp)
                                .toISOString()
                                .slice(0, 19),
                            assignedEmployees: selectedEmployees.map(Number),
                        },
                    ],
                }),
            });

            const result = await res.json();
            if (!res.ok)
                throw new Error(result?.error?.message || "Task creation failed");

            toast.success(result.message || "Task scheduled successfully");
            setOpenTaskDialog(false);
            setNewTask({
                taskName: "",
                description: "",
                deadlineTimestamp: "",
                priority: "Medium",
            });
            setSelectedEmployees([]);
            onRefresh();
        } catch (err: any) {
            toast.error(err.message || "Something went wrong");
        }
    };

    return (
        <TasksProvider refreshTasks={onRefresh}>
            <div className="space-y-4 h-full flex flex-col">
                <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">Tasks</h3>
                            <p className="text-sm text-muted-foreground">
                                {tasks.length} task{tasks.length !== 1 ? "s" : ""} in this project
                            </p>
                        </div>
                        <div className="border rounded-md p-1 bg-muted/20 flex items-center">
                            <Button
                                variant={view === "board" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("board")}
                                className="h-7 px-3 text-xs"
                            >
                                <Kanban className="h-3.5 w-3.5 mr-1.5" />
                                Board
                            </Button>
                            <Button
                                variant={view === "table" ? "secondary" : "ghost"}
                                size="sm"
                                onClick={() => setView("table")}
                                className="h-7 px-3 text-xs"
                            >
                                <List className="h-3.5 w-3.5 mr-1.5" />
                                Table
                            </Button>
                        </div>
                    </div>
                    {user?.role?.toLowerCase() !== "employee" && (
                        <Button
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setOpenTaskDialog(true)}
                        >
                            <Plus className="h-3.5 w-3.5" />
                            Add Task
                        </Button>
                    )}
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                    {formattedTasks.length === 0 ? (
                        <div className="text-center py-12 border rounded-lg border-dashed">
                            <p className="text-muted-foreground text-sm">No tasks added yet.</p>
                            <Button variant="link" onClick={() => setOpenTaskDialog(true)}>Create one</Button>
                        </div>
                    ) : view === "board" ? (
                        <div className="h-full w-full">
                            <KanbanBoard initialTasks={tasks} onTaskUpdate={onRefresh} companyId={user?.companyId} />
                        </div>
                    ) : (
                        <DataTable
                            data={formattedTasks}
                            columns={columns}
                            loading={loading}
                        />
                    )}
                </div>

                <TasksDialogs />

                {/* Add Task Dialog */}
                <Dialog open={openTaskDialog} onOpenChange={setOpenTaskDialog}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Schedule New Task</DialogTitle>
                            <DialogDescription>
                                Assign a task to selected team members.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-2">
                            <Input
                                placeholder="Task Name"
                                value={newTask.taskName}
                                onChange={(e) =>
                                    setNewTask({ ...newTask, taskName: e.target.value })
                                }
                            />
                            <Textarea
                                placeholder="Task Description"
                                value={newTask.description}
                                onChange={(e) =>
                                    setNewTask({ ...newTask, description: e.target.value })
                                }
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">
                                        Deadline
                                    </label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {newTask.deadlineTimestamp ? (
                                                    format(new Date(newTask.deadlineTimestamp), "PPP")
                                                ) : (
                                                    <span className="text-muted-foreground">
                                                        Pick date
                                                    </span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={
                                                    newTask.deadlineTimestamp
                                                        ? new Date(newTask.deadlineTimestamp)
                                                        : undefined
                                                }
                                                onSelect={(date) =>
                                                    setNewTask({
                                                        ...newTask,
                                                        deadlineTimestamp: date?.toISOString() ?? "",
                                                    })
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div>
                                    <label className="text-sm text-muted-foreground mb-1 block">
                                        Priority
                                    </label>
                                    <Select
                                        onValueChange={(val) =>
                                            setNewTask({ ...newTask, priority: val })
                                        }
                                        value={newTask.priority}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="High">High</SelectItem>
                                            <SelectItem value="Medium">Medium</SelectItem>
                                            <SelectItem value="Low">Low</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-muted-foreground mb-1 block">
                                    Assign To
                                </label>
                                <MultiSelect
                                    value={selectedEmployees}
                                    onValueChange={setSelectedEmployees}
                                >
                                    <MultiSelectTrigger>
                                        <MultiSelectValue>
                                            {selectedEmployees.length > 0
                                                ? `${selectedEmployees.length} selected`
                                                : "Select members"}
                                        </MultiSelectValue>
                                    </MultiSelectTrigger>
                                    <MultiSelectContent>
                                        <MultiSelectSearch placeholder="Search employees..." />
                                        <MultiSelectList>
                                            <MultiSelectGroup heading="Participants">
                                                {project?.participants?.map((emp) => (
                                                    <MultiSelectItem key={emp.id} value={emp.id}>
                                                        {emp.name}
                                                    </MultiSelectItem>
                                                ))}
                                            </MultiSelectGroup>
                                        </MultiSelectList>
                                        <MultiSelectEmpty>No match found</MultiSelectEmpty>
                                    </MultiSelectContent>
                                </MultiSelect>
                            </div>

                            <Button onClick={handleCreateTask} className="w-full">
                                Submit Task
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </TasksProvider>
    );
}
